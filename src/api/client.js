/* Le seul fichier du front qui parle au back.
   Les routes et les réponses suivent la page Notion « Contrat front / back ».

   FAUSSES_DONNEES = true : le front reçoit les exemples du contrat, sans back.
   Quand le back sera prêt, on passe à false : les mêmes fonctions appellent alors les vraies adresses /api/…
   Le reste du site ne sait pas d'où viennent les réponses. */
export const FAUSSES_DONNEES = true;

/* Une erreur du back, toujours sous la même forme : { erreur: { code, message } } (contrat § 1). */
export class ErreurApi extends Error {
  constructor(statut, code, message, details) {
    super(message);
    this.statut = statut;
    this.code = code;
    this.details = details || {};
  }
}

const MESSAGE_500 = 'Un problème est survenu, réessayez dans un instant.';

async function appel(methode, adresse, corps) {
  let rep;
  try {
    rep = await fetch(adresse, {
      method: methode,
      headers: corps ? { 'Content-Type': 'application/json' } : undefined,
      body: corps ? JSON.stringify(corps) : undefined,
    });
  } catch {
    throw new ErreurApi(0, 'reseau', 'Pas de connexion. Vérifiez votre réseau et réessayez.');
  }
  if (rep.status === 204) return null;
  const json = await rep.json().catch(() => null);
  if (!rep.ok) {
    const e = json && json.erreur;
    throw new ErreurApi(rep.status, e ? e.code : 'inconnue', e ? e.message : MESSAGE_500, json || {});
  }
  return json;
}

/* ——— Fausses réponses, copiées du contrat ——— */

const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
const faux = async (valeur, ms = 450) => { await attendre(ms); return typeof valeur === 'function' ? valeur() : valeur; };

/* « Solo » a été renommée « Plus » (nom affiché) ; l'identifiant technique reste « solo ». */
const OFFRES = {
  offres: [
    {
      id: 'decouverte', pour: 'particulier', nom: 'Découverte', prix_mensuel_ttc: 0, devise: 'EUR',
      limites: { demandes_par_jour: 1, parcours_ia: 'premier_chapitre' },
      inclus: ['Bibliothèque des IA', 'Tronc commun complet', 'Premier chapitre de chaque parcours par IA', '1 demande par jour'],
    },
    {
      id: 'solo', pour: 'particulier', nom: 'Plus', prix_mensuel_ttc: 7.9, prix_annuel_ttc: 69, devise: 'EUR', limites: null,
      inclus: ['Bibliothèque des IA', 'Tronc commun complet', 'Tous les parcours par IA', 'Demandes illimitées'],
    },
    {
      id: 'entreprise', pour: 'entreprise', nom: 'Entreprise', prix_mensuel_ht_par_salarie: 9, prix_annuel_ht_par_salarie_par_mois: 7,
      salaries_min: 2, salaries_max: 49, devise: 'EUR', essai_jours: 14, limites: null,
      options: [{ id: 'lancement_visio', nom: 'Séance de lancement en visio', prix_ht: 150 }, { id: 'attestations', nom: 'Attestations de formation', prix_ht: null }],
      inclus: ['Tout le contenu', 'Espace dirigeant', 'IA autorisées pour l’équipe', 'Tableaux de bord anonymes', 'Suivi des formations', 'Relances'],
    },
    {
      id: 'sur_mesure', pour: 'entreprise', nom: 'Sur mesure', sur_devis: true, salaries_min: 50,
      inclus: ['Tout ce que contient Entreprise', 'Connexion avec le compte Microsoft ou Google de l’entreprise', 'Accompagnement'],
    },
  ],
};

/* Pour tester les erreurs en mode démo :
   - un mail qui commence par « deja@ » est déjà utilisé (409) ;
   - les invitations « demo » (valable), « expiree » et « utilisee » (410), toute autre : inconnue (404). */
const INVITATIONS = {
  demo: { entreprise_nom: 'Exemple SARL', email: 'lea@exemple.fr', expire_le: '2026-12-02T00:00:00Z' },
};

function fauxMoi({ prenom, email, type, role, entreprise, offre, statut, finEssai }) {
  return {
    id: 'usr_8f2k', email, prenom, type, role: role || null,
    entreprise: entreprise || null,
    offre: {
      id: offre, statut: statut || 'actif', fin_essai: finEssai || null,
      limites: offre === 'decouverte' ? { demandes_par_jour: 1, demandes_restantes_aujourdhui: 1, parcours_ia: 'premier_chapitre' } : null,
    },
    droits: [], ia_visibles: [],
  };
}

const mailDejaPris = (email) => /^deja@/i.test(String(email || '').trim());

/* ——— Ce que le front peut demander ——— */

/* GET /api/offres (contrat § 2) */
export function getOffres() {
  if (FAUSSES_DONNEES) return faux(OFFRES, 350);
  return appel('GET', '/api/offres');
}

/* POST /api/contact (contrat § 2) */
export function envoyerContact(donnees) {
  if (FAUSSES_DONNEES) return faux({ ok: true });
  return appel('POST', '/api/contact', donnees);
}

/* Création du compte (mail + mot de passe). Elle se fait chez le service de connexion, pas encore choisi
   (Supabase, Firebase…, contrat § 1 et § 13). Ce sera la seule fonction à adapter quand il sera choisi. */
export async function creerCompte({ email, motDePasse }) {
  if (FAUSSES_DONNEES) {
    await attendre(400);
    if (mailDejaPris(email)) throw new ErreurApi(409, 'email_deja_utilise', 'Un compte existe déjà avec ce mail. Connectez-vous plutôt.');
    return { jeton: 'faux-jeton' };
  }
  void motDePasse;
  throw new ErreurApi(501, 'connexion_non_branchee', 'La création de compte n’est pas encore branchée.');
}

/* Connexion (mail + mot de passe), chez le service de connexion, comme creerCompte.
   En démo : n'importe quel mail et un mot de passe de 8 caractères suffisent ; « type » choisit le compte simulé. */
export async function seConnecter({ email, motDePasse, type = 'salarie' }) {
  if (FAUSSES_DONNEES) {
    await attendre(400);
    if (!motDePasse || motDePasse.length < 8) throw new ErreurApi(401, 'identifiants_invalides', 'Mail ou mot de passe incorrect.');
    const prenom = (email.split('@')[0] || 'Vous').replace(/[._-].*/, '').replace(/^./, (c) => c.toUpperCase());
    if (type === 'particulier') return fauxMoi({ prenom, email, type: 'particulier', offre: 'solo' });
    if (type === 'dirigeant') return fauxMoi({ prenom, email, type: 'membre', role: 'administrateur', entreprise: { id: 'org_51ab', nom: 'Exemple SARL' }, offre: 'entreprise' });
    return fauxMoi({ prenom, email, type: 'membre', role: 'salarie', entreprise: { id: 'org_51ab', nom: 'Exemple SARL' }, offre: 'entreprise' });
  }
  void motDePasse;
  throw new ErreurApi(501, 'connexion_non_branchee', 'La connexion n’est pas encore branchée.');
}

/* POST /api/recommandation : l'IA de Bibl.IA choisit l'outil et écrit le prompt (contrat § 7).
   La demande est lue puis effacée : ni le back ni le fournisseur d'IA ne la conservent.
   En démo (FAUSSES_DONNEES), renvoie null : le site garde sa recommandation calculée dans le navigateur. */
export async function recommander({ demande, profil, entreprise, ia_disponibles, deja_en_place }) {
  if (FAUSSES_DONNEES) return null;
  return appel('POST', '/api/recommandation', { demande, profil, entreprise, ia_disponibles, deja_en_place });
}

/* POST /api/inscription/particulier (contrat § 3.1) */
export function inscrireParticulier({ offre, periode, situation, prenom, email }) {
  if (FAUSSES_DONNEES) return faux(() => ({
    moi: fauxMoi({ prenom, email, type: 'particulier', offre }),
    ...(offre === 'solo' ? { paiement_url: 'https://checkout.stripe.com/exemple' } : {}),
  }));
  return appel('POST', '/api/inscription/particulier', { offre, periode, situation });
}

/* POST /api/inscription/entreprise (contrat § 3.2) */
export function inscrireEntreprise({ entreprise_nom, taille, periode, nombre_salaries, prenom, email }) {
  if (FAUSSES_DONNEES) return faux(() => {
    const fin = new Date(Date.now() + 14 * 864e5).toISOString();
    return { moi: fauxMoi({ prenom, email, type: 'membre', role: 'administrateur', entreprise: { id: 'org_51ab', nom: entreprise_nom }, offre: 'entreprise', statut: 'essai', finEssai: fin }) };
  });
  return appel('POST', '/api/inscription/entreprise', { entreprise_nom, taille, offre: 'entreprise', periode, nombre_salaries });
}

/* GET /api/invitations/{code} (contrat § 3.3) */
export async function getInvitation(code) {
  if (FAUSSES_DONNEES) {
    await attendre(500);
    if (code === 'expiree') throw new ErreurApi(410, 'invitation_expiree', 'Cette invitation a expiré. Demandez-en une nouvelle à votre administrateur.');
    if (code === 'utilisee') throw new ErreurApi(410, 'invitation_deja_utilisee', 'Cette invitation a déjà servi. Si c’est la vôtre, connectez-vous.');
    if (!INVITATIONS[code]) throw new ErreurApi(404, 'invitation_inconnue', 'Ce lien d’invitation n’existe pas. Vérifiez qu’il est complet, ou demandez-en un nouveau.');
    return INVITATIONS[code];
  }
  return appel('GET', `/api/invitations/${encodeURIComponent(code)}`);
}

/* POST /api/invitations/{code}/accepter (contrat § 3.3) */
export function accepterInvitation(code, { prenom, email }) {
  if (FAUSSES_DONNEES) return faux(() => {
    const inv = INVITATIONS[code];
    if (inv && email.trim().toLowerCase() !== inv.email) throw new ErreurApi(409, 'email_different', 'Ce mail n’est pas celui de l’invitation.');
    return fauxMoi({ prenom, email, type: 'membre', role: 'salarie', entreprise: { id: 'org_51ab', nom: inv ? inv.entreprise_nom : '' }, offre: 'entreprise' });
  });
  return appel('POST', `/api/invitations/${encodeURIComponent(code)}/accepter`);
}

/* POST /api/entreprise/invitations (contrat § 9.3) */
export function inviterSalaries(emails) {
  if (FAUSSES_DONNEES) return faux(() => {
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      envoyees: emails.filter((e) => ok.test(e)),
      refusees: emails.filter((e) => !ok.test(e)).map((email) => ({ email, raison: 'email_invalide' })),
    };
  });
  return appel('POST', '/api/entreprise/invitations', { emails });
}
