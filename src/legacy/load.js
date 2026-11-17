const files = [
  "/legacy/data/catalogue.js",
  "/legacy/core/utils-state.js",
  "/legacy/features/recommandations.js",
  "/legacy/pages/accueil.js",
  "/legacy/pages/bibliotheque-et-fiches.js",
  "/legacy/pages/formations.js",
  "/legacy/pages/nouveautes.js",
  "/legacy/features/questionnaires.js",
  "/legacy/pages/profil.js",
  "/legacy/pages/dirigeant.js",
  "/legacy/core/navigation.js",
];

let loading;

export function loadOriginalFeatures() {
  if (!loading) {
    loading = files.reduce(
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

  return loading;
}
