const files = [
  "/src/legacy/data/catalogue.js",
  "/src/legacy/core/utils-state.js",
  "/src/legacy/features/recommandations.js",
  "/src/legacy/pages/accueil.js",
  "/src/legacy/pages/bibliotheque-et-fiches.js",
  "/src/legacy/pages/formations.js",
  "/src/legacy/pages/nouveautes.js",
  "/src/legacy/features/questionnaires.js",
  "/src/legacy/pages/profil.js",
  "/src/legacy/pages/dirigeant.js",
  "/src/legacy/core/navigation.js"
];
let loading;
export function loadOriginalFeatures() {
  if (!loading) loading = files.reduce((promise, path) => promise.then(() => new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = path; script.async = false;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Impossible de charger ${path}`));
    document.body.appendChild(script);
  })), Promise.resolve());
  return loading;
}
