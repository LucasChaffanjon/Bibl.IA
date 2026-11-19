/* Adresses du site.
   - Pages publiques : /  (présentation), /offres, /login, /inscription, /inscription/particulier,
     /inscription/entreprise, /invitation/<code>, /contact.
   - Le site connecté : /dashboard. Ses rubriques gardent une ancre : /dashboard#formations, /dashboard#lecon-tc3…

   Les pages publiques ont été écrites avec des ancres (#inscription-particulier?offre=solo). Plutôt que de les
   réécrire, on leur passe une « ancre équivalente » calculée depuis l'adresse : leur code ne change pas.

   Mise en ligne : l'hébergeur doit renvoyer index.html pour toutes ces adresses (réglage « SPA » ou « rewrite »). */

const PUBLIQUES = {
  '/': 'decouverte',
  '/offres': 'decouverte-offres',
  '/login': 'login',
  '/inscription': 'inscription',
  '/inscription/particulier': 'inscription-particulier',
  '/inscription/entreprise': 'inscription-entreprise',
  '/contact': 'contact',
};

/* L'adresse actuelle → { zone: 'public' | 'app', ancre } */
export function lireAdresse(loc = window.location) {
  const chemin = loc.pathname.replace(/\/+$/, '') || '/';
  if (chemin === '/dashboard' || chemin.startsWith('/dashboard/')) return { zone: 'app', ancre: loc.hash };
  if (chemin.startsWith('/invitation/')) return { zone: 'public', ancre: `#invitation-${decodeURIComponent(chemin.slice(12))}` };
  const route = PUBLIQUES[chemin];
  return { zone: 'public', ancre: `#${route || 'decouverte'}${loc.search || ''}`, inconnue: !route };
}

/* Anciennes adresses à ancre (/#decouverte, /#formations…) : on les convertit au chargement. */
export function convertirAncienneAdresse() {
  const { pathname, hash } = window.location;
  if ((pathname.replace(/\/+$/, '') || '/') !== '/' || !hash) return;
  const brut = decodeURIComponent(hash.slice(1));
  const [route, q] = brut.split('?');
  const recherche = q ? `?${q}` : '';
  const vers = route === 'decouverte' ? '/'
    : route === 'decouverte-offres' ? '/offres'
    : route === 'inscription' ? `/inscription${recherche}`
    : route === 'inscription-particulier' ? `/inscription/particulier${recherche}`
    : route === 'inscription-entreprise' ? `/inscription/entreprise${recherche}`
    : route === 'contact' ? `/contact${recherche}`
    : route.startsWith('invitation-') ? `/invitation/${route.slice(11)}`
    : `/dashboard${hash}`; /* une rubrique du site connecté */
  window.history.replaceState(null, '', vers);
}

/* Navigation sans recharger la page */
export function naviguer(vers, { remplacer = false } = {}) {
  if (remplacer) window.history.replaceState(null, '', vers);
  else window.history.pushState(null, '', vers);
  window.dispatchEvent(new Event('biblia-nav'));
}

/* Les liens internes (href="/…") changent d'adresse sans recharger la page. */
export function installerLiens() {
  if (window.__biblLiens) return;
  window.__biblLiens = true;
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href^="/"]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    const href = a.getAttribute('href');
    if (/^\/(legacy|videos|src|assets)\//.test(href)) return;
    e.preventDefault();
    const avant = window.location.pathname;
    naviguer(href);
    const u = new URL(href, window.location.origin);
    if (u.hash) window.dispatchEvent(new HashChangeEvent('hashchange'));
    if (u.pathname !== avant && !u.hash) window.scrollTo(0, 0);
  });
}
