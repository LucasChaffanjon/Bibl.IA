/* Thème clair / sombre, pour tout le site (pages publiques et site connecté).
   - Sans choix enregistré, le site suit le réglage de l'appareil.
   - Tout bouton portant l'attribut data-theme-btn bascule le thème (un seul écouteur, sur le document).
   - Le passage d'un thème à l'autre se fait par un cercle qui s'ouvre depuis le bouton (View Transitions).
     Sans cette API (navigateurs anciens), les couleurs glissent en fondu. Avec « réduire les animations » : immédiat. */
const CLE = 'biblia-demo-v2-theme';
const SOMBRE = window.matchMedia('(prefers-color-scheme: dark)');
const REDUIT = window.matchMedia('(prefers-reduced-motion: reduce)');

function lire() { try { return localStorage.getItem(CLE); } catch { return null; } }
export const estSombre = () => {
  const t = document.documentElement.getAttribute('data-theme');
  return t ? t === 'dark' : SOMBRE.matches;
};

function majBoutons() {
  const sombre = estSombre();
  document.querySelectorAll('[data-theme-btn]').forEach((b) => {
    b.setAttribute('aria-label', sombre ? 'Passer en thème clair' : 'Passer en thème sombre');
    b.setAttribute('aria-pressed', String(sombre));
  });
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', sombre ? '#0E1411' : '#F2F4F1');
}

export function appliquer(t) {
  const root = document.documentElement;
  if (t) root.setAttribute('data-theme', t); else root.removeAttribute('data-theme');
  majBoutons();
}

export function basculer(origine) {
  const suivant = estSombre() ? 'light' : 'dark';
  const changer = () => {
    appliquer(suivant);
    try { localStorage.setItem(CLE, suivant); } catch { /* choix non mémorisé */ }
  };
  if (REDUIT.matches) return changer();

  if (!document.startViewTransition) {
    const root = document.documentElement;
    root.classList.add('theme-fondu');
    changer();
    setTimeout(() => root.classList.remove('theme-fondu'), 400);
    return;
  }
  /* Le cercle part du centre du bouton et couvre tout l'écran. */
  const r = origine ? origine.getBoundingClientRect() : { left: innerWidth / 2, top: 0, width: 0, height: 0 };
  const x = r.left + r.width / 2, y = r.top + r.height / 2;
  const rayon = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const transition = document.startViewTransition(changer);
  transition.ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${rayon}px at ${x}px ${y}px)`] },
      { duration: 520, easing: 'cubic-bezier(.23,1,.32,1)', pseudoElement: '::view-transition-new(root)' },
    );
  }).catch(() => {});
}

/* Démarrage : le thème enregistré s'applique avant le premier affichage. */
appliquer(lire());
SOMBRE.addEventListener('change', majBoutons);
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-theme-btn]');
  if (!b) return;
  e.preventDefault();
  basculer(b);
});
/* Les boutons ajoutés plus tard (pages qui s'affichent) reçoivent le bon libellé. */
new MutationObserver(() => {
  if (document.querySelector('[data-theme-btn]:not([aria-label])')) majBoutons();
}).observe(document.documentElement, { childList: true, subtree: true });

window.BiblTheme = { appliquer, basculer, actuel: lire, estSombre };
