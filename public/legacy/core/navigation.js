/* ——— Routage (#accueil, #bibliotheque, #ia-…, #formations, #parcours, #lecon-…, #nouveautes, #profil, #dirigeant) ——— */
const ROUTES = {accueil:viewHome, bibliotheque:viewLibrary, formations:viewTraining, parcours:viewTraining, nouveautes:viewUpdates, 'mises-a-jour':viewUpdates, profil:viewProfile, dirigeant:viewBoss};
function resolveRoute() {
  const h = decodeURIComponent(location.hash.slice(1));
  if (h.startsWith('ia-') && AI[h.slice(3)]) return {fn:viewFiche, arg:h.slice(3), nav:'bibliotheque'};
  if (h.startsWith('lecon-') && LESSONS[h.slice(6)]) { const l = LESSONS[h.slice(6)]; return {fn:viewTraining, arg:l.course === 'tc' || isAllowed(l.course) ? l.id : null, nav:'formations'}; }
  const r = ROUTES[h] && !(h === 'dirigeant' && !isAdmin()) ? h : 'accueil'; /* l'espace dirigeant n'existe que pour l'administrateur */
  return {fn:ROUTES[r], nav:r === 'mises-a-jour' ? 'nouveautes' : r === 'parcours' ? 'formations' : r};
}
function renderView(keep) {
  const {fn, arg, nav} = resolveRoute(), v = $('#view');
  runCleanups();
  fn(keep && fn === viewTraining ? null : arg);
  $$('[data-r]').forEach(a => a.dataset.r === nav ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
  placeLine(); armEffects(v); armHover(v);
  onScroll();
}
let booted = false, curNav = null, homeY = 0;
function route() {
  if (!document.getElementById('view')) return; /* page publique (présentation, inscription) : rien à afficher ici */
  if (curNav === 'accueil') homeY = window.scrollY;
  /* Retour sur l'accueil : on ne retrouve sa demande que si l'on était parti depuis la recommandation,
     il y a moins de 15 minutes. Sinon l'accueil repart d'une zone de saisie vide. */
  if (resolveRoute().nav === 'accueil' && curNav !== 'accueil' && lastAsk) {
    const fresh = lastAsk.via === 'reco' && Date.now() - (lastAsk.t || 0) < 15 * 60 * 1000;
    keepAsk(fresh ? Object.assign(lastAsk, {via:null}) : null);
  } else if (lastAsk && curNav && curNav !== 'accueil' && lastAsk.via) keepAsk(Object.assign(lastAsk, {via:null})); /* on a continué ailleurs */
  closeRail(); closeModal(true);
  renderView(false);
  curNav = resolveRoute().nav;
  // Au retour sur l'accueil avec une recommandation affichée, on retrouve la même position
  const y = curNav === 'accueil' && lastAsk ? homeY : 0;
  try { window.scrollTo({top:y, behavior:'instant'}); } catch (e) { window.scrollTo(0, y); }
  if (booted) $('#main').focus({preventScroll:true});
  booted = true;
}

/* ——— Actions globales ——— */
document.addEventListener('click', e => {
  const act = e.target.closest('[data-act]');
  if (act) {
    e.preventDefault();
    const a = act.dataset.act;
    if (a === 'skip') { $('#main').focus(); return; }
    if (railMode !== 'closed') closeRail();
    if (a === 'suggest') openSuggest();
    if (a === 'onboard') openOnboarding();
    if (a === 'home-setup') openHomeSetup();
    return;
  }
  const l = e.target.closest('a[href^="#lecon-"]');
  if (l && !e.metaKey && !e.ctrlKey && !e.shiftKey) { e.preventDefault(); closeRail(); openLesson(l.getAttribute('href').slice(7)); return; }
  const same = e.target.closest('a[href^="#"]');
  if (same && same.getAttribute('href') === (location.hash || '#accueil') && !e.metaKey && !e.ctrlKey) { e.preventDefault(); route(); window.scrollTo(0, 0); }
});
// React écoute les changements de page (hashchange).

/* ——— Démarrage ——— */
document.documentElement.lang = 'fr';
applyTheme(theme);
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyTheme(theme));
renderRail();
window.BiblIA = { navigate: route, renderView, getPage: () => resolveRoute().nav };
if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeLine);
