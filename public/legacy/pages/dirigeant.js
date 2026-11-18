/* ——— Espace dirigeant ——— */
function weeklyChart() {
  const W = 640, H = 260, L = 44, R = 8, T = 24, B = 34, max = 400, n = DASH.weekly.length;
  const bw = (W - L - R) / n, y = v => T + (H - T - B) * (1 - v / max), bar = (W - L - R) / n * .56;
  let g = '';
  [0, 100, 200, 300, 400].forEach(t => { g += `<line class="gl" x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}"/><text class="ax" x="${L - 8}" y="${y(t) + 4}" text-anchor="end">${t}</text>`; });
  DASH.weekly.forEach((v, i) => {
    const x = L + i * bw + (bw - bar) / 2, top = y(v), base = y(0), r = 4;
    g += `<path class="col" style="transition-delay:${i * 70}ms" d="M${x},${base} V${top + r} Q${x},${top} ${x + r},${top} H${x + bar - r} Q${x + bar},${top} ${x + bar},${top + r} V${base} Z"/>`;
    g += `<text class="ax" x="${x + bar / 2}" y="${H - 12}" text-anchor="middle">${DASH.weeks[i].replace(' sept.', '/09').replace(' oct.', '/10').replace(' nov.', '/11')}</text>`;
    g += `<rect class="hit" x="${L + i * bw}" y="${T}" width="${bw}" height="${H - T - B}" fill="transparent" data-i="${i}"/>`;
  });
  const lx = L + (n - 1) * bw + bw / 2;
  g += `<text x="${lx}" y="${y(DASH.weekly[n - 1]) - 8}" text-anchor="middle" style="font-size:12px;fill:var(--fg)">${DASH.weekly[n - 1]}</text>`;
  return `<div class="chart-wrap" data-draw><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Recherches par semaine, de ${DASH.weekly[0]} à ${DASH.weekly[n - 1]}">${g}</svg><div class="tip" aria-hidden="true"></div></div>`;
}
function viewBoss() {
  const v = $('#view'), w = DASH.weekly, last = w.slice(-4).reduce((a, b) => a + b, 0), prev = w.slice(0, 4).reduce((a, b) => a + b, 0);
  const delta = Math.round((last - prev) / prev * 100), avg = Math.round(DASH.training.reduce((a, t) => a + t[1], 0) / DASH.training.length);
  const c = S.company;
  v.innerHTML = `<div class="wrap"><header class="phead"><h1 class="h1 split">Pilotez l’IA dans votre entreprise, sans surveiller personne</h1>
    <p class="lead">Présentez votre entreprise, choisissez les IA autorisées, invitez vos salariés et suivez l’adoption en chiffres agrégés et anonymes.</p></header>
    <section class="co reveal" aria-label="Présentation de l’entreprise">
      <div class="stack" style="gap:14px">
        <h2 class="h3">${c.done ? esc(c.name || 'Votre entreprise') : 'Présentez votre entreprise'}</h2>
        <p class="muted">${c.done ? 'Ces informations sont ajoutées au début des textes proposés à tous vos salariés : l’IA connaît votre activité, vos clients et vos règles.' : 'Dix questions, environ deux minutes. Chaque texte proposé à vos salariés tiendra compte de votre activité, de vos clients et de vos règles.'}</p>
        <div class="row"><button class="btn btn-primary has-arrow" type="button" id="coEdit">${c.done ? 'Modifier la présentation' : 'Présenter mon entreprise'} ${ARW}</button></div></div>
      <div class="ctx"><p class="label">${c.done ? 'Ajouté au début des textes de vos salariés' : 'Aperçu'}</p><pre>${c.done ? esc(promptPreview('company')) : 'Mon entreprise : [nom], secteur [secteur], [taille] salariés. [Ce que fait l’entreprise].\nNos clients : [types de clients].\nAvec nos clients : [ton].\nRègles à respecter : [vos règles].'}</pre></div>
    </section>
    <div class="notice reveal" style="margin-bottom:24px">${ic('info')}<span>Tableau de bord de démonstration : chiffres fictifs ${EX}</span></div>
    <div class="stats reveal">
      <div class="stat"><span class="label">Recherches sur 4 semaines</span><span class="big" data-count="${last}">${fr(last)}</span><span class="small muted">+${delta} % par rapport aux 4 semaines précédentes</span></div>
      <div class="stat"><span class="label">Salariés inscrits</span><span class="big" data-count="${DASH.active}">${DASH.active}</span><span class="small muted">sur ${DASH.invited + S.invites} invités</span></div>
      <div class="stat"><span class="label">IA autorisées</span><span class="big" id="allowedCount">${S.allowed.length}</span><span class="small muted">sur ${AIS.length} dans la bibliothèque</span></div>
      <div class="stat"><span class="label">Formations terminées</span><span class="big" data-count="${avg}" data-suffix=" %">${avg} %</span><span class="small muted">avancement moyen de l’équipe</span></div></div>
    <section class="section" style="border-top:0;padding-top:48px"><div class="grid2">
      <div class="chart-card reveal"><div class="stack"><p class="label">Recherches par semaine</p><p class="small muted">Nombre total de demandes faites dans Bibl.IA</p></div>${weeklyChart()}</div>
      <div class="chart-card reveal"><div class="stack"><p class="label">IA les plus utilisées</p><p class="small muted">Part des IA ouvertes depuis une recommandation</p></div>
        <ul class="hbars">${DASH.top.map(([id, p], i) => `<li class="hbar" style="--i:${i}"><span class="row" style="gap:8px;flex-wrap:nowrap;min-width:0">${tile(id, 'tile-xs')}${esc(nameOf(id))}</span><span class="track"><span class="fill" data-v="${p / 40}" style="display:block"></span></span><span class="v">${p} %</span></li>`).join('')}</ul></div>
    </div>
    <div class="chart-card reveal" style="margin-top:24px"><div class="stack"><p class="label">Avancement global des formations</p><p class="small muted">Moyenne de l’équipe, jamais par personne</p></div>
      <ul class="hbars">${DASH.training.map(([n, p], i) => `<li class="hbar" style="--i:${i};grid-template-columns:minmax(0,260px) minmax(0,1fr) 48px"><span>${esc(n)}</span><span class="track"><span class="fill" data-v="${p / 100}" style="display:block"></span></span><span class="v">${p} %</span></li>`).join('')}</ul></div></section>
    <section class="section"><div class="sec-head reveal"><h2 class="h2">Des chiffres d’équipe, et le suivi des formations</h2></div>
      <div class="privacy reveal"><div>${ic('users')}<h3 class="h4">Ce que vous voyez</h3><p class="muted">Des chiffres d’équipe, sans nom : IA les plus utilisées, évolution de l’utilisation, nombre de salariés actifs. Et, pour chaque salarié, son avancement dans les formations. Vos salariés en sont informés dans leur espace.</p></div>
        <div>${ic('eyeoff')}<h3 class="h4">Ce que vous ne verrez jamais</h3><p class="muted">Le contenu des demandes de vos salariés, ni qui utilise quelle IA, ni combien de fois.</p></div>
        <div>${ic('shield')}<h3 class="h4">Seuil d’anonymat</h3><p class="muted">Les chiffres d’utilisation des IA ne s’affichent qu’à partir de 5 salariés actifs, pour qu’aucune personne ne soit reconnaissable.</p></div></div></section>
    <section class="section"><div class="sec-head reveal"><h2 class="h2">Choisissez les IA de votre entreprise</h2><p class="lead">Vos salariés ne voient que les IA autorisées : les autres n’apparaissent nulle part dans leur espace, ni dans leurs recommandations.</p></div>
      <ul class="allow reveal">${AIS.map(a => `<li>${tile(a.id)}<div class="stack" style="gap:2px;min-width:0"><span>${esc(a.name)}</span><span class="small muted">${esc(a.editor)} · ${esc(a.origin)} · ${esc(CATS.find(x => x.id === a.cat).name)}</span>
          <details class="allow-d"><summary>Usages, prix et données</summary><p class="small">${esc(a.tagline)}</p><p class="small"><strong style="font-weight:500">Prix : </strong>${esc(a.price.free)} · ${esc(a.price.team)}</p><p class="small"><strong style="font-weight:500">Données : </strong>${esc(a.data)}</p></details></div>
        <button class="switch-btn" type="button" role="switch" aria-checked="${isAllowed(a.id)}" data-allow="${a.id}"><span class="switch" aria-hidden="true"></span><span class="lbl">${isAllowed(a.id) ? 'Autorisée' : 'Non autorisée'}</span><span class="sr-only"> : ${esc(a.name)}</span></button></li>`).join('')}</ul></section>
    <section class="section"><div class="grid2">
      <div class="stack reveal" style="gap:16px"><h2 class="h3">Ajoutez votre équipe en une minute</h2><p class="muted">Collez les adresses e-mail, séparées par des virgules ou des retours à la ligne.</p></div>
      <form class="stack reveal" style="gap:16px" id="invForm" novalidate>
        <div class="field"><label for="invMails">Adresses e-mail</label><textarea class="input" id="invMails" placeholder="prenom.nom@entreprise.fr, …"></textarea></div>
        <p class="small" id="invMsg" hidden></p>
        <div class="row"><button class="btn btn-primary" type="submit">${ic('mail', 'i-sm')}Préparer les invitations</button></div>
        <div class="field"><span class="flabel">Ou partagez le lien d’invitation</span><div class="copyline"><code id="invLink">https://bibl-ia.example/rejoindre/7F3K-DEMO</code><button class="btn btn-quiet" type="button" id="invCopy">${ic('copy', 'i-sm')}Copier</button></div></div>
      </form></div></section></div>`;
  splitWords($('.split', v));
  $('#coEdit').addEventListener('click', openCompanyQuiz);
  $$('[data-allow]', v).forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.allow, on = !isAllowed(id);
    S.allowed = on ? [...S.allowed, id] : S.allowed.filter(x => x !== id); save(); renderRail();
    b.setAttribute('aria-checked', on); $('.lbl', b).textContent = on ? 'Autorisée' : 'Non autorisée'; $('#allowedCount').textContent = S.allowed.length;
    toast(on ? `${AI[id].name} est maintenant proposée à vos salariés.` : `${AI[id].name} n’apparaît plus pour vos salariés.`, on ? 'check' : 'lock');
  }));
  $('#invForm').addEventListener('submit', e => {
    e.preventDefault();
    const list = $('#invMails').value.split(/[\s,;]+/).filter(Boolean), ok = list.filter(x => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x)), msg = $('#invMsg');
    msg.hidden = false;
    if (!ok.length) { msg.textContent = 'Aucune adresse valide. Vérifiez le format : prenom.nom@entreprise.fr'; return; }
    S.invites += ok.length; save(); $('#invMails').value = '';
    msg.textContent = `${ok.length} invitation${ok.length > 1 ? 's' : ''} préparée${ok.length > 1 ? 's' : ''}${list.length > ok.length ? ` · ${list.length - ok.length} adresse(s) ignorée(s)` : ''}. Démonstration : aucun e-mail n’est envoyé.`;
    toast(`${ok.length} invitation${ok.length > 1 ? 's' : ''} préparée${ok.length > 1 ? 's' : ''}.`, 'mail');
  });
  $('#invCopy').addEventListener('click', e => copyText($('#invLink').textContent, e.currentTarget, $('#invLink')));
  // Infobulle du graphique
  const wrap = $('.chart-wrap', v), tip = $('.tip', wrap), cols = $$('.col', wrap);
  $$('.hit', wrap).forEach(h => {
    h.addEventListener('pointerenter', () => {
      const i = +h.dataset.i, r = wrap.getBoundingClientRect(), b = cols[i].getBoundingClientRect();
      cols.forEach((c, k) => c.classList.toggle('dim', k !== i));
      tip.innerHTML = `Semaine du ${DASH.weeks[i]} : <strong style="font-weight:500">${DASH.weekly[i]}</strong> recherches`;
      tip.style.left = (b.left - r.left + b.width / 2) + 'px'; tip.style.top = (b.top - r.top) + 'px'; tip.classList.add('on');
    });
    h.addEventListener('pointerleave', () => { cols.forEach(c => c.classList.remove('dim')); tip.classList.remove('on'); });
  });
}
