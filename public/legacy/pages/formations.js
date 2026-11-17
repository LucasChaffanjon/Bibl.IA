/* ——— Formations ——— */
const openCourses = new Set();
function lessonRow(l, nextId) {
  const done = S.done.includes(l.id);
  return `<li><a class="lesson ${done ? 'done' : ''} ${l.id === nextId ? 'is-next' : ''}" href="#lecon-${l.id}">
    <span class="st" aria-hidden="true">${done ? ic('check', 'i-sm') : ''}</span><span class="lt">${esc(l.title)}${l.id === nextId ? ' <span class="tag" style="margin-left:6px">Prochaine leçon</span>' : ''}</span>
    <span class="dur">${l.dur} min</span><span class="go" aria-hidden="true">${ARW}</span><span class="sr-only">${done ? 'terminée' : 'à faire'}</span></a></li>`;
}
let tcInit = false;
function viewTraining(openId) {
  const v = $('#view'), nl = nextLesson(), g = globalProgress(), tcDone = coursePct('tc') === 100;
  if (!tcInit) { tcInit = true; if (nl && nl.course === 'tc') openCourses.add('tcm' + nl.mod); }
  v.innerHTML = `<div class="wrap"><header class="phead"><h1 class="h1 split">Des leçons de 3 à 5 minutes</h1>
    <p class="lead">Chaque leçon est centrée sur une tâche concrète. Commencez par le tronc commun, puis suivez le parcours des IA que vous utilisez.</p></header>
    <div class="f-hero">
      ${nl ? `<div class="f-next reveal"><p class="label">Votre prochaine leçon · ${esc(courseName(nl))}</p><h2>${esc(nl.title)}</h2><p style="opacity:.85">${ic('clock', 'i-sm')} ${nl.dur} minutes · ${esc(nl.chap)}</p><a class="btn has-arrow" href="#lecon-${nl.id}">${ic('play', 'i-sm')}Commencer ${ARW}</a></div>`
        : `<div class="f-next reveal"><p class="label">Formations</p><h2>Toutes vos leçons sont terminées.</h2></div>`}
      <div class="f-prog reveal"><p class="label">Votre progression</p><p class="big"><span data-count="${g.pct}" data-suffix=" %">${g.pct} %</span></p><div class="bar"><i data-v="${g.pct / 100}"></i></div><p class="small muted">${g.done} leçon${g.done > 1 ? 's' : ''} terminée${g.done > 1 ? 's' : ''} sur ${g.total}</p></div>
    </div>
    ${reviewBlock()}
    <section class="section" style="border-top:0"><div class="sec-head reveal"><h2 class="h2">Tronc commun : ${esc(TRONC.name)}</h2><p class="lead">${TRONC.lessons.length} leçons de 3 ou 4 minutes en ${TRONC.mods.length} modules, des fondations aux usages avancés. Chacune explique en quelques lignes, vous fait essayer tout de suite sur une tâche réelle, puis revient sous forme de question les jours suivants.</p></div>
      <p class="tc-sum reveal">${coursePct('tc')} % terminé · ${TRONC.lessons.reduce((s, l) => s + l.dur, 0)} minutes en tout</p>
      ${TRONC.mods.map((m, k) => { const ls = TRONC.lessons.filter(l => l.mod === k), d = ls.filter(l => S.done.includes(l.id)).length, key = 'tcm' + k, open = openCourses.has(key);
        return `<div class="course reveal"><button class="course-h" type="button" aria-expanded="${open}" data-course="${key}"><span class="mod-n ${d === ls.length ? 'is-done' : ''}" aria-hidden="true">${d === ls.length ? ic('check', 'i-sm') : k + 1}</span><span class="stack" style="gap:2px"><span class="h4">${esc(m)}</span><span class="small muted">${ls.length} leçons · ${ls.reduce((s, l) => s + l.dur, 0)} minutes</span></span>
          <span class="stack" style="gap:6px"><span class="bar"><i data-v="${d / ls.length}"></i></span><span class="pct">${d} sur ${ls.length}</span></span><svg class="i chev" aria-hidden="true"><use href="#i-chev"/></svg></button>
          <div class="course-b"><div><div class="chap"><ul class="lessons">${ls.map(l => lessonRow(LESSONS[l.id], nl && nl.id)).join('')}</ul></div></div></div></div>`; }).join('')}</section>
    <section class="section"><div class="sec-head reveal"><h2 class="h2">De l’essentiel à l’avancé</h2><p class="lead">Prise en main, paramétrage, usages concrets, aller plus loin.${tcDone ? '' : ' Nous vous conseillons de terminer d’abord le tronc commun.'}</p></div>
      ${orderedCourses().map(a => { const c = COURSES[a.id], pc = coursePct(a.id), open = openCourses.has(a.id);
        return `<div class="course reveal"><button class="course-h" type="button" aria-expanded="${open}" data-course="${a.id}">${tile(a.id)}<span class="stack" style="gap:2px"><span class="h4">${esc(c.name)}</span><span class="small muted">4 chapitres · 8 leçons</span></span>
          <span class="stack" style="gap:6px"><span class="bar"><i data-v="${pc / 100}"></i></span><span class="pct">${pc} %</span></span><svg class="i chev" aria-hidden="true"><use href="#i-chev"/></svg></button>
          <div class="course-b"><div>${c.chapters.map(ch => `<div class="chap"><h4>${esc(ch.t)}</h4><ul class="lessons">${ch.l.map(l => lessonRow(LESSONS[l.id], nl && nl.id)).join('')}</ul></div>`).join('')}</div></div></div>`; }).join('')}
      <p class="note" style="margin-top:24px">Pas de badge ni de classement : seule votre progression compte, et elle n’est visible que par vous.</p></section></div>`;
  splitWords($('.split', v));
  const rg = $('#revGo', v); if (rg) rg.addEventListener('click', openReview);
  const rs = $('#revSkip', v); if (rs) rs.addEventListener('click', () => {
    Object.values(S.rev).forEach(r => { if (r.due != null) r.due -= DAY; }); save();
    const y = scrollY; renderView(true); window.scrollTo(0, y); toast('Démonstration : une journée a passé.', 'clock');
  });
  $$('[data-course]', v).forEach(b => b.addEventListener('click', () => { const o = b.getAttribute('aria-expanded') !== 'true'; b.setAttribute('aria-expanded', o); o ? openCourses.add(b.dataset.course) : openCourses.delete(b.dataset.course); }));
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
    <section class="lpart"><h3 class="lpart-h"><span class="lpart-n">2</span>À vous, tout de suite</h3><p>${esc(p.task)}</p>
      ${p.prompt ? `<div class="lprompt"><pre id="lpText">${esc(p.prompt)}</pre><button class="btn btn-quiet copy" type="button" id="lpCopy">${ic('copy', 'i-sm')}Copier</button></div>`
        : `<a class="link has-arrow" href="${p.go.href}">${esc(p.go.label)} ${ARW}</a>`}
      <div class="lcheck"><p class="small muted">Une fois fait, vérifiez :</p><ul>${p.check.map(c => `<li><label class="lchk"><input type="checkbox"><span>${esc(c)}</span></label></li>`).join('')}</ul></div></section>
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
    {wide:true, label:l.title, onClose:() => { if (location.hash.startsWith('#lecon-')) history.replaceState(null, '', '#formations'); }});
  const cp = $('#lpCopy', m); if (cp) cp.addEventListener('click', () => copyText(l.practice.prompt, cp, $('#lpText', m)));
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
    if (h === 'formations' || h.startsWith('lecon-') || h.startsWith('ia-')) setTimeout(() => { const y = scrollY; renderView(true); window.scrollTo(0, y); }, 50);
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
    <div class="modal-in rev-body" id="revBody"></div>`, {wide:true, label:'Révision', onClose:() => { if (location.hash === '#formations') { const y = scrollY; renderView(true); window.scrollTo(0, y); } }});
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

