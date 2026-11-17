const files = [
  "/src/legacy/data/catalogue.js",
  "/src/legacy/data/activites-tronc.js",
  "/src/legacy/core/utils-state.js",
  "/src/legacy/features/recommandations.js",
  "/src/legacy/pages/accueil.js",
  "/src/legacy/pages/bibliotheque-et-fiches.js",
  "/src/legacy/features/activites.js",
  "/src/legacy/pages/formations.js",
  "/src/legacy/pages/nouveautes.js",
  "/src/legacy/features/questionnaires.js",
  "/src/legacy/pages/profil.js",
  "/src/legacy/pages/dirigeant.js",
  "/src/legacy/core/navigation.js"
];
/* La promesse est gardée sur window, et non dans ce module : après une modification en cours de développement,
   Vite recharge ce module, et les scripts seraient sinon injectés une seconde fois (« déjà déclaré »). */
export function loadOriginalFeatures() {
  if (!window.__biblLoading) window.__biblLoading = files.reduce((promise, path) => promise.then(() => new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = path; script.async = false;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Impossible de charger ${path}`));
    document.body.appendChild(script);
  })), Promise.resolve());
  return window.__biblLoading;
}
