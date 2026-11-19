/* Briques partagées par les pages publiques (présentation, inscription, invitation, contact). */
import React, { useEffect, useId, useState } from 'react';
import { getOffres } from '../api/client';
import ThemeToggle from '../components/ThemeToggle';

/* « #inscription-particulier?offre=solo&periode=annuelle » → { route, params } */
export function lireHash(hash) {
  const brut = decodeURIComponent((hash || '').replace(/^#/, ''));
  const [route, q] = brut.split('?');
  return { route, params: new URLSearchParams(q || '') };
}

export const ROUTES_PUBLIQUES = ['decouverte', 'inscription', 'inscription-particulier', 'inscription-entreprise', 'contact'];
export const estPublique = (hash) => {
  const { route } = lireHash(hash);
  return ROUTES_PUBLIQUES.includes(route) || route.startsWith('decouverte-') || route.startsWith('invitation-');
};

const nf = (min) => new Intl.NumberFormat('fr-FR', { minimumFractionDigits: min, maximumFractionDigits: 2 });
/* 7.9 → « 7,90 € » ; 69 → « 69 € » ; 0 → « 0 € » */
export const euros = (n) => `${nf(Number.isInteger(n) ? 0 : 2).format(n)} €`;

/* Les offres viennent toujours du back (GET /api/offres) : le front n'écrit jamais un prix en dur. */
let cache = null;
export function useOffres() {
  const [etat, setEtat] = useState(cache ? { offres: cache } : { chargement: true });
  const charger = () => {
    setEtat({ chargement: true });
    getOffres()
      .then((r) => { cache = Object.fromEntries(r.offres.map((o) => [o.id, o])); setEtat({ offres: cache }); })
      .catch((e) => setEtat({ erreur: e.message }));
  };
  useEffect(() => { if (!cache) charger(); }, []);
  return { ...etat, recharger: charger };
}

export function Icone({ id, petit, className = '' }) {
  return <svg aria-hidden="true" className={`i${petit ? ' i-sm' : ''} ${className}`}><use href={`#i-${id}`} /></svg>;
}

/* Logo d'une IA : les vrais logos sont dans IconSprites (#logo-…). */
const COULEURS = { chatgpt: '#10A37F', lechat: '#FA500F', claude: '#D97757', copilot: '#0078D4', gemini: '#3186FF', perplexity: '#22B8CD', notebooklm: '#F9AB00', deepl: '#0F2B46', canva: '#7D2AE8' };
export function LogoIA({ id, taille = 40 }) {
  return (
    <span className="tile has-logo" style={{ '--s': `${taille}px`, '--b': COULEURS[id] }} aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false"><use href={`#logo-${id}`} /></svg>
    </span>
  );
}

export function Marque() {
  return <a className="brand pub-brand" href="/" aria-label="Bibl.IA, présentation">Bibl<b>.</b>IA</a>;
}

export function Fleche() {
  return <svg className="arrow" viewBox="0 0 10 10" aria-hidden="true"><path className="stem" d="M0 5h8" stroke="currentColor" strokeWidth="1.6" fill="none" /><path className="head" d="M5 1l4 4-4 4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

/* Barre du haut des pages publiques. `verOffres` : bouton qui fait défiler jusqu'aux offres. */
export function BarrePublique({ verOffres, sansInscription }) {
  return (
    <header className="pub-top">
      <div className="pub-wrap pub-top-in">
        <Marque />
        <nav className="pub-top-act" aria-label="Navigation">
          <ThemeToggle className="pub-theme" />
          {verOffres
            ? <button type="button" className="btn btn-quiet pub-hide-s" onClick={verOffres}>Offres</button>
            : <a className="btn btn-quiet pub-hide-s" href="/offres">Offres</a>}
          {/* La vraie connexion passera par le service de connexion (contrat § 1). En démo : /login simule le compte. */}
          <a className="btn btn-quiet" href="/login">Se connecter</a>
          {!sansInscription && <a className="btn btn-primary btn-sm" href="/inscription">Créer un compte</a>}
        </nav>
      </div>
    </header>
  );
}

export function PiedPublic() {
  return (
    <footer className="pub-foot">
      <div className="pub-wrap pub-foot-in">
        <span>Bibl<b>.</b>IA · La bibliothèque des IA pour le travail</span>
        <span className="pub-foot-l">
          <a className="ulink" href="/offres">Offres</a>
          <a className="ulink" href="/contact">Nous contacter</a>
          <a className="ulink" href="/login">Se connecter</a>
        </span>
      </div>
    </footer>
  );
}

/* ——— Formulaires ——— */

/* Un champ avec son libellé visible, une aide facultative, et son erreur juste en dessous. */
export function Champ({ label, aide, erreur, children, facultatif }) {
  const id = useId();
  const idAide = aide && !erreur ? `${id}-aide` : undefined;
  const idErr = erreur ? `${id}-err` : undefined;
  const enfant = React.cloneElement(children, {
    id,
    'aria-invalid': erreur ? true : undefined,
    'aria-describedby': [idAide, idErr].filter(Boolean).join(' ') || undefined,
  });
  return (
    <div className={`fld${erreur ? ' has-err' : ''}`}>
      <label htmlFor={id}>{label}{facultatif && <span className="fld-opt"> (facultatif)</span>}</label>
      {enfant}
      {idAide && <p className="fld-help" id={idAide}>{aide}</p>}
      {erreur && <p className="fld-err" id={idErr}><Icone id="info" petit />{erreur}</p>}
    </div>
  );
}

export function MotDePasse({ value, onChange, ...rest }) {
  const [voir, setVoir] = useState(false);
  return (
    <div className="pw">
      <input type={voir ? 'text' : 'password'} autoComplete="new-password" value={value} onChange={onChange} {...rest} />
      <button type="button" className="pw-eye" onClick={() => setVoir(!voir)} aria-label={voir ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} aria-pressed={voir}>
        <Icone id={voir ? 'eyeoff' : 'eye'} petit />
      </button>
    </div>
  );
}

export const MAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const verifMail = (v) => (!v.trim() ? 'Indiquez votre mail.' : !MAIL_OK.test(v.trim()) ? 'Ce mail semble incomplet, par exemple : prenom@entreprise.fr' : '');
export const verifMdp = (v) => (v.length < 8 ? 'Au moins 8 caractères.' : '');
export const verifRequis = (v, msg) => (!String(v || '').trim() ? msg : '');

/* Bouton d'envoi : garde sa largeur pendant l'attente, et dit ce qui se passe. */
export function BoutonEnvoi({ enCours, children, attente = 'Un instant…', className = '' }) {
  return (
    <button type="submit" className={`btn btn-primary pub-submit ${className}`} disabled={enCours} aria-busy={enCours || undefined}>
      <span className={`pub-submit-l${enCours ? ' is-hidden' : ''}`}>{children}</span>
      {enCours && <span className="pub-submit-w"><span className="spin" aria-hidden="true" />{attente}</span>}
    </button>
  );
}

/* Message d'erreur général d'un formulaire (réseau, 500…). */
export function AlerteFormulaire({ message }) {
  if (!message) return null;
  return <p className="pub-alert" role="alert"><Icone id="info" petit />{message}</p>;
}

/* Remonte en haut et place le focus sur le titre quand l'écran change. */
export function useTitreFocus(dep) {
  const ref = React.useRef(null);
  useEffect(() => {
    window.scrollTo(0, 0);
    if (ref.current) ref.current.focus({ preventScroll: true });
  }, [dep]);
  return ref;
}

/* Démo : tant que le back n'existe pas, le site garde le profil dans ce navigateur (clé biblia-demo-v2).
   L'inscription y dépose la situation choisie, pour que le questionnaire « Mon profil » s'y adapte.
   Quand le back sera branché, ce sera l'objet « moi » (GET /api/moi) qui portera ces informations. */
export function transmettreDemo({ profile, company, account }) {
  const CLE = 'biblia-demo-v2';
  try {
    const s = JSON.parse(localStorage.getItem(CLE) || '{}');
    if (profile) s.profile = { ...(s.profile || {}), ...profile };
    if (company) s.company = { ...(s.company || {}), ...company };
    /* Type de compte : particulier, ou membre d'une entreprise (salarié ou administrateur).
       Il décide de ce que le site montre (espace dirigeant, questions sur l'entreprise…). */
    if (account) s.account = account;
    localStorage.setItem(CLE, JSON.stringify(s));
  } catch { /* stockage indisponible : le questionnaire demandera la situation */ }
  /* Si le site est déjà chargé dans cet onglet, on met aussi à jour sa copie en mémoire. */
  if (typeof window.BiblIADemo === 'function') window.BiblIADemo({ profile, company, account });
}
