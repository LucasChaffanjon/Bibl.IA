/* ——— Outils ——— */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ic = (n, cls = '') => `<svg class="i ${cls}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const ARW = '<svg class="arrow" viewBox="0 0 10 10" aria-hidden="true"><path class="stem" d="M0 5h7" stroke="currentColor" stroke-width="1.5"/><path class="head" d="M1 1l4 4-4 4" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>';
const LOGOS = new Set(['chatgpt','lechat','claude','copilot','gemini','perplexity','notebooklm','deepl','canva']);
const tile = (id, cls = '', st = '') => `<span class="tile ${cls}${LOGOS.has(id) ? ' has-logo' : ''}" style="--b:${AI[id].color};${st}" aria-hidden="true">${LOGOS.has(id) ? `<svg viewBox="0 0 24 24" focusable="false"><use href="#logo-${id}"/></svg>` : esc(AI[id].mono)}</span>`;
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\u2019'\-]/g, ' ');
const fr = n => Math.round(n).toLocaleString('fr-FR');
const RM = window.matchMedia('(prefers-reduced-motion: reduce)');
const isSmall = () => window.matchMedia('(max-width: 760px)').matches;
const EX = '<span class="tag tag-ex">[Exemple]</span>';
/* Coche de réussite (fin de leçon, fin de questionnaire) : le disque apparaît, puis la coche se dessine */
const DONE_MARK = '<span class="done-mark" aria-hidden="true"><svg viewBox="0 0 52 52"><circle class="done-ring" cx="26" cy="26" r="25"/><path class="done-check" d="M15 27l7.5 7.5L37 19"/></svg></span>';

/* ——— État de démonstration (reste dans ce navigateur) ——— */
const KEY = 'biblia-demo-v2';
const DEFAULTS = () => ({
  profile:{situation:'', situationOther:'', job:'', jobOther:'', studyLevel:'', studyLevelOther:'', tasks:[], tasksOther:'', audience:[], audienceOther:'', tone:'', toneOther:'', format:'', formatOther:'', langs:[], langsOther:'', level:'', tools:[], toolsOther:'', notes:'', done:false},
  company:{name:'', sector:'', sectorOther:'', size:'', activity:'', clients:[], clientsOther:'', area:'', areaOther:'', values:[], valuesOther:'', voice:'', voiceOther:'', rules:'', notes:'', done:false},
  allowed:['chatgpt','lechat','claude','copilot','perplexity','deepl','canva','gamma'],
  hidden:[], dock:['chatgpt','lechat','claude','copilot','perplexity','deepl'], done:['tc1'], rev:{tc1:{n:0,due:0}}, ratings:{}, suggestions:[], invites:0, welcomeOff:false,
  blocks:[{id:'next',on:true},{id:'updates',on:true},{id:'ais',on:true},{id:'how',on:true},{id:'rules',on:true}]
});
let S = DEFAULTS();
try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(DEFAULTS(), JSON.parse(raw)); S.profile = Object.assign(DEFAULTS().profile, S.profile); S.company = Object.assign(DEFAULTS().company, S.company); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
/* Les écrans d'inscription (React) transmettent la situation choisie (étudiant, freelance…) au profil. */
window.BiblIADemo = ({profile, company} = {}) => { if (profile) Object.assign(S.profile, profile); if (company) Object.assign(S.company, company); save(); };
const isAllowed = id => S.allowed.includes(id);
const isHidden = id => S.hidden.includes(id);
const visibleAIs = () => AIS.filter(a => isAllowed(a.id) && !isHidden(a.id));

/* ——— Notifications ——— */
function toast(msg, icon = 'check') {
  const t = document.createElement('div');
  t.className = 'toast'; t.innerHTML = ic(icon) + `<span>${esc(msg)}</span>`;
  $('#toasts').append(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 320); }, 3200);
}

/* ——— Fenêtres ——— */
let lastFocus = null;
function openModal(html, {wide = false, label = 'Fenêtre', onClose} = {}) {
  closeModal(true);
  lastFocus = document.activeElement;
  const root = $('#modalRoot');
  root.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-label="${esc(label)}"><div class="modal-scrim" data-close></div><div class="modal-box ${wide ? 'wide' : ''}">${html}</div></div>`;
  const m = root.firstElementChild; m._onClose = onClose;
  m.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeModal(); });
  m.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.stopPropagation(); closeModal(); }
    if (e.key === 'Tab') {
      const f = $$('a[href],button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex="-1"])', m).filter(x => x.offsetParent);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  document.documentElement.style.overflow = 'hidden';
  setTimeout(() => { const t = $('[autofocus]', m) || $('.modal-box button, .modal-box a, .modal-box input', m); t && t.focus(); }, 60);
  return m;
}
function closeModal(instant) {
  const m = $('#modalRoot .modal'); if (!m) return;
  const done = () => { m.remove(); document.documentElement.style.overflow = ''; m._onClose && m._onClose(); lastFocus && lastFocus.focus && lastFocus.focus(); };
  if (instant || RM.matches) return done();
  m.classList.add('closing'); setTimeout(done, isSmall() ? 220 : 160);
}

/* ——— Thème ——— */
function applyTheme(t) {
  const root = document.documentElement;
  if (t) root.setAttribute('data-theme', t); else root.removeAttribute('data-theme');
  const dark = t ? t === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  const b = $('#themeBtn'); if (!b) return;
  b.innerHTML = ic(dark ? 'sun' : 'moon', dark ? 'i-sun' : 'i-moon');
  b.setAttribute('aria-label', dark ? 'Passer en thème clair' : 'Passer en thème sombre');
}
let theme = null; try { theme = localStorage.getItem(KEY + '-theme'); } catch (e) {}
$('#themeBtn') && $('#themeBtn').addEventListener('click', () => {
  const dark = document.documentElement.getAttribute('data-theme') ? document.documentElement.getAttribute('data-theme') === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  theme = dark ? 'light' : 'dark'; applyTheme(theme);
  try { localStorage.setItem(KEY + '-theme', theme); } catch (e) {}
});

/* ——— Barre latérale « Mes IA » ———
   Les logos des IA autorisées, toujours visibles. Au survol, le logo grossit (et ses voisins un peu,
   comme un dock) ; un clic ouvre directement l'IA dans un nouvel onglet. */
let railMode = 'closed';
function closeRail() {}
const dockIds = () => (S.dock || []).filter(id => visibleAIs().some(a => a.id === id));
function drawDock() {
  $('#railDock').innerHTML = dockIds().map(id => AI[id]).map(a => `<li><a class="dock-item" href="${a.url}" target="_blank" rel="noopener" draggable="false" aria-label="Ouvrir ${esc(a.name)} (nouvel onglet)">${tile(a.id)}<span class="dock-tip" aria-hidden="true"><b>${esc(a.short || a.name)}</b><span>Ouvrir ${ic('ext', 'i-sm')}</span></span></a></li>`).join('');
}
function renderDockPop() {
  $('#dockPop').innerHTML = `<div class="dp-head"><p class="h4">Mes IA</p><p class="small muted">Choisissez les IA affichées dans la barre. Faites glisser un logo pour changer l’ordre, ou déposez-le sur la poubelle pour le retirer.</p></div>
    <ul class="dp-list">${visibleAIs().map(a => `<li><button class="dp-item" type="button" role="switch" aria-checked="${(S.dock || []).includes(a.id)}" data-dock="${a.id}">${tile(a.id)}<span class="dp-name">${esc(a.name)}</span><span class="switch" aria-hidden="true"></span></button></li>`).join('')}</ul>
    <button class="btn btn-quiet dp-suggest" type="button" data-act="suggest">${ic('plus', 'i-sm')}Suggérer une IA manquante</button>`;
}
function renderRail() { drawDock(); if (!$('#dockPop').hidden) renderDockPop(); }
function openDockPop() {
  renderDockPop(); $('#dockPop').hidden = false; $('#dockEdit').setAttribute('aria-expanded', 'true');
  const f = $('.dp-item', $('#dockPop')); f && f.focus({preventScroll:true});
}
function closeDockPop(back) {
  const p = $('#dockPop'); if (p.hidden) return;
  p.hidden = true; $('#dockEdit').setAttribute('aria-expanded', 'false'); if (back) $('#dockEdit').focus();
}
$('#dockEdit').addEventListener('click', () => $('#dockPop').hidden ? openDockPop() : closeDockPop(true));
$('#dockPop').addEventListener('click', e => {
  if (e.target.closest('[data-act]')) { closeDockPop(); return; }
  const b = e.target.closest('[data-dock]'); if (!b) return;
  const id = b.dataset.dock, on = !S.dock.includes(id);
  /* une IA ajoutée se place en bas de la barre ; l'ordre se change en faisant glisser les logos */
  S.dock = on ? [...S.dock, id] : S.dock.filter(x => x !== id); save();
  b.setAttribute('aria-checked', on); drawDock();
});
document.addEventListener('pointerdown', e => { if (!e.target.closest('#dockPop, #dockEdit')) closeDockPop(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#dockPop').hidden) { e.stopPropagation(); closeDockPop(true); } });
/* Glisser-déposer : le logo suit la souris 1:1, les autres s'écartent pour lui faire de la place,
   puis il se pose dans son nouvel emplacement. Un simple clic (moins de 6 px) ouvre toujours l'IA.
   Au clavier : Alt + ↑ / ↓ déplace le logo sélectionné. Échap annule un déplacement en cours. */
(() => {
  const dock = $('#railDock'); let st = null, swallow = false;
  const slot = () => { const a = dock.children[0], b = dock.children[1]; return a && b ? b.getBoundingClientRect().top - a.getBoundingClientRect().top : 54; };
  const reorder = (from, to) => { const ids = dockIds(), [m] = ids.splice(from, 1); ids.splice(to, 0, m); S.dock = [...ids, ...S.dock.filter(x => !ids.includes(x))]; save(); };
  dock.addEventListener('pointerdown', e => {
    const li = e.target.closest('li');
    if (!li || st || e.button !== 0 || e.pointerType !== 'mouse') return;
    st = {li, id:e.pointerId, y0:e.clientY, from:[...dock.children].indexOf(li), to:null, slot:slot(), on:false};
  });
  /* écoute sur tout le document : un geste rapide peut quitter la colonne avant que la capture ne prenne */
  document.addEventListener('pointermove', e => {
    if (!st || e.pointerId !== st.id) return;
    let dy = e.clientY - st.y0;
    if (!st.on) {
      if (Math.abs(dy) < 6) return;
      st.on = true; st.li.setPointerCapture(st.id);
      dock.classList.add('is-dragging'); st.li.classList.add('dragging'); document.documentElement.classList.add('grabbing');
      $('#rail').classList.add('drag-mode'); /* la poubelle apparaît en bas de la barre */
    }
    const n = dock.children.length, min = -st.from * st.slot;
    if (dy < min) dy = min - Math.sqrt(min - dy) * 2; /* frottement en haut ; vers le bas, la main reste libre pour atteindre la poubelle */
    st.li.style.transform = `translateY(${dy}px)`;
    const tr = trash.getBoundingClientRect(), m = 14;
    const over = e.clientX > tr.left - m && e.clientX < tr.right + m && e.clientY > tr.top - m && e.clientY < tr.bottom + m;
    if (over !== st.over) { st.over = over; trash.classList.toggle('hot', over); st.li.classList.toggle('over-trash', over); }
    /* au-dessus de la poubelle, les autres logos se resserrent comme si celui-ci était déjà retiré */
    const to = over ? n - 1 : Math.max(0, Math.min(n - 1, st.from + Math.round(dy / st.slot)));
    if (to !== st.to) {
      st.to = to;
      [...dock.children].forEach((x, i) => {
        if (x === st.li) return;
        const s = st.from < i && i <= to ? -1 : to <= i && i < st.from ? 1 : 0;
        x.style.transform = s ? `translateY(${s * st.slot}px)` : '';
      });
    }
  });
  const end = cancel => {
    if (!st) return; const s = st; st = null;
    if (!s.on) return;
    swallow = true; setTimeout(() => swallow = false, 0);
    const drop = !cancel && s.over, to = cancel || s.to == null ? s.from : s.to;
    trash.classList.remove('hot');
    s.li.classList.remove('dragging', 'over-trash'); s.li.classList.add('settling');
    if (drop) { s.li.style.transform += ' scale(.3)'; s.li.style.opacity = '0'; } /* le logo « tombe » dans la poubelle */
    else s.li.style.transform = to === s.from ? '' : `translateY(${(to - s.from) * s.slot}px)`;
    if (cancel) [...dock.children].forEach(x => { if (x !== s.li) x.style.transform = ''; });
    setTimeout(() => {
      dock.classList.remove('is-dragging'); document.documentElement.classList.remove('grabbing'); $('#rail').classList.remove('drag-mode');
      if (drop) remove(dockIds()[s.from]); else if (to !== s.from) reorder(s.from, to);
      drawDock();
    }, RM.matches ? 0 : 200);
  };
  const trash = $('#railTrash');
  const remove = id => {
    S.dock = S.dock.filter(x => x !== id); save();
    if (!$('#dockPop').hidden) renderDockPop();
    toast(`${AI[id].short || AI[id].name} est retirée de vos IA. Le bouton + permet de la remettre.`);
  };
  document.addEventListener('pointerup', e => { if (st && e.pointerId === st.id) end(false); });
  dock.addEventListener('pointercancel', () => end(true));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && st && st.on) end(true); });
  dock.addEventListener('click', e => { if (swallow) { e.preventDefault(); e.stopPropagation(); } }, true);
  dock.addEventListener('keydown', e => {
    if (e.key === 'Delete' || e.key === 'Backspace') { /* au clavier : Suppr retire le logo sélectionné */
      const li = e.target.closest('li'); if (!li) return;
      e.preventDefault();
      const i = [...dock.children].indexOf(li); remove(dockIds()[i]); drawDock();
      const nx = dock.children[Math.min(i, dock.children.length - 1)];
      (nx ? $('a', nx) : $('#dockEdit')).focus(); return;
    }
    if (!e.altKey || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
    const li = e.target.closest('li'); if (!li) return;
    e.preventDefault();
    const i = [...dock.children].indexOf(li), j = i + (e.key === 'ArrowUp' ? -1 : 1);
    if (j < 0 || j >= dock.children.length) return;
    reorder(i, j); drawDock(); $('a', dock.children[j]).focus();
  });
})();
/* La demande de l'accueil n'est gardée que si l'on part depuis la recommandation (fiche, autre IA…) */
document.addEventListener('click', e => {
  if (lastAsk && e.target.closest && e.target.closest('#result a[href^="#"]')) keepAsk(Object.assign(lastAsk, {via:'reco'}));
}, true);

/* ——— Navigation : indicateur glissant ——— */
function placeLine() {
  const nav = $('#nav'); if (!nav) return; /* page publique */
  const cur = $('a[aria-current="page"]', nav), line = $('.nav-line', nav);
  if (!cur) { line.style.width = '0'; return; }
  line.style.width = cur.offsetWidth - 24 + 'px'; line.style.transform = `translateX(${cur.offsetLeft + 12}px)`;
}
(() => {
  const nav = $('#nav'), ind = $('.nav-ind', nav);
  $$('a', nav).forEach(a => a.addEventListener('mouseenter', () => {
    ind.style.width = a.offsetWidth + 'px'; ind.style.transform = `translateX(${a.offsetLeft}px)`; ind.style.opacity = 1;
  }));
  nav.addEventListener('mouseleave', () => ind.style.opacity = 0);
})();

/* ——— Moteur d'effets au défilement ——— */
const scrollers = new Set();
let ticking = false;
function onScroll() {
  if (ticking) return; ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    const y = window.scrollY, vh = window.innerHeight, max = document.documentElement.scrollHeight - vh;
    const top = $('#top');
    if (!top) return; /* page publique : ni barre du site ni effets */
    top.classList.toggle('is-stuck', y > 4);
    scrollers.forEach(f => f(y, vh));
  });
}
window.addEventListener('scroll', onScroll, {passive:true});
window.addEventListener('resize', () => { onScroll(); placeLine(); });

const ANIM = 'IntersectionObserver' in window && !RM.matches;
if (ANIM) document.documentElement.classList.add('js-anim');
let io = null;
function easeOut(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
function countUp(el) {
  const target = parseFloat(el.dataset.count), suf = el.dataset.suffix || '', t0 = performance.now(), dur = 1500;
  const step = now => { const p = Math.min(1, (now - t0) / dur); el.textContent = fr(target * easeOut(p)) + suf; if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
function fire(el) {
  if (el.classList.contains('reveal')) {
    el.classList.remove('pending'); el.classList.add('shown');
    const end = e => { if (e.target === el) { el.classList.remove('shown'); el.removeEventListener('animationend', end); } };
    el.addEventListener('animationend', end);
  }
  if (el.dataset.v != null) el.style.setProperty('--v', el.dataset.v);
  if (el.dataset.draw != null) el.classList.add('drawn');
}
function armEffects(scope) {
  /* Les données s'affichent à leur valeur réelle : pas de compteur ni d'apparition rejoués à chaque visite */
  $$('[data-v],[data-draw]', scope).forEach(el => { if (el.dataset.v != null) el.style.setProperty('--v', el.dataset.v); el.classList.add('drawn'); });
}

/* ——— Survol : projecteur, inclinaison, aimant ——— */
function armHover() { /* survols gérés en CSS : plus d'inclinaison ni d'aimant */ }

/* ——— Copier dans le presse-papiers (avec repli) ——— */
function copyText(text, btn, srcEl) {
  const ok = () => { btn.classList.add('ok'); const old = btn.innerHTML; btn.innerHTML = ic('check', 'i-sm') + 'Copié'; toast('Texte copié. Collez-le dans l’IA et complétez les [crochets].'); setTimeout(() => { btn.classList.remove('ok'); btn.innerHTML = old; }, 2200); };
  const fallback = () => { if (srcEl) { const r = document.createRange(); r.selectNodeContents(srcEl); const s = getSelection(); s.removeAllRanges(); s.addRange(r); } toast('Texte sélectionné : faites Ctrl + C (ou Cmd + C) pour le copier.', 'info'); };
  try { navigator.clipboard.writeText(text).then(ok, fallback); } catch (e) { fallback(); }
}
/* ——— Cycle de vie des vues ——— */
let cleanups = [];
const onCleanup = f => cleanups.push(f);
function runCleanups() { cleanups.forEach(f => { try { f(); } catch (e) {} }); cleanups = []; }

/* ——— Progression des formations ——— */
function orderedCourses() {
  const t = S.profile.tools, first = [];
  if (t.includes('ms365')) first.push('copilot');
  if (t.includes('google')) first.push('gemini');
  if (t.includes('chatgpt')) first.push('chatgpt');
  const vis = visibleAIs();
  return [...first.filter(id => vis.some(a => a.id === id)).map(id => AI[id]), ...vis.filter(a => !first.includes(a.id))];
}
const courseLessons = id => id === 'tc' ? TRONC.lessons : COURSES[id].chapters.flatMap(c => c.l);
const coursePct = id => { const ls = courseLessons(id); return Math.round(ls.filter(l => S.done.includes(l.id)).length / ls.length * 100); };
function globalProgress() {
  const ids = [...TRONC.lessons, ...visibleAIs().flatMap(a => courseLessons(a.id))].map(l => l.id);
  const d = ids.filter(id => S.done.includes(id)).length;
  return {done:d, total:ids.length, pct:ids.length ? Math.round(d / ids.length * 100) : 0};
}
function nextLesson() {
  const tc = TRONC.lessons.find(l => !S.done.includes(l.id));
  if (tc) return LESSONS[tc.id];
  for (const a of orderedCourses()) for (const l of courseLessons(a.id)) if (!S.done.includes(l.id)) return LESSONS[l.id];
  return null;
}
const courseName = l => l.course === 'tc' ? TRONC.name : COURSES[l.course].name;

