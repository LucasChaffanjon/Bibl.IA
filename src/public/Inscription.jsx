/* Écrans d'inscription (publics) :
   /inscription                       choisir : pour moi, ou pour mon entreprise
   /inscription/particulier?offre=…   Découverte ou Plus                (contrat § 3.1)
   /inscription/entreprise?periode=…  l'administrateur crée l'entreprise (contrat § 3.2), puis invite (§ 9.3)
   /invitation/<code>                 un salarié accepte l'invitation    (contrat § 3.3)
   /contact                           « Nous contacter »                 (contrat § 2)
   Ces écrans reçoivent une ancre équivalente (#inscription-particulier?offre=…) : voir routes.js.
   Rien ici ne parle directement au back : tout passe par src/api/client.js. */
import React, { useEffect, useState } from 'react';
import {
  accepterInvitation, creerCompte, envoyerContact, getInvitation, inscrireEntreprise, inscrireParticulier, inviterSalaries, FAUSSES_DONNEES,
} from '../api/client';
import {
  AlerteFormulaire, BarrePublique, transmettreDemo, BoutonEnvoi, Champ, Icone, MotDePasse, PiedPublic, euros, lireHash, useOffres, useTitreFocus,
  verifMail, verifMdp, verifRequis, MAIL_OK, Fleche,
} from './commun';

/* Les situations proposées à l'inscription d'un particulier. Le questionnaire « Mon profil » du site
   s'adapte à ce choix (public/legacy/data/catalogue.js, PERSONAS). Les mêmes identifiants des deux côtés. */
const SITUATIONS = [
  ['salarie', 'Salarié·e'],
  ['etudiant', 'Étudiant·e ou alternant·e'],
  ['independant', 'Auto-entrepreneur·e, artisan·e ou commerçant·e'],
  ['freelance', 'Freelance ou consultant·e'],
  ['dirigeant', 'Dirigeant·e d’entreprise'],
  ['recherche', 'En recherche d’emploi ou en reconversion'],
  ['perso', 'Pour ma vie personnelle'],
  ['autre', 'Autre situation'],
];

/* Mise en page commune : le formulaire, et à côté (sur grand écran) le récapitulatif de l'offre. */
export function Cadre({ children, aside, etroit }) {
  return (
    <div className="pub pub-form">
      <BarrePublique sansInscription />
      <main id="main" tabIndex={-1} className="pub-wrap">
        <div className={`reg${aside ? ' has-aside' : ''}${etroit ? ' is-narrow' : ''}`}>
          <div className="reg-main">{children}</div>
          {aside && <aside className="reg-aside">{aside}</aside>}
        </div>
      </main>
      <PiedPublic />
    </div>
  );
}

export function Retour({ href = '/inscription', children = 'Retour' }) {
  return <a className="reg-back" href={href}><Icone id="chev" petit className="flip" />{children}</a>;
}

/* Une petite case « conditions » obligatoire. */
function Conditions({ coche, onChange, erreur }) {
  return (
    <div className={`fld fld-check${erreur ? ' has-err' : ''}`}>
      <label className="pcheck">
        <input type="checkbox" checked={coche} onChange={(e) => onChange(e.target.checked)} aria-invalid={erreur ? true : undefined} aria-describedby={erreur ? 'cgu-err' : undefined} />
        <span>J’accepte les conditions d’utilisation et la politique de confidentialité.</span>
      </label>
      {erreur && <p className="fld-err" id="cgu-err"><Icone id="info" petit />{erreur}</p>}
    </div>
  );
}

/* Tableau d'erreurs → focus sur le premier champ en erreur. */
function focusPremiereErreur(form) {
  requestAnimationFrame(() => {
    const el = form && form.querySelector('[aria-invalid="true"]');
    if (el) el.focus();
  });
}

/* Écran final, commun aux trois parcours. */
function Bravo({ titre, children, actions }) {
  const ref = useTitreFocus(titre);
  return (
    <div className="done">
      <span className="done-ic" aria-hidden="true"><Icone id="check" /></span>
      <h1 className="reg-h" tabIndex={-1} ref={ref}>{titre}</h1>
      <div className="done-txt">{children}</div>
      <div className="done-act">{actions}</div>
    </div>
  );
}

/* ——— #inscription : le choix ——— */

export function Choix() {
  const ref = useTitreFocus('choix');
  return (
    <Cadre etroit>
      <h1 className="reg-h" tabIndex={-1} ref={ref}>Créer votre compte</h1>
      <p className="reg-lead">Pour qui utiliserez-vous Bibl.IA&nbsp;?</p>
      <div className="pchoice">
        <a className="pchoice-c has-arrow" href="/inscription/particulier">
          <span className="pchoice-ic"><Icone id="user" /></span>
          <span className="pchoice-t"><b>Pour moi</b><span>Gratuit pour découvrir, ou Plus pour tout débloquer.</span></span>
          <Fleche />
        </a>
        <a className="pchoice-c has-arrow" href="/inscription/entreprise">
          <span className="pchoice-ic"><Icone id="users" /></span>
          <span className="pchoice-t"><b>Pour mon entreprise</b><span>Vous créez l’espace de l’équipe et invitez vos salariés. 14 jours d’essai, sans carte bancaire.</span></span>
          <Fleche />
        </a>
      </div>
      <p className="reg-aside-note"><Icone id="mail" petit />Votre entreprise vous a invité&nbsp;? Ouvrez le lien reçu par mail&nbsp;: il vous amène directement à votre inscription.</p>
      {FAUSSES_DONNEES && (
        <div className="demo">
          <p><b>Mode démo</b> (visible seulement tant que le back n’est pas branché)&nbsp;: tester l’invitation d’un salarié</p>
          <p><a className="ulink" href="/invitation/demo">valable</a> · <a className="ulink" href="/invitation/expiree">expirée</a> · <a className="ulink" href="/invitation/utilisee">déjà utilisée</a> · <a className="ulink" href="/invitation/x7">lien inconnu</a>. Un mail qui commence par « deja@ » est considéré comme déjà inscrit.</p>
        </div>
      )}
    </Cadre>
  );
}

/* ——— #inscription-particulier ——— */

function RecapParticulier({ o, offre, periode }) {
  if (!o) return null;
  const x = o[offre];
  const prix = offre === 'decouverte' ? 'Gratuit' : periode === 'annuelle' ? `${euros(x.prix_annuel_ttc)} par an` : `${euros(x.prix_mensuel_ttc)} par mois`;
  return (
    <div className="recap">
      <p className="recap-k">Votre offre</p>
      <p className="recap-n">{x.nom}</p>
      <p className="recap-p">{prix}{offre !== 'decouverte' && <small> TTC</small>}</p>
      <ul className="offer-inc">{x.inclus.map((t) => <li key={t}><Icone id="check" petit />{t}</li>)}</ul>
      {offre === 'decouverte' && <p className="recap-note">Vous pourrez passer à {o.solo.nom} à tout moment, sans rien perdre.</p>}
    </div>
  );
}

export function Particulier({ params }) {
  const { offres } = useOffres();
  const [offre, setOffre] = useState(params.get('offre') === 'solo' ? 'solo' : 'decouverte');
  const [periode, setPeriode] = useState(params.get('periode') === 'mensuelle' ? 'mensuelle' : 'annuelle');
  const [v, setV] = useState({ prenom: '', email: '', mdp: '', situation: '', situationAutre: '', cgu: false });
  const [err, setErr] = useState({});
  const [envoi, setEnvoi] = useState(false);
  const [general, setGeneral] = useState('');
  const [fini, setFini] = useState(null);
  const ref = useTitreFocus('particulier');
  const maj = (k) => (e) => { const val = e && e.target ? e.target.value : e; setV({ ...v, [k]: val }); if (err[k]) setErr({ ...err, [k]: '' }); };

  const valider = () => ({
    prenom: verifRequis(v.prenom, 'Indiquez votre prénom.'),
    email: verifMail(v.email),
    mdp: verifMdp(v.mdp),
    situation: verifRequis(v.situation, 'Choisissez ce qui vous correspond le mieux.'),
    situationAutre: v.situation === 'autre' ? verifRequis(v.situationAutre, 'Précisez votre situation en quelques mots.') : '',
    cgu: v.cgu ? '' : 'Cochez cette case pour créer votre compte.',
  });

  const envoyer = async (e) => {
    e.preventDefault();
    const er = valider();
    setErr(er); setGeneral('');
    if (Object.values(er).some(Boolean)) { focusPremiereErreur(e.currentTarget); return; }
    setEnvoi(true);
    try {
      await creerCompte({ email: v.email.trim(), motDePasse: v.mdp });
      const r = await inscrireParticulier({ offre, periode, situation: v.situation, prenom: v.prenom.trim(), email: v.email.trim() });
      /* Offre payante : le back renvoie un lien de paiement. Pour de vrai, on y part : window.location.href = r.paiement_url.
         En démo, on affiche directement l'écran final. */
      if (r.paiement_url && !FAUSSES_DONNEES) { window.location.href = r.paiement_url; return; }
      transmettreDemo({ account: { type: 'particulier', role: null }, profile: { situation: v.situation, situationOther: v.situation === 'autre' ? v.situationAutre.trim() : '' } });
      setFini(r.moi);
    } catch (x) {
      if (x.code === 'email_deja_utilise') { setErr({ email: x.message }); focusPremiereErreur(e.target); } else setGeneral(x.message);
    } finally { setEnvoi(false); }
  };

  if (fini) {
    return (
      <Cadre etroit>
        <Bravo titre={`Votre compte est prêt, ${fini.prenom}`}
          actions={<a className="btn btn-primary has-arrow" href="/dashboard">Commencer <Fleche /></a>}>
          {offre === 'solo'
            ? <p>{FAUSSES_DONNEES ? 'En démo, le paiement est simulé. ' : ''}Votre abonnement {offres ? offres.solo.nom : 'Plus'} est actif. Commencez par dire ce que vous devez faire aujourd’hui.</p>
            : <p>Vous avez une demande par jour et le premier chapitre de chaque parcours par IA. Commencez par l’essentiel&nbsp;: comprendre l’IA et bien lui demander.</p>}
        </Bravo>
      </Cadre>
    );
  }

  return (
    <Cadre aside={<RecapParticulier o={offres} offre={offre} periode={periode} />}>
      <Retour />
      <h1 className="reg-h" tabIndex={-1} ref={ref}>Créer votre compte</h1>
      <form className="reg-form" onSubmit={envoyer} noValidate>
        <fieldset className="opts">
          <legend>Votre offre</legend>
          <div className="opts-row">
            {['decouverte', 'solo'].map((id) => (
              <label key={id} className={`opt${offre === id ? ' is-on' : ''}`}>
                <input type="radio" name="offre" value={id} checked={offre === id} onChange={() => setOffre(id)} />
                <b>{offres ? offres[id].nom : id === 'solo' ? 'Plus' : 'Découverte'}</b>
                <span>{!offres ? ' ' : id === 'decouverte' ? 'Gratuit' : `${euros(offres.solo.prix_mensuel_ttc)}/mois ou ${euros(offres.solo.prix_annuel_ttc)}/an`}</span>
              </label>
            ))}
          </div>
          {offre === 'solo' && (
            <div className="opts-sub" role="radiogroup" aria-label="Facturation">
              {['annuelle', 'mensuelle'].map((p) => (
                <label key={p} className="pcheck">
                  <input type="radio" name="periode" checked={periode === p} onChange={() => setPeriode(p)} />
                  <span>{p === 'annuelle' ? 'À l’année' : 'Au mois, sans engagement'}{offres && <b> · {euros(p === 'annuelle' ? offres.solo.prix_annuel_ttc : offres.solo.prix_mensuel_ttc)}</b>}</span>
                </label>
              ))}
            </div>
          )}
        </fieldset>

        <Champ label="Prénom" erreur={err.prenom}>
          <input type="text" autoComplete="given-name" value={v.prenom} onChange={maj('prenom')} />
        </Champ>
        <Champ label="Mail" erreur={err.email}>
          <input type="email" autoComplete="email" inputMode="email" value={v.email} onChange={maj('email')} onBlur={() => v.email && setErr({ ...err, email: verifMail(v.email) })} />
        </Champ>
        <Champ label="Mot de passe" aide="Au moins 8 caractères." erreur={err.mdp}>
          <MotDePasse value={v.mdp} onChange={maj('mdp')} />
        </Champ>
        <Champ label="Votre situation" aide="Les questions de votre profil s’adapteront à votre réponse." erreur={err.situation}>
          <select value={v.situation} onChange={maj('situation')}>
            <option value="">Choisir</option>
            {SITUATIONS.map(([id, lib]) => <option key={id} value={id}>{lib}</option>)}
          </select>
        </Champ>
        {v.situation === 'autre' && (
          <Champ label="Précisez votre situation" erreur={err.situationAutre}>
            <input type="text" value={v.situationAutre} onChange={maj('situationAutre')} placeholder="Par exemple : bénévole, retraité·e, enseignant·e" />
          </Champ>
        )}
        <Conditions coche={v.cgu} onChange={maj('cgu')} erreur={err.cgu} />
        <AlerteFormulaire message={general} />
        <BoutonEnvoi enCours={envoi} attente="Création du compte…">{offre === 'solo' ? 'Continuer vers le paiement' : 'Créer mon compte'}</BoutonEnvoi>
        {offre === 'solo' && <p className="reg-fine"><Icone id="lock" petit />Paiement sécurisé chez notre prestataire. Bibl.IA ne voit jamais votre carte.</p>}
      </form>
    </Cadre>
  );
}

/* ——— #inscription-entreprise : 3 étapes ——— */

const TAILLES = [['2-10', '2 à 10 salariés'], ['11-49', '11 à 49 salariés'], ['50+', '50 salariés et plus']];

function RecapEntreprise({ o, periode, n }) {
  if (!o) return null;
  const e = o.entreprise;
  const pu = periode === 'annuelle' ? e.prix_annuel_ht_par_salarie_par_mois : e.prix_mensuel_ht_par_salarie;
  const nb = Math.min(e.salaries_max, Math.max(e.salaries_min, Number(n) || e.salaries_min));
  return (
    <div className="recap">
      <p className="recap-k">Offre {e.nom}</p>
      <p className="recap-n">{e.essai_jours} jours gratuits</p>
      <p className="recap-p">puis {euros(pu)} <small>HT par salarié et par mois</small></p>
      <div className="recap-calc">
        <span>{nb} salariés · {periode === 'annuelle' ? 'à l’année' : 'au mois'}</span>
        <b>{euros(pu * nb)} HT/mois</b>
      </div>
      <p className="recap-note">Sans carte bancaire pour l’essai. Vous ne payez ensuite que les salariés qui ont rejoint l’équipe, vous compris.</p>
    </div>
  );
}

function Etapes({ n, total = 3 }) {
  return (
    <div className="rsteps" aria-label={`Étape ${n} sur ${total}`}>
      <span className="steps-t">Étape {n} sur {total}</span>
      <span className="steps-bar" aria-hidden="true">{Array.from({ length: total }, (_, i) => <i key={i} className={i < n ? 'is-on' : ''} />)}</span>
    </div>
  );
}

export function Entreprise({ params }) {
  const { offres } = useOffres();
  const [etape, setEtape] = useState(1);
  const [sens, setSens] = useState(1);
  const [periode, setPeriode] = useState(params.get('periode') === 'mensuelle' ? 'mensuelle' : 'annuelle');
  const [v, setV] = useState({ nom: '', taille: '', nombre: '', prenom: '', email: '', mdp: '', cgu: false });
  const [err, setErr] = useState({});
  const [envoi, setEnvoi] = useState(false);
  const [general, setGeneral] = useState('');
  const [moi, setMoi] = useState(null);
  const ref = useTitreFocus(etape);
  const maj = (k) => (e) => { const val = e && e.target ? e.target.value : e; setV({ ...v, [k]: val }); if (err[k]) setErr({ ...err, [k]: '' }); };
  const e = offres && offres.entreprise;
  const aller = (n) => { setSens(n > etape ? 1 : -1); setEtape(n); setGeneral(''); };

  const suite1 = (ev) => {
    ev.preventDefault();
    const nb = Number(v.nombre);
    const er = {
      nom: verifRequis(v.nom, 'Indiquez le nom de votre entreprise.'),
      taille: verifRequis(v.taille, 'Choisissez la taille de votre entreprise.'),
      nombre: v.taille === '50+' ? '' : !v.nombre ? 'Indiquez combien de salariés vous souhaitez équiper.'
        : e && (nb < e.salaries_min || nb > e.salaries_max || !Number.isInteger(nb)) ? `Entre ${e.salaries_min} et ${e.salaries_max} salariés pour cette offre.` : '',
    };
    setErr(er);
    if (Object.values(er).some(Boolean)) { focusPremiereErreur(ev.currentTarget); return; }
    if (v.taille === '50+') return;
    aller(2);
  };

  const suite2 = async (ev) => {
    ev.preventDefault();
    const er = {
      prenom: verifRequis(v.prenom, 'Indiquez votre prénom.'),
      email: verifMail(v.email),
      mdp: verifMdp(v.mdp),
      cgu: v.cgu ? '' : 'Cochez cette case pour créer votre compte.',
    };
    setErr(er); setGeneral('');
    const form = ev.currentTarget;
    if (Object.values(er).some(Boolean)) { focusPremiereErreur(form); return; }
    setEnvoi(true);
    try {
      await creerCompte({ email: v.email.trim(), motDePasse: v.mdp });
      const r = await inscrireEntreprise({ entreprise_nom: v.nom.trim(), taille: v.taille, periode, nombre_salaries: Number(v.nombre), prenom: v.prenom.trim(), email: v.email.trim() });
      transmettreDemo({ account: { type: 'membre', role: 'administrateur', entreprise: v.nom.trim() }, profile: { situation: 'dirigeant' }, company: { name: v.nom.trim() } });
      setMoi(r.moi);
      aller(3);
    } catch (x) {
      if (x.code === 'email_deja_utilise') { setErr({ email: x.message }); focusPremiereErreur(form); } else setGeneral(x.message);
    } finally { setEnvoi(false); }
  };

  const aside = etape < 3 ? <RecapEntreprise o={offres} periode={periode} n={v.nombre} /> : null;

  return (
    <Cadre aside={aside} etroit={etape === 3}>
      {etape === 1 && <Retour />}
      {etape === 2 && <button type="button" className="reg-back" onClick={() => aller(1)}><Icone id="chev" petit className="flip" />Votre entreprise</button>}
      <div className="reg-step" key={etape} style={{ '--dir': sens }}>
        {etape < 3 && <Etapes n={etape} />}

        {etape === 1 && (
          <>
            <h1 className="reg-h" tabIndex={-1} ref={ref}>Votre entreprise</h1>
            <form className="reg-form" onSubmit={suite1} noValidate>
              <Champ label="Nom de l’entreprise" erreur={err.nom}>
                <input type="text" autoComplete="organization" value={v.nom} onChange={maj('nom')} />
              </Champ>
              <fieldset className={`opts${err.taille ? ' has-err' : ''}`}>
                <legend>Taille de l’entreprise</legend>
                <div className="opts-row opts-3">
                  {TAILLES.map(([id, lib]) => (
                    <label key={id} className={`opt opt-s${v.taille === id ? ' is-on' : ''}`}>
                      <input type="radio" name="taille" value={id} checked={v.taille === id} onChange={() => { setV({ ...v, taille: id }); setErr({ ...err, taille: '', nombre: '' }); }} aria-invalid={err.taille ? true : undefined} />
                      <b>{lib}</b>
                    </label>
                  ))}
                </div>
                {err.taille && <p className="fld-err"><Icone id="info" petit />{err.taille}</p>}
              </fieldset>

              {v.taille === '50+' ? (
                <div className="pub-info">
                  <p><b>Pour 50 salariés et plus, nous préparons une offre sur mesure</b>&nbsp;: connexion avec le compte Microsoft ou Google de l’entreprise, et accompagnement.</p>
                  <a className="btn btn-primary" href="/contact?taille=50%2B">Nous contacter</a>
                </div>
              ) : (
                <>
                  <Champ label="Nombre de salariés à équiper" aide={e ? `De ${e.salaries_min} à ${e.salaries_max}, vous compris. Vous pourrez en ajouter ensuite.` : ''} erreur={err.nombre}>
                    <input type="number" inputMode="numeric" min={e ? e.salaries_min : 2} max={e ? e.salaries_max : 49} value={v.nombre} onChange={maj('nombre')} className="input-num" />
                  </Champ>
                  <fieldset className="opts">
                    <legend>Facturation après l’essai</legend>
                    <div className="opts-sub" role="radiogroup">
                      {['annuelle', 'mensuelle'].map((p) => (
                        <label key={p} className="pcheck">
                          <input type="radio" name="periode" checked={periode === p} onChange={() => setPeriode(p)} />
                          <span>{p === 'annuelle' ? 'À l’année' : 'Au mois, sans engagement'}{e && <b> · {euros(p === 'annuelle' ? e.prix_annuel_ht_par_salarie_par_mois : e.prix_mensuel_ht_par_salarie)} HT par salarié et par mois</b>}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <button type="submit" className="btn btn-primary pub-submit has-arrow">Continuer <Fleche /></button>
                </>
              )}
            </form>
          </>
        )}

        {etape === 2 && (
          <>
            <h1 className="reg-h" tabIndex={-1} ref={ref}>Votre compte administrateur</h1>
            <p className="reg-lead">Vous gérerez l’espace de {v.nom.trim() || 'votre entreprise'}&nbsp;: IA autorisées, invitations, suivi des formations.</p>
            <form className="reg-form" onSubmit={suite2} noValidate>
              <Champ label="Prénom" erreur={err.prenom}>
                <input type="text" autoComplete="given-name" value={v.prenom} onChange={maj('prenom')} />
              </Champ>
              <Champ label="Mail professionnel" erreur={err.email}>
                <input type="email" autoComplete="email" inputMode="email" value={v.email} onChange={maj('email')} onBlur={() => v.email && setErr({ ...err, email: verifMail(v.email) })} />
              </Champ>
              <Champ label="Mot de passe" aide="Au moins 8 caractères." erreur={err.mdp}>
                <MotDePasse value={v.mdp} onChange={maj('mdp')} />
              </Champ>
              <Conditions coche={v.cgu} onChange={maj('cgu')} erreur={err.cgu} />
              <AlerteFormulaire message={general} />
              <BoutonEnvoi enCours={envoi} attente="Création de l’espace…">Commencer l’essai gratuit</BoutonEnvoi>
              <p className="reg-fine"><Icone id="lock" petit />Aucune carte bancaire demandée pour l’essai.</p>
            </form>
          </>
        )}

        {etape === 3 && moi && <Inviter moi={moi} titreRef={ref} />}
      </div>
    </Cadre>
  );
}

/* Étape 3 : l'espace est créé, on propose d'inviter tout de suite (contrat § 9.3). */
function Inviter({ moi, titreRef }) {
  const [texte, setTexte] = useState('');
  const [err, setErr] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [res, setRes] = useState(null);
  const fin = moi.offre.fin_essai ? new Date(moi.offre.fin_essai).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : null;
  const mails = texte.split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean);

  const envoyer = async (ev) => {
    ev.preventDefault();
    if (!mails.length) { setErr('Ajoutez au moins un mail, ou passez cette étape.'); return; }
    const mauvais = mails.filter((m) => !MAIL_OK.test(m));
    if (mauvais.length) { setErr(`${mauvais.length > 1 ? 'Ces mails semblent incomplets' : 'Ce mail semble incomplet'} : ${mauvais.join(', ')}`); return; }
    setErr(''); setEnvoi(true);
    try { setRes(await inviterSalaries(mails)); } catch (x) { setErr(x.message); } finally { setEnvoi(false); }
  };

  if (res) {
    return (
      <Bravo titre={`${res.envoyees.length} invitation${res.envoyees.length > 1 ? 's' : ''} envoyée${res.envoyees.length > 1 ? 's' : ''}`}
        actions={<a className="btn btn-primary has-arrow" href="/dashboard#dirigeant">Ouvrir l’espace dirigeant <Fleche /></a>}>
        <p>Vos salariés reçoivent un mail avec un lien pour créer leur compte. Vous suivrez leurs inscriptions dans l’espace dirigeant.</p>
        {res.refusees.length > 0 && <p className="pub-alert">Non envoyées&nbsp;: {res.refusees.map((r) => r.email).join(', ')}</p>}
      </Bravo>
    );
  }

  return (
    <>
      <div className="done-head">
        <span className="done-ic" aria-hidden="true"><Icone id="check" /></span>
        <h1 className="reg-h" tabIndex={-1} ref={titreRef}>Votre espace « {moi.entreprise.nom} » est prêt</h1>
        <p className="reg-lead">Votre essai gratuit est en cours{fin ? ` jusqu’au ${fin}` : ''}. Invitez maintenant les salariés qui utiliseront Bibl.IA.</p>
      </div>
      <form className="reg-form" onSubmit={envoyer} noValidate>
        <Champ label="Mails de vos salariés" aide="Un par ligne, ou séparés par des virgules. Chacun reçoit un lien valable 14 jours." erreur={err}>
          <textarea rows={5} value={texte} onChange={(e) => { setTexte(e.target.value); if (err) setErr(''); }} placeholder={'lea@entreprise.fr\nmarc@entreprise.fr'} />
        </Champ>
        <div className="reg-row">
          <BoutonEnvoi enCours={envoi} attente="Envoi…">{mails.length > 1 ? `Inviter ${mails.length} salariés` : 'Inviter'}</BoutonEnvoi>
          <a className="btn btn-quiet" href="/dashboard#dirigeant">Plus tard</a>
        </div>
        <p className="reg-fine"><Icone id="eye" petit />Vos salariés sont informés que vous voyez leur avancement dans les formations, et rien d’autre.</p>
      </form>
    </>
  );
}

/* ——— #invitation-<code> ——— */

export function Invitation({ code }) {
  const [inv, setInv] = useState({ chargement: true });
  const [v, setV] = useState({ prenom: '', mdp: '', cgu: false });
  const [err, setErr] = useState({});
  const [envoi, setEnvoi] = useState(false);
  const [general, setGeneral] = useState('');
  const [moi, setMoi] = useState(null);
  const ref = useTitreFocus(inv.chargement ? 'att' : inv.erreur ? 'err' : 'ok');

  useEffect(() => {
    let actif = true;
    setInv({ chargement: true });
    getInvitation(code).then((r) => actif && setInv({ data: r })).catch((x) => actif && setInv({ erreur: x }));
    return () => { actif = false; };
  }, [code]);
  const maj = (k) => (e) => { const val = e && e.target ? e.target.value : e; setV({ ...v, [k]: val }); if (err[k]) setErr({ ...err, [k]: '' }); };

  const envoyer = async (ev) => {
    ev.preventDefault();
    const er = { prenom: verifRequis(v.prenom, 'Indiquez votre prénom.'), mdp: verifMdp(v.mdp), cgu: v.cgu ? '' : 'Cochez cette case pour créer votre compte.' };
    setErr(er); setGeneral('');
    const form = ev.currentTarget;
    if (Object.values(er).some(Boolean)) { focusPremiereErreur(form); return; }
    setEnvoi(true);
    try {
      await creerCompte({ email: inv.data.email, motDePasse: v.mdp });
      const m = await accepterInvitation(code, { prenom: v.prenom.trim(), email: inv.data.email });
      transmettreDemo({ account: { type: 'membre', role: 'salarie' }, profile: { situation: 'salarie' } });
      setMoi(m);
    } catch (x) { setGeneral(x.message); } finally { setEnvoi(false); }
  };

  if (inv.chargement) {
    return <Cadre etroit><div className="sk-block" aria-busy="true"><span className="sr-only">Chargement de l’invitation…</span><i /><i /><i /></div></Cadre>;
  }

  if (inv.erreur) {
    const x = inv.erreur;
    return (
      <Cadre etroit>
        <span className="done-ic is-warn" aria-hidden="true"><Icone id="info" /></span>
        <h1 className="reg-h" tabIndex={-1} ref={ref}>{x.code === 'invitation_expiree' ? 'Cette invitation a expiré' : x.code === 'invitation_deja_utilisee' ? 'Invitation déjà utilisée' : 'Lien d’invitation introuvable'}</h1>
        <p className="reg-lead">{x.message}</p>
        <div className="done-act">
          {x.code === 'invitation_deja_utilisee' ? <a className="btn btn-primary" href="/login">Se connecter</a> : <a className="btn btn-ghost" href="/">Découvrir Bibl.IA</a>}
        </div>
      </Cadre>
    );
  }

  if (moi) {
    return (
      <Cadre etroit>
        <Bravo titre={`Bienvenue chez ${moi.entreprise.nom}, ${moi.prenom}`}
          actions={<a className="btn btn-primary has-arrow" href="/dashboard">Commencer <Fleche /></a>}>
          <p>Votre compte est prêt. Vous y trouverez les IA autorisées par votre entreprise, et vos formations, de l’essentiel jusqu’au niveau avancé.</p>
        </Bravo>
      </Cadre>
    );
  }

  const d = inv.data;
  const exp = new Date(d.expire_le).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  return (
    <Cadre aside={
      <div className="recap">
        <p className="recap-k">Ce que voit votre entreprise</p>
        <ul className="offer-inc">
          <li><Icone id="check" petit />Votre avancement dans les formations</li>
        </ul>
        <p className="recap-k recap-k2">Ce qu’elle ne voit jamais</p>
        <ul className="offer-inc is-no">
          <li><Icone id="x" petit />Ce que vous tapez dans Bibl.IA</li>
          <li><Icone id="x" petit />Les IA que vous ouvrez, et combien de fois</li>
        </ul>
      </div>
    }>
      <p className="reg-kicker"><Icone id="mail" petit />Invitation valable jusqu’au {exp}</p>
      <h1 className="reg-h" tabIndex={-1} ref={ref}>{d.entreprise_nom} vous invite à rejoindre Bibl.IA</h1>
      <p className="reg-lead">L’abonnement est pris en charge par votre entreprise. Il vous reste à créer votre compte.</p>
      <form className="reg-form" onSubmit={envoyer} noValidate>
        <Champ label="Mail" aide="Celui de l’invitation. Pour en utiliser un autre, demandez une nouvelle invitation.">
          <input type="email" value={d.email} readOnly />
        </Champ>
        <Champ label="Prénom" erreur={err.prenom}>
          <input type="text" autoComplete="given-name" value={v.prenom} onChange={maj('prenom')} />
        </Champ>
        <Champ label="Mot de passe" aide="Au moins 8 caractères." erreur={err.mdp}>
          <MotDePasse value={v.mdp} onChange={maj('mdp')} />
        </Champ>
        <Conditions coche={v.cgu} onChange={maj('cgu')} erreur={err.cgu} />
        <AlerteFormulaire message={general} />
        <BoutonEnvoi enCours={envoi} attente="Création du compte…">Rejoindre {d.entreprise_nom}</BoutonEnvoi>
      </form>
    </Cadre>
  );
}

/* ——— #contact ——— */

export function Contact({ params }) {
  const [v, setV] = useState({ nom: '', email: '', entreprise: '', taille: params.get('taille') || '', message: '' });
  const [err, setErr] = useState({});
  const [envoi, setEnvoi] = useState(false);
  const [general, setGeneral] = useState('');
  const [ok, setOk] = useState(false);
  const ref = useTitreFocus('contact');
  const maj = (k) => (e) => { setV({ ...v, [k]: e.target.value }); if (err[k]) setErr({ ...err, [k]: '' }); };

  const envoyer = async (ev) => {
    ev.preventDefault();
    const er = { nom: verifRequis(v.nom, 'Indiquez votre nom.'), email: verifMail(v.email), message: verifRequis(v.message, 'Écrivez quelques mots sur votre besoin.') };
    setErr(er); setGeneral('');
    if (Object.values(er).some(Boolean)) { focusPremiereErreur(ev.currentTarget); return; }
    setEnvoi(true);
    try { await envoyerContact({ nom: v.nom.trim(), email: v.email.trim(), entreprise: v.entreprise.trim(), taille: v.taille, message: v.message.trim() }); setOk(true); }
    catch (x) { setGeneral(x.message); } finally { setEnvoi(false); }
  };

  if (ok) {
    return (
      <Cadre etroit>
        <Bravo titre="Message envoyé" actions={<a className="btn btn-ghost" href="/">Retour à la présentation</a>}>
          <p>Merci. Nous vous répondons par mail sous deux jours ouvrés.</p>
        </Bravo>
      </Cadre>
    );
  }

  return (
    <Cadre etroit>
      <Retour href="/">Présentation</Retour>
      <h1 className="reg-h" tabIndex={-1} ref={ref}>Nous contacter</h1>
      <p className="reg-lead">Une entreprise de 50 salariés ou plus, une question avant de commencer&nbsp;? Écrivez-nous.</p>
      <form className="reg-form" onSubmit={envoyer} noValidate>
        <Champ label="Nom" erreur={err.nom}><input type="text" autoComplete="name" value={v.nom} onChange={maj('nom')} /></Champ>
        <Champ label="Mail" erreur={err.email}><input type="email" autoComplete="email" inputMode="email" value={v.email} onChange={maj('email')} /></Champ>
        <div className="reg-2">
          <Champ label="Entreprise" facultatif><input type="text" autoComplete="organization" value={v.entreprise} onChange={maj('entreprise')} /></Champ>
          <Champ label="Taille" facultatif>
            <select value={v.taille} onChange={maj('taille')}>
              <option value="">Choisir</option>
              <option value="2-10">2 à 10 salariés</option>
              <option value="11-49">11 à 49 salariés</option>
              <option value="50+">50 salariés et plus</option>
            </select>
          </Champ>
        </div>
        <Champ label="Message" erreur={err.message}><textarea rows={5} value={v.message} onChange={maj('message')} /></Champ>
        <AlerteFormulaire message={general} />
        <BoutonEnvoi enCours={envoi} attente="Envoi…">Envoyer</BoutonEnvoi>
      </form>
    </Cadre>
  );
}

/* Aiguillage des écrans d'inscription selon l'adresse. */
export default function Inscription({ hash }) {
  const { route, params } = lireHash(hash);
  if (route.startsWith('invitation-')) return <Invitation code={route.slice(11)} />;
  if (route === 'inscription-particulier') return <Particulier params={params} />;
  if (route === 'inscription-entreprise') return <Entreprise params={params} />;
  if (route === 'contact') return <Contact params={params} />;
  return <Choix />;
}
