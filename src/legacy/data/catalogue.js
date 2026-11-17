
"use strict";
/* Bibl.IA — contenus de démonstration.
   Fiches : usages établis et publics de chaque outil, sans fonctionnalité inventée.
   Prix et règles de données : indicatifs, à vérifier sur le site de l'éditeur. */
const CATS = [
  {id:'ecrire',  name:'Écrire et reformuler'},
  {id:'outils',  name:'Dans vos outils de bureau'},
  {id:'chercher',name:'Chercher et résumer'},
  {id:'traduire',name:'Traduire et corriger'},
  {id:'creer',   name:'Présentations et visuels'}
];

const AIS = [
  {id:'chatgpt', name:'ChatGPT', mono:'Ch', cat:'ecrire', editor:'OpenAI', origin:'États-Unis', url:'https://chatgpt.com',
   tagline:'Assistant polyvalent pour rédiger, reformuler, résumer et trouver des idées.',
   usages:['Rédiger un mail, un courrier ou une annonce','Reformuler un texte dans un autre ton','Résumer un document que vous lui donnez (PDF, Word, Excel)','Trouver des idées et préparer une réunion','Créer une image à partir d’une description'],
   price:{free:'Oui, avec des limites',solo:'Abonnement mensuel (environ 20 € [Exemple])',team:'Offres pour les entreprises'},
   data:'Selon votre formule et vos réglages, vos conversations peuvent servir à améliorer les modèles. Un réglage permet de le refuser. Les offres pour les entreprises indiquent ne pas utiliser vos données pour l’entraînement par défaut.'},
  {id:'lechat', name:'Le Chat', mono:'Lc', cat:'ecrire', editor:'Mistral AI', origin:'France', url:'https://chat.mistral.ai',
   tagline:'Assistant d’un éditeur français pour rédiger, résumer et chercher sur le web.',
   usages:['Rédiger et reformuler des textes en français','Résumer un document que vous lui donnez','Chercher une information sur le web, avec les sources','Traduire un texte court'],
   price:{free:'Oui, avec des limites',solo:'Abonnement mensuel (environ 15 € [Exemple])',team:'Offres pour les entreprises'},
   data:'Éditeur français. Pour les comptes individuels, un réglage permet de refuser que vos conversations servent à l’entraînement. Les offres pour les entreprises prévoient des garanties supplémentaires.'},
  {id:'claude', name:'Claude', mono:'Cl', cat:'ecrire', editor:'Anthropic', origin:'États-Unis', url:'https://claude.ai',
   tagline:'Assistant apprécié pour la rédaction soignée et la lecture de longs documents.',
   usages:['Rédiger un texte soigné ou délicat','Analyser un long document (contrat, rapport, cahier des charges)','Résumer et comparer plusieurs documents','Préparer un plan ou une trame'],
   price:{free:'Oui, avec des limites',solo:'Abonnement mensuel (environ 20 € [Exemple])',team:'Offres pour les entreprises'},
   data:'Pour les comptes individuels, vous choisissez dans les paramètres si vos conversations servent à améliorer les modèles. Les offres pour les entreprises indiquent ne pas les utiliser pour l’entraînement.'},
  {id:'copilot', name:'Microsoft 365 Copilot', short:'Copilot', mono:'Co', cat:'outils', editor:'Microsoft', origin:'États-Unis', url:'https://copilot.microsoft.com',
   tagline:'L’IA intégrée à Word, Excel, PowerPoint, Outlook et Teams.',
   usages:['Rédiger un brouillon dans Word ou Outlook','Résumer un long fil de mails dans Outlook','Analyser un tableau dans Excel','Créer une présentation PowerPoint à partir d’un document','Résumer une réunion Teams'],
   price:{free:'Copilot Chat inclus avec un compte professionnel',solo:'Licence par utilisateur (tarif [Exemple] à confirmer)',team:'Ajout à l’abonnement Microsoft 365'},
   data:'Avec un compte professionnel Microsoft 365, Microsoft indique que vos données restent dans l’environnement de l’entreprise et ne servent pas à entraîner les modèles.'},
  {id:'gemini', name:'Gemini', mono:'Ge', cat:'outils', editor:'Google', origin:'États-Unis', url:'https://gemini.google.com',
   tagline:'L’IA de Google, seule ou dans Gmail, Docs et Sheets.',
   usages:['Rédiger un mail dans Gmail','Résumer un document dans Google Docs','Organiser un tableau dans Google Sheets','Répondre à une question générale'],
   price:{free:'Oui, avec un compte Google',solo:'Abonnement mensuel (tarif [Exemple] à confirmer)',team:'Inclus dans certaines offres Google Workspace'},
   data:'Avec un compte Google Workspace professionnel, Google indique ne pas utiliser vos données pour entraîner les modèles. Avec un compte personnel, certaines conversations peuvent être relues pour améliorer le service, sauf si vous désactivez l’historique.'},
  {id:'perplexity', name:'Perplexity', mono:'Pe', cat:'chercher', editor:'Perplexity AI', origin:'États-Unis', url:'https://www.perplexity.ai',
   tagline:'Un moteur de recherche qui répond en citant ses sources.',
   usages:['Vérifier une information avec ses sources','Faire une veille sur un sujet ou un concurrent','Comparer des fournisseurs ou des produits','Trouver un texte de référence (norme, réglementation)'],
   price:{free:'Oui, avec des limites',solo:'Abonnement mensuel (environ 20 € [Exemple])',team:'Offre pour les entreprises'},
   data:'Un réglage permet de refuser que vos questions servent à améliorer le service. L’offre pour les entreprises indique ne pas les utiliser pour l’entraînement.'},
  {id:'notebooklm', name:'NotebookLM', mono:'Nb', cat:'chercher', editor:'Google', origin:'États-Unis', url:'https://notebooklm.google.com',
   tagline:'Pose des questions à vos propres documents, réponses avec citations.',
   usages:['Résumer un ensemble de documents','Retrouver une information dans vos procédures','Préparer une note à partir de plusieurs sources','Écouter un résumé audio de vos documents'],
   price:{free:'Oui, avec un compte Google',solo:'Inclus dans certaines offres Google',team:'Inclus dans certaines offres Google Workspace'},
   data:'Google indique que les documents que vous importez ne servent pas à entraîner les modèles.'},
  {id:'deepl', name:'DeepL', mono:'Dl', cat:'traduire', editor:'DeepL SE', origin:'Allemagne', url:'https://www.deepl.com/translator',
   tagline:'Traduction de textes et de documents, correction avec DeepL Write.',
   usages:['Traduire un mail ou un texte','Traduire un document Word, PowerPoint ou PDF en gardant la mise en page','Corriger et améliorer un texte avec DeepL Write'],
   price:{free:'Oui, avec des limites',solo:'Abonnement DeepL Pro (environ 9 € [Exemple])',team:'Offres pour les équipes'},
   data:'Version gratuite : vos textes peuvent être conservés pour améliorer le service. Avec DeepL Pro, l’éditeur indique que vos textes sont supprimés après traduction et ne servent pas à l’entraînement.'},
  {id:'canva', name:'Canva', mono:'Ca', cat:'creer', editor:'Canva', origin:'Australie', url:'https://www.canva.com',
   tagline:'Affiches, publications et visuels à partir de modèles, avec des outils d’IA.',
   usages:['Créer une affiche ou un flyer à partir d’un modèle','Préparer une publication pour les réseaux sociaux','Générer une image à partir d’une description','Mettre en forme une présentation'],
   price:{free:'Oui',solo:'Abonnement Canva Pro (tarif [Exemple] à confirmer)',team:'Offre Canva Teams'},
   data:'Des réglages de confidentialité permettent de choisir si vos contenus peuvent servir à entraîner les outils d’IA de Canva.'},
  {id:'gamma', name:'Gamma', mono:'Ga', cat:'creer', editor:'Gamma', origin:'États-Unis', url:'https://gamma.app',
   tagline:'Crée une présentation complète à partir d’un texte ou d’un plan.',
   usages:['Transformer un plan en présentation','Importer un document existant pour le mettre en forme','Ajuster le texte et le style d’une diapositive'],
   price:{free:'Oui, avec des crédits limités',solo:'Abonnement mensuel (tarif [Exemple] à confirmer)',team:'Offres pour les équipes'},
   data:'Consultez la politique de confidentialité de l’éditeur. Évitez d’y importer des chiffres confidentiels sans l’accord de votre entreprise.'}
];
/* Couleur associée à chaque IA (repère visuel : teinte des tuiles, survols, frise des nouveautés) */
const BRAND = {chatgpt:'#10A37F', lechat:'#FA500F', claude:'#D97757', copilot:'#0078D4', gemini:'#3186FF', perplexity:'#22B8CD', notebooklm:'#F9AB00', deepl:'#0F2B46', canva:'#7D2AE8', gamma:'#D6409F'};
AIS.forEach(a => a.color = BRAND[a.id]);
const AI = Object.fromEntries(AIS.map(a => [a.id, a]));
const nameOf = id => (AI[id] && (AI[id].short || AI[id].name)) || id;

/* Profil : choix proposés à l'inscription */
const JOBS = ['Commercial·e','Assistant·e de direction','Comptabilité et gestion','Ressources humaines','Communication et marketing','Service client','Production et logistique','Direction','Autre métier'];
const TASKS = [
  {id:'mail',label:'Écrire des mails'},{id:'slides',label:'Préparer des présentations'},{id:'summary',label:'Faire des comptes rendus'},
  {id:'translate',label:'Traduire'},{id:'search',label:'Chercher des informations'},{id:'sheet',label:'Travailler sur des tableaux'},
  {id:'visual',label:'Créer des visuels'},{id:'hr',label:'Rédiger des annonces'}
];
const TOOLS = [
  {id:'ms365',label:'Microsoft 365 (Outlook, Word, Excel)'},{id:'google',label:'Google Workspace (Gmail, Docs)'},
  {id:'chatgpt',label:'ChatGPT'},{id:'other-ai',label:'Une autre IA'},{id:'none',label:'Aucune IA pour l’instant'}
];

/* Questionnaire du salarié (inscription et page « Mon profil ») : les réponses alimentent le contexte des prompts */
const EMP_Q = [
  {id:'job', type:'single', title:'Quel est votre métier ?', help:'Pour vous proposer des exemples qui vous parlent.', options:JOBS, other:'Autre métier', otherPh:'Précisez votre métier (par exemple : chargé·e d’affaires)'},
  {id:'tasks', type:'multi', title:'Quelles sont vos tâches principales ?', help:'Elles apparaissent en premier dans les exemples de l’accueil.', options:TASKS},
  {id:'audience', type:'multi', title:'À qui vous adressez-vous le plus souvent ?', help:'Pour adapter le ton et le niveau de détail des textes.', options:['Clients particuliers','Clients professionnels','Fournisseurs','Collègues','Direction','Administrations et partenaires']},
  {id:'tone', type:'single', title:'Quel ton utilisez-vous dans vos échanges écrits ?', help:'Il sera repris dans les textes de rédaction proposés.', options:['Très formel','Professionnel et cordial','Simple et direct','Chaleureux et proche']},
  {id:'format', type:'single', title:'Comment préférez-vous recevoir les réponses de l’IA ?', help:'Chaque texte proposé le précisera à l’IA.', options:['Courtes et à l’essentiel','Détaillées avec des explications','En liste à puces','Avec un exemple concret']},
  {id:'langs', type:'multi', title:'Dans quelles langues travaillez-vous ?', help:'Pour les traductions et les échanges avec l’étranger.', options:['Français','Anglais','Allemand','Espagnol','Italien','Autre langue'], other:'Autre langue', otherPh:'Laquelle ? (par exemple : néerlandais)'},
  {id:'level', type:'single', title:'Où en êtes-vous avec l’IA ?', help:'Pour adapter les explications.', options:['Je débute','J’ai déjà essayé quelques fois','Je l’utilise régulièrement']},
  {id:'tools', type:'multi', title:'Quels outils utilisez-vous déjà ?', help:'Si l’IA intégrée à vos outils est autorisée, elle vous sera proposée en priorité.', options:TOOLS, exclusive:'none', other:'other-ai', otherPh:'Laquelle ? (par exemple : un outil de transcription)'},
  {id:'notes', type:'textarea', title:'Autre chose d’important à savoir pour vous aider ?', help:'Réponse libre. Il est ajouté au début de chacun de vos textes à copier.', ph:'Par exemple : je suis le contact des clients hôteliers, je rappelle toujours notre délai de livraison de 5 jours, j’évite le jargon technique.'}
];

/* Présentation de l'entreprise (espace dirigeant) : ajoutée en tête des prompts de tous les salariés */
const CO_Q = [
  {id:'name', type:'text', title:'Comment s’appelle votre entreprise ?', help:'Le nom utilisé avec vos clients.', ph:'Nom de l’entreprise'},
  {id:'sector', type:'single', title:'Dans quel secteur travaillez-vous ?', options:['Industrie','Bâtiment et travaux','Commerce et distribution','Services aux entreprises','Santé et social','Hôtellerie et restauration','Transport et logistique','Numérique','Agriculture et agroalimentaire','Autre secteur'], other:'Autre secteur', otherPh:'Précisez votre secteur (par exemple : imprimerie)'},
  {id:'size', type:'single', title:'Combien de salariés compte l’entreprise ?', options:['1 à 10','11 à 49','50 à 249','250 et plus']},
  {id:'activity', type:'textarea', title:'Que fait votre entreprise, en une ou deux phrases ?', help:'C’est ce que l’IA lira avant chaque demande de vos salariés.', ph:'Par exemple : nous fabriquons et installons des menuiseries en bois pour les particuliers et les professionnels.'},
  {id:'clients', type:'multi', title:'Qui sont vos clients ?', options:['Particuliers','Entreprises','Collectivités et secteur public','Clients à l’international']},
  {id:'area', type:'single', title:'Où travaillez-vous ?', options:['Localement','Dans la région','Dans toute la France','À l’international']},
  {id:'values', type:'multi', title:'Qu’est-ce qui distingue votre entreprise ?', options:['Proximité','Expertise technique','Qualité','Prix compétitifs','Réactivité','Innovation','Engagement environnemental']},
  {id:'voice', type:'single', title:'Comment l’entreprise s’adresse-t-elle à ses clients ?', options:['Vouvoiement, ton formel','Vouvoiement, ton chaleureux','Tutoiement, ton décontracté']},
  {id:'rules', type:'textarea', title:'Quelles règles vos salariés doivent-ils respecter avec l’IA ?', help:'Informations à ne jamais transmettre, mentions obligatoires, mots à éviter…', ph:'Par exemple : ne jamais citer nos marges ni nos fournisseurs ; toujours signer « L’équipe Durand ».'},
  {id:'notes', type:'textarea', title:'Autre chose d’important pour bien présenter votre entreprise ?', help:'Réponse libre : produits phares, saisonnalité, projets en cours, vocabulaire maison…', ph:'Par exemple : notre pic d’activité est au printemps ; nos clients nous connaissent pour le sur-mesure.'}
];
/* Moteur de recommandation de démonstration : mots-clés → tâche → IA autorisées. */
const ms = p => p.tools.includes('ms365');
const gg = p => p.tools.includes('google');
/* En-tête de chaque prompt : présentation de l'entreprise + profil du salarié (voir contextBlock) */
const me = p => contextBlock();
const tn = (p, d) => p.tone ? p.tone.toLowerCase() : d;

const INTENTS = [
 {id:'mail', chip:'Écrire un mail à un client', ask:'J’ai besoin d’écrire un mail à un client',
  kw:['mail','email','e-mail','courriel','message','repondre','reponse','relance','relancer','ecrire a','courrier','lettre','client','fournisseur','devis'],
  cands:[
   {ai:'copilot',when:ms,why:'Vous utilisez Outlook : Copilot y est déjà intégré. Vous rédigez votre mail sans changer de fenêtre.'},
   {ai:'gemini',when:gg,why:'Vous utilisez Gmail : Gemini vous aide à rédiger directement dans votre messagerie.'},
   {ai:'lechat',why:'Le Chat rédige un mail clair en français à partir de quelques indications. Vous l’ajustez ensuite en une phrase (« plus court », « plus formel »).'},
   {ai:'chatgpt',why:'ChatGPT rédige un premier jet de mail que vous ajustez ensuite à votre façon.'},
   {ai:'claude',why:'Claude est apprécié pour les messages délicats qui demandent du tact.'}],
  prompt:p=>`${me(p)}Rédigez un mail à [nom du client] pour [objet : relancer un devis, confirmer un rendez-vous…].\nContexte : [2 ou 3 phrases sur la situation].\nTon : ${tn(p, 'courtois et professionnel')}, phrases courtes.\nTerminez par une prochaine étape claire et une formule de politesse.\nLongueur : 10 lignes maximum.`},
 {id:'slides', chip:'Faire une présentation', ask:'Je dois faire une présentation',
  kw:['presentation','diapo','diaporama','slide','powerpoint','ppt','support','pitch','keynote','presenter'],
  cands:[
   {ai:'gamma',why:'Gamma transforme un simple plan en présentation complète et mise en page. Vous n’avez plus qu’à relire et ajuster.'},
   {ai:'copilot',when:ms,why:'Vous travaillez avec PowerPoint : Copilot peut créer une présentation à partir d’un document Word existant.'},
   {ai:'canva',why:'Canva propose des modèles de présentation soignés que vous complétez facilement.'},
   {ai:'chatgpt',why:'ChatGPT vous aide d’abord à construire le plan et les messages clés de chaque diapositive.'}],
  prompt:p=>`${me(p)}Créez une présentation de [nombre] diapositives sur [sujet].\nPublic : [qui va la voir : clients, équipe, direction].\nObjectif : [ce que le public doit retenir ou décider].\nUne idée par diapositive, avec un titre court et 3 points maximum.\nTerminez par une diapositive « Prochaines étapes ».`},
 {id:'summary', chip:'Résumer un compte rendu', ask:'Je dois résumer un compte rendu de réunion',
  kw:['resumer','resume','synthese','synthetiser','compte rendu','compte-rendu','reunion','rapport','document long','lire','pdf','notes'],
  cands:[
   {ai:'copilot',when:ms,why:'Vos documents sont dans Word ou Teams : Copilot les résume là où ils se trouvent.'},
   {ai:'notebooklm',why:'NotebookLM répond uniquement à partir des documents que vous lui donnez, avec les passages cités. Idéal pour ne rien inventer.'},
   {ai:'claude',why:'Claude lit de longs documents et en fait une synthèse structurée et fidèle.'},
   {ai:'lechat',why:'Le Chat résume un document en français et en extrait les décisions et les actions.'},
   {ai:'chatgpt',why:'ChatGPT résume un document que vous lui transmettez et en tire les points clés.'}],
  prompt:p=>`${me(p)}Voici le compte rendu d’une réunion : [collez le texte ou joignez le fichier].\nFaites-en un résumé en 3 parties :\n1. Les décisions prises\n2. Les actions à mener, avec qui et pour quand\n3. Les points restés en suspens\nRestez fidèle au texte : n’ajoutez aucune information.`},
 {id:'translate', chip:'Traduire un document', ask:'Je dois traduire un document en anglais',
  kw:['traduire','traduction','anglais','allemand','espagnol','italien','portugais','langue','translate','etranger','version anglaise'],
  cands:[
   {ai:'deepl',why:'DeepL est spécialisé dans la traduction : il traduit vos textes et vos documents en gardant la mise en page.'},
   {ai:'lechat',why:'Le Chat traduit un texte et peut l’adapter au ton voulu.'},
   {ai:'chatgpt',why:'ChatGPT traduit un texte et l’adapte au destinataire.'}],
  prompt:p=>`${me(p)}Traduisez le texte suivant en [langue].\nDestinataire : [un client, un fournisseur, un partenaire].\nGardez un ton ${tn(p, 'professionnel')} et les termes techniques de notre métier : [termes à conserver].\nTexte : [collez votre texte]`},
 {id:'correct', chip:'Corriger un texte', ask:'Je voudrais corriger et améliorer un texte',
  kw:['corriger','correction','orthographe','faute','reformuler','relire','ameliorer','ton','plus clair','plus court','grammaire'],
  cands:[
   {ai:'deepl',why:'DeepL Write corrige l’orthographe et propose des tournures plus claires, sans changer le sens.'},
   {ai:'lechat',why:'Le Chat corrige et reformule votre texte en français en respectant votre style.'},
   {ai:'claude',why:'Claude reformule avec soin, en vous expliquant ce qu’il a changé.'},
   {ai:'chatgpt',why:'ChatGPT corrige et reformule votre texte selon le ton demandé.'}],
  prompt:p=>`${me(p)}Corrigez les fautes du texte ci-dessous et rendez-le plus clair.\nGardez le sens et mon style. Ne rajoutez pas d’information.\nListez ensuite les principales corrections.\nTexte : [collez votre texte]`},
 {id:'search', chip:'Vérifier une information', ask:'Je dois vérifier une information',
  kw:['chercher','rechercher','trouver','information','source','verifier','veille','concurrent','reglementation','loi','norme','fournisseur','comparer','prix'],
  cands:[
   {ai:'perplexity',why:'Perplexity cherche sur le web et cite ses sources : vous pouvez vérifier chaque information en un clic.'},
   {ai:'lechat',why:'Le Chat peut chercher sur le web et indiquer ses sources.'},
   {ai:'gemini',when:gg,why:'Gemini s’appuie sur la recherche Google pour répondre.'},
   {ai:'chatgpt',why:'ChatGPT peut chercher sur le web ; vérifiez toujours les sources indiquées.'}],
  prompt:p=>`${me(p)}Je cherche des informations fiables sur [sujet].\nDonnez-moi une réponse courte, puis les 3 sources les plus sérieuses avec leur date.\nSignalez les points incertains ou contradictoires.`},
 {id:'visual', chip:'Créer une affiche', ask:'Je dois créer une affiche',
  kw:['affiche','visuel','image','flyer','logo','publication','post','reseaux sociaux','linkedin','instagram','facebook','banniere','carte','illustration','photo'],
  cands:[
   {ai:'canva',why:'Canva part de modèles prêts à l’emploi : vous obtenez un visuel professionnel sans compétence en graphisme.'},
   {ai:'chatgpt',why:'ChatGPT peut créer une image à partir d’une description, à intégrer ensuite dans votre support.'}],
  prompt:p=>`${me(p)}Je dois créer [une affiche, une publication LinkedIn…] pour [événement ou message].\nPublic : [à qui elle s’adresse].\nInformations à faire figurer : [date, lieu, offre, contact].\nStyle : [sobre et professionnel, coloré…], aux couleurs de l’entreprise : [couleurs].`},
 {id:'sheet', chip:'Analyser un tableau Excel', ask:'Je dois analyser un tableau Excel',
  kw:['excel','tableau','tableur','chiffre','formule','calcul','donnees','budget','graphique','statistique','sheets','colonne','ventes'],
  cands:[
   {ai:'copilot',when:ms,why:'Vous travaillez dans Excel : Copilot analyse votre tableau et propose formules et graphiques sur place.'},
   {ai:'gemini',when:gg,why:'Vous travaillez dans Google Sheets : Gemini vous aide à organiser et analyser votre tableau.'},
   {ai:'chatgpt',why:'ChatGPT lit un fichier Excel que vous lui donnez, en tire les tendances et explique les formules.'},
   {ai:'claude',why:'Claude analyse un fichier de données et explique ses conclusions pas à pas.'}],
  prompt:p=>`${me(p)}Voici un tableau : [joignez le fichier ou collez les données, sans données personnelles].\nIl contient [ce que représentent les colonnes].\nDites-moi en langage simple :\n1. Les 3 tendances principales\n2. Les valeurs inhabituelles\n3. Le graphique le plus adapté pour présenter ces chiffres`},
 {id:'meeting', chip:'Préparer une réunion', ask:'Je dois préparer une réunion',
  kw:['preparer','ordre du jour','planning','organiser','planifier','checklist','procedure','plan d action','projet','animer','entretien annuel'],
  cands:[
   {ai:'copilot',when:ms,why:'Votre agenda est dans Outlook et Teams : Copilot vous aide à préparer et suivre vos réunions.'},
   {ai:'lechat',why:'Le Chat vous propose un ordre du jour clair et les questions à prévoir.'},
   {ai:'chatgpt',why:'ChatGPT structure votre réunion : objectifs, ordre du jour, minutage.'},
   {ai:'claude',why:'Claude vous aide à anticiper les points sensibles et à préparer vos arguments.'}],
  prompt:p=>`${me(p)}Je prépare une réunion de [durée] avec [participants] sur [sujet].\nObjectif : [décision à prendre ou information à partager].\nProposez un ordre du jour minuté, les questions à poser et les documents à préparer.`},
 {id:'hr', chip:'Rédiger une annonce d’emploi', ask:'Je dois rédiger une annonce d’emploi',
  kw:['annonce','offre d emploi','emploi','recrutement','recruter','fiche de poste','candidat','poste','stage','alternance'],
  cands:[
   {ai:'lechat',why:'Le Chat rédige une annonce claire et attractive en français à partir de vos informations.'},
   {ai:'chatgpt',why:'ChatGPT rédige une annonce structurée que vous adaptez à votre entreprise.'},
   {ai:'claude',why:'Claude soigne le ton et veille à une formulation inclusive.'}],
  prompt:p=>`${me(p)}Rédigez une annonce pour un poste de [intitulé] en [CDI, CDD, alternance] à [ville].\nMissions principales : [3 à 5 missions].\nProfil recherché : [compétences, expérience].\nCe que nous offrons : [avantages].\nTon : chaleureux et professionnel, formulation inclusive, 250 mots maximum.`},
 {id:'ideas', chip:'Trouver des idées', ask:'J’ai besoin de trouver des idées',
  kw:['idee','brainstorm','inspiration','nom','slogan','imaginer','creatif','animation','evenement','cadeau'],
  cands:[
   {ai:'chatgpt',why:'ChatGPT propose rapidement de nombreuses pistes que vous pouvez trier et approfondir.'},
   {ai:'claude',why:'Claude propose des idées argumentées, avec leurs avantages et leurs limites.'},
   {ai:'lechat',why:'Le Chat propose des idées en français, adaptées à votre contexte.'}],
  prompt:p=>`${me(p)}Proposez-moi 10 idées pour [objectif].\nContraintes : [budget, délai, public].\nPour chaque idée : une phrase d’explication et son principal avantage.\nClassez-les de la plus simple à la plus ambitieuse.`}
];
const GENERAL = {id:'general', cands:[
  {ai:'lechat',why:'Pour une demande générale, un assistant conversationnel comme Le Chat est un bon point de départ.'},
  {ai:'chatgpt',why:'ChatGPT est un assistant polyvalent, adapté à la plupart des demandes.'},
  {ai:'claude',why:'Claude est un assistant polyvalent, à l’aise avec les textes longs.'},
  {ai:'copilot',why:'Copilot est disponible dans vos outils Microsoft.'}],
  prompt:p=>`${me(p)}Voici ce que je dois faire : [décrivez la tâche].\nContexte : [pour qui, pour quand, avec quelles informations].\nRésultat attendu : [un texte, une liste, un tableau…].\nPosez-moi des questions si quelque chose n’est pas clair.`};

const JOB_TIPS = {
  'Commercial·e':'Précisez l’étape de la vente (premier contact, relance, remerciement) : le résultat sera plus juste.',
  'Comptabilité et gestion':'Ne collez jamais de coordonnées bancaires ni de données nominatives : remplacez-les par [crochets].',
  'Ressources humaines':'Les informations sur les salariés sont confidentielles : n’en mettez jamais dans une IA.',
  'Service client':'Retirez le nom et les coordonnées du client avant de coller son message.',
  'Assistant·e de direction':'Indiquez le destinataire et le niveau de formalité attendu.',
  'Communication et marketing':'Donnez le ton de votre marque et un exemple de texte déjà publié.',
  'Production et logistique':'Gardez les références et quantités exactes : relisez-les après la réponse.',
  'Direction':'Demandez une version courte et une version détaillée pour gagner du temps.'
};
/* Formations : tronc commun « Premiers pas avec l’IA ».
   Cinq modules, des fondations aux usages avancés. Chaque leçon suit le même rythme : comprendre (quelques lignes),
   pratiquer tout de suite sur une vraie tâche, vérifier avec une question. Une autre question revient ensuite en révision. */
const TRONC = {id:'tc', name:'Premiers pas avec l’IA', mods:['Les fondations','Vos outils','Bien demander','Vérifier et protéger','Aller plus loin'], lessons:[
 /* ——— Module 1 · Les fondations ——— */
 {id:'tc1',mod:0,dur:3,title:'L’IA est un domaine, pas un outil',goal:'Savoir où se situent ChatGPT et les autres assistants dans l’ensemble de l’IA.',fig:'nest',
  learn:['L’intelligence artificielle est un domaine d’étude, comme la médecine. Dire « l’IA fait ceci » est aussi vague que dire « la médecine soigne cela ».','Ce domaine contient des branches emboîtées : l’apprentissage automatique (machine learning), puis l’apprentissage profond (deep learning), puis les grands modèles de langage.','ChatGPT, Le Chat, Claude ou Copilot se trouvent au bout de cette chaîne : ce sont des outils précis, construits sur des modèles de langage.'],
  ex:'La kinésithérapie est une spécialité de la médecine. Les modèles de langage sont, de la même façon, une spécialité de l’apprentissage profond, lui-même une branche de l’IA.',
  practice:{task:'Demandez à votre assistant de vous expliquer ce schéma avec votre métier.',prompt:'Expliquez-moi en 5 lignes la différence entre intelligence artificielle, machine learning, deep learning et modèle de langage, du plus large au plus précis. Prenez un exemple tiré du métier de [votre métier].',check:['Les quatre termes sont expliqués, du plus large au plus précis.','L’exemple parle de votre métier.']},
  quiz:{q:'ChatGPT, c’est…',o:['l’intelligence artificielle elle-même','un outil construit sur un modèle de langage, une petite partie de l’IA','un programme qui suit des règles écrites à la main'],a:1,why:'L’IA est un vaste domaine ; ChatGPT n’en est qu’une application.'},
  rev:{q:'Du plus large au plus précis, quel ordre est juste ?',o:['Modèle de langage, deep learning, machine learning, IA','IA, machine learning, deep learning, modèle de langage','Machine learning, IA, modèle de langage, deep learning'],a:1,why:'Chaque niveau est une branche du précédent.'},
  keep:'Quand quelqu’un dit « l’IA », demandez de quel outil il parle.'},
 {id:'tc2',mod:0,dur:4,title:'Le machine learning : apprendre à partir d’exemples',goal:'Comprendre comment une machine apprend sans qu’on lui écrive de règles.',
  learn:['Un programme classique applique des règles écrites par un humain. Avec le machine learning, on montre à la machine des milliers d’exemples et elle trouve les règles seule.','Le résultat de cet apprentissage s’appelle un modèle. Une fois entraîné, il fait des prédictions sur des cas qu’il n’a jamais vus.','Un modèle déjà construit peut être réentraîné avec les données d’une autre entreprise, pour un autre usage.','Vous en croisez tous les jours : recommandations de vidéos, publicités ciblées, alertes de fraude sur votre carte bancaire.'],
  ex:'Un fabricant entraîne un modèle sur l’historique des ventes de ses téléphones. Le modèle estime ensuite les ventes d’un nouveau téléphone qu’il n’a jamais vu.',
  practice:{task:'Repérez le machine learning dans votre quotidien.',prompt:'Je travaille comme [votre métier] dans le secteur [secteur]. Donnez-moi 5 exemples de machine learning que je croise sans le savoir, au travail ou chez moi. Pour chacun, dites ce que le modèle a appris et avec quelles données.',check:['Au moins un exemple vient de votre travail.','Pour un exemple, vous savez dire quelles données ont servi à l’entraînement.']},
  quiz:{q:'Qu’est-ce qui distingue le machine learning d’un programme classique ?',o:['Il va plus vite','Il trouve lui-même les règles à partir d’exemples','Il ne fait jamais d’erreur'],a:1,why:'Un programme classique applique des règles ; un modèle les tire des exemples.'},
  rev:{q:'Un modèle entraîné sert surtout à…',o:['faire des prédictions sur des cas nouveaux','stocker les exemples qu’on lui a montrés','remplacer une base de données'],a:0,why:'Son intérêt est de généraliser à ce qu’il n’a jamais vu.'},
  keep:'Un modèle apprend de ses exemples : s’ils sont mauvais, il le sera aussi.'},
 {id:'tc3',mod:0,dur:4,title:'Trois façons d’apprendre',goal:'Distinguer apprentissage supervisé, non supervisé et semi-supervisé.',
  learn:['Supervisé : on donne les exemples avec la bonne réponse. Comme un chien récompensé chaque fois qu’il rapporte la balle, la machine apprend à associer les deux.','Non supervisé : on donne les données sans réponse. La machine regroupe ce qui se ressemble, comme un enfant qui trie ses blocs par couleur sans qu’on le lui demande.','Semi-supervisé : un humain étiquette une petite partie des données, par exemple 5 %, et le modèle s’en sert pour traiter le reste. Tout étiqueter à la main coûterait trop cher.'],
  ex:'Une banque fait marquer à la main quelques milliers de transactions, « fraude » ou « normale ». Le modèle apprend sur cet échantillon, puis surveille les millions d’autres.',
  practice:{task:'Appliquez ces trois idées à votre activité.',prompt:'Je suis [votre métier]. Pour chacune des trois façons d’apprendre (supervisé, non supervisé, semi-supervisé), proposez un exemple concret de ce qu’une machine pourrait apprendre avec les données de mon activité. Trois lignes par exemple.',check:['Chaque exemple précise si les données contiennent la bonne réponse.','Un des exemples vous paraît réaliste dans votre entreprise.']},
  quiz:{q:'Un logiciel range vos clients en groupes qui se ressemblent, sans qu’on lui ait donné de catégories. C’est de l’apprentissage…',o:['supervisé','non supervisé','semi-supervisé'],a:1,why:'Aucune bonne réponse n’est fournie : la machine trouve seule les groupes.'},
  rev:{q:'Pourquoi n’étiqueter qu’une petite partie des données ?',o:['Parce que l’étiquetage à la main coûte cher','Parce que le modèle refuse les données étiquetées','Parce que c’est toujours plus précis'],a:0,why:'Le semi-supervisé obtient de bons résultats avec peu de travail humain.'},
  keep:'Avec ou sans la bonne réponse : c’est ce qui sépare les façons d’apprendre.'},
 {id:'tc4',mod:0,dur:4,title:'Le deep learning et les réseaux de neurones',goal:'Comprendre la technique qui a rendu possibles les assistants actuels.',
  learn:['Le deep learning est une forme de machine learning qui utilise des réseaux de neurones artificiels, inspirés des connexions du cerveau.','Ces réseaux sont faits de couches. Les premières repèrent des éléments simples, les suivantes des idées de plus en plus complexes. Plus il y a de couches, plus le modèle saisit de nuances.','On lui fournit une très grande quantité de données et il trouve lui-même ce qui compte. C’est ce qui lui permet de reconnaître une image, une voix ou le sens d’une phrase.'],
  ex:'En reconnaissance vocale, les premières couches distinguent des sons. Les suivantes reconnaissent des mots, puis une voix précise, puis un accent.',
  practice:{task:'Testez la lecture d’image de votre assistant, s’il le permet.',prompt:'[Joignez une photo sans donnée sensible : un objet de votre bureau, un graphique, un plan.]\nDécrivez ce que vous voyez en 5 points, puis dites ce dont vous n’êtes pas sûr.',check:['La photo ne montre ni personne ni document confidentiel.','L’IA a signalé au moins une incertitude.']},
  quiz:{q:'À quoi servent les couches d’un réseau de neurones ?',o:['À stocker des réponses toutes faites','À passer d’éléments simples à des idées de plus en plus complexes','À relier l’ordinateur à Internet'],a:1,why:'Chaque couche s’appuie sur la précédente pour saisir quelque chose de plus abstrait.'},
  rev:{q:'Le deep learning est…',o:['une branche du machine learning','un concurrent du machine learning','un autre nom de ChatGPT'],a:0,why:'C’est un type de machine learning, fondé sur des réseaux de neurones.'},
  keep:'Beaucoup de données et beaucoup de couches : c’est le moteur des IA actuelles.'},
 {id:'tc5',mod:0,dur:3,title:'Classer ou créer : discriminatif et génératif',goal:'Reconnaître une IA générative d’un coup d’œil.',
  learn:['Un modèle discriminatif classe : ce mail est un spam ou non, cette transaction est une fraude ou non, cette photo montre un chat.','Un modèle génératif crée quelque chose de nouveau, texte, image, son ou vidéo, à partir des régularités apprises dans ses données.','Le test le plus simple porte sur la sortie. Un chiffre, une catégorie ou une probabilité : ce n’est pas de l’IA générative. Du texte, une image ou de l’audio : c’en est.'],
  ex:'Le filtre antispam de votre messagerie classe. L’assistant qui rédige une réponse à un mail génère.',
  practice:{task:'Faites le tri dans les outils que vous utilisez.',prompt:'Voici des outils ou des fonctions que j’utilise : [listez-en 5, par exemple filtre antispam, correcteur, traduction, suggestions de réponse].\nPour chacun, dites s’il classe ou s’il génère, et justifiez en une ligne.',check:['Vous avez appliqué le test de la sortie à chaque outil.','Si vous n’êtes pas d’accord avec une réponse, vous avez vérifié qui avait raison.']},
  quiz:{q:'Un outil reçoit une photo et répond « chat : 97 % ». Il est…',o:['génératif','discriminatif'],a:1,why:'Sa sortie est une catégorie avec une probabilité : il classe.'},
  rev:{q:'Un outil produit une image à partir d’une phrase. Il est…',o:['génératif','discriminatif'],a:0,why:'Il crée un contenu qui n’existait pas.'},
  keep:'Une catégorie en sortie : il classe. Un contenu nouveau : il génère.'},
 {id:'tc6',mod:0,dur:3,title:'Les familles de l’IA générative',goal:'Savoir quel type de modèle travaille derrière chaque usage.',
  learn:['Texte vers texte : vous écrivez, il répond par écrit. C’est le cœur de ChatGPT, Le Chat, Claude ou Copilot.','Texte vers image, vers vidéo ou vers 3D : vous décrivez, il produit une image, une vidéo ou un objet en volume. La voix a aussi ses modèles : texte vers parole, et parole vers texte pour la dictée.','Un assistant réunit souvent plusieurs modèles dans une seule fenêtre. Quand il crée une image, ce n’est pas le modèle qui écrit les textes qui travaille.'],
  ex:'Vous dictez une demande (parole vers texte), l’assistant rédige un résumé (texte vers texte), puis crée une illustration pour la présentation (texte vers image).',
  practice:{task:'Utilisez deux familles dans la même tâche.',prompt:'Je prépare [une affiche, une publication, une présentation] sur [sujet].\n1. Rédigez un titre et trois phrases d’accroche.\n2. Décrivez précisément une image qui irait avec, puis générez-la si vous le pouvez.',check:['Vous avez obtenu un texte, et une image ou sa description.','Vous savez dire quelle famille a produit quoi.']},
  quiz:{q:'Vous dictez un message à votre téléphone, qui l’écrit. Quelle famille ?',o:['Texte vers image','Parole vers texte','Texte vers texte'],a:1,why:'Votre voix entre, du texte sort.'},
  rev:{q:'Quand un assistant crée une image, il utilise…',o:['le même modèle que pour le texte','un modèle spécialisé dans l’image, appelé depuis la même fenêtre'],a:1,why:'Chaque famille a ses modèles, réunis dans une seule interface.'},
  keep:'Une seule fenêtre, plusieurs modèles spécialisés derrière.'},
 {id:'tc7',mod:0,dur:4,title:'Les grands modèles de langage',goal:'Comprendre comment sont fabriqués les assistants que vous utilisez.',
  learn:['Un grand modèle de langage (LLM, pour « large language model ») est d’abord pré-entraîné sur une quantité immense de textes. Il devient un bon généraliste de la langue : répondre, résumer, classer, rédiger.','Il peut ensuite être affiné sur des données spécialisées : médecine, droit, finance, ou les documents d’une entreprise.','Seules quelques grandes entreprises ont les moyens d’entraîner ces modèles. Les autres les utilisent à distance et les adaptent à leurs besoins.','Le modèle écrit la suite la plus plausible. Il a souvent raison, mais il peut inventer avec aplomb, ou reproduire les biais de ses données.'],
  ex:'Une personne apprend d’abord l’anglais courant, puis se spécialise dans le vocabulaire médical. Un LLM suit le même chemin : un apprentissage général, puis une spécialisation.',
  practice:{task:'Observez la frontière entre ce que le modèle sait et ce qu’il devine.',prompt:'Sur le sujet [un sujet précis de votre métier], dites-moi ce que vous savez avec certitude, ce qui a pu changer récemment, et ce que vous risquez d’inventer. Soyez franc sur vos limites.',check:['La réponse sépare ce qui est sûr de ce qui est incertain.','Vous avez repéré un point à vérifier ailleurs.']},
  quiz:{q:'Que veut dire « affiner » un modèle de langage ?',o:['Le rendre plus rapide','Le spécialiser avec les données d’un domaine précis','Corriger ses erreurs une par une'],a:1,why:'Après l’apprentissage général, on le spécialise avec des données ciblées.'},
  rev:{q:'Pourquoi un modèle de langage peut-il inventer une réponse ?',o:['Il écrit la suite la plus plausible, pas une vérité vérifiée','Il copie exprès des sites peu fiables','Il est programmé pour plaisanter'],a:0,why:'Plausible ne veut pas dire exact.'},
  keep:'Un généraliste de la langue, très doué, qui ne sait pas toujours qu’il se trompe.'},
 {id:'tc8',mod:0,dur:4,title:'Ce que l’IA change dans le travail',goal:'Voir où l’IA est déjà utilisée et ce que cela change pour vous.',
  learn:['Les machines de la révolution industrielle ont pris en charge une partie du travail physique. L’IA fait de même avec une partie du travail intellectuel, et beaucoup plus vite.','En entreprise, quatre usages dominent : les assistants qui répondent aux clients, les automatisations, la création de contenu et les assistants vocaux.','Le rapport 2025 du Forum économique mondial sur l’emploi prévoit d’ici 2030 environ 170 millions d’emplois créés et 92 millions supprimés, avec 39 % des compétences actuelles à renouveler.','Les outils changent vite. L’habitude d’apprendre un peu, régulièrement, compte plus que la maîtrise d’un outil précis.'],
  ex:'Un service client confie les questions simples à un assistant disponible jour et nuit. Les conseillers gardent les cas difficiles, où l’écoute compte.',
  practice:{task:'Regardez votre propre semaine avec ces lunettes.',prompt:'Voici les tâches qui occupent ma semaine de [votre métier] : [listez-en 6 à 8].\nPour chacune, dites si l’IA peut la faire, la préparer, ou si elle doit rester humaine. Une ligne d’explication par tâche.',check:['Vous avez trouvé une tâche que l’IA pourrait préparer dès demain.','Vous avez trouvé une tâche qui doit rester humaine, et vous savez pourquoi.']},
  quiz:{q:'Selon le Forum économique mondial, d’ici 2030…',o:['l’IA supprime plus d’emplois qu’elle n’en crée','davantage d’emplois sont créés que supprimés, mais beaucoup de compétences changent','les métiers de bureau ne changent pas'],a:1,why:'Le rapport prévoit un solde positif, avec 39 % des compétences à renouveler.'},
  rev:{q:'Quelle habitude protège le mieux face à ces changements ?',o:['Attendre que l’entreprise forme tout le monde','Apprendre un peu, régulièrement','Éviter les outils d’IA'],a:1,why:'Les outils passent ; l’habitude d’apprendre reste.'},
  keep:'Le travail change de forme ; apprendre régulièrement permet de suivre.'},

 /* ——— Module 2 · Vos outils ——— */
 {id:'tc9',mod:1,dur:3,title:'Un assistant ouvert en permanence',goal:'Prendre le réflexe de l’IA dans votre journée.',
  learn:['Gardez votre assistant autorisé ouvert à côté de votre travail. Le réflexe vient en l’utilisant, y compris pour de petites choses.','Les premiers usages faciles : préparer la réponse à un mail sans enjeu, reformuler, résumer un document, trouver des idées.','Sur l’application de bureau ou de téléphone, la dictée fait gagner du temps et pousse à donner plus de contexte.','Poser la même demande à deux assistants montre vite leurs forces respectives.'],
  ex:'Un mail de routine arrive. Vous le collez sans données sensibles, vous dictez en deux phrases ce que vous voulez répondre, l’assistant rédige, vous relisez.',
  practice:{task:'Confiez aujourd’hui une petite tâche à votre assistant.',prompt:'Voici un mail auquel je dois répondre : [collez-le, sans noms ni données sensibles].\nJe veux répondre que [votre réponse en une phrase]. Rédigez une réponse courte et cordiale.',check:['Vous avez relu et ajusté avant d’envoyer.','Vous avez une idée du temps gagné, même approximative.']},
  quiz:{q:'Quel est le meilleur moyen de prendre le réflexe de l’IA ?',o:['Attendre une tâche importante pour essayer','L’utiliser chaque jour pour de petites tâches','Lire des articles sur l’IA'],a:1,why:'C’est l’usage répété qui montre ce que l’outil sait faire.'},
  rev:{q:'Pourquoi dicter plutôt que taper ?',o:['Le résultat est toujours meilleur','On donne plus de contexte en moins de temps','L’IA comprend mieux la voix que l’écrit'],a:1,why:'À l’oral, on en dit plus, et le contexte améliore la réponse.'},
  keep:'De petites tâches, tous les jours : c’est ainsi que le réflexe vient.'},
 {id:'tc10',mod:1,dur:4,title:'Chercher avec des sources',goal:'Obtenir des informations récentes et vérifiables.',
  learn:['Sans recherche sur le web, un assistant répond de mémoire, et sa mémoire s’arrête à une date. Pour une information récente ou chiffrée, utilisez un outil qui cherche et cite ses sources : Perplexity, ou le mode recherche de votre assistant.','Une question rapide se règle avec une recherche simple. Pour un dossier complet, la « recherche approfondie » consulte des dizaines de sites et rédige un rapport en quelques minutes.','Comparez les types de sources : sites officiels, articles de presse et avis d’utilisateurs ne disent pas toujours la même chose.'],
  ex:'Avant un rendez-vous avec un nouveau client, une recherche approfondie résume son secteur, ses enjeux et ses actualités, avec les liens pour vérifier.',
  practice:{task:'Posez une vraie question de travail à un outil de recherche autorisé.',prompt:'Recherchez : [une question précise sur votre secteur ou un client, sans donnée confidentielle].\nDonnez une réponse courte, puis les 3 sources les plus sérieuses avec leur date. Signalez les points sur lesquels les sources ne sont pas d’accord.',check:['Vous avez ouvert au moins une source pour vérifier.','Les sources sont datées et récentes.']},
  quiz:{q:'Vous préparez un dossier complet sur un marché. Quel usage choisir ?',o:['Une question rapide à l’assistant, sans recherche','Une recherche approfondie qui consulte de nombreuses sources','Un générateur d’images'],a:1,why:'Pour un dossier, la recherche approfondie croise beaucoup de sources.'},
  rev:{q:'Pour un chiffre récent, sans recherche web, l’assistant…',o:['répond de mémoire, parfois dépassée','cherche forcément sur Internet'],a:0,why:'Sa mémoire s’arrête à la date de son entraînement.'},
  keep:'Une information récente demande une source, une date et un lien.'},
 {id:'tc11',mod:1,dur:4,title:'Travailler sur vos documents et vos réunions',goal:'Faire répondre l’IA à partir de vos propres sources.',
  learn:['Certains outils rassemblent beaucoup de documents au même endroit (rapports, pages web, transcriptions) et répondent à vos questions en s’appuyant uniquement sur eux.','Les outils de prise de notes de réunion produisent un compte rendu, la liste des actions décidées et les questions posées. Plus besoin de réécouter un appel.','Ces outils manipulent des informations internes : utilisez seulement ceux que votre entreprise autorise, et prévenez les participants avant d’enregistrer.'],
  ex:'Vous rassemblez le cahier des charges, deux comptes rendus et le site d’un client, puis vous demandez : « Quelles sont les trois attentes qui reviennent le plus ? »',
  practice:{task:'Faites travailler votre assistant sur plusieurs documents à la fois.',prompt:'[Joignez deux ou trois documents autorisés sur un même sujet.]\nEn vous appuyant uniquement sur ces documents : résumez les points communs, les contradictions, et listez les actions à prévoir. Indiquez de quel document vient chaque point.',check:['Chaque point indique sa source.','Les documents joints sont autorisés par votre entreprise.']},
  quiz:{q:'Avant d’enregistrer une réunion avec un outil de prise de notes, il faut…',o:['rien, c’est automatique','vérifier que l’outil est autorisé et prévenir les participants','demander à l’IA si c’est permis'],a:1,why:'Une réunion contient souvent des informations internes et la voix de personnes.'},
  rev:{q:'Pourquoi demander de quel document vient chaque point ?',o:['Pour pouvoir vérifier','Pour rallonger la réponse','Parce que l’IA l’exige'],a:0,why:'Une réponse sourcée se vérifie en quelques secondes.'},
  keep:'Vos propres sources donnent des réponses plus fiables que la mémoire de l’IA.'},
 {id:'tc12',mod:1,dur:4,title:'Combiner plusieurs outils',goal:'Découper une tâche complexe et confier chaque étape au bon outil.',
  learn:['Une tâche complexe se découpe en étapes : chercher, rassembler, rédiger, mettre en forme. Chaque étape va à l’outil le plus adapté.','Gardez une conversation « assistant de tâche » ouverte du début à la fin. Elle connaît le contexte, répond à vos questions et rédige les demandes destinées aux autres outils.','Ne construisez ce genre d’enchaînement que pour une tâche qui revient souvent. Pour une tâche unique, restez simple.'],
  ex:'Préparer une présentation client : recherche approfondie sur son secteur, questions rapides à un outil de recherche, synthèse par l’assistant, puis mise en page avec un outil de présentation autorisé.',
  practice:{task:'Découpez une tâche que vous faites souvent.',prompt:'Je fais régulièrement cette tâche : [décrivez-la].\nDécoupez-la en étapes. Pour chaque étape, dites quel type d’outil convient (assistant, recherche, présentation, aucun) et ce que je dois vérifier.',check:['Chaque étape a un outil, ou « aucun ».','Au moins une étape de vérification humaine est prévue.']},
  quiz:{q:'Quand vaut-il la peine d’enchaîner plusieurs outils ?',o:['Pour chaque petite tâche','Pour une tâche complexe qui revient souvent','Jamais, un seul outil suffit'],a:1,why:'Le temps de mise en place se rentabilise sur les tâches répétées.'},
  rev:{q:'À quoi sert l’« assistant de tâche » ?',o:['À garder le contexte et préparer les demandes pour les autres outils','À remplacer tous les autres outils','À enregistrer vos réunions'],a:0,why:'Il vous suit du début à la fin sans que vous répétiez le contexte.'},
  keep:'Une étape, un outil, et un fil conducteur du début à la fin.'},

 /* ——— Module 3 · Bien demander ——— */
 {id:'tc13',mod:2,dur:4,title:'Objectif, contexte, format',goal:'Obtenir une réponse utile dès le premier essai.',
  learn:['L’objectif : ce que vous voulez obtenir. « Un mail de relance », plutôt que « aidez-moi pour un client ».','Le contexte : qui vous êtes, pour qui c’est, ce qui s’est passé avant. Mieux vaut trop d’informations que pas assez.','Le format : la longueur, le ton, la forme (liste, tableau, mail).','Les Anglais disent « garbage in, garbage out » : une demande pauvre donne une réponse pauvre.'],
  ex:'« Je suis assistante commerciale. Rédigez un mail de relance pour un devis envoyé il y a 10 jours à un client fidèle. Ton cordial, 8 lignes au plus. »',
  practice:{task:'Prenez un texte que vous devez écrire cette semaine et lancez-le avec ce modèle.',prompt:'Objectif : [ce que vous voulez obtenir].\nContexte : je suis [votre métier], c’est pour [destinataire], [ce qui s’est passé avant].\nFormat : [longueur, ton, liste ou paragraphe].',check:['Les trois parties sont remplies.','Le texte obtenu est utilisable avec peu de retouches.']},
  quiz:{q:'Laquelle de ces demandes donnera la meilleure réponse ?',o:['Parlez-moi des voitures électriques.','Comparez en 3 points le coût d’une voiture électrique et d’une thermique pour un commercial qui roule 30 000 km par an.','Voitures électriques : votre avis ?'],a:1,why:'Elle contient un objectif, un contexte et un format.'},
  rev:{q:'Quels sont les trois éléments d’une bonne demande ?',o:['Politesse, longueur, mots-clés','Objectif, contexte, format','Rôle, exemple, signature'],a:1,why:'Avec ces trois éléments, la première réponse vise juste.'},
  keep:'Une bonne demande ressemble à une bonne consigne donnée à un collègue.'},
 {id:'tc14',mod:2,dur:4,title:'Trois niveaux de demande',goal:'Adapter l’effort de rédaction à l’enjeu de la tâche.',
  learn:['La demande du quotidien tient en une ou deux phrases, avec objectif, contexte et format. C’est celle que vous écrirez le plus.','Pour une tâche importante, précisez aussi le rôle (« vous êtes expert en… »), les étapes, les documents utiles et un exemple. Gardez cette conversation sous un titre clair pour y revenir.','Pour une tâche quotidienne, rédigez une fois des instructions permanentes dans un projet ou un assistant personnalisé, testez-les, puis réutilisez-les.','Inutile d’écrire une page pour reformuler une phrase.'],
  ex:'Reformuler une phrase : niveau 1. Préparer une levée de fonds : niveau 2, dans une conversation nommée « Levée de fonds ». Répondre chaque jour aux demandes de devis : niveau 3.',
  practice:{task:'Écrivez une demande de niveau 2 pour une tâche importante du mois.',prompt:'Rôle : vous êtes [expert du domaine].\nObjectif : [ce que je veux obtenir].\nContexte : [qui je suis, pour qui, ce qui s’est passé].\nÉtapes : [ce que vous devez faire, dans l’ordre].\nRessources : [documents joints].\nFormat : [longueur, forme].',check:['La conversation porte un titre clair.','La première réponse demande peu de corrections.']},
  quiz:{q:'Vous répondez chaque jour au même type de demande client. Quel niveau ?',o:['Une demande rapide à chaque fois','Des instructions permanentes, testées une fois pour toutes','Aucune IA'],a:1,why:'Pour une tâche quotidienne, le temps passé sur de bonnes instructions se récupère vite.'},
  rev:{q:'Où garder une demande de niveau 2 ?',o:['Dans une conversation au titre clair, pour y revenir','Nulle part, on la réécrit','Dans un mail à soi-même'],a:0,why:'Vous retrouvez le contexte sans tout réexpliquer.'},
  keep:'L’effort mis dans la demande suit l’enjeu de la tâche.'},
 {id:'tc15',mod:2,dur:3,title:'Montrer des exemples plutôt qu’expliquer',goal:'Obtenir le ton et la forme voulus sans tout décrire.',
  learn:['Décrire un style prend du temps et reste flou. Un exemple le montre d’un coup : l’IA imite mieux qu’elle n’obéit.','Sans exemple, avec un exemple, avec plusieurs exemples : plus vous en donnez, plus le résultat ressemble à ce que vous attendez. Gardez les exemples pour les tâches qui comptent.','Retirez les noms et les données sensibles de l’exemple avant de le coller.'],
  ex:'« Voici un mail envoyé le mois dernier, qui a bien marché : [mail]. Écrivez-en un dans le même style pour annoncer la fermeture du 24 décembre. »',
  practice:{task:'Retrouvez un texte que vous avez écrit et qui vous plaît, puis demandez-en un nouveau sur ce modèle.',prompt:'Voici un exemple de [mail, annonce, compte rendu] que j’aime : [collez le texte, sans noms ni données sensibles].\nÉcrivez dans le même style et avec la même longueur : [le nouveau sujet].',check:['Le résultat reprend le ton de votre exemple.','Vous avez retiré les noms avant de coller.']},
  quiz:{q:'Vous voulez que l’IA écrive comme vous. Le plus efficace ?',o:['Décrire votre style en détail','Coller un ou deux textes que vous avez écrits','Demander « écrivez de façon naturelle »'],a:1,why:'L’IA reproduit mieux un exemple qu’une description.'},
  rev:{q:'Avant de coller un ancien mail comme exemple, que faut-il faire ?',o:['Le traduire en anglais','Retirer les noms et les données sensibles','Rien, l’IA les ignore'],a:1,why:'Un exemple reste une donnée envoyée à l’outil : rendez-le anonyme.'},
  keep:'Un exemple vaut mieux qu’une longue explication.'},
 {id:'tc16',mod:2,dur:3,title:'Dicter, faire poser des questions, ajuster',goal:'Donner beaucoup de contexte sans passer dix minutes à écrire.',
  learn:['Dictez au lieu de taper : la plupart des applications ont un micro, et on en dit plus à l’oral.','Décrivez à quoi ressemblera le résultat une fois fini. C’est ce qui permet à l’IA de savoir quand elle a réussi.','Terminez par : « Avant de commencer, posez-moi les questions qui vous manquent. »','Si la réponse ne convient pas, ne recommencez pas : demandez « plus court », « plus formel » ou « ajoutez la date ».'],
  ex:'Pour préparer une réunion, expliquez à voix haute le sujet, les participants et ce que vous voulez en tirer. L’IA vous pose trois questions, puis propose l’ordre du jour.',
  practice:{task:'Ouvrez l’application de votre IA, appuyez sur le micro et décrivez une tâche pendant une minute.',prompt:'[Décrivez la tâche à l’oral, dans le désordre si besoin.]\nLe résultat attendu : [à quoi il ressemble une fois fini].\nAvant de commencer, posez-moi les questions qui vous manquent.',check:['L’IA vous a posé des questions avant de répondre.','Vous avez demandé au moins un ajustement au lieu de recommencer.']},
  quiz:{q:'La réponse est trop longue. Que faites-vous ?',o:['J’ouvre une nouvelle conversation et je réécris tout','Je réponds « Plus court, en 5 lignes »','Je le fais moi-même'],a:1,why:'L’IA garde le fil de la conversation : un ajustement suffit.'},
  rev:{q:'Quelle phrase ajouter à la fin d’une demande complexe ?',o:['« Merci d’avance »','« Avant de commencer, posez-moi les questions qui vous manquent »','« Soyez créatif »'],a:1,why:'Ses questions font apparaître ce que vous aviez oublié de dire.'},
  keep:'Dites tout, puis laissez l’IA demander ce qui manque.'},
 {id:'tc17',mod:2,dur:3,title:'Faire améliorer votre demande par l’IA',goal:'Obtenir une demande solide pour une tâche importante.',
  learn:['Écrivez d’abord vous-même l’essentiel : objectif, contexte, quelques consignes. Vous connaissez le terrain, l’IA non.','Demandez ensuite à l’IA de l’améliorer : elle signale ce qui manque, pose ses questions et structure le tout.','Une demande entièrement écrite par un générateur dépanne pour un essai rapide. Pour une tâche à fort enjeu, elle reste trop générique.'],
  ex:'« Voici ma demande pour préparer l’entretien annuel d’un collaborateur : [brouillon]. Dites ce qui manque, puis proposez une version complète. »',
  practice:{task:'Faites améliorer une demande que vous avez écrite cette semaine.',prompt:'Voici une demande que je veux améliorer : [collez votre brouillon].\nListez ce qui manque pour obtenir un excellent résultat, posez-moi les questions nécessaires, puis proposez la version finale.',check:['Vous avez répondu aux questions de l’IA avant la version finale.','La version finale garde vos consignes d’origine.']},
  quiz:{q:'Pour une tâche importante, la meilleure façon d’obtenir une demande solide ?',o:['La faire écrire entièrement par l’IA','L’écrire vous-même, puis la faire améliorer par l’IA','Copier une demande trouvée sur Internet'],a:1,why:'Vous apportez le fond, l’IA complète la forme.'},
  rev:{q:'Un générateur de demandes automatique sert surtout…',o:['pour un essai rapide','pour une tâche à fort enjeu'],a:0,why:'Pour une tâche importante, votre connaissance du terrain compte plus.'},
  keep:'Vous écrivez le fond, l’IA améliore la forme.'},

 /* ——— Module 4 · Vérifier et protéger ——— */
 {id:'tc18',mod:3,dur:3,title:'Pourquoi l’IA se trompe',goal:'Connaître les erreurs typiques pour les repérer vite.',
  learn:['L’hallucination : l’IA invente un fait, une source ou un chiffre crédible. Cela arrive surtout sur des questions très précises ou récentes.','La date limite : sans recherche web, ses connaissances s’arrêtent à la fin de son entraînement.','Le biais : si ses données d’entraînement penchent d’un côté, ses réponses aussi.','Le ton ne dit rien de l’exactitude : une erreur est écrite avec la même assurance qu’une vérité.'],
  ex:'Vous demandez trois études sur un sujet pointu. L’IA cite des titres, des auteurs et des dates ; l’un des titres n’existe pas.',
  practice:{task:'Provoquez une erreur pour apprendre à la repérer.',prompt:'Citez trois articles ou études précises, avec auteur, titre et date, sur [un sujet pointu de votre métier].',check:['Vous avez cherché au moins une des références citées.','Vous avez noté si elle existe vraiment.']},
  quiz:{q:'Qu’est-ce qu’une « hallucination » d’IA ?',o:['Un bug qui bloque l’outil','Une information inventée, présentée comme vraie','Une réponse trop longue'],a:1,why:'L’IA comble un manque avec du plausible.'},
  rev:{q:'Sur quel type de demande l’IA se trompe-t-elle le plus ?',o:['Reformuler un texte que vous lui donnez','Citer un chiffre précis ou une référence récente'],a:1,why:'Les faits précis et récents sont son point faible, surtout sans recherche.'},
  keep:'Plausible ne veut pas dire vrai.'},
 {id:'tc19',mod:3,dur:4,title:'Relire et faire vérifier',goal:'Repérer les erreurs avant qu’elles partent chez un client.',
  learn:['Vérifiez vous-même, un par un, les noms, les chiffres et les dates.','Pour un fait précis (loi, prix, délai), demandez la source et ouvrez-la.','Donnez à l’IA un critère qu’on peut juger par oui ou par non, pour qu’elle se contrôle : « chaque montant doit être identique à la facture jointe ; signalez tout écart ».'],
  ex:'L’IA indique « délai légal de 30 jours » : demandez la source, puis vérifiez-la sur un site officiel.',
  practice:{task:'Reprenez une réponse obtenue pendant une leçon précédente et demandez à l’IA de se contrôler.',prompt:'Relisez votre réponse précédente.\nCritère : [chaque chiffre doit correspondre au document joint / chaque affirmation doit avoir une source].\nListez ce qui ne respecte pas ce critère, puis corrigez.',check:['Vous avez vérifié vous-même au moins un chiffre ou une date.','Vous avez ouvert au moins une source citée.']},
  quiz:{q:'Quelle consigne aide le plus l’IA à vérifier son travail ?',o:['« Vérifiez bien »','« Chaque montant doit être identique à la facture jointe ; signalez tout écart »','« Soyez précis »'],a:1,why:'Un critère vérifiable donne un résultat ; un vœu, non.'},
  rev:{q:'L’IA cite un délai légal. Que faites-vous ?',o:['Je le reprends tel quel','Je demande la source et je la vérifie sur un site officiel','Je repose la question'],a:1,why:'Pour un fait précis, seule la source fait foi.'},
  keep:'Une réponse bien écrite n’est pas forcément une réponse juste.'},
 {id:'tc20',mod:3,dur:4,title:'Protéger les données de l’entreprise',goal:'Utiliser l’IA sans exposer d’informations sensibles.',
  learn:['N’écrivez jamais de mot de passe, de coordonnées bancaires ni de données personnelles sur un client ou un collègue.','Remplacez les noms par des repères : [Client A], [Produit B].','N’utilisez que les IA autorisées par votre entreprise. Chaque fiche de la bibliothèque explique ce que deviennent vos données.'],
  ex:'Au lieu de « Relance pour M. Martin, facture 2024-118 », écrivez « Relance pour [Client A], facture [numéro] ».',
  practice:{task:'Préparez un vrai texte de travail en le rendant anonyme, puis demandez-en un résumé.',prompt:'[Collez votre texte après avoir remplacé les noms par [Client A], [Collègue B], et retiré les numéros et montants sensibles.]\nRésumez ce texte en 5 points.',check:['Plus aucun nom de personne ni d’entreprise.','Aucun numéro de compte, de contrat ou de téléphone.']},
  quiz:{q:'Lequel de ces textes pouvez-vous coller dans une IA autorisée ?',o:['« Relance pour M. Martin, IBAN FR76… »','« Relance pour [Client A], facture [numéro] »','« Mot de passe du portail fournisseur : … »'],a:1,why:'Les repères entre crochets gardent le sens sans exposer personne.'},
  rev:{q:'Vous hésitez à coller un document dans l’IA. La règle ?',o:['Dans le doute, je colle','Dans le doute, je ne colle pas et je demande à mon responsable','Je n’en colle que la moitié'],a:1,why:'Votre responsable sait ce que l’entreprise autorise.'},
  keep:'Dans le doute, ne collez pas.'},

 /* ——— Module 5 · Aller plus loin ——— */
 {id:'tc21',mod:4,dur:4,title:'Comment les outils se connectent : les API',goal:'Comprendre ce qui relie les logiciels entre eux.',fig:'api',
  learn:['Une API est un intermédiaire qui permet à un logiciel d’utiliser le service d’un autre. Comme un serveur au restaurant : il prend la commande, la transmet en cuisine et rapporte le plat.','C’est ainsi qu’une application de livraison affiche une carte : elle utilise le service de cartographie d’un autre éditeur au lieu de le refaire.','Beaucoup d’outils d’IA fonctionnent ainsi, en s’appuyant sur les modèles d’autres entreprises. Vos données peuvent donc passer par plusieurs prestataires.','L’accès passe par une clé d’API, à garder secrète comme un mot de passe.'],
  ex:'Votre logiciel de facturation envoie chaque soir un résumé dans votre messagerie : deux services se parlent par leurs API.',
  practice:{task:'Regardez comment vos outils pourraient se parler.',prompt:'J’utilise ces outils au travail : [listez-en 4 ou 5].\nExpliquez simplement lesquels peuvent probablement être connectés entre eux, et ce que ces connexions permettraient d’automatiser. Précisez ce qu’il faudrait vérifier côté données.',check:['Vous avez une idée de connexion utile.','Vous savez à qui en parler dans l’entreprise.']},
  quiz:{q:'Une API, c’est…',o:['un nouveau modèle d’IA','un intermédiaire qui permet à deux logiciels d’échanger','un antivirus'],a:1,why:'Comme le serveur entre la salle et la cuisine.'},
  rev:{q:'Une clé d’API se traite comme…',o:['un mot de passe, à garder secret','une adresse publique, à partager'],a:0,why:'Elle donne accès à un service, souvent payant.'},
  keep:'Les outils se parlent par leurs API ; les clés restent secrètes.'},
 {id:'tc22',mod:4,dur:4,title:'Automatiser une tâche répétitive',goal:'Reconnaître une tâche qui mérite d’être automatisée.',
  learn:['Une automatisation suit un schéma simple : un déclencheur (un mail arrive, une ligne est ajoutée), puis une ou plusieurs actions (envoyer une réponse, remplir un tableau).','On peut y insérer une étape d’IA : résumer, classer, rédiger un brouillon.','Des outils sans code existent (Make, Zapier, n8n). Leur mise en place passe en général par la personne qui gère les outils de l’entreprise.','N’automatisez que ce qui revient souvent et vous coûte du temps : une automatisation se teste, se surveille et peut coûter de l’argent.'],
  ex:'Chaque fois qu’un lecteur répond à la newsletter pour demander la ressource offerte, un mail avec le lien part tout seul.',
  practice:{task:'Repérez une tâche à automatiser et décrivez-la.',prompt:'Voici une tâche que je fais souvent : [décrivez-la, avec sa fréquence].\nDécrivez-la sous forme d’automatisation : déclencheur, actions, étape d’IA éventuelle, points à vérifier. Estimez le temps gagné par mois.',check:['La tâche revient au moins chaque semaine.','Vous avez une description claire à montrer à votre responsable.']},
  quiz:{q:'Quelle tâche mérite le plus une automatisation ?',o:['Un rapport annuel unique','Envoyer chaque jour le même lien aux personnes qui le demandent','Préparer un discours pour un départ en retraite'],a:1,why:'Fréquente, répétitive, sans jugement : la cible idéale.'},
  rev:{q:'Les deux parties d’une automatisation ?',o:['Un déclencheur, puis des actions','Une question, puis une réponse','Un mot de passe, puis une clé'],a:0,why:'Quand ceci arrive, faire cela.'},
  keep:'On automatise ce qui revient souvent, après l’avoir fait à la main.'},
 {id:'tc23',mod:4,dur:4,title:'Créer un assistant sur mesure',goal:'Savoir quand et comment préparer un assistant personnalisé.',
  learn:['La plupart des assistants permettent d’en créer une version personnalisée (GPT, projet, agent) avec des instructions permanentes et des documents de référence.','Sa qualité dépend de deux choses : des instructions précises et testées, et des documents bien choisis. Son nom et sa description n’y changent rien.','Suivez l’ordre : conversation rapide, puis conversation longue au titre clair, et seulement pour une tâche régulière, un assistant personnalisé.','Ajoutez des raccourcis pour les demandes fréquentes, et testez-le sur de vrais cas avant de le partager.'],
  ex:'Un assistant « Réponses aux appels d’offres » reçoit vos règles de rédaction, trois réponses gagnantes et la plaquette de l’entreprise. Chaque nouvel appel d’offres démarre avec ce contexte.',
  practice:{task:'Rédigez les instructions d’un assistant pour une tâche régulière.',prompt:'Aidez-moi à écrire les instructions d’un assistant personnalisé pour cette tâche régulière : [décrivez-la].\nIncluez son rôle, ce qu’il doit toujours faire, ce qu’il ne doit jamais faire, le format des réponses et deux exemples. Posez-moi d’abord vos questions.',check:['Les instructions contiennent au moins une interdiction claire.','Vous avez listé les documents de référence à lui donner, autorisés par l’entreprise.']},
  quiz:{q:'Qu’est-ce qui compte le plus dans un assistant personnalisé ?',o:['Son nom et son image','Ses instructions et ses documents de référence','Le nombre de raccourcis'],a:1,why:'Le nom sert seulement à le retrouver.'},
  rev:{q:'Quand créer un assistant personnalisé ?',o:['Pour toute nouvelle tâche','Pour une tâche régulière, déjà rodée en conversation'],a:1,why:'Sinon, une conversation au titre clair suffit.'},
  keep:'Une tâche régulière, des instructions testées, de bons documents.'},
 {id:'tc24',mod:4,dur:3,title:'Garder ce qui marche',goal:'Ne plus repartir de zéro à chaque demande.',
  learn:['Rangez les conversations importantes dans un projet ou un dossier, par client ou par sujet, avec un titre clair.','Quand vous corrigez l’IA, demandez-lui de retenir la règle : « à l’avenir, pas de point d’exclamation dans mes mails ». À la fin d’une session de travail, demandez-lui d’enregistrer ce qu’elle a appris sur vos préférences.','Gardez vos meilleures demandes dans un document, avec des [crochets] à compléter.'],
  ex:'Chaque lundi, vous préparez le planning de l’équipe : une demande type, écrite une fois, vous fait gagner ce temps toutes les semaines.',
  practice:{task:'Transformez la meilleure demande écrite pendant ce parcours en modèle réutilisable.',prompt:'Voici une demande qui a bien marché : [collez-la].\nTransformez-la en modèle : remplacez ce qui change à chaque fois par des [crochets] et gardez le reste.',check:['Le modèle est enregistré là où vous le retrouverez.','La conversation porte un titre clair.']},
  quiz:{q:'Vous corrigez souvent le même défaut dans les réponses. Que faire ?',o:['Le corriger à la main à chaque fois','Demander à l’IA de retenir cette règle pour la suite','Changer d’IA'],a:1,why:'La plupart des assistants gardent vos préférences en mémoire si vous le leur demandez.'},
  rev:{q:'Où garder une demande qui marche bien ?',o:['Nulle part, je m’en souviendrai','Dans un modèle avec des [crochets], rangé avec mes documents','Dans un mail à moi-même, sans titre'],a:1,why:'Un modèle bien rangé se retrouve en dix secondes.'},
  keep:'Une bonne demande se réutilise pendant des mois.'},
 {id:'tc25',mod:4,dur:3,title:'Savoir s’arrêter, et continuer d’apprendre',goal:'Choisir où l’IA vous aide vraiment, et rester à jour sans vous disperser.',
  learn:['Une décision qui touche une personne ou de l’argent (embauche, sanction, montant engagé) demande toujours un regard humain.','Si vous passez plus de temps à corriger qu’à faire vous-même, changez d’approche. Votre jugement et votre façon de faire restent ce qui distingue votre travail.','Les outils changent chaque mois. Réservez une ou deux heures par semaine pour vous tenir à jour, plutôt que de suivre chaque annonce.'],
  ex:'Rédiger la première version d’un compte rendu : oui. Choisir seul quel candidat recevoir en entretien : non.',
  practice:{task:'Préparez la suite de votre apprentissage.',prompt:'Je suis [votre métier] et je dispose de [temps] par semaine pour progresser avec l’IA.\nProposez-moi un plan sur 4 semaines : chaque semaine, une tâche réelle de mon travail à essayer avec l’IA et ce que je dois vérifier.',check:['Le plan tient dans le temps dont vous disposez.','La première tâche est notée dans votre agenda.']},
  quiz:{q:'Dans quel cas l’IA ne doit-elle pas décider à votre place ?',o:['Proposer trois titres pour une annonce','Choisir quel salarié reçoit une prime','Résumer un compte rendu'],a:1,why:'Ce qui touche des personnes ou de l’argent demande un regard humain.'},
  rev:{q:'Comment rester à jour sans vous noyer dans les annonces ?',o:['Suivre chaque nouveauté le jour même','Réserver un créneau fixe chaque semaine','Attendre qu’un collègue vous en parle'],a:1,why:'Un rendez-vous régulier suffit, et vous garde concentré sur votre travail.'},
  keep:'Savoir ne pas utiliser l’IA fait partie de savoir l’utiliser.'}
]};
/* Révisions espacées : une question revient le lendemain, puis à 3, 7 et 21 jours. Une erreur la ramène au lendemain. */
const REV_DAYS = [1, 3, 7, 21], DAY = 864e5;

const KIND = {
 start:n=>({goal:`Ouvrir ${n} et obtenir une première réponse.`,steps:[`Ouvrez ${n} depuis la bibliothèque Bibl.IA (bouton « Ouvrir »).`,'Connectez-vous avec le compte indiqué par votre entreprise.','Écrivez votre demande comme vous l’expliqueriez à un collègue.','Lisez la réponse en entier avant de l’utiliser.'],keep:'Commencez par une tâche simple que vous connaissez bien : vous jugerez mieux le résultat.'}),
 adjust:n=>({goal:'Améliorer une réponse en une ou deux phrases.',steps:['Repérez ce qui ne convient pas : longueur, ton, oubli.','Demandez simplement : « Plus court », « Plus formel », « Ajoutez la date du rendez-vous ».','Deux ou trois échanges suffisent souvent.','Copiez le résultat final et relisez-le dans votre outil habituel.'],keep:'Ne recommencez pas de zéro : demandez un ajustement.'}),
 privacy:n=>({goal:`Vérifier ce que deviennent vos données dans ${n}.`,steps:[`Ouvrez les paramètres de ${n}, souvent accessibles depuis votre photo de profil ou une icône d’engrenage.`,'Cherchez la rubrique consacrée aux données ou à la confidentialité.','Vérifiez si vos contenus peuvent servir à améliorer le service et choisissez l’option conforme aux règles de votre entreprise.','En cas de doute, demandez à votre responsable avant d’utiliser des documents internes.'],keep:'Les intitulés des menus changent selon les versions : la fiche de la bibliothèque résume les règles de l’éditeur.'}),
 organize:n=>({goal:'Retrouver facilement vos travaux.',steps:['Donnez un titre clair à vos conversations ou documents importants.','Supprimez ce dont vous n’avez plus besoin, surtout si cela contient des informations internes.','Gardez dans un document vos demandes qui fonctionnent bien.','Rangez par client ou par dossier si l’outil le permet.'],keep:'Un historique rangé, c’est du temps gagné la semaine suivante.'}),
 usage:(n,t)=>({goal:`${t} avec ${n}, pas à pas.`,steps:['Rassemblez les informations utiles avant de commencer.',`Ouvrez ${n} et décrivez la tâche : « ${t} ».`,'Précisez le contexte, le destinataire et le format attendu.','Relisez, ajustez, puis vérifiez les noms, les chiffres et les dates.'],keep:'Utilisez le texte prêt à copier de Bibl.IA comme point de départ.'}),
 reuse:n=>({goal:'Gagner du temps sur les tâches qui reviennent.',steps:['Repérez une tâche que vous faites chaque semaine.','Écrivez un modèle de demande avec des [crochets] à compléter.','Testez-le deux ou trois fois et améliorez-le.','Partagez-le avec vos collègues qui font la même tâche.'],keep:'Un bon modèle de demande se réutilise pendant des mois.'}),
 limits:n=>({goal:`Savoir quand ${n} n’est pas le bon outil.`,steps:['Pas d’informations confidentielles si votre entreprise ne l’a pas autorisé.','Pas de décision importante sans vérification humaine.','Pour un fait précis (loi, chiffre, prix), vérifiez toujours la source.','Si vous passez plus de temps à corriger qu’à faire vous-même, changez d’approche.'],keep:'Savoir ne pas utiliser l’IA fait partie de savoir l’utiliser.'})
};
const CHAPS = ['Prise en main','Paramétrage','Usages concrets','Aller plus loin'];
function courseFor(ai){
  const n = ai.short || ai.name, u = ai.usages;
  const L = (c,i,title,dur,kind) => ({id:`${ai.id}-${c}${i}`,title,dur,kind,ai:ai.id});
  return {id:ai.id, name:`Parcours ${n}`, chapters:[
    {t:CHAPS[0], l:[L(1,1,`Ouvrir ${n} et faire une première demande`,3,'start'),L(1,2,'Lire une réponse et demander un ajustement',4,'adjust')]},
    {t:CHAPS[1], l:[L(2,1,'Régler la confidentialité de votre compte',4,'privacy'),L(2,2,'Retrouver et organiser vos travaux',3,'organize')]},
    {t:CHAPS[2], l:[L(3,1,u[0],5,'usage'),L(3,2,u[1],4,'usage')]},
    {t:CHAPS[3], l:[L(4,1,'Réutiliser vos meilleures demandes',4,'reuse'),L(4,2,`Savoir quand ne pas utiliser ${n}`,3,'limits')]}
  ]};
}
const COURSES = Object.fromEntries(AIS.map(a => [a.id, courseFor(a)]));
const LESSONS = {};
TRONC.lessons.forEach(l => LESSONS[l.id] = Object.assign({course:'tc', chap:TRONC.mods[l.mod]}, l));
Object.values(COURSES).forEach(c => c.chapters.forEach(ch => ch.l.forEach(l => {
  const n = nameOf(l.ai); LESSONS[l.id] = Object.assign({course:c.id, chap:ch.t}, l, KIND[l.kind](n, l.title));
})));

/* Nouveautés : fonctions existantes présentées au format Bibl.IA, dates fictives. */
const UPDATES = [
 {id:'u1',ai:'copilot',date:'12 nov.',title:'Résumer un long fil de mails dans Outlook',change:'Au lieu de relire quinze messages, vous obtenez un résumé des points clés et des décisions en haut du fil.',todo:'Ouvrez un long fil dans Outlook, lancez le résumé proposé par Copilot, puis vérifiez-le avant de répondre.',lesson:'copilot-32',link:'https://outlook.office.com'},
 {id:'u2',ai:'chatgpt',date:'5 nov.',title:'Ranger vos conversations dans des projets',change:'Les conversations et les fichiers d’un même dossier (un client, un chantier) peuvent être regroupés au même endroit.',todo:'Créez un projet par dossier récurrent et ajoutez-y vos documents de référence autorisés.',lesson:'chatgpt-22',link:'https://chatgpt.com'},
 {id:'u3',ai:'deepl',date:'28 oct.',title:'Corriger un texte en français avec DeepL Write',change:'DeepL ne sert plus seulement à traduire : il corrige et améliore aussi vos textes en français.',todo:'Collez votre texte dans DeepL Write et acceptez ou refusez chaque suggestion une par une.',lesson:'deepl-12',link:'https://www.deepl.com/write'},
 {id:'u4',ai:'lechat',date:'21 oct.',title:'Chercher sur le web avec les sources',change:'Le Chat peut chercher des informations récentes sur le web et indique d’où elles viennent.',todo:'Pour toute information factuelle, ouvrez les sources citées et vérifiez-les.',lesson:'lechat-32',link:'https://chat.mistral.ai'},
 {id:'u5',ai:'claude',date:'14 oct.',title:'Garder vos documents de référence dans un projet',change:'Dans un projet, Claude s’appuie sur vos documents de référence (catalogue, charte, procédures) pour toutes les conversations du projet.',todo:'Créez un projet, ajoutez uniquement des documents autorisés, puis posez vos questions dans ce projet.',lesson:'claude-22',link:'https://claude.ai'},
 {id:'u6',ai:'perplexity',date:'7 oct.',title:'Regrouper vos recherches par sujet',change:'Les Espaces rassemblent les recherches d’un même sujet de veille (concurrence, réglementation).',todo:'Créez un espace par sujet de veille pour retrouver vos recherches et leurs sources.',lesson:'perplexity-22',link:'https://www.perplexity.ai'},
 {id:'u7',ai:'canva',date:'30 sept.',title:'Créer une image à partir d’une description',change:'Vous décrivez l’image voulue et Canva la génère directement dans votre visuel.',todo:'Vérifiez que l’image respecte l’identité de votre entreprise avant de publier.',lesson:'canva-32',link:'https://www.canva.com'},
 {id:'u8',ai:'gamma',date:'23 sept.',title:'Partir d’un document existant',change:'Vous importez un texte ou un document et Gamma le met en forme en présentation.',todo:'Importez votre plan, puis relisez chaque diapositive : la mise en forme ne remplace pas la vérification.',lesson:'gamma-32',link:'https://gamma.app'},
 {id:'u9',ai:'gemini',date:'16 sept.',title:'Rédiger un mail dans Gmail',change:'Dans Gmail, Gemini propose un brouillon à partir de quelques mots.',todo:'Indiquez le destinataire et l’objectif, puis relisez le brouillon avant l’envoi.',lesson:'gemini-31',link:'https://mail.google.com'}
];

/* Tableau de bord dirigeant : chiffres agrégés de démonstration. */
const DASH = {
  weeks:['22 sept.','29 sept.','6 oct.','13 oct.','20 oct.','27 oct.','3 nov.','10 nov.'],
  weekly:[212,248,231,279,301,318,296,342],
  invited:23, active:19,
  top:[['copilot',34],['lechat',22],['chatgpt',17],['deepl',12],['canva',8],['gamma',7]],
  training:[['Tronc commun « Premiers pas avec l’IA »',68],['Parcours par IA',31]]
};
