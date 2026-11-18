import React, { useEffect, useState } from 'react';
import IconSprites from './components/IconSprites';
import SideRail from './components/SideRail';
import Header from './components/Header';
import Footer from './components/Footer';
import Overlays from './components/Overlays';
import Accueil from './pages/Accueil';
import Bibliotheque from './pages/Bibliotheque';
import FicheIA from './pages/FicheIA';
import Formations from './pages/Formations';
import Lecon from './pages/Lecon';
import Nouveautes from './pages/Nouveautes';
import Profil from './pages/Profil';
import Dirigeant from './pages/Dirigeant';
import { loadOriginalFeatures } from './legacy/load';
import Decouverte from './public/Decouverte';
import Inscription from './public/Inscription';
import { estPublique, lireHash } from './public/commun';

function selectedPage(hash) {
  const route = decodeURIComponent((hash || '').replace(/^#/, ''));
  if (route.startsWith('ia-')) return 'fiche';
  if (route.startsWith('lecon-')) return 'lecon';
  if (route === 'parcours') return 'formations'; // « Tous les parcours » : seconde vue de la rubrique Formations
  if (['accueil','bibliotheque','formations','nouveautes','mises-a-jour','profil','dirigeant'].includes(route)) return route === 'mises-a-jour' ? 'nouveautes' : route;
  return 'accueil';
}
const pages = {
  accueil: Accueil, bibliotheque: Bibliotheque, fiche: FicheIA,
  formations: Formations, lecon: Lecon, nouveautes: Nouveautes,
  profil: Profil, dirigeant: Dirigeant
};

export default function App() {
  const [hash, setHash] = useState(window.location.hash);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  /* Pages publiques (présentation, inscription) : elles n'ont pas besoin des scripts du site. */
  const publique = estPublique(hash);
  useEffect(() => {
    if (publique || ready) return;
    let active = true;
    loadOriginalFeatures().then(() => { if (active) setReady(true); })
      .catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [publique, ready]);
  const page = selectedPage(hash);
  const Page = pages[page];
  // Route is called after React commits the correct view container.
  useEffect(() => {
    if (!publique && ready && window.BiblIA) window.BiblIA.navigate();
  }, [hash, ready, page, publique]);
  if (publique) {
    const route = lireHash(hash).route;
    return <>
      <IconSprites />
      <a className="skip" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>Aller au contenu</a>
      {route === 'decouverte' || route.startsWith('decouverte-') ? <Decouverte hash={hash} /> : <Inscription hash={hash} />}
    </>;
  }
  return <>
    <IconSprites />
    <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: "<a class=\"skip\" data-act=\"skip\" href=\"#main\">Aller au contenu</a>" }} />
    <SideRail />
    <div className="shell">
      <Header />
      <main className="main" id="main" tabIndex={-1}>
        {error ? <p role="alert">Erreur de chargement : {error}</p> : <Page key={page} />}
      </main>
      <Footer />
    </div>
    <Overlays />
  </>;
}
