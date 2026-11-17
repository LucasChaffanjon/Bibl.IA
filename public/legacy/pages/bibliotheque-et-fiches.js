/* ——— Bibliothèque ——— */
let libTab = 'all', libShowHidden = false;
function aiCard(a, i) {
  const off = !isAllowed(a.id), hid = isHidden(a.id);
  const pf = a.price.free.startsWith('Oui') || a.price.free.includes('inclus') ? 'Version gratuite' : 'Payant';
  return `<article class="card ai-card reveal ${off ? 'is-off' : ''} ${hid ? 'is-hidden' : ''}" style="--rv:${i % 3};--b:${a.color}">
    <div class="ai-top">${tile(a.id)}
      ${off ? `<span class="tag tag-line">${ic('lock', 'i-sm')}Non autorisée</span>` : `<button class="btn btn-quiet hide-btn" type="button" data-hide="${a.id}" aria-label="${hid ? 'Réafficher' : 'Masquer'} ${esc(a.name)}">${ic(hid ? 'eye' : 'eyeoff', 'i-sm')}${hid ? 'Réafficher' : 'Masquer'}</button>`}</div>
    <h3><a class="stretch" href="#ia-${a.id}">${esc(a.name)}</a></h3>
    <p class="tagline">${esc(a.tagline)}</p>
    <div class="row"><span class="tag tag-line">${esc(pf)}</span><span class="tag tag-line">${esc(a.origin)}</span></div>
    <span class="link has-arrow foot-link">Voir la fiche ${ARW}</span></article>`;
}
function viewLibrary() {
  const v = $('#view');
  const tabs = [['all', 'Toutes'], ...CATS.filter(c => AIS.some(a => a.cat === c.id && isAllowed(a.id))).map(c => [c.id, c.name])];
  if (!tabs.some(t => t[0] === libTab)) libTab = 'all';
  const draw = () => {
    const list = AIS.filter(a => isAllowed(a.id) && (libTab === 'all' || a.cat === libTab) && (libShowHidden || !isHidden(a.id)));
    $('#libGrid').innerHTML = list.map(aiCard).join('') + `<button class="card dashed reveal" type="button" data-act="suggest"><span class="ico">${ic('plus')}</span><h3 class="h4">Il manque une IA ?</h3><p class="muted">Suggérez-la : votre responsable recevra votre proposition.</p><span class="link has-arrow">Suggérer une IA ${ARW}</span></button>`;
    $$('[data-hide]', v).forEach(b => b.addEventListener('click', e => { e.preventDefault(); toggleHidden(b.dataset.hide); draw(); }));
    armHover(v); armEffects(v);
  };
  v.innerHTML = `<div class="wrap"><header class="phead"><h1 class="h1 split">La bibliothèque des IA</h1>
    <p class="lead">Une fiche par IA : à quoi elle sert, son prix, ce que deviennent vos données et ses dernières nouveautés. Vous y trouvez uniquement les IA autorisées par votre entreprise.</p></header>
    <div class="toolbar"><div class="tabs" role="tablist" aria-label="Catégories"><span class="tabs-ind" aria-hidden="true"></span>${tabs.map(([id, n]) => `<button role="tab" type="button" data-tab="${id}" aria-selected="${libTab === id}">${esc(n)}</button>`).join('')}</div>
      <button class="check" type="button" role="switch" aria-checked="${libShowHidden}" id="showHid"><span class="switch" aria-hidden="true"></span>Afficher les IA masquées (${S.hidden.filter(isAllowed).length})</button></div>
    <div class="grid3" id="libGrid"></div>
    <p class="note" style="margin-top:32px">Fiches de démonstration : prix et règles de données indicatifs, à vérifier sur le site de chaque éditeur.</p></div>`;
  splitWords($('.split', v));
  const ind = $('.tabs-ind', v);
  const placeInd = () => { const b = $('[aria-selected="true"]', v); if (b) { ind.style.width = b.offsetWidth + 'px'; ind.style.transform = `translateX(${b.offsetLeft - 4}px)`; } };
  $$('[data-tab]', v).forEach(b => b.addEventListener('click', () => { libTab = b.dataset.tab; $$('[data-tab]', v).forEach(x => x.setAttribute('aria-selected', x === b)); placeInd(); draw(); }));
  $('#showHid').addEventListener('click', e => { libShowHidden = !libShowHidden; e.currentTarget.setAttribute('aria-checked', libShowHidden); draw(); });
  requestAnimationFrame(placeInd); window.addEventListener('resize', placeInd); onCleanup(() => window.removeEventListener('resize', placeInd));
  draw();
}
function toggleHidden(id) {
  const a = AI[id];
  if (isHidden(id)) { S.hidden = S.hidden.filter(x => x !== id); toast(`${a.name} est de nouveau visible dans votre bibliothèque.`); }
  else { S.hidden.push(id); toast(`${a.name} est masquée. Vous pouvez la réafficher à tout moment.`, 'eyeoff'); }
  save(); renderRail();
}

/* ——— Fiche d'une IA ——— */
function viewFiche(id) {
  const a = AI[id], off = !isAllowed(id), hid = isHidden(id), v = $('#view');
  if (off) { v.innerHTML = `<div class="wrap"><header class="phead"><h1 class="h1">Cette fiche n’est pas disponible</h1><p class="lead">Cet outil ne fait pas partie des IA proposées par votre entreprise.</p><p><a class="btn btn-ghost has-arrow" href="#bibliotheque">Voir la bibliothèque ${ARW}</a></p></header></div>`; return; }
  const ups = UPDATES.filter(u => u.ai === id), pct = coursePct(id), nl = courseLessons(id).find(l => !S.done.includes(l.id));
  v.innerHTML = `<div class="wrap">
    <div class="fiche-head">${tile(id, 'tile-xl')}
      <div class="stack" style="gap:16px"><nav class="crumb" aria-label="Fil d’Ariane"><a href="#bibliotheque">Bibliothèque</a><span>/</span><span>${esc(CATS.find(c => c.id === a.cat).name)}</span></nav>
        <h1 class="h1 split">${esc(a.name)}</h1><p class="lead">${esc(a.tagline)}</p>
        <div class="row">${off ? `<span class="tag tag-line">${ic('lock', 'i-sm')}Non autorisée par votre entreprise</span>` : `<span class="tag">${ic('check', 'i-sm')}Autorisée par votre entreprise</span>`}<span class="tag tag-line">${esc(a.editor)} · ${esc(a.origin)}</span></div>
        <div class="row" style="margin-top:8px">${off ? `<p class="small muted">Demandez à votre responsable de l’autoriser depuis l’espace dirigeant.</p>` : `<a class="btn btn-primary" href="${a.url}" target="_blank" rel="noopener">Ouvrir ${esc(a.short || a.name)} ${ic('ext', 'i-sm')}</a>
          <button class="btn btn-ghost" type="button" id="hideMe">${ic(hid ? 'eye' : 'eyeoff', 'i-sm')}${hid ? 'Réafficher dans ma bibliothèque' : 'Masquer de ma bibliothèque'}</button>`}</div></div></div>
    <div class="fiche-grid">
      <section class="fiche-cell reveal"><p class="label">À quoi elle sert</p><ul class="ticks">${a.usages.map(u => `<li>${ic('check', 'i-sm')}<span>${esc(u)}</span></li>`).join('')}</ul></section>
      <section class="fiche-cell reveal"><p class="label">Prix</p><dl class="kv"><dt>Version gratuite</dt><dd>${esc(a.price.free)}</dd><dt>Abonnement individuel</dt><dd>${esc(a.price.solo)}</dd><dt>Pour l’entreprise</dt><dd>${esc(a.price.team)}</dd></dl><p class="note">Tarifs indicatifs, à vérifier sur le site de l’éditeur.</p></section>
      <section class="fiche-cell reveal"><p class="label">Ce que deviennent vos données</p><p>${esc(a.data)}</p><p class="callout">Quel que soit l’outil : pas de mot de passe, de coordonnées bancaires ni d’informations personnelles sur un client ou un collègue.</p><p class="note">Informations indicatives : les conditions de l’éditeur font foi.</p></section>
      <section class="fiche-cell reveal"><p class="label">Se former</p><h2 class="h3">${esc(COURSES[id].name)}</h2><div class="bar"><i data-v="${pct / 100}"></i></div><p class="small muted">${pct} % terminé · 8 leçons de 3 à 5 minutes</p>
        ${nl ? `<a class="link has-arrow" href="#lecon-${nl.id}">Leçon suivante : ${esc(nl.title)} ${ARW}</a>` : '<p class="small">Parcours terminé.</p>'}</section>
    </div>
    <section class="section" style="border-top:0;padding-top:64px"><div class="sec-head reveal"><h2 class="h2">Ce qui a changé dans ${esc(a.short || a.name)}</h2></div>
      ${ups.length ? `<ul class="ledger">${ups.map(u => `<li class="reveal"><a class="lrow" href="#nouveautes"><span class="tag tag-ex">[Exemple]</span><span class="stack" style="gap:4px"><span class="h4">${esc(u.title)}</span><span class="small muted">${esc(u.change)}</span></span><span class="go">${ARW}</span></a></li>`).join('')}</ul>` : '<p class="muted">Aucune nouveauté importante pour le moment.</p>'}</section></div>`;
  splitWords($('.split', v));
  const hb = $('#hideMe'); if (hb) hb.addEventListener('click', () => { toggleHidden(id); viewFiche(id); armEffects(v); armHover(v); });
}

