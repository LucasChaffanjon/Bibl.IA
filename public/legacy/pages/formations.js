/* ——— Formations ———
   La rubrique a deux vues, reliées par un sélecteur en haut de page :
   · #formations : le tableau de bord (prochaine leçon, progression, révisions, parcours en cours) ;
   · #parcours : tous les parcours, chacun dans un bloc repliable (le tronc commun d’abord, puis une IA par bloc). */
let trainTab = 'formations'; /* dernière vue ouverte : on y revient en fermant une leçon */
/* cta : le bouton « Commencer » de la fin de la vidéo. Une vidéo ne contient pas de lien cliquable : on pose un vrai lien
   par-dessus, à la même place (en % de l’image, mesurée sur la dernière image), à partir de la seconde où il apparaît. */
const INTRO_VIDEO = {src:'/videos/premiers-pas-avec-l-ia.mp4', poster:'/videos/premiers-pas-avec-l-ia.jpg', dur:'1 min 22', seconds:82.33, cta:{from:77.85, left:43.02, top:61.11, width:15.21, height:8.15}};
const plural = (n, one, many) => `${n} ${n > 1 ? many : one}`;
function courseStats(id) {
  const ls = courseLessons(id).map(l => LESSONS[l.id]);
  const d = ls.filter(l => S.done.includes(l.id)).length;
  return {n:ls.length, d, min:ls.reduce((s, l) => s + (l.dur || 0), 0), pct:ls.length ? Math.round(d / ls.length * 100) : 0, next:ls.find(l => !S.done.includes(l.id)) || null};
}
function lessonRow(l, nextId) {
  const done = S.done.includes(l.id);
  return `<li><a class="lesson ${done ? 'done' : ''} ${l.id === nextId ? 'is-next' : ''}" href="#lecon-${l.id}">
    <span class="st" aria-hidden="true">${done ? ic('check', 'i-sm') : ''}</span><span class="lt">${esc(l.title)}${l.id === nextId ? ' <span class="tag" style="margin-left:6px">Prochaine leçon</span>' : ''}</span>
    <span class="dur">${l.dur} min</span><span class="go" aria-hidden="true">${ARW}</span><span class="sr-only">${done ? 'terminée' : 'à faire'}</span></a></li>`;
}
function trainTabs(tab) {
  const tabs = [['formations', 'Tableau de bord', 'user'], ['parcours', 'Tous les parcours', 'cap']];
  return `<nav class="ftabs" aria-label="Sections des formations">${tabs.map(([h, label, i]) => `<a href="#${h}"${h === tab ? ' aria-current="page"' : ''}>${ic(i, 'i-sm')}${label}</a>`).join('')}</nav>`;
}

/* Tableau de bord : ce qu’il faut faire maintenant, et où l’on en est */
function viewDashboard(v, nl) {
  const g = globalProgress();
  const all = [{id:'tc', name:TRONC.name}, ...orderedCourses().map(a => ({id:a.id, name:COURSES[a.id].name}))].map(c => Object.assign(c, courseStats(c.id)));
  const going = all.filter(c => c.d > 0 && c.d < c.n), finished = all.filter(c => c.n && c.d === c.n);
  /* Rien en cours : on propose le parcours qui contient la prochaine leçon (le tronc commun au départ) */
  const list = going.length ? going : all.filter(c => nl && c.id === nl.course);
  const row = c => `<li><a class="lrow frow" href="${c.next ? `#lecon-${c.next.id}` : '#parcours'}">
      ${c.id === 'tc' ? `<span class="ico" aria-hidden="true">${ic('cap')}</span>` : tile(c.id)}
      <span class="stack" style="gap:6px;min-width:0"><span class="h4">${esc(c.id === 'tc' ? `Tronc commun · ${c.name}` : c.name)}</span>
        <span class="small muted">${c.d} sur ${plural(c.n, 'leçon', 'leçons')}${c.next ? ` · Prochaine : ${esc(c.next.title)}` : ''}</span>
        <span class="bar"><i data-v="${c.pct / 100}"></i></span></span>
      <span class="frow-go"><span class="pct">${c.pct} %</span><span class="go" aria-hidden="true">${ARW}</span></span></a></li>`;
  v.innerHTML = `<div class="wrap"><header class="phead"><h1 class="h1 split">Votre tableau de bord</h1>
    <p class="lead">Reprenez là où vous en étiez, révisez ce que vous avez appris et suivez votre progression.</p>${trainTabs('formations')}</header>
    <div class="f-hero">
      ${nl ? `<div class="f-next reveal"><p class="label">Votre prochaine leçon · ${esc(courseName(nl))}</p><h2>${esc(nl.title)}</h2><p style="opacity:.85">${ic('clock', 'i-sm')} ${nl.dur} minutes · ${esc(nl.chap)}</p><a class="btn has-arrow" href="#lecon-${nl.id}">${ic('play', 'i-sm')}Commencer ${ARW}</a></div>`
        : `<div class="f-next reveal"><p class="label">Formations</p><h2>Toutes vos leçons sont terminées.</h2></div>`}
      <div class="f-prog reveal"><p class="label">Votre progression</p><p class="big"><span data-count="${g.pct}" data-suffix=" %">${g.pct} %</span></p><div class="bar"><i data-v="${g.pct / 100}"></i></div><p class="small muted">${plural(g.done, 'leçon terminée', 'leçons terminées')} sur ${g.total}</p></div>
    </div>
    ${reviewBlock()}
    <section class="fsec" aria-labelledby="fGoing"><div class="fsec-h"><h2 class="h3" id="fGoing">${going.length ? 'Vos parcours en cours' : list.length ? 'Votre prochain parcours' : 'Vos parcours'}</h2><a class="link has-arrow" href="#parcours">Voir tous les parcours ${ARW}</a></div>
      ${list.length ? `<ul class="ledger">${list.map(row).join('')}</ul>` : `<p class="muted">${finished.length === all.length ? 'Vous avez terminé tous vos parcours. Les questions de révision continuent de revenir ici.' : 'Aucun parcours en cours. Choisissez-en un dans la liste des parcours.'}</p>`}
      ${finished.length ? `<p class="small muted row" style="gap:8px">${ic('check', 'i-sm')}${finished.length > 1 ? 'Parcours terminés' : 'Parcours terminé'} : ${finished.map(c => esc(c.id === 'tc' ? 'Tronc commun' : AI[c.id].name)).join(', ')}.</p>` : ''}</section>
    <p class="note" style="margin-top:32px">Pas de badge ni de classement : seule votre progression compte, et elle n’est visible que par vous.</p></div>`;
}

/* Tous les parcours : chaque parcours est un volet, fermé par défaut ; à l’intérieur, chaque module (ou chapitre) est aussi un volet.
   Les parcours terminés descendent en fin de liste. Les leçons d’un volet fermé sont hors d’atteinte du clavier (inert). */
const panes = {}; /* état ouvert/fermé des volets, gardé le temps de la visite */
const isOpenPane = key => key in panes ? panes[key] : key === 'intro'; /* seule la vidéo d’introduction est ouverte au départ */
function courseHead(key, lead, name, meta, pct, extra = '') {
  return `<button class="course-h" type="button" aria-expanded="${isOpenPane(key)}" aria-controls="pb-${key}" data-pane="${key}">${lead}
    <span class="stack" style="gap:2px;min-width:0"><span class="h4">${name}${extra}</span><span class="small muted">${meta}</span></span>
    <span class="stack" style="gap:6px"><span class="bar"><i data-v="${pct / 100}"></i></span><span class="pct">${pct} %</span></span><svg class="i chev" aria-hidden="true"><use href="#i-chev"/></svg></button>`;
}
const paneBody = (key, cls, html) => `<div class="${cls}" id="pb-${key}"${isOpenPane(key) ? '' : ' inert'}><div>${html}</div></div>`;
/* Un module : son numéro, son titre, une case cochée quand toutes ses leçons sont faites, puis ses leçons */
function modulePane(key, n, title, lessons, nid) {
  const d = lessons.filter(l => S.done.includes(l.id)).length, full = d === lessons.length, min = lessons.reduce((s, l) => s + l.dur, 0);
  return `<div class="mod${full ? ' is-done' : ''}"><button class="mod-t" type="button" aria-expanded="${isOpenPane(key)}" aria-controls="pb-${key}" data-pane="${key}">
      <span class="mod-n" aria-hidden="true">${n}</span>
      <span class="stack" style="gap:2px;min-width:0"><span class="mod-name">${esc(title)}</span><span class="small muted">${d} sur ${plural(lessons.length, 'leçon', 'leçons')} · ${min} min</span></span>
      <span class="mod-box" aria-hidden="true">${full ? ic('check', 'i-sm') : ''}</span><span class="sr-only">${full ? 'Module terminé' : 'Module en cours'}</span>
      <svg class="i chev" aria-hidden="true"><use href="#i-chev"/></svg></button>
    ${paneBody(key, 'pane-b', `<ul class="lessons">${lessons.map(l => lessonRow(l, nid)).join('')}</ul>`)}</div>`;
}
function tcBlock(nid) {
  const tc = courseStats('tc');
  const mods = TRONC.mods.map((m, k) => modulePane('tcm' + k, k + 1, `Module ${k + 1} · ${m}`, TRONC.lessons.filter(l => l.mod === k).map(l => LESSONS[l.id]), nid)).join('');
  const intro = `<div class="intro"><button class="intro-t" type="button" aria-expanded="${isOpenPane('intro')}" aria-controls="pb-intro" data-pane="intro">${ic('play', 'i-sm')}<span>Vidéo d’introduction · ${INTRO_VIDEO.dur}</span><span class="intro-hint">${isOpenPane('intro') ? 'Masquer' : 'Afficher'}</span><svg class="i chev" aria-hidden="true"><use href="#i-chev"/></svg></button>
    ${paneBody('intro', 'pane-b', `<div class="fintro">
      <div class="vplayer" data-state="idle">
        <div class="vstage"><video class="fintro-v" playsinline preload="none" poster="${INTRO_VIDEO.poster}" aria-label="Vidéo d’introduction au tronc commun, avec voix off"><source src="${INTRO_VIDEO.src}" type="video/mp4"><track kind="captions" srclang="fr" label="Français" src="${INTRO_VIDEO.src.replace('.mp4', '.vtt')}"></video>
          <a class="fintro-cta" href="#lecon-${TRONC.lessons[0].id}" hidden style="left:${INTRO_VIDEO.cta.left}%;top:${INTRO_VIDEO.cta.top}%;width:${INTRO_VIDEO.cta.width}%;height:${INTRO_VIDEO.cta.height}%"><span class="sr-only">Commencer la leçon 1 : ${esc(TRONC.lessons[0].title)}</span></a></div>
        <button class="vbig" type="button" aria-label="Lire la vidéo d’introduction">${VICO.play}</button>
        <div class="vbar">
          <button class="vbtn" type="button" data-v="play" aria-label="Lire">${VICO.play}</button>
          <span class="vtime">0:00</span>
          <input class="vseek" type="range" min="0" max="${INTRO_VIDEO.seconds}" step="0.1" value="0" aria-label="Position dans la vidéo">
          <button class="vbtn" type="button" data-v="mute" aria-label="Couper le son">${VICO.sound}</button>
          <button class="vbtn vcc" type="button" data-v="cc" aria-pressed="false" aria-label="Sous-titres">CC</button>
          <button class="vbtn" type="button" data-v="fs" aria-label="Plein écran">${VICO.fsIn}</button>
        </div></div>
      <div class="stack" style="gap:8px;min-width:0"><h3 class="h4">Pourquoi suivre ce parcours</h3><p class="small muted">Ce que l’IA sait déjà faire, les cinq modules du parcours et la méthode des leçons, en une minute. Montez le son : une voix vous guide.</p></div></div>`)}</div>`;
  return `<div class="course is-tc">${courseHead('tc', `<span class="ico" aria-hidden="true">${tc.d === tc.n ? ic('check') : ic('cap')}</span>`, `Tronc commun · ${esc(TRONC.name)}`,
    `${plural(tc.n, 'leçon', 'leçons')} · ${TRONC.mods.length} modules · ${tc.min} min en tout`, tc.pct, tc.d === 0 ? ' <span class="tag">Recommandé</span>' : '')}
    ${paneBody('tc', 'course-b', intro + mods)}</div>`;
}
function aiBlock(a, nid) {
  const c = COURSES[a.id], st = courseStats(a.id);
  return `<div class="course">${courseHead(a.id, tile(a.id), esc(c.name), `${c.chapters.length} chapitres · ${plural(st.n, 'leçon', 'leçons')} · ${st.min} min`, st.pct)}
    ${paneBody(a.id, 'course-b', c.chapters.map((ch, k) => modulePane(`${a.id}-${k}`, k + 1, ch.t, ch.l.map(l => LESSONS[l.id]), nid)).join(''))}</div>`;
}
function viewCatalog(v, nl) {
  const nid = nl && nl.id, tc = courseStats('tc'), tcDone = tc.d === tc.n;
  const ais = orderedCourses(), done = a => { const s = courseStats(a.id); return s.n && s.d === s.n; };
  const todo = ais.filter(a => !done(a)), finished = ais.filter(done);
  const total = tc.n + ais.reduce((s, a) => s + courseStats(a.id).n, 0);
  v.innerHTML = `<div class="wrap"><header class="phead"><h1 class="h1 split">Tous les parcours</h1>
    <p class="lead">Commencez par le tronc commun, puis suivez le parcours des IA que vous utilisez. Chaque leçon dure de 3 à 5 minutes et part d’une tâche concrète.</p>${trainTabs('parcours')}</header>
    <p class="small muted cat-sum">${1 + ais.length} parcours · ${plural(total, 'leçon', 'leçons')}</p>
    ${tcDone ? '' : `<section class="fsec" aria-labelledby="tcLabel"><h2 class="label" id="tcLabel">Pour commencer</h2>${tcBlock(nid)}</section>`}
    <section class="fsec" aria-labelledby="aiLabel"><h2 class="h3" id="aiLabel">Parcours par IA</h2>
      <p class="small muted" style="margin-top:-6px">Prise en main, paramétrage, usages concrets, aller plus loin.${tcDone ? '' : ' Nous vous conseillons de terminer d’abord le tronc commun.'}</p>
      ${todo.length ? todo.map(a => aiBlock(a, nid)).join('') : `<p class="muted">${ais.length ? 'Vous avez terminé tous les parcours par IA.' : 'Aucune IA n’est autorisée pour l’instant. Votre dirigeant peut en ajouter depuis l’espace dirigeant.'}</p>`}
    </section>
    ${tcDone || finished.length ? `<section class="fsec" aria-labelledby="doneLabel"><h2 class="h3" id="doneLabel">Parcours terminés</h2>
      ${tcDone ? tcBlock(nid) : ''}${finished.map(a => aiBlock(a, nid)).join('')}</section>` : ''}
    <p class="note" style="margin-top:32px">Pas de badge ni de classement : seule votre progression compte, et elle n’est visible que par vous.</p></div>`;
  $$('[data-pane]', v).forEach(b => b.addEventListener('click', () => {
    const o = b.getAttribute('aria-expanded') !== 'true', body = b.nextElementSibling;
    b.setAttribute('aria-expanded', o); body.inert = !o; panes[b.dataset.pane] = o;
    const hint = $('.intro-hint', b); if (hint) hint.textContent = o ? 'Masquer' : 'Afficher';
    if (!o) $$('video', body).forEach(x => x.pause());
  }));
  $$('.vplayer', v).forEach(bindPlayer);
}

/* Lecteur de la vidéo d’introduction. Les commandes du navigateur mettent la vidéo seule en plein écran, sans le lien
   « Commencer » posé dessus : ce lecteur met en plein écran le bloc entier (vidéo + lien), qui reste donc cliquable. */
const VICO = {
  play:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4l13 8-13 8z"/></svg>',
  pause:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>',
  replay:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5a7 7 0 1 1-6.6 4.7l1.9.6A5 5 0 1 0 12 7v3L7.5 6 12 2z"/></svg>',
  sound:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9h4l5-4v14l-5-4H3z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  muted:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9h4l5-4v14l-5-4H3z"/><path d="M16 9l6 6M22 9l-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  fsIn:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h6v2H6v4H4zm10 0h6v6h-2V6h-4zM4 14h2v4h4v2H4zm14 0h2v6h-6v-2h4z"/></svg>',
  fsOut:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4h2v6H4V8h4zm6 0h2v4h4v2h-6zM4 14h6v6H8v-4H4zm10 0h6v2h-4v4h-2z"/></svg>'
};
const fsElement = () => document.fullscreenElement || document.webkitFullscreenElement || null;
const fsExit = () => { const f = document.exitFullscreen || document.webkitExitFullscreen; if (f) Promise.resolve(f.call(document)).catch(() => {}); };
function bindPlayer(p) {
  const vid = $('video', p), cta = $('.fintro-cta', p), seek = $('.vseek', p), time = $('.vtime', p), btn = k => $(`[data-v="${k}"]`, p);
  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const dur = () => (isFinite(vid.duration) && vid.duration) || INTRO_VIDEO.seconds;
  let shown = '';
  const paint = () => {
    const playing = !vid.paused && !vid.ended, b = btn('play'), st = playing ? 'pause' : vid.ended ? 'replay' : 'play';
    /* On ne redessine le bouton que s’il change : le redessiner à chaque instant de lecture faisait perdre des clics */
    if (st !== shown) { shown = st; b.innerHTML = VICO[st]; b.setAttribute('aria-label', playing ? 'Mettre en pause' : vid.ended ? 'Revoir' : 'Lire'); }
    p.dataset.state = playing ? 'playing' : vid.currentTime > 0 ? 'paused' : 'idle';
    seek.max = dur(); seek.value = vid.currentTime; seek.style.setProperty('--p', `${vid.currentTime / dur() * 100}%`);
    time.textContent = `${fmt(vid.currentTime)} / ${fmt(dur())}`;
    /* Le lien « Commencer » n’existe que pendant que le bouton est visible dans la vidéo */
    cta.hidden = vid.currentTime < INTRO_VIDEO.cta.from;
  };
  ['play', 'pause', 'timeupdate', 'seeked', 'ended', 'loadedmetadata', 'durationchange'].forEach(e => vid.addEventListener(e, paint));
  const toggle = () => { if (vid.paused || vid.ended) vid.play().catch(() => {}); else vid.pause(); };
  [btn('play'), $('.vbig', p), vid].forEach(el => el.addEventListener('click', toggle));
  seek.addEventListener('input', () => { vid.currentTime = +seek.value; paint(); });
  btn('mute').addEventListener('click', () => {
    vid.muted = !vid.muted; const b = btn('mute');
    b.innerHTML = vid.muted ? VICO.muted : VICO.sound; b.setAttribute('aria-label', vid.muted ? 'Remettre le son' : 'Couper le son');
  });
  btn('cc').addEventListener('click', () => {
    const tr = vid.textTracks[0], on = btn('cc').getAttribute('aria-pressed') !== 'true';
    if (tr) tr.mode = on ? 'showing' : 'hidden'; btn('cc').setAttribute('aria-pressed', on);
  });
  btn('fs').addEventListener('click', () => {
    if (fsElement() === p) return fsExit();
    const req = p.requestFullscreen || p.webkitRequestFullscreen;
    if (req) Promise.resolve(req.call(p)).catch(() => {});
    else if (vid.webkitEnterFullscreen) vid.webkitEnterFullscreen(); /* iPhone : seul le plein écran de la vidéo existe */
  });
  const onFs = () => { const on = fsElement() === p, b = btn('fs'); b.innerHTML = on ? VICO.fsOut : VICO.fsIn; b.setAttribute('aria-label', on ? 'Quitter le plein écran' : 'Plein écran'); };
  document.addEventListener('fullscreenchange', onFs); document.addEventListener('webkitfullscreenchange', onFs);
  onCleanup(() => { document.removeEventListener('fullscreenchange', onFs); document.removeEventListener('webkitfullscreenchange', onFs); if (fsElement() === p) fsExit(); });
  /* Au clic sur « Commencer » : pause, sortie du plein écran, puis la leçon s’ouvre par-dessus la page */
  cta.addEventListener('click', () => { vid.pause(); if (fsElement() === p) fsExit(); });
  paint();
}

function viewTraining(openId) {
  const h = decodeURIComponent(location.hash.slice(1));
  if (h === 'formations' || h === 'parcours') trainTab = h;
  const v = $('#view'), nl = nextLesson();
  if (trainTab === 'parcours') viewCatalog(v, nl); else viewDashboard(v, nl);
  splitWords($('.split', v));
  const rg = $('#revGo', v); if (rg) rg.addEventListener('click', openReview);
  const rs = $('#revSkip', v); if (rs) rs.addEventListener('click', () => {
    Object.values(S.rev).forEach(r => { if (r.due != null) r.due -= DAY; }); save();
    const y = scrollY; renderView(true); window.scrollTo(0, y); toast('Démonstration : une journée a passé.', 'clock');
  });
  if (openId) setTimeout(() => openLesson(openId), RM.matches ? 0 : 250);
}
/* Schémas des leçons : les branches emboîtées de l’IA, le trajet d’une demande par une API */
const FIGS = {
  nest:() => `<figure class="fig nest" aria-label="L’intelligence artificielle contient le machine learning, qui contient le deep learning, qui contient les modèles de langage."><div class="n1"><span>Intelligence artificielle</span><div class="n2"><span>Machine learning</span><div class="n3"><span>Deep learning</span><div class="n4"><span>Modèles de langage</span><b>ChatGPT, Le Chat, Claude, Copilot…</b></div></div></div></div></figure>`,
  api:() => { const s = [['Vous', 'le client'], ['L’application', 'la salle'], ['L’API', 'le serveur'], ['Le service', 'la cuisine']];
    return `<figure class="fig flow"><ol>${s.map(([a, b], i) => `<li class="${i === 2 ? 'hl' : ''}"><strong>${a}</strong><small>${b}</small></li>${i < s.length - 1 ? `<li class="arw" aria-hidden="true">${ARW}</li>` : ''}`).join('')}</ol><figcaption class="small muted">La commande va de gauche à droite, puis le plat revient par le même chemin.</figcaption></figure>`; }
};
/* Questions à choix : réponse immédiate, la bonne option est toujours montrée */
function quizHTML(q) {
  return `<fieldset class="quiz"><legend class="quiz-q">${esc(q.q)}</legend><div class="qopts">${q.o.map((o, i) => `<button class="qopt" type="button" data-i="${i}"><span class="qmark" aria-hidden="true"></span><span>${esc(o)}</span></button>`).join('')}</div><p class="qwhy" aria-live="polite"></p></fieldset>`;
}
function bindQuiz(box, q, onAnswer) {
  const opts = $$('.qopt', box);
  opts.forEach(b => b.addEventListener('click', () => {
    const i = +b.dataset.i, ok = i === q.a;
    opts.forEach(x => { x.disabled = true; const j = +x.dataset.i;
      if (j === q.a) { x.classList.add('right'); $('.qmark', x).innerHTML = ic('check'); }
      else if (j === i) { x.classList.add('wrong'); $('.qmark', x).innerHTML = ic('x'); } });
    const w = $('.qwhy', box); w.innerHTML = `<strong>${ok ? 'Exact.' : 'Pas tout à fait.'}</strong> ${esc(q.why)}`; w.classList.add('on');
    onAnswer && onAnswer(ok);
  }));
}
function lessonContent(l, done) {
  const head = `<div class="stack" style="gap:12px"><span class="tag">${ic('clock', 'i-sm')}${l.dur} minutes</span><h2 class="h2">${esc(l.title)}</h2><p class="lead">${esc(l.goal)}</p></div>`;
  const keep = `<p class="callout"><strong style="font-weight:500">À retenir · </strong>${esc(l.keep)}</p>`;
  if (!l.learn) return head + `<ol class="steps">${l.steps.map((s, i) => `<li style="--i:${i}"><span>${esc(s)}</span></li>`).join('')}</ol>
    ${l.ex ? `<div class="example"><p class="label" style="margin-bottom:8px">Exemple</p>${esc(l.ex)}</div>` : ''}${keep}
    <div class="row"><button class="btn btn-primary has-arrow" type="button" id="doneBtn" autofocus>${done ? 'Leçon déjà terminée' : 'J’ai terminé cette leçon'} ${ARW}</button><button class="btn btn-ghost" type="button" data-close>Plus tard</button></div>`;
  const p = l.practice;
  return head + `
    <section class="lpart"><h3 class="lpart-h"><span class="lpart-n">1</span>Comprendre</h3>
      <ul class="learn">${l.learn.map(s => `<li>${esc(s)}</li>`).join('')}</ul>${l.fig ? FIGS[l.fig]() : ''}
      <div class="example"><p class="label" style="margin-bottom:8px">Exemple</p>${esc(l.ex)}</div></section>
    ${l.acts ? `<section class="lpart"><h3 class="lpart-h"><span class="lpart-n">2</span>À vous</h3><div class="acts">${actsHTML(l)}</div></section>` : `<section class="lpart"><h3 class="lpart-h"><span class="lpart-n">2</span>À vous, tout de suite</h3><p>${esc(p.task)}</p>
      ${p.prompt ? `<div class="lprompt"><pre id="lpText">${esc(p.prompt)}</pre><button class="btn btn-quiet copy" type="button" id="lpCopy">${ic('copy', 'i-sm')}Copier</button></div>`
        : `<a class="link has-arrow" href="${p.go.href}">${esc(p.go.label)} ${ARW}</a>`}
      <div class="lcheck"><p class="small muted">Une fois fait, vérifiez :</p><ul>${p.check.map(c => `<li><label class="lchk"><input type="checkbox"><span>${esc(c)}</span></label></li>`).join('')}</ul></div></section>`}
    <section class="lpart"><h3 class="lpart-h"><span class="lpart-n">3</span>Testez-vous</h3>${quizHTML(l.quiz)}</section>
    ${keep}
    <div class="stack" style="gap:10px"><div class="row"><button class="btn btn-primary has-arrow" type="button" id="doneBtn" ${done ? '' : 'disabled'}>${done ? 'Leçon déjà terminée' : 'J’ai terminé cette leçon'} ${ARW}</button><button class="btn btn-ghost" type="button" data-close>Plus tard</button></div>
      ${done ? '' : '<p class="small muted" id="doneHint">Répondez à la question pour terminer la leçon.</p>'}</div>`;
}
function openLesson(id) {
  const l = LESSONS[id]; if (!l || (l.course !== 'tc' && !isAllowed(l.course))) return;
  const done = S.done.includes(id);
  const m = openModal(`<div class="modal-top"><span class="small muted">${esc(courseName(l))} · ${esc(l.chap)}</span><button class="rp-close" data-close aria-label="Fermer la leçon">${ic('x')}</button></div>
    <div class="modal-in lesson-body">${lessonContent(l, done)}</div>`,
    {wide:true, label:l.title, onClose:() => { if (location.hash.startsWith('#lecon-')) history.replaceState(null, '', '#' + trainTab); }});
  const cp = $('#lpCopy', m); if (cp) cp.addEventListener('click', () => copyText(l.practice.prompt, cp, $('#lpText', m)));
  bindActs(m, l);
  const go = $('.lpart a[href^="#"]', m); if (go) go.addEventListener('click', () => closeModal());
  if (l.quiz) bindQuiz(m, l.quiz, () => { const b = $('#doneBtn', m); b.disabled = false; const h = $('#doneHint', m); if (h) h.remove(); });
  $('#doneBtn', m).addEventListener('click', () => {
    const before = globalProgress();
    if (!S.done.includes(id)) S.done.push(id);
    const firstRev = !!l.rev && !S.rev[id]; if (firstRev) S.rev[id] = {n:0, due:Date.now() + DAY};
    save();
    const nx = nextLesson(), g = globalProgress();
    /* Écran de fin : coche qui se dessine, progression qui avance de l'ancienne à la nouvelle valeur, leçon suivante */
    $('.lesson-body', m).innerHTML = `<div class="done-screen">${DONE_MARK}
      <div class="stack" style="gap:6px"><h2 class="h2">Leçon terminée</h2><p class="lead">${esc(l.title)}</p></div>
      <div class="done-prog"><div class="row" style="justify-content:space-between"><span class="small muted">Votre progression</span><span class="small"><strong>${g.done}</strong> leçon${g.done > 1 ? 's' : ''} sur ${g.total} · ${g.pct} %</span></div><div class="bar"><i id="doneBar" style="--v:${before.pct / 100}"></i></div></div>
      ${firstRev ? `<p class="small muted row" style="gap:8px">${ic('clock', 'i-sm')}Une question sur cette leçon reviendra demain, pour la garder en mémoire.</p>` : ''}
      ${nx ? `<div class="done-next"><span class="ico">${ic('play', 'i-sm')}</span><span class="stack" style="gap:2px;min-width:0"><span class="small muted">Leçon suivante · ${nx.dur} minutes</span><strong>${esc(nx.title)}</strong></span></div>
      <div class="row"><button class="btn btn-primary has-arrow" type="button" id="goNext">Commencer la leçon suivante ${ARW}</button><button class="btn btn-ghost" type="button" data-close>Plus tard</button></div>`
      : '<p class="muted">Vous avez terminé toutes vos leçons.</p><button class="btn btn-primary" type="button" data-close>Fermer</button>'}</div>`;
    requestAnimationFrame(() => requestAnimationFrame(() => { const b = $('#doneBar', m); b && b.style.setProperty('--v', g.pct / 100); }));
    const gn = $('#goNext', m); if (gn) { gn.focus(); gn.addEventListener('click', () => openLesson(nx.id)); }
    const h = location.hash.slice(1);
    if (h === 'formations' || h === 'parcours' || h.startsWith('lecon-') || h.startsWith('ia-')) setTimeout(() => { const y = scrollY; renderView(true); window.scrollTo(0, y); }, 50);
  });
}

/* ——— Révisions espacées ——— */
const dueReviews = () => TRONC.lessons.map(l => l.id).filter(id => S.rev[id] && S.rev[id].due != null && S.rev[id].due <= Date.now());
const nextReviewAt = () => { const ts = Object.values(S.rev).map(r => r.due).filter(d => d != null); return ts.length ? Math.min(...ts) : null; };
const whenLabel = ts => { const d = Math.max(1, Math.ceil((ts - Date.now()) / DAY)); return d === 1 ? 'demain' : `dans ${d} jours`; };
function reviewBlock() {
  const due = dueReviews(), nx = nextReviewAt();
  if (!due.length && nx == null) return '';
  const n = due.length;
  return `<div class="revcard reveal"><div class="stack" style="gap:6px"><h2 class="h3">${n ? `${n} question${n > 1 ? 's' : ''} à réviser` : 'Vos révisions sont à jour'}</h2>
    <p class="muted">${n ? `Moins d’une minute pour garder en mémoire ce que vous avez appris.` : `Prochaine révision ${whenLabel(nx)}.`} Chaque question revient le lendemain, puis après 3, 7 et 21 jours.</p></div>
    <div class="row">${n ? `<button class="btn btn-primary has-arrow" type="button" id="revGo">Réviser maintenant ${ARW}</button>` : `<button class="btn btn-quiet" type="button" id="revSkip">${ic('clock', 'i-sm')}Simuler le lendemain (démonstration)</button>`}</div></div>`;
}
function openReview() {
  const ids = dueReviews(); if (!ids.length) return;
  let k = 0, good = 0; const miss = [];
  const m = openModal(`<div class="modal-top"><span class="small muted">Révision · ${ids.length} question${ids.length > 1 ? 's' : ''}</span><button class="rp-close" data-close aria-label="Fermer la révision">${ic('x')}</button></div>
    <div class="modal-in rev-body" id="revBody"></div>`, {wide:true, label:'Révision', onClose:() => { if (location.hash === '#formations' || location.hash === '#parcours') { const y = scrollY; renderView(true); window.scrollTo(0, y); } }});
  const body = $('#revBody', m);
  const show = () => {
    if (k >= ids.length) return finish();
    const id = ids[k], l = LESSONS[id];
    body.innerHTML = `<div class="rev-top"><span class="small muted">Question ${k + 1} sur ${ids.length} · ${esc(l.title)}</span><span class="rev-dots" aria-hidden="true">${ids.map((_, i) => `<i class="${i < k ? 'past' : i === k ? 'cur' : ''}"></i>`).join('')}</span></div>
      ${quizHTML(l.rev)}<div class="row" id="revNav" hidden><button class="btn btn-primary has-arrow" type="button" id="revNext">${k + 1 < ids.length ? 'Question suivante' : 'Voir le bilan'} ${ARW}</button></div>`;
    bindQuiz(body, l.rev, ok => {
      const r = S.rev[id];
      if (ok) { good++; r.n++; r.due = r.n >= REV_DAYS.length ? null : Date.now() + REV_DAYS[r.n] * DAY; }
      else { miss.push(id); r.n = 0; r.due = Date.now() + DAY; }
      save();
      $('#revNav', body).hidden = false;
      const nb = $('#revNext', body); nb.focus(); nb.addEventListener('click', () => { k++; show(); });
    });
    $('.qopt', body).focus();
  };
  const finish = () => {
    const nx = nextReviewAt();
    const all = good === ids.length;
    body.innerHTML = `<div class="done-screen">${good ? DONE_MARK : ''}<div class="stack" style="gap:6px"><h2 class="h2">${all ? 'Révision réussie' : 'Révision terminée'}</h2>
      <p class="lead">${ids.length === 1 ? (all ? 'Vous avez retrouvé la bonne réponse.' : 'La bonne réponse ne vous est pas revenue cette fois.') : `${good} réponse${good > 1 ? 's' : ''} retrouvée${good > 1 ? 's' : ''} sur ${ids.length}.`} ${nx != null ? `Prochaine révision ${whenLabel(nx)}.` : 'Aucune autre révision n’est prévue pour l’instant.'}</p></div>
      ${miss.length ? `<div class="stack" style="gap:8px;width:100%"><p class="small muted">${miss.length > 1 ? 'Ces questions reviendront' : 'Cette question reviendra'} demain. Relire la leçon prend trois minutes :</p>${miss.map(id => `<a class="link has-arrow" href="#lecon-${id}">${esc(LESSONS[id].title)} ${ARW}</a>`).join('')}</div>` : ''}
      <button class="btn btn-primary" type="button" data-close>Fermer</button></div>`;
    $$('a[href^="#lecon-"]', body).forEach(a => a.addEventListener('click', () => closeModal()));
    $('[data-close]', body).focus();
  };
  show();
}

