/* ——— Activités des leçons du tronc commun ———
   Chaque leçon peut enchaîner plusieurs activités de formes différentes, toutes faisables sans quitter la page :
   · reveal  : une question pour réfléchir, puis la réponse qu’on déplie ;
   · chat    : une demande à une IA, puis la réponse qu’elle aurait donnée, avec ce qu’il faut y remarquer ;
   · sort    : ranger des éléments dans des catégories, avec la correction au fur et à mesure ;
   · order   : remettre des étapes dans l’ordre en les touchant une à une ;
   · pick    : cocher tout ce qui est vrai (ou risqué), puis vérifier ;
   · compare : choisir la meilleure de deux propositions ;
   · build   : construire une demande champ par champ et la copier ;
   · try     : facultatif, essayer pour de vrai dans une IA autorisée (le texte est copié et l’IA s’ouvre).
   Les activités ne bloquent pas la fin de la leçon : seule la question finale le fait. */

const ACT_LABEL = {reveal:'Réfléchissez', chat:'Voyez ce que fait l’IA', sort:'Classez', order:'Remettez dans l’ordre', pick:'Cochez', compare:'Choisissez', build:'Construisez votre demande', try:'Facultatif · Essayez dans une IA'};
const TRY_TOOLS = {assistant:['chatgpt', 'lechat', 'claude', 'copilot', 'gemini'], search:['perplexity', 'chatgpt', 'gemini', 'copilot']};
const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
const paste = isMac ? 'Cmd + V' : 'Ctrl + V';
const textBlock = s => Array.isArray(s) ? `<ul class="act-list">${s.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : `<p>${esc(s)}</p>`;
/* Ordre mélangé mais stable (jamais identique à la bonne réponse) */
const shuffled = n => {
  const p = [...Array(n).keys()].sort((x, y) => (x * 7 + 3) % (n + 1) - (y * 7 + 3) % (n + 1));
  return p.every((v, i) => v === i) ? p.reverse() : p;
};

function actsHTML(l) {
  return l.acts.map((a, i) => `<div class="act act-${a.t}" data-act-i="${i}">
    <p class="act-k">${ACT_LABEL[a.t]}</p>${a.q ? `<p class="act-q">${esc(a.q)}</p>` : ''}${actBody(a, i)}</div>`).join('');
}
function actBody(a, i) {
  switch (a.t) {
    case 'reveal': return `<button class="btn btn-ghost btn-sm act-toggle" type="button" aria-expanded="false">${ic('eye', 'i-sm')}Voir la réponse</button>
      <div class="act-ans" hidden>${textBlock(a.a)}</div>`;
    case 'chat': return `<div class="bubble-row me"><div class="bubble me">${esc(a.ask).replace(/\n/g, '<br>')}</div></div>
      <button class="btn btn-ghost btn-sm act-toggle" type="button" aria-expanded="false">${ic('spark', 'i-sm')}Voir ce que l’IA répond</button>
      <div class="act-ans" hidden><div class="bubble-row"><div class="bubble ai"><span class="bubble-who">Exemple de réponse d’une IA</span>${esc(a.ans).replace(/\n/g, '<br>')}</div></div>
        ${a.notes ? `<div class="act-notes"><p class="label">À remarquer</p>${textBlock(a.notes)}</div>` : ''}</div>`;
    case 'sort': return `<ul class="sort-list">${a.items.map(([txt], j) => `<li class="sort-row" data-j="${j}"><span class="sort-t">${esc(txt)}</span>
        <span class="seg" role="group" aria-label="Choisir une catégorie">${a.cats.map((c, k) => `<button class="seg-b" type="button" data-k="${k}">${esc(c)}</button>`).join('')}</span>
        <span class="sort-why" aria-live="polite"></span></li>`).join('')}</ul><p class="act-score" aria-live="polite"></p>`;
    case 'order': { const mix = shuffled(a.items.length);
      return `<p class="small muted">Touchez les éléments dans le bon ordre. Touchez un élément placé pour le retirer.</p>
        <div class="ord-pool">${mix.map(j => `<button class="chip ord-c" type="button" data-j="${j}">${esc(a.items[j])}</button>`).join('')}</div>
        <ol class="ord-seq" aria-label="Votre ordre"></ol>
        <div class="act-fb" aria-live="polite"></div>`; }
    case 'pick': return `<div class="pick-list">${a.items.map(([txt], j) => `<button class="pick" type="button" aria-pressed="false" data-j="${j}"><span class="pick-box" aria-hidden="true"></span><span class="pick-t">${esc(txt)}</span><span class="pick-why"></span></button>`).join('')}</div>
      <div class="row"><button class="btn btn-primary btn-sm act-check" type="button">Vérifier</button></div><p class="act-score" aria-live="polite"></p>`;
    case 'compare': return `<div class="cmp">${a.opts.map((o, k) => `<button class="cmp-o" type="button" data-k="${k}"><span class="cmp-l">${k ? 'Demande B' : 'Demande A'}</span><span class="cmp-t">${esc(o)}</span></button>`).join('')}</div>
      <div class="act-fb" aria-live="polite"></div>`;
    case 'build': return `<div class="bld">${a.fields.map(([lab, ph], k) => `<label class="field"><span class="flabel">${esc(lab)}</span><textarea class="input bld-in" rows="2" data-k="${k}" placeholder="${esc(ph)}"></textarea></label>`).join('')}</div>
      <div class="lprompt"><pre class="bld-out" aria-live="polite"></pre><button class="btn btn-quiet copy bld-copy" type="button">${ic('copy', 'i-sm')}Copier</button></div>
      ${a.check ? `<div class="act-notes"><p class="label">Avant d’envoyer</p>${textBlock(a.check)}</div>` : ''}${tryLinks(a.tools || 'assistant', 'bld')}`;
    case 'try': return `<p>${esc(a.task)}</p>
      <details class="act-what"><summary>C’est quoi, une IA « assistant » ?</summary><p>C’est un site ou une application où vous écrivez une demande, comme dans une messagerie, et qui vous répond par écrit. ChatGPT, Le Chat ou Claude sont des assistants. Vous n’avez rien à installer : un compte suffit, celui indiqué par votre entreprise.</p></details>
      <ol class="act-steps"><li>Cliquez sur le bouton d’une IA ci-dessous : le texte est copié et l’IA s’ouvre dans un nouvel onglet.</li><li>Cliquez dans la zone où l’on écrit, en bas de la page de l’IA, puis collez avec <kbd>${paste}</kbd>.</li><li>Remplacez les passages entre [crochets] par vos informations, puis envoyez avec la touche Entrée.</li><li>Lisez la réponse, puis revenez sur cet onglet.</li></ol>
      <div class="lprompt"><pre class="try-text">${esc(a.prompt)}</pre><button class="btn btn-quiet copy try-copy" type="button">${ic('copy', 'i-sm')}Copier</button></div>
      ${tryLinks(a.tools || 'assistant', 'try')}
      ${a.sample ? `<button class="btn btn-ghost btn-sm act-toggle" type="button" aria-expanded="false">${ic('eye', 'i-sm')}Pas le temps ? Voir un exemple de réponse</button>
        <div class="act-ans" hidden><div class="bubble ai"><span class="bubble-who">Exemple de réponse d’une IA</span>${esc(a.sample).replace(/\n/g, '<br>')}</div></div>` : ''}`;
  }
  return '';
}
/* Boutons « Copier et ouvrir » vers les IA autorisées par l’entreprise */
function tryLinks(kind, src) {
  const ids = TRY_TOOLS[kind].filter(id => AI[id] && isAllowed(id) && !isHidden(id)).slice(0, 3);
  if (!ids.length) return `<p class="small muted">Aucune IA de ce type n’est autorisée pour l’instant dans votre entreprise. Vous pouvez quand même lire l’exemple de réponse.</p>`;
  return `<div class="try-links">${ids.map(id => `<a class="btn btn-ghost try-go" href="${AI[id].url}" target="_blank" rel="noopener" data-src="${src}">${tile(id, 'tile-xs')}Copier et ouvrir ${esc(AI[id].name)}${ic('ext', 'i-sm')}</a>`).join('')}</div>`;
}

function bindActs(scope, l) {
  if (!l.acts) return;
  $$('.act', scope).forEach(box => {
    const a = l.acts[+box.dataset.actI];
    $$('.act-toggle', box).forEach(b => b.addEventListener('click', () => {
      const ans = b.nextElementSibling, open = b.getAttribute('aria-expanded') !== 'true';
      if (!b.dataset.label) b.dataset.label = b.innerHTML;
      b.innerHTML = open ? `${ic('eyeoff', 'i-sm')}Masquer` : b.dataset.label;
      b.setAttribute('aria-expanded', open); ans.hidden = !open;
      if (open) { ans.classList.remove('appear'); void ans.offsetWidth; ans.classList.add('appear'); }
    }));
    if (a.t === 'sort') bindSort(box, a);
    if (a.t === 'order') bindOrder(box, a);
    if (a.t === 'pick') bindPick(box, a);
    if (a.t === 'compare') bindCompare(box, a);
    if (a.t === 'build') bindBuild(box, a);
    if (a.t === 'try') { const pre = $('.try-text', box); $('.try-copy', box).addEventListener('click', e => copyText(a.prompt, e.currentTarget, pre)); }
    /* Copier en même temps que l’IA s’ouvre : le lien s’ouvre normalement dans un nouvel onglet */
    $$('.try-go', box).forEach(g => g.addEventListener('click', () => {
      const text = g.dataset.src === 'bld' ? $('.bld-out', box).textContent : a.prompt;
      try { navigator.clipboard.writeText(text).then(() => toast(`Texte copié. Collez-le dans l’IA avec ${paste}.`)); } catch (e) {}
    }));
  });
}
function bindSort(box, a) {
  let n = 0, good = 0;
  $$('.sort-row', box).forEach(row => {
    const [, right, why] = a.items[+row.dataset.j];
    $$('.seg-b', row).forEach(b => b.addEventListener('click', () => {
      if (row.classList.contains('done')) return;
      const k = +b.dataset.k, ok = k === right; n++; if (ok) good++;
      row.classList.add('done', ok ? 'right' : 'wrong');
      $$('.seg-b', row).forEach(x => { x.disabled = true; if (+x.dataset.k === right) x.classList.add('is-right'); else if (x === b) x.classList.add('is-wrong'); });
      $('.sort-why', row).innerHTML = `<strong>${ok ? 'Oui.' : `Non : ${esc(a.cats[right])}.`}</strong> ${esc(why || '')}`;
      if (n === a.items.length) $('.act-score', box).textContent = `${good} bonne${good > 1 ? 's' : ''} réponse${good > 1 ? 's' : ''} sur ${n}.${good === n ? ' Parfait.' : ' Relisez les explications ci-dessus.'}`;
    }));
  });
}
function bindOrder(box, a) {
  const pool = $('.ord-pool', box), seq = $('.ord-seq', box), fb = $('.act-fb', box);
  const check = () => {
    const got = $$('li', seq).map(li => +li.dataset.j);
    if (got.length < a.items.length) { fb.innerHTML = ''; return; }
    const ok = got.every((j, i) => j === i);
    $$('li', seq).forEach((li, i) => li.classList.toggle('wrong', +li.dataset.j !== i));
    fb.innerHTML = ok ? `<p class="fb-ok">${ic('check', 'i-sm')}<strong>Exact.</strong> ${esc(a.why || '')}</p>`
      : `<p class="fb-no"><strong>Pas tout à fait.</strong> Les éléments en rouge ne sont pas à leur place. Touchez-les pour les retirer et réessayez.</p>`;
    seq.classList.toggle('solved', ok);
  };
  pool.addEventListener('click', e => {
    const c = e.target.closest('.ord-c'); if (!c || seq.classList.contains('solved')) return;
    const li = document.createElement('li'); li.dataset.j = c.dataset.j;
    li.innerHTML = `<button type="button" class="ord-p">${esc(a.items[+c.dataset.j])}</button>`;
    seq.appendChild(li); c.hidden = true; check();
  });
  seq.addEventListener('click', e => {
    const li = e.target.closest('li'); if (!li || seq.classList.contains('solved')) return;
    $(`.ord-c[data-j="${li.dataset.j}"]`, pool).hidden = false; li.remove();
    $$('li', seq).forEach(x => x.classList.remove('wrong')); check();
  });
}
function bindPick(box, a) {
  const btns = $$('.pick', box);
  btns.forEach(b => b.addEventListener('click', () => { if (!box.classList.contains('checked')) b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); }));
  $('.act-check', box).addEventListener('click', e => {
    box.classList.add('checked'); e.currentTarget.disabled = true; let good = 0;
    btns.forEach(b => {
      const [, ok, why] = a.items[+b.dataset.j], on = b.getAttribute('aria-pressed') === 'true', right = on === ok;
      if (right) good++;
      b.classList.add(right ? 'right' : 'wrong', ok ? 'is-yes' : 'is-no'); b.disabled = true;
      $('.pick-why', b).innerHTML = `<strong>${ok ? (a.yes || 'À cocher') : (a.no || 'À laisser')}.</strong> ${esc(why || '')}`;
    });
    $('.act-score', box).textContent = good === btns.length ? 'Tout est juste.' : `${good} sur ${btns.length} justes. Les explications sont sous chaque ligne.`;
  });
}
function bindCompare(box, a) {
  const os = $$('.cmp-o', box);
  os.forEach(o => o.addEventListener('click', () => {
    const k = +o.dataset.k, ok = k === a.a;
    os.forEach(x => { x.disabled = true; x.classList.add(+x.dataset.k === a.a ? 'right' : 'dim'); });
    if (!ok) o.classList.add('wrong');
    $('.act-fb', box).innerHTML = `<p class="${ok ? 'fb-ok' : 'fb-no'}"><strong>${ok ? 'Bien vu.' : `Plutôt la demande ${a.a ? 'B' : 'A'}.`}</strong> ${esc(a.why)}</p>`;
  }));
}
function bindBuild(box, a) {
  const ins = $$('.bld-in', box), out = $('.bld-out', box);
  const render = () => { out.textContent = ins.map((x, k) => `${a.fields[k][0]} : ${x.value.trim() || '[à compléter]'}`).join('\n'); };
  ins.forEach(x => x.addEventListener('input', render)); render();
  $('.bld-copy', box).addEventListener('click', e => copyText(out.textContent, e.currentTarget, out));
}
