# Bibl.IA — Vraie version — React + Vite

Ce projet part du fichier `index.html` fourni et conserve son design et ses contenus.

## Démarrage sur MacBook (VS Code)

1. Installer **Node.js LTS** depuis https://nodejs.org (si nécessaire).
2. Décompresser le ZIP, puis ouvrir **le dossier du projet** dans VS Code : `Fichier > Ouvrir un dossier`.
3. Ouvrir `Terminal > Nouveau terminal` dans VS Code.
4. Exécuter :

```bash
npm install
npm run dev
```

5. Ouvrir le lien `Local:` affiché dans le terminal (en général http://127.0.0.1:5173/).
6. Pour arrêter le serveur : `Ctrl + C` dans le terminal.

⚠️ N'ouvrez pas `index.html` en double-cliquant dessus : Vite doit servir les fichiers.

## Où modifier quoi ?

- `src/components/` : structure React (en-tête, barre latérale, pied de page, icônes, fenêtres)
- `src/pages/` : points d'entrée React des pages
- `src/styles/site.css` : styles d'origine
- `src/legacy/pages/` : **contenus réels et comportements des pages** ; les fonctions `viewHome`, `viewLibrary`, `viewFiche`, `viewTraining`, `viewUpdates`, `viewProfile`, `viewBoss` sont conservées et séparées.
- `src/legacy/features/` : recommandations, questionnaires
- `src/legacy/core/` : état, utilitaires, routage
- `src/legacy/data/catalogue.js` : IA, formations, contenus et exemples

## Nature de la migration

Il s'agit d'une **migration React progressive**, pas d'une réécriture React native : React monte la structure et les composants de pages ; les fonctions historiques génèrent encore le HTML interne et pilotent les interactions. Cela limite les régressions et garde les comportements du prototype. Les données de démonstration restent dans le navigateur.

Adresses du site :

- `/` : présentation (et `/offres` pour arriver sur les prix) ;
- `/login` : connexion (en démo, on choisit le compte à simuler : salarié, dirigeant ou particulier) ;
- `/inscription`, `/inscription/particulier`, `/inscription/entreprise`, `/invitation/<code>`, `/contact` ;
- `/dashboard` : le site connecté. Ses rubriques gardent une ancre : `/dashboard#formations`, `/dashboard#profil`…

Les anciennes adresses à ancre (`/#decouverte`, `/#formations`) sont converties automatiquement. À la mise en ligne, l’hébergeur doit renvoyer `index.html` pour toutes ces adresses (réglage « SPA » ou « rewrite »).

Dans le site connecté, la navigation utilise les ancres `#accueil`, `#bibliotheque`, `#formations`, etc. React suit ces changements de route ; le moteur historique construit le contenu de la vue choisie. Pour une migration intégrale à React (hooks/état/composants JSX dans chaque page), il faut remplacer progressivement les modules `legacy`.

### Vérification

```bash
npm run build
```

En cas de problème, assurez-vous d'avoir lancé `npm install` et que votre version de Node.js est compatible avec Vite.
