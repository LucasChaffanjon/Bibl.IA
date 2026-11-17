/* ——— Nouveautés ——— */
let updFilter = 'mine';
function viewUpdates() {
  const v = $('#view');
  const chips = [['mine', 'Mes IA'], ['all', 'Toutes'], ...AIS.filter(a => isAllowed(a.id) && UPDATES.some(u => u.ai === a.id)).map(a => [a.id, a.short || a.name])];
  if (!chips.some(c => c[0] === updFilter)) updFilter = 'mine';
  v.innerHTML = `<div class="wrap narrow" style="max-width:1000px"><header class="phead"><h1 class="h1 split">Seulement ce qui change votre façon de travailler</h1>
    <p class="lead">Pas de fil d’actualité. Pour chaque IA, uniquement les changements qui modifient son utilisation, avec ce que vous devez faire.</p>
    <div class="notice">${ic('info')}<span>Contenus de démonstration : chaque fiche illustre le format d’une nouveauté. Les dates sont fictives, vérifiez toujours les annonces des éditeurs.</span></div></header>
    <div class="row" id="updChips" style="margin-bottom:40px">${chips.map(([id, n]) => `<button class="chip" type="button" data-f="${id}" aria-pressed="${updFilter === id}">${esc(n)}</button>`).join('')}</div>
    <div class="tl-wrap" style="position:relative"><ol class="tl" id="tl"></ol></div></div>`;
  splitWords($('.split', v));
  const draw = () => {
    const list = UPDATES.filter(u => isAllowed(u.ai) && (updFilter === 'all' || (updFilter === 'mine' ? !isHidden(u.ai) : u.ai === updFilter)));
    $('#tl').innerHTML = '<span class="tl-fill" aria-hidden="true"></span>' + (list.length ? list.map(u => { const a = AI[u.ai], L = LESSONS[u.lesson];
      return `<li class="reveal" style="--b:${a.color}"><span class="tl-dot" aria-hidden="true"></span><article class="upd">
        <header class="upd-h">${tile(u.ai)}<div class="stack" style="gap:4px;flex:1;min-width:220px"><div class="row">${EX}<span class="small muted">${esc(a.name)} · ${esc(u.date)}</span>${isAllowed(u.ai) ? '' : `<span class="tag tag-line">${ic('lock', 'i-sm')}Non autorisée</span>`}</div><h2 class="h4">${esc(u.title)}</h2></div></header>
        <div class="upd-b"><div><p class="label">Ce qui change concrètement</p><p>${esc(u.change)}</p></div><div><p class="label">Ce que vous devez faire</p><p>${esc(u.todo)}</p></div></div>
        <footer class="upd-f"><a class="link has-arrow" href="${u.link}" target="_blank" rel="noopener">Ouvrir la fonction dans ${esc(a.short || a.name)} ${ic('ext', 'i-sm')}</a>${L ? `<a class="link has-arrow" href="#lecon-${L.id}">${ic('cap', 'i-sm')}Module associé : ${esc(L.title)} ${ARW}</a>` : ''}</footer></article></li>`; }).join('')
      : '<li><p class="muted">Aucune nouveauté pour cette sélection.</p></li>');
    armEffects(v);
  };
  $$('[data-f]', v).forEach(c => c.addEventListener('click', () => { updFilter = c.dataset.f; $$('[data-f]', v).forEach(x => x.setAttribute('aria-pressed', x === c)); draw(); tlScroll(scrollY, innerHeight); }));
  draw();
  function tlScroll() { /* frise statique */ }
}
