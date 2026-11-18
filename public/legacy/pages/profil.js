/* ——— Profil ——— */
const profQuestions = d => empQuestions(d).map(q => `<section class="form-sec"><div class="stack"><h2 class="h4" id="qt-${q.id}">${esc(q.title)}</h2>${q.help ? `<p class="small muted" id="qh-${q.id}">${esc(q.help)}</p>` : ''}</div><div>${qField(q, d[q.id], d[q.id + 'Other'])}</div></section>`).join('');
function viewProfile() {
  const v = $('#view'), d = JSON.parse(JSON.stringify(S.profile));
  const hid = S.hidden.filter(isAllowed).map(id => AI[id]);
  v.innerHTML = `<div class="wrap"><header class="phead"><h1 class="h1 split">Des demandes à votre mesure</h1>
    <p class="lead">Vos réponses sont ajoutées au début de chaque texte à copier, pour que l’IA vous réponde comme un collègue qui connaît votre travail. Votre responsable ne les voit pas.</p></header>
    <div id="profQ">${profQuestions(d)}</div>
    <div class="row" style="padding-block:8px 48px"><button class="btn btn-primary" type="button" id="saveProfile">Enregistrer mon profil</button><button class="btn btn-ghost" type="button" data-act="onboard">Répondre question par question</button></div>
    <section class="form-sec reveal"><div class="stack"><h2 class="h4">Aperçu de votre contexte</h2><p class="small muted">Placé au début de chaque texte à copier, avec la présentation de l’entreprise faite par votre dirigeant.</p></div>
      <div class="ctx"><pre id="ctxPrev">${esc(promptPreview())}</pre></div></section>
    <section class="form-sec reveal"><div class="stack"><h2 class="h4">Ma page d’accueil</h2><p class="small muted">La zone de saisie reste toujours en haut.</p></div>
      <div class="stack" style="gap:16px"><p>${S.blocks.filter(b => b.on).map(b => BLOCK_NAMES[b.id]).join(' · ') || 'Aucun bloc affiché sous la zone de saisie.'}</p><button class="btn btn-ghost" type="button" data-act="home-setup" style="align-self:flex-start">${ic('sliders', 'i-sm')}Personnaliser l’accueil</button></div></section>
    <section class="form-sec reveal"><div class="stack"><h2 class="h4">IA masquées</h2><p class="small muted">Elles n’apparaissent plus dans votre bibliothèque ni dans vos recommandations.</p></div>
      ${hid.length ? `<ul class="blk-list">${hid.map(a => `<li>${tile(a.id)}<span class="name">${esc(a.name)}</span><button class="btn btn-quiet" type="button" data-unhide="${a.id}">${ic('eye', 'i-sm')}Réafficher</button></li>`).join('')}</ul>` : '<p class="muted">Aucune. Vous pouvez masquer une IA depuis sa fiche ou la bibliothèque.</p>'}</section>
    <section class="form-sec reveal"><div class="stack"><h2 class="h4">Mes suggestions d’IA</h2></div>
      <div class="stack" style="gap:16px">${S.suggestions.length ? `<ul class="blk-list">${S.suggestions.map(s => `<li>${ic('bulb')}<span class="name">${esc(s.name)}<span class="small muted"> · ${esc(s.date)}</span></span><span class="tag tag-line">Transmise</span></li>`).join('')}</ul>` : '<p class="muted">Vous n’avez encore rien suggéré.</p>'}
      <button class="btn btn-ghost" type="button" data-act="suggest" style="align-self:flex-start">${ic('plus', 'i-sm')}Suggérer une IA</button></div></section>
    <section class="form-sec reveal"><div class="stack"><h2 class="h4">Données de démonstration</h2><p class="small muted">Tout est enregistré dans ce navigateur uniquement.</p></div>
      <div class="row"><button class="btn btn-quiet" type="button" id="resetBtn">${ic('refresh', 'i-sm')}Réinitialiser la démonstration</button></div></section></div>`;
  splitWords($('.split', v));
  /* Les questions dépendent de la situation : quand elle change, on redessine la liste */
  const qBox = $('#profQ', v);
  const bindAll = () => empQuestions(d).forEach(q => bindQ(qBox, q, d));
  bindAll();
  qBox.addEventListener('q-adapt', () => {
    qBox.innerHTML = profQuestions(d); bindAll();
    const f = $('[data-q-situation][aria-pressed="true"]', qBox) || $('[data-q-situation]', qBox); f && f.focus();
  });
  $('#saveProfile').addEventListener('click', () => { S.profile = JSON.parse(JSON.stringify(Object.assign(d, {done:true}))); save(); /* une copie : les clics suivants ne changent rien tant qu'on n'enregistre pas */ $('#ctxPrev').textContent = promptPreview(); toast('Profil enregistré. Vos prompts en tiennent compte.'); });
  $$('[data-unhide]', v).forEach(b => b.addEventListener('click', () => { toggleHidden(b.dataset.unhide); renderView(true); }));
  const rb = $('#resetBtn'); let armed = false;
  rb.addEventListener('click', () => {
    if (!armed) { armed = true; rb.innerHTML = 'Confirmer : tout effacer'; rb.classList.add('copy', 'ok'); setTimeout(() => { if (armed) { armed = false; rb.classList.remove('copy', 'ok'); rb.innerHTML = ic('refresh', 'i-sm') + 'Réinitialiser la démonstration'; } }, 4000); return; }
    S = DEFAULTS(); save(); keepAsk(null); renderRail(); toast('Démonstration réinitialisée.'); location.hash = '#accueil';
  });
}

/* ——— Suggérer une IA ——— */
function openSuggest() {
  const m = openModal(`<div class="modal-top"><h2 class="h4">Suggérer une IA manquante</h2><button class="rp-close" data-close aria-label="Fermer">${ic('x')}</button></div>
    <form class="modal-in stack" style="gap:20px" id="sugForm" novalidate>
      <p class="muted">Votre responsable recevra votre proposition et décidera de l’ajouter aux IA autorisées.</p>
      <div class="field"><label for="sugName">Nom de l’IA</label><input class="input" id="sugName" required autofocus placeholder="Par exemple : un outil de transcription"></div>
      <div class="field"><label for="sugUrl">Adresse du site (facultatif)</label><input class="input" id="sugUrl" type="url" placeholder="https://"></div>
      <div class="field"><label for="sugWhy">À quoi vous servirait-elle ?</label><textarea class="input" id="sugWhy" placeholder="Par exemple : transcrire mes réunions avec les clients"></textarea></div>
      <p class="small" id="sugErr" style="color:var(--ink-text)" hidden>Indiquez au moins le nom de l’IA.</p>
      <div class="row"><button class="btn btn-primary" type="submit">Envoyer la suggestion</button><button class="btn btn-ghost" type="button" data-close>Annuler</button></div></form>`, {label:'Suggérer une IA'});
  $('#sugForm', m).addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#sugName', m).value.trim();
    if (!name) { $('#sugErr', m).hidden = false; $('#sugName', m).focus(); return; }
    S.suggestions.unshift({name, url:$('#sugUrl', m).value.trim(), why:$('#sugWhy', m).value.trim(), date:new Date().toLocaleDateString('fr-FR', {day:'numeric', month:'long'})});
    save(); closeModal(); toast(`Merci ! « ${name} » est transmise à votre responsable (démonstration : rien n’est envoyé).`);
    if ((location.hash.slice(1)) === 'profil') renderView(true);
  });
}

