/* ——— Accueil ——— */
const PHRASES = ['J’ai besoin d’écrire un mail à un client', 'Je dois faire une présentation pour lundi', 'Je dois traduire une fiche produit en anglais', 'Je dois résumer le compte rendu de la réunion', 'Je dois créer une affiche pour un salon'];
const BLOCK_NAMES = {next:'Ma prochaine leçon', updates:'Nouveautés de mes IA', ais:'Mes IA autorisées', how:'Comment ça marche', rules:'Les trois bons réflexes'};

function splitWords() { /* titres statiques : l'animation mot à mot à chaque page est retirée */ }

function viewHome() {
  const v = $('#view'), p = S.profile;
  const date = new Date().toLocaleDateString('fr-FR', {weekday:'long', day:'numeric', month:'long'});
  const order = [...INTENTS].sort((a, b) => (p.tasks.includes(b.id) ? 1 : 0) - (p.tasks.includes(a.id) ? 1 : 0));
  const welcome = !p.done && !S.welcomeOff ? `<div class="notice" id="welcome">${ic('user')}<span>Première visite ? Répondez à quelques questions (2 minutes) pour recevoir des conseils adaptés à votre travail.</span>
      <span class="row"><button class="btn btn-primary btn-sm" type="button" data-act="onboard">Compléter mon profil</button><button class="btn btn-quiet" type="button" id="welcomeOff">Plus tard</button></span></div>` : '';
  v.innerHTML = `<section class="hero${booted ? '' : ' is-first'}" id="hero">
    <div class="wrap narrow hero-in">
      <h1 class="display split" id="heroTitle">Que devez-vous faire <em>aujourd’hui</em> ?</h1>
      <p class="lead">Décrivez votre tâche avec vos mots. Bibl.IA vous indique quelle IA utiliser, pourquoi, et comment vous en servir.</p>
      ${welcome}
      <form class="ask" id="askForm" autocomplete="off" novalidate>
        <div class="ask-box">
          <label for="askInput" class="sr-only">Décrivez ce que vous devez faire</label>
          <textarea id="askInput" rows="1" aria-labelledby="heroTitle" aria-describedby="askErr askHint"></textarea>
          <span class="ask-ph" id="askPh" aria-hidden="true"></span>
          <button class="btn btn-cta has-arrow" type="submit">Trouver la bonne IA ${ARW}</button>
        </div>
        <p class="ask-err" id="askErr" role="alert" hidden>${ic('info', 'i-sm')}Écrivez ce que vous devez faire (par exemple « préparer une présentation ») ou choisissez un exemple ci-dessous.</p>
        <p class="ask-hint" id="askHint">Entrée pour valider · Maj + Entrée pour aller à la ligne</p>
      </form>
      <div class="examples"><p class="label">Exemples de tâches courantes</p>
        <div class="row" id="chips">${order.map((it, i) => `<button class="chip" type="button" data-intent="${it.id}" aria-pressed="false" style="--i:${i}">${esc(it.chip)}</button>`).join('')}</div></div>
      <div id="result"></div>
    </div></section>
    <div class="wrap"><div class="blocks-bar"><p class="label">Votre page d’accueil</p><button class="btn btn-quiet" type="button" data-act="home-setup">${ic('sliders', 'i-sm')}Personnaliser</button></div></div>
    <div id="blocks">${S.blocks.filter(b => b.on).map(b => BLOCKS[b.id]()).join('')}</div>`;

  if (!RM.matches) splitWords($('#heroTitle'));
  const ta = $('#askInput'), ph = $('#askPh'), form = $('#askForm');
  const grow = () => { ta.style.height = 'auto'; ta.style.height = Math.min(220, ta.scrollHeight) + 'px'; ph.classList.toggle('off', !!ta.value); };
  ta.addEventListener('input', grow);
  ta.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit(); } });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const t = ta.value.trim();
    if (!t) { $('#askErr').hidden = false; ta.setAttribute('aria-invalid', 'true'); $('.ask-box').classList.add('invalid'); ta.focus(); return; }
    runReco(t);
  });
  ta.addEventListener('input', () => { if (ta.value.trim()) clearAskErr(); });
  $$('#chips .chip').forEach(c => c.addEventListener('click', () => {
    const it = INTENTS.find(x => x.id === c.dataset.intent);
    $$('#chips .chip').forEach(x => x.setAttribute('aria-pressed', x === c)); ta.value = it.ask; grow(); runReco(it.ask, false, it.id);
  }));
  const wo = $('#welcomeOff'); if (wo) wo.addEventListener('click', () => { S.welcomeOff = true; save(); $('#welcome').remove(); });

  ph.textContent = 'Par exemple : ' + low(PHRASES[0]);
  armHow();
  // Retour sur l'accueil : la dernière demande et sa recommandation sont toujours là
  if (lastAsk && lastAsk.text) {
    ta.value = lastAsk.text; grow();
    if (lastAsk.chip) $$('#chips .chip').forEach(x => x.setAttribute('aria-pressed', x.dataset.intent === lastAsk.chip));
    runReco(lastAsk.text, true, lastAsk.chip);
  }
}

/* ——— Blocs de l'accueil ——— */
const BLOCKS = {
  next() {
    const l = nextLesson(), g = globalProgress();
    if (!l) return `<section class="section"><div class="wrap"><div class="next reveal"><div class="stack"><p class="label">Formations</p><h3>Bravo, toutes vos leçons sont terminées.</h3></div></div></div></section>`;
    return `<section class="section" aria-label="Ma prochaine leçon"><div class="wrap"><div class="next reveal">
      <div class="stack" style="gap:14px"><p class="label">Votre prochaine leçon · ${esc(courseName(l))}</p><h3>${esc(l.title)}</h3>
        <p class="muted small">${ic('clock', 'i-sm')} ${l.dur} minutes · ${esc(l.chap)}</p>
        <div class="stack" style="max-width:420px"><div class="bar"><i data-v="${g.pct / 100}"></i></div><p class="small muted"><span data-count="${g.pct}" data-suffix=" %">${g.pct} %</span> de votre formation terminée</p></div></div>
      <a class="btn btn-cta has-arrow" href="#lecon-${l.id}">${ic('play', 'i-sm')}Commencer la leçon ${ARW}</a></div></div></section>`;
  },
  updates() {
    const list = UPDATES.filter(u => isAllowed(u.ai) && !isHidden(u.ai)).slice(0, 3);
    if (!list.length) return '';
    return `<section class="section" aria-label="Ce qui change dans mes IA"><div class="wrap">
      <div class="sec-head reveal"><h2 class="h2">Ce qui change dans vos IA</h2><p class="lead">Uniquement les changements qui modifient votre façon de travailler.</p></div>
      <ul class="ledger">${list.map(u => `<li class="reveal"><a class="lrow" href="#nouveautes">${tile(u.ai)}
        <span class="stack" style="gap:4px;min-width:0"><span class="row">${EX}<span class="small muted">${esc(nameOf(u.ai))} · ${esc(u.date)}</span></span><span class="h4">${esc(u.title)}</span><span class="small muted">À faire : ${esc(u.todo)}</span></span>
        <span class="go">${ARW}</span></a></li>`).join('')}</ul>
      <p style="margin-top:24px"><a class="link has-arrow" href="#nouveautes">Toutes les nouveautés ${ARW}</a></p></div></section>`;
  },
  ais() {
    const vis = visibleAIs(); if (!vis.length) return '';
    const items = vis.map(a => `<a class="mq-item" href="#ia-${a.id}">${tile(a.id)}<span class="stack" style="gap:0"><span>${esc(a.name)}</span><span class="tiny muted">${esc(CATS.find(c => c.id === a.cat).name)}</span></span></a>`).join('');
    return `<section class="section" aria-label="Mes IA autorisées"><div class="wrap">
      <div class="sec-head reveal"><h2 class="h2">${vis.length} IA autorisées par votre entreprise</h2><p class="lead">Vos préférées sont aussi dans « Mes IA », à gauche de l’écran : un clic suffit pour les ouvrir.</p></div>
      <div class="ai-row reveal">${items}</div></div></section>`;
  },
  how() {
    const demo = visibleAIs().find(a => a.id === 'lechat') || visibleAIs()[0] || AI.lechat;
    const steps = [['Décrivez votre tâche', 'Avec vos mots, comme à un collègue : « Je dois écrire un mail à un client ».'], ['Recevez la bonne IA', 'Bibl.IA choisit parmi les IA autorisées par votre entreprise, explique pourquoi et vous donne un texte prêt à copier.'], ['Apprenez en 3 minutes', 'Une courte leçon à mettre en pratique tout de suite, puis des questions qui reviennent les jours suivants.']];
    const screens = [
      `<p class="small muted">Votre demande</p><div class="typing">Je dois écrire un mail à un client<span class="caret"></span></div><div class="row"><span class="tag tag-line">Écrire un mail</span><span class="tag tag-line">Traduire</span><span class="tag tag-line">Résumer</span></div>`,
      `<div class="row" style="gap:12px;flex-wrap:nowrap">${tile(demo.id, 'tile-lg')}<div class="stack" style="gap:0"><p class="small muted">L’IA la plus adaptée</p><p class="h4">${esc(demo.short || demo.name)}</p></div></div><div class="prompt"><pre>Rédigez un mail à <mark>[nom du client]</mark> pour <mark>[objet]</mark>. Ton cordial, 10 lignes maximum.</pre></div>`,
      `<p class="small muted">Tronc commun · 4 minutes</p><p class="h4">Objectif, contexte, format</p><ol class="steps" style="gap:8px"><li><span class="small">Comprendre en quelques lignes</span></li><li><span class="small">Essayer tout de suite</span></li><li><span class="small">Une question, puis des révisions</span></li></ol>`];
    return `<section class="section" aria-label="Comment ça marche"><div class="wrap">
      <div class="sec-head"><h2 class="h2">Trois étapes, aucune compétence technique</h2></div>
      <ol class="how">${steps.map(([t, d], i) => `<li><div class="screen" aria-hidden="true">${screens[i]}</div><span class="n">Étape ${i + 1}</span><h3 class="h3">${t}</h3><p class="muted" style="max-width:44ch">${d}</p></li>`).join('')}</ol>
    </div></section>`;
  },
  rules() {
    const r = [['shield', 'Pas de données sensibles', 'Ni mot de passe, ni coordonnées bancaires, ni informations personnelles sur un client ou un collègue.'], ['check', 'Relisez toujours', 'L’IA peut se tromper avec assurance. Vérifiez les noms, les chiffres et les dates avant d’envoyer.'], ['lock', 'Seulement les IA autorisées', 'Votre entreprise a choisi des outils dont elle connaît les règles. Les autres restent verrouillées.']];
    return `<section class="section" aria-label="Les trois bons réflexes"><div class="wrap">
      <div class="sec-head reveal"><h2 class="h2">Les trois bons réflexes</h2></div>
      <div class="rules">${r.map(([i, t, d]) => `<div class="rule">${ic(i)}<h3 class="h4">${t}</h3><p class="muted">${d}</p></div>`).join('')}</div>
      <p style="margin-top:32px"><a class="link has-arrow" href="#lecon-tc20">Leçon : protéger les données de l’entreprise (4 min) ${ARW}</a></p></div></section>`;
  }
};

function armHow() { /* défilement guidé retiré : les trois étapes sont visibles d'un coup d'œil */ }

/* ——— Personnaliser l'accueil ——— */
function openHomeSetup() {
  const render = () => `<div class="modal-top"><h2 class="h4">Personnaliser mon accueil</h2><button class="rp-close" data-close aria-label="Fermer">${ic('x')}</button></div>
    <div class="modal-in stack" style="gap:20px"><p class="muted">La zone « Que devez-vous faire aujourd’hui ? » reste toujours en haut. Choisissez les blocs affichés en dessous et leur ordre.</p>
    <ul class="blk-list">${S.blocks.map((b, i) => `<li data-i="${i}"><button class="tgl" type="button" role="switch" aria-checked="${b.on}" data-t="${i}"><span class="switch" aria-hidden="true"></span><span class="sr-only">Afficher ${BLOCK_NAMES[b.id]}</span></button>
      <span class="name">${BLOCK_NAMES[b.id]}</span>
      <button class="icon-btn" type="button" data-up="${i}" aria-label="Monter ${BLOCK_NAMES[b.id]}" ${i ? '' : 'disabled'}>${ic('arrup', 'i-sm')}</button>
      <button class="icon-btn" type="button" data-down="${i}" aria-label="Descendre ${BLOCK_NAMES[b.id]}" ${i < S.blocks.length - 1 ? '' : 'disabled'}>${ic('arrdown', 'i-sm')}</button></li>`).join('')}</ul>
    <div class="row"><button class="btn btn-primary" type="button" data-close>Terminé</button></div></div>`;
  const m = openModal(render(), {label:'Personnaliser mon accueil', onClose:() => { if ((location.hash.slice(1) || 'accueil') === 'accueil') route(); }});
  const box = $('.modal-box', m);
  box.addEventListener('click', e => {
    const t = e.target.closest('[data-t],[data-up],[data-down]'); if (!t) return;
    let moved = null, focusSel = null;
    if (t.dataset.t != null) { const b = S.blocks[+t.dataset.t]; b.on = !b.on; focusSel = `[data-t="${t.dataset.t}"]`; }
    if (t.dataset.up != null) { const i = +t.dataset.up; [S.blocks[i - 1], S.blocks[i]] = [S.blocks[i], S.blocks[i - 1]]; moved = i - 1; focusSel = `[data-up="${i - 1}"]`; }
    if (t.dataset.down != null) { const i = +t.dataset.down; [S.blocks[i + 1], S.blocks[i]] = [S.blocks[i], S.blocks[i + 1]]; moved = i + 1; focusSel = `[data-down="${i + 1}"]`; }
    save(); box.innerHTML = render();
    if (moved != null) $(`li[data-i="${moved}"]`, box).classList.add('moved');
    const f = $(focusSel, box); (f && !f.disabled ? f : $('[data-close]', box)).focus();
  });
}
