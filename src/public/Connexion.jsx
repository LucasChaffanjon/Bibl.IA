/* /login : connexion au site. Le vrai service de connexion n'est pas encore choisi (contrat § 1) ;
   en démo, on choisit en plus le type de compte à simuler, pour voir le site d'un particulier ou d'un salarié. */
import React, { useState } from 'react';
import { seConnecter, FAUSSES_DONNEES } from '../api/client';
import { AlerteFormulaire, BoutonEnvoi, Champ, Icone, MotDePasse, transmettreDemo, verifMail, useTitreFocus } from './commun';
import { Cadre, Retour } from './Inscription';
import { naviguer } from './routes';

const COMPTES = [
  ['salarie', 'Salarié·e d’une entreprise', 'Les IA autorisées par l’entreprise, sans espace dirigeant.'],
  ['dirigeant', 'Dirigeant·e (administrateur)', 'Avec l’espace dirigeant et la présentation de l’entreprise.'],
  ['particulier', 'Particulier', 'Étudiant, freelance, usage personnel : pas de question sur une entreprise.'],
];

export default function Connexion() {
  const [v, setV] = useState({ email: '', mdp: '', type: 'salarie' });
  const [err, setErr] = useState({});
  const [envoi, setEnvoi] = useState(false);
  const [general, setGeneral] = useState('');
  const ref = useTitreFocus('login');
  const maj = (k) => (e) => { setV({ ...v, [k]: e.target.value }); if (err[k]) setErr({ ...err, [k]: '' }); };

  const envoyer = async (e) => {
    e.preventDefault();
    const er = { email: verifMail(v.email), mdp: v.mdp ? '' : 'Indiquez votre mot de passe.' };
    setErr(er); setGeneral('');
    if (er.email || er.mdp) { requestAnimationFrame(() => e.target.querySelector('[aria-invalid="true"]')?.focus()); return; }
    setEnvoi(true);
    try {
      const moi = await seConnecter({ email: v.email.trim(), motDePasse: v.mdp, type: v.type });
      const account = { type: moi.type, role: moi.role, entreprise: moi.entreprise ? moi.entreprise.nom : '' };
      transmettreDemo({
        account,
        profile: moi.type === 'membre' ? { situation: moi.role === 'administrateur' ? 'dirigeant' : 'salarie' } : undefined,
        company: moi.entreprise ? { name: moi.entreprise.nom } : undefined,
      });
      naviguer('/dashboard');
    } catch (x) {
      setGeneral(x.message);
    } finally { setEnvoi(false); }
  };

  return (
    <Cadre etroit>
      <Retour href="/">Présentation</Retour>
      <h1 className="reg-h" tabIndex={-1} ref={ref}>Se connecter</h1>
      <form className="reg-form" onSubmit={envoyer} noValidate>
        <Champ label="Mail" erreur={err.email}>
          <input type="email" autoComplete="email" inputMode="email" value={v.email} onChange={maj('email')} />
        </Champ>
        <Champ label="Mot de passe" erreur={err.mdp}>
          <MotDePasse value={v.mdp} onChange={maj('mdp')} autoComplete="current-password" />
        </Champ>
        {FAUSSES_DONNEES && (
          <fieldset className="opts">
            <legend>Démonstration : quel compte simuler&nbsp;?</legend>
            <div className="login-types">
              {COMPTES.map(([id, nom, aide]) => (
                <label key={id} className={`opt${v.type === id ? ' is-on' : ''}`}>
                  <input type="radio" name="type" value={id} checked={v.type === id} onChange={maj('type')} />
                  <b>{nom}</b><span>{aide}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <AlerteFormulaire message={general} />
        <BoutonEnvoi enCours={envoi} attente="Connexion…">Se connecter</BoutonEnvoi>
        <p className="reg-fine"><Icone id="user" petit />Pas encore de compte&nbsp;? <a className="ulink" href="/inscription">Créer un compte</a></p>
      </form>
    </Cadre>
  );
}
