/* Les scripts du site sont servis depuis public/legacy (adresse /legacy/…), pour qu'ils existent aussi
   une fois le site construit et mis en ligne. Les fichiers à modifier sont donc ceux de public/legacy. */
const files = [
  "/legacy/data/catalogue.js",
  "/legacy/data/activites-tronc.js",
  "/legacy/core/utils-state.js",
  "/legacy/features/recommandations.js",
  "/legacy/pages/accueil.js",
  "/legacy/pages/bibliotheque-et-fiches.js",
  "/legacy/features/activites.js",
  "/legacy/pages/formations.js",
  "/legacy/pages/nouveautes.js",
  "/legacy/features/questionnaires.js",
  "/legacy/pages/profil.js",
  "/legacy/pages/dirigeant.js",
  "/legacy/core/navigation.js",
];

/* La promesse est gardée sur window, et non dans ce module : après une modification en cours de développement,
   Vite recharge ce module, et les scripts seraient sinon injectés une seconde fois (« déjà déclaré »). */
export function loadOriginalFeatures() {
  if (!window.__biblLoading) {
    window.__biblLoading = files.reduce(
      (promise, path) =>
        promise.then(
          () =>
            new Promise((resolve, reject) => {
              const script = document.createElement("script");

              script.src = path;
              script.async = false;

              script.onload = resolve;
              script.onerror = () =>
                reject(new Error(`Impossible de charger ${path}`));

              document.body.appendChild(script);
            })
        ),
      Promise.resolve()
    );
  }

  return window.__biblLoading;
}
