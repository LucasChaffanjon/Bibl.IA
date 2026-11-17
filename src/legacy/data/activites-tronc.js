/* ——— Exercices du tronc commun « Premiers pas avec l’IA » ———
   Une liste d’activités par leçon (voir features/activites.js pour les formes possibles).
   Les modules 1 et 4 se font entièrement dans la page ; l’essai dans une vraie IA reste facultatif,
   et n’apparaît que là où il apprend quelque chose qu’un exercice ne montre pas. */
const TRONC_ACTS = {
 /* ——— Module 1 · Les fondations ——— */
 tc1:[
  {t:'order', q:'Du plus large au plus précis, remettez ces termes dans l’ordre.', items:['Intelligence artificielle', 'Machine learning', 'Deep learning', 'Modèle de langage', 'ChatGPT'], why:'Chaque terme est une branche du précédent. ChatGPT est un outil, tout au bout de la chaîne.'},
  {t:'sort', q:'Ces phrases parlent-elles de tout le domaine, ou d’un outil précis ?', cats:['Tout le domaine', 'Un outil précis'], items:[
   ['« L’IA va transformer la médecine. »', 0, 'On parle du domaine entier, comme on dirait « la chimie va transformer l’industrie ».'],
   ['« J’ai demandé un plan de réunion à ChatGPT. »', 1, 'ChatGPT est un assistant précis, édité par OpenAI.'],
   ['« Le Chat a corrigé mon mail. »', 1, 'Le Chat est l’assistant de l’entreprise française Mistral AI.'],
   ['« L’IA progresse chaque année. »', 0, 'Phrase vague : quel outil, quelle branche ? Impossible à vérifier.']]},
  {t:'reveal', q:'Un collègue vous dit : « L’IA s’est trompée dans mon tableau. » Quelle question lui poser en premier ?', a:'« Quel outil as-tu utilisé ? » Selon la réponse, l’erreur n’a pas la même cause : un assistant comme ChatGPT a pu inventer un chiffre, une fonction automatique du tableur a pu mal classer une ligne. Parler de l’outil précis aide à comprendre l’erreur, et à la corriger.'}
 ],
 tc2:[
  {t:'pick', q:'Parmi ces outils du quotidien, lesquels utilisent le machine learning ? Cochez-les.', yes:'Machine learning', no:'Règle fixe', items:[
   ['Les vidéos que YouTube vous propose ensuite', true, 'Le modèle a appris de ce que regardent des millions de personnes.'],
   ['La calculatrice de votre téléphone', false, 'Elle applique des règles mathématiques écrites à la main.'],
   ['L’alerte de votre banque sur un paiement inhabituel', true, 'Le modèle a appris à quoi ressemble un paiement suspect.'],
   ['Le réveil qui sonne à 7 h', false, 'Une simple règle : à 7 h, sonner.'],
   ['Le tri automatique des spams', true, 'Il a appris sur des milliers de mails marqués « spam ».']]},
  {t:'sort', q:'Règle écrite par un humain, ou règle apprise sur des exemples ?', cats:['Règle écrite', 'Apprise sur des exemples'], items:[
   ['« Si une facture a plus de 30 jours, envoyer une relance. »', 0, 'Quelqu’un a écrit la règle, mot pour mot.'],
   ['Prévoir les ventes du mois prochain à partir de trois ans d’historique', 1, 'Le modèle trouve lui-même les tendances dans les chiffres passés.'],
   ['Reconnaître une signature manuscrite', 1, 'Impossible à décrire en règles : on montre des exemples.'],
   ['Appliquer 20 % de TVA à un prix', 0, 'Un calcul fixe, toujours le même.']]},
  {t:'reveal', q:'Un fabricant de téléphones a entraîné un modèle sur ses ventes passées pour prévoir celles d’un nouveau modèle. Une autre marque peut-elle réutiliser ce modèle ?', a:['Oui. Un modèle déjà construit peut être réentraîné avec l’historique de ventes de l’autre marque.', 'C’est ce qui rend le machine learning si répandu : on adapte un modèle existant à ses propres données au lieu de repartir de zéro.', 'Mais si l’historique est faux ou incomplet, les prévisions le seront aussi.']}
 ],
 tc3:[
  {t:'sort', q:'Pour chaque situation, de quelle façon la machine apprend-elle ?', cats:['Supervisé', 'Non supervisé', 'Semi-supervisé'], items:[
   ['On lui montre 10 000 photos marquées « pomme » ou « orange ».', 0, 'Chaque exemple arrive avec sa bonne réponse.'],
   ['Le logiciel range vos clients en groupes qui se ressemblent, sans catégories fournies.', 1, 'Personne ne lui a dit quels groupes chercher.'],
   ['Une banque marque à la main 5 % de ses transactions ; le modèle s’occupe du reste.', 2, 'Une petite partie étiquetée sert à traiter tout le reste.'],
   ['On lui donne des milliers de mails déjà triés en « spam » et « pas spam ».', 0, 'La bonne réponse accompagne chaque exemple.']]},
  {t:'reveal', q:'Pourquoi la banque n’étiquette-t-elle pas toutes ses transactions à la main ?', a:'Parce qu’il y en a des millions. Les faire vérifier une par une coûterait trop cher et prendrait trop de temps. Quelques milliers d’exemples bien choisis suffisent au modèle pour comprendre ce qui distingue une fraude d’un paiement normal, puis il applique ce qu’il a compris à tout le reste.'},
  {t:'reveal', q:'Votre service client trie chaque jour ses demandes à la main en « réclamation », « question » et « commande ». Si vous vouliez qu’une machine apprenne à le faire, de quoi aurait-elle besoin ?', a:'De vos anciennes demandes, déjà classées par votre équipe. Ce sont des exemples avec leur bonne réponse : de l’apprentissage supervisé. Plus ces exemples sont nombreux et bien classés, plus la machine triera juste.'}
 ],
 tc4:[
  {t:'order', q:'Dans un outil de dictée, le réseau de neurones passe du plus simple au plus complexe. Remettez ses couches dans l’ordre.', items:['Des sons', 'Des syllabes', 'Des mots', 'Le sens de la phrase'], why:'Chaque couche s’appuie sur la précédente pour saisir quelque chose de plus abstrait. Plus il y a de couches, plus le modèle saisit de nuances.'},
  {t:'reveal', q:'Pourquoi le deep learning a-t-il besoin d’autant de données ?', a:'Parce qu’il trouve lui-même ce qui compte, sans qu’on le lui dise. Pour reconnaître un chat sur toutes les photos possibles (de face, de dos, dans le noir), il doit en avoir vu énormément. Avec peu d’exemples, il se trompe dès que la situation change un peu.'},
  {t:'chat', ask:'[Photo jointe : un tableau blanc couvert de notes de réunion]\nQue voyez-vous sur cette image ?', ans:'Je vois un tableau blanc couvert de notes écrites à la main. En haut, un titre : « Lancement printemps ». Dessous, trois colonnes : « Budget », « Équipe » et « Calendrier ». Les lignes en bas à droite sont difficiles à lire : je ne suis pas sûr de leur contenu.', notes:['Lire une image, c’est du deep learning : des couches qui passent des traits aux lettres, puis aux mots.', 'La réponse dit ce dont elle n’est pas sûre. Sur une photo floue ou mal éclairée, vérifiez toujours.', 'Ne joignez jamais une photo qui montre des personnes ou des documents confidentiels.']}
 ],
 tc5:[
  {t:'sort', q:'Regardez ce qui sort de chaque outil : il classe, ou il crée ?', cats:['Il classe', 'Il crée'], items:[
   ['Le filtre antispam de votre messagerie', 0, 'Ce qui sort : « spam » ou « pas spam ».'],
   ['Un assistant qui rédige la réponse à un mail', 1, 'Il produit un texte qui n’existait pas.'],
   ['Une application qui répond « chat : 97 % » à une photo', 0, 'Une catégorie et une probabilité.'],
   ['Un outil qui crée une affiche à partir d’une phrase', 1, 'Il produit une image nouvelle.'],
   ['La détection de fraude de votre banque', 0, 'Ce qui sort : « suspect » ou « normal ».'],
   ['La traduction automatique d’un texte', 1, 'Elle écrit un texte nouveau, dans une autre langue.']]},
  {t:'reveal', q:'Une IA a vu des milliers de photos de chiens, sans aucune étiquette. Comment peut-elle dessiner un chien qui n’existe pas ?', a:'Elle ne recopie aucune photo. Elle a repéré des régularités : deux oreilles, quatre pattes, un museau, des pelages qui varient. Quand vous demandez un chien, elle assemble ces régularités en une image nouvelle. C’est pour cela qu’une IA générative sait créer, mais peut aussi se tromper : elle produit ce qui est probable, pas ce qui est vrai.'}
 ],
 tc6:[
  {t:'sort', q:'Quelle famille de modèles travaille dans chaque cas ?', cats:['Texte → texte', 'Texte → image', 'Parole → texte', 'Texte → parole'], items:[
   ['Vous demandez le résumé d’un compte rendu', 0, 'Du texte entre, du texte sort.'],
   ['Vous dictez un message à votre téléphone', 2, 'Votre voix entre, du texte sort.'],
   ['Vous décrivez le visuel d’une affiche', 1, 'Une description entre, une image sort.'],
   ['Le standard d’un cabinet dentaire lit son message d’accueil avec une voix naturelle', 3, 'Un texte entre, une voix sort. Des « réceptionnistes » vocales prennent déjà des rendez-vous ainsi.'],
   ['Vous demandez trois titres pour une annonce', 0, 'Du texte entre, du texte sort.']]},
  {t:'reveal', q:'Dans ChatGPT, vous demandez un texte, puis une image, dans la même conversation. Est-ce le même modèle qui fait les deux ?', a:'Non. L’assistant réunit plusieurs modèles dans une seule fenêtre : un modèle de langage pour le texte, un modèle d’image pour l’illustration. Vous voyez une seule conversation, mais chaque tâche part vers le modèle spécialisé.'},
  {t:'reveal', q:'Et les modèles « texte vers vidéo » ou « texte vers 3D », à quoi servent-ils ?', a:'Le premier crée ou modifie une vidéo à partir d’une description. Le second crée un objet en volume, surtout pour les jeux vidéo, l’architecture ou les maquettes de produits. Vous les croiserez moins souvent au bureau, mais ils progressent très vite.'}
 ],
 tc7:[
  {t:'order', q:'Remettez dans l’ordre la fabrication d’un assistant comme ChatGPT.', items:['Rassembler une quantité immense de textes', 'Pré-entraîner le modèle sur ces textes', 'L’affiner pour un usage précis', 'Le proposer aux entreprises, souvent à distance par une API'], why:'D’abord un généraliste de la langue, puis une spécialisation. Seules quelques grandes entreprises peuvent payer les premières étapes ; les autres louent le modèle et l’adaptent à leurs données.'},
  {t:'chat', ask:'Quel a été le chiffre d’affaires 2024 de la boulangerie Dupont, à Lyon ?', ans:'La boulangerie Dupont, à Lyon, a réalisé environ 1,2 million d’euros de chiffre d’affaires en 2024, en hausse de 8 % par rapport à 2023, grâce à l’ouverture d’un second point de vente.', notes:['Cette réponse est un exemple inventé pour la leçon, mais typique : précise, chiffrée, sûre d’elle.', 'Un modèle de langage écrit la suite la plus plausible. Sur une petite entreprise peu connue, il n’a souvent aucune donnée, et il comble le vide.', 'Le bon réflexe : pour un chiffre précis, demandez la source, ou utilisez un outil de recherche qui cite les siennes.']},
  {t:'try', task:'Voyez par vous-même où s’arrête ce que sait l’IA, sur un sujet de votre métier.', prompt:'Sur le sujet suivant : [un sujet précis de votre métier], dites-moi ce que vous savez avec certitude, ce qui a pu changer récemment, et ce que vous risquez d’inventer. Soyez franc sur vos limites.', sample:'Ce que je sais avec certitude : les grands principes et le vocabulaire de base du sujet.\nCe qui a pu changer : les dates, les seuils et les règles récentes, car mes connaissances s’arrêtent à la fin de mon entraînement.\nCe que je risque d’inventer : des noms d’entreprises, des chiffres précis et des références d’études. Vérifiez-les toujours à la source.'}
 ],
 tc8:[
  {t:'sort', q:'Pour chaque tâche : l’IA peut-elle la faire seule, la préparer, ou doit-elle rester humaine ?', cats:['L’IA la fait', 'L’IA la prépare', 'Reste humaine'], items:[
   ['Répondre aux questions fréquentes des clients sur les horaires', 0, 'Question simple, réponse connue : un assistant répond seul, jour et nuit.'],
   ['Rédiger le compte rendu d’une réunion enregistrée', 1, 'L’IA fait le premier jet, vous corrigez.'],
   ['Annoncer une mauvaise nouvelle à un salarié', 2, 'L’écoute et le tact restent humains.'],
   ['Proposer trois idées de publication pour la page de l’entreprise', 1, 'Elle propose, vous choisissez.'],
   ['Décider d’une augmentation de salaire', 2, 'Une décision qui touche une personne et de l’argent.']]},
  {t:'reveal', q:'Selon le rapport 2025 du Forum économique mondial sur l’emploi, environ 92 millions d’emplois vont disparaître ou changer profondément d’ici 2030. Combien d’emplois nouveaux apparaîtront, à votre avis ?', a:['Environ 170 millions, soit un solde positif d’environ 78 millions.', 'Mais 39 % des compétences actuelles devront être renouvelées : le travail change de forme.', 'Le même rapport indique que la grande majorité des employeurs prévoient de former leurs équipes en priorité.']},
  {t:'reveal', q:'Il y a deux cents ans, la révolution industrielle a mécanisé le travail physique. Qu’est-ce qui est différent aujourd’hui ?', a:'Cette fois, c’est une partie du travail intellectuel qui change : écrire, résumer, chercher, classer. Et tout va beaucoup plus vite : la révolution industrielle s’est installée sur des décennies, l’IA est arrivée dans les entreprises en quelques années. D’où l’intérêt d’apprendre un peu, régulièrement.'}
 ],

 /* ——— Module 2 · Vos outils ——— */
 tc9:[
  {t:'chat', ask:'[Mail collé : un fournisseur demande si la livraison de mardi peut passer à jeudi]\nRépondez que jeudi nous convient, mais avant 11 h. Ton cordial, 4 lignes.', ans:'Bonjour,\nMerci pour votre message. Jeudi nous convient tout à fait, à condition que la livraison arrive avant 11 h.\nPouvez-vous me confirmer le créneau ?\nBien cordialement,', notes:['La demande tient en une phrase, mais elle dit l’essentiel : quoi répondre, le ton, la longueur.', 'Le mail collé ne contenait ni nom ni donnée sensible.', 'Vous relisez avant d’envoyer : c’est vous qui signez.']},
  {t:'pick', q:'Lesquelles de ces petites tâches pouvez-vous confier à un assistant dès aujourd’hui ?', yes:'Bonne idée', no:'À éviter', items:[
   ['Reformuler un paragraphe trop long', true, 'Rapide, sans risque, et vous gardez le contrôle.'],
   ['Trouver cinq idées de titre pour une note interne', true, 'Il propose, vous choisissez.'],
   ['Envoyer un mail à un client sans le relire', false, 'Relisez toujours : l’IA peut se tromper de ton ou de fait.'],
   ['Résumer un long document public', true, 'Un gain de temps immédiat.'],
   ['Coller la liste des salaires de l’équipe pour en faire un tableau', false, 'Des données personnelles : à ne jamais coller.']]},
  {t:'reveal', q:'Pourquoi dicter sa demande plutôt que la taper ?', a:'À l’oral, on en dit plus, plus vite. Vous donnez naturellement le contexte (pour qui, pourquoi, ce qui s’est passé), et c’est ce contexte qui rend la réponse utile. Les applications des assistants, sur ordinateur comme sur téléphone, ont un bouton micro pour cela.'},
  {t:'try', task:'Confiez une petite tâche réelle à votre assistant, et gardez sa fenêtre ouverte à côté de votre travail.', prompt:'Voici un mail auquel je dois répondre : [collez-le, sans noms ni données sensibles].\nJe veux répondre que [votre réponse en une phrase]. Rédigez une réponse courte et cordiale.'}
 ],
 tc10:[
  {t:'sort', q:'Pour chaque besoin, quel type d’outil choisir ?', cats:['Assistant seul', 'Recherche avec sources', 'Recherche approfondie'], items:[
   ['Reformuler une phrase', 0, 'Pas besoin d’Internet.'],
   ['Connaître le taux actuel du Livret A', 1, 'Information récente et chiffrée : il faut une source datée.'],
   ['Préparer un dossier complet sur le secteur d’un nouveau client', 2, 'Un rapport qui croise des dizaines de sites, en quelques minutes.'],
   ['Trouver la date du prochain salon de votre secteur', 1, 'Une question précise et récente.'],
   ['Trouver des idées de nom pour un projet interne', 0, 'De la créativité, pas des faits.']]},
  {t:'chat', ask:'Quelles aides existent pour former les salariés d’une PME à l’IA ? Réponse courte, avec 3 sources datées.', ans:'Trois pistes principales : le plan de développement des compétences de l’entreprise, les financements de votre opérateur de compétences (OPCO), et le compte personnel de formation (CPF) de chaque salarié.\nSources : [1] site du ministère du Travail, page mise à jour en mars ; [2] site de votre OPCO, rubrique « financements » ; [3] article d’un média économique, daté de février.\nÀ vérifier : les montants et les conditions changent chaque année.', notes:['Exemple de réponse d’un outil de recherche : chaque affirmation renvoie à une source numérotée et datée.', 'Un site officiel, un organisme et un média : trois types de sources qui se complètent.', 'Ouvrez au moins une source avant de reprendre un chiffre.']},
  {t:'reveal', q:'Astuce : comment savoir ce que pensent vraiment les utilisateurs d’un logiciel, au-delà des sites officiels ?', a:'Certains outils de recherche, comme Perplexity, permettent de cibler les forums et les discussions entre utilisateurs. Comparez ces avis, souvent francs, avec les sites officiels et la presse. Les trois ne disent pas toujours la même chose, et c’est justement instructif.'},
  {t:'try', tools:'search', task:'Posez une vraie question de travail à un outil de recherche, et ouvrez une des sources.', prompt:'Recherchez : [une question précise sur votre secteur, sans donnée confidentielle].\nDonnez une réponse courte, puis les 3 sources les plus sérieuses avec leur date. Signalez les points sur lesquels les sources ne sont pas d’accord.'}
 ],
 tc11:[
  {t:'chat', ask:'[Trois documents joints : le cahier des charges et deux comptes rendus de réunion]\nEn vous appuyant uniquement sur ces documents : quelles sont les trois attentes du client qui reviennent le plus ? Indiquez de quel document vient chaque point.', ans:'1. Une livraison en 6 semaines au plus (cahier des charges, page 2 ; compte rendu du 12 mars).\n2. Un interlocuteur unique pendant tout le projet (comptes rendus du 12 mars et du 4 avril).\n3. Un budget qui ne dépasse pas l’enveloppe annoncée (cahier des charges, page 5).\nJe n’ai rien trouvé sur la formation des équipes : ce point n’apparaît dans aucun des trois documents.', notes:['La réponse s’appuie sur vos documents, pas sur la mémoire de l’IA : elle est bien plus fiable.', 'Chaque point indique d’où il vient : vous vérifiez en quelques secondes.', 'Elle dit aussi ce qu’elle n’a pas trouvé, au lieu de l’inventer.']},
  {t:'pick', q:'Un outil de prise de notes a suivi votre réunion. Que peut-il vous donner ensuite ? Cochez.', yes:'Oui', no:'Non', items:[
   ['Un compte rendu des sujets abordés', true, 'C’est sa fonction de base.'],
   ['La liste des actions décidées, et qui doit les faire', true, 'Plus besoin de prendre des notes pendant l’appel.'],
   ['Les questions posées, avec le moment exact où elles l’ont été', true, 'Un clic, et vous réécoutez le passage.'],
   ['Une réponse à une question sur la réunion, des semaines plus tard', true, 'Certains outils permettent d’interroger l’enregistrement comme un assistant.'],
   ['Ce que les participants pensaient sans le dire', false, 'Il ne sait que ce qui a été dit.']]},
  {t:'reveal', q:'Avant d’enregistrer une réunion avec un tel outil, que devez-vous faire ?', a:['Vérifier que l’outil est autorisé par votre entreprise : une réunion contient souvent des informations internes.', 'Prévenir les participants dès le début : leur voix est enregistrée.']},
  {t:'reveal', q:'Vous avez 40 pages à lire avant une réunion, et une heure de route. Une idée ?', a:'Certains outils qui rassemblent vos documents, comme NotebookLM de Google, en tirent un résumé audio : une conversation entre deux voix qui reprend l’essentiel. Vous l’écoutez pendant le trajet. Comme toujours, seulement avec des documents que votre entreprise autorise.'}
 ],
 tc12:[
  {t:'order', q:'Vous préparez une présentation pour un prospect. Remettez les étapes dans l’ordre.', items:['Expliquer la tâche à un assistant qui vous suivra jusqu’au bout', 'Lancer une recherche approfondie sur le secteur du prospect', 'Poser les petites questions à un outil de recherche rapide', 'Rassembler tous les documents au même endroit et en tirer une synthèse', 'Créer les diapositives avec un outil de présentation', 'Relire et vérifier chaque chiffre'], why:'Chaque étape va à l’outil le plus adapté, et l’assistant du début rédige les demandes destinées aux autres outils. La relecture humaine ferme la marche.'},
  {t:'pick', q:'Quelles tâches méritent d’enchaîner plusieurs outils ?', yes:'Ça vaut la peine', no:'Restez simple', items:[
   ['Préparer chaque semaine une présentation client', true, 'Régulière et complexe : le temps de mise en place se rattrape vite.'],
   ['Corriger une faute dans un mail', false, 'Un seul outil, ou aucun, suffit.'],
   ['Produire chaque mois une veille sur votre secteur', true, 'Recherche, synthèse et mise en forme, tous les mois.'],
   ['Écrire une carte de vœux unique', false, 'Une tâche ponctuelle.']]},
  {t:'reveal', q:'Pourquoi ne pas tout faire dans un seul assistant ?', a:'On peut, mais chaque outil a son point fort : l’un cherche mieux, un autre rédige mieux, un troisième met en page. Les combiner donne un résultat plus solide. Connaître le bon outil pour chaque besoin, sans être expert de tous, est l’une des compétences les plus utiles aujourd’hui.'},
  {t:'try', task:'Découpez une tâche que vous faites souvent, et voyez quel outil irait à chaque étape.', prompt:'Je fais régulièrement cette tâche : [décrivez-la].\nDécoupez-la en étapes. Pour chaque étape, dites quel type d’outil convient (assistant, recherche, présentation, aucun) et ce que je dois vérifier.', sample:'1. Rassembler les chiffres du mois : aucun outil d’IA, export depuis votre logiciel.\n2. Résumer les faits marquants : assistant. À vérifier : chaque chiffre repris.\n3. Chercher l’actualité du secteur : outil de recherche avec sources. À vérifier : la date des articles.\n4. Mettre en page : outil de présentation. À vérifier : les graphiques.'}
 ],

 /* ——— Module 3 · Bien demander ——— */
 tc13:[
  {t:'compare', q:'Laquelle de ces deux demandes donnera la réponse la plus utile ?', opts:['Aidez-moi pour un client.', 'Je suis assistante commerciale. Rédigez un mail de relance pour un devis envoyé il y a 10 jours à un client fidèle. Ton cordial, 8 lignes au plus.'], a:1, why:'Elle donne l’objectif (un mail de relance), le contexte (qui écrit, à qui, depuis quand) et le format (le ton, la longueur).'},
  {t:'chat', ask:'Parlez-moi des voitures.', ans:'Les voitures sont des véhicules à moteur qui servent au transport de personnes. Il en existe de nombreux types : citadines, berlines, SUV… Elles peuvent rouler à l’essence, au diesel ou à l’électricité.', notes:['Demande vague, réponse vague. Les Anglais disent « garbage in, garbage out » : une demande pauvre donne une réponse pauvre.', 'Essayez plutôt : « Comparez en 3 points le coût d’une voiture électrique et d’une thermique pour un commercial qui roule 30 000 km par an. »']},
  {t:'sort', q:'Dans cette demande, retrouvez l’objectif, le contexte et le format.', cats:['Objectif', 'Contexte', 'Format'], items:[
   ['« Rédigez une annonce de recrutement »', 0, 'Ce que vous voulez obtenir.'],
   ['« pour un poste de comptable dans un cabinet de 12 personnes à Nantes »', 1, 'Pour qui, et dans quelle situation.'],
   ['« le dernier recrutement a attiré peu de candidats »', 1, 'Ce qui s’est passé avant : très utile à l’IA.'],
   ['« en moins de 150 mots, avec la liste des missions »', 2, 'La longueur et la forme.']]},
  {t:'build', q:'Construisez une demande pour un texte que vous devez écrire cette semaine.', fields:[['Objectif', 'Ce que vous voulez obtenir. Exemple : un mail pour décaler une réunion'], ['Contexte', 'Qui vous êtes, pour qui c’est, ce qui s’est passé avant'], ['Format', 'Longueur, ton, liste ou paragraphe']], check:['Retirez les noms et les données sensibles.', 'Relisez la réponse avant de l’utiliser.']}
 ],
 tc14:[
  {t:'sort', q:'Quel niveau de demande pour chaque situation ?', cats:['1 · Rapide', '2 · Tâche importante', '3 · Instructions permanentes'], items:[
   ['Reformuler une phrase', 0, 'Une ou deux phrases suffisent.'],
   ['Préparer une levée de fonds', 1, 'Importante mais ponctuelle : une conversation soignée, au titre clair.'],
   ['Répondre chaque jour aux demandes de devis', 2, 'Tâche quotidienne : des instructions écrites une fois, testées, réutilisées.'],
   ['Traduire un message court', 0, 'Rapide.'],
   ['Préparer le programme d’un séminaire d’équipe', 1, 'Rôle, étapes, documents utiles et un exemple valent le coup.']]},
  {t:'reveal', q:'Vous avez passé vingt minutes à écrire une demande détaillée pour votre levée de fonds. Que faites-vous de la conversation ?', a:'Donnez-lui un titre clair, par exemple « Levée de fonds », pour la retrouver. La prochaine fois, vous reprenez là où vous en étiez, avec tout le contexte, au lieu de tout réexpliquer. Les conversations rapides, elles, peuvent être oubliées.'},
  {t:'build', q:'Écrivez une demande de niveau 2 pour une tâche importante du mois.', fields:[['Rôle', 'Exemple : vous êtes expert en recrutement'], ['Objectif', 'Ce que vous voulez obtenir'], ['Contexte', 'Qui vous êtes, pour qui, ce qui s’est passé'], ['Étapes', 'Ce que l’IA doit faire, dans l’ordre'], ['Ressources', 'Les documents que vous joignez'], ['Format', 'Longueur, forme']], check:['Donnez un titre clair à la conversation.', 'Ajoutez un exemple de bon résultat si vous en avez un.']}
 ],
 tc15:[
  {t:'compare', q:'Pour que l’IA écrive comme d’habitude dans votre entreprise, quelle demande marche le mieux ?', opts:['Écrivez un mail chaleureux mais professionnel, pas trop long, avec une touche d’humour légère, comme nous le faisons d’habitude.', 'Voici un mail envoyé le mois dernier, qui a bien marché : [mail]. Écrivez-en un dans le même style pour annoncer la fermeture du 24 décembre.'], a:1, why:'L’IA imite mieux un exemple qu’elle n’obéit à une description. « Chaleureux mais professionnel » peut vouloir dire mille choses ; un vrai mail montre exactement le ton voulu.'},
  {t:'pick', q:'Avant de coller cet ancien mail comme exemple, que faut-il retirer ?', yes:'À retirer', no:'À garder', items:[
   ['Le nom du client', true, 'Remplacez-le par [Client A].'],
   ['Le numéro de facture', true, 'Remplacez-le par [numéro].'],
   ['La formule de politesse', false, 'Elle fait partie du style à imiter.'],
   ['L’adresse mail du destinataire', true, 'Une donnée personnelle.'],
   ['La structure en trois paragraphes', false, 'C’est justement ce que l’IA doit reproduire.']]},
  {t:'reveal', q:'Les spécialistes parlent de « zero shot », « one shot » et « few shot ». De quoi s’agit-il ?', a:['Zero shot : aucun exemple. Pour les demandes rapides du quotidien.', 'One shot : un exemple. Pour une tâche qui compte.', 'Few shot : plusieurs exemples. Pour des instructions qui serviront souvent.', 'Plus il y a d’exemples, plus le résultat ressemble à ce que vous attendez. Mais les trouver prend du temps.']},
  {t:'reveal', q:'Astuce : comment faire écrire l’IA comme vous, sans recoller vos exemples à chaque fois ?', a:'Certains assistants, comme Claude, permettent d’enregistrer un « style » à partir de textes que vous avez écrits. Vous le choisissez ensuite d’un clic. Gardez quand même votre plume : écrivez vous-même vos textes importants, c’est ce qui rend votre style reconnaissable.'}
 ],
 tc16:[
  {t:'chat', ask:'Je dois préparer la réunion de lundi avec l’équipe commerciale… on doit faire le point sur le salon, décider qui ira au prochain, et parler des nouveaux tarifs. Je veux un ordre du jour d’une heure. Avant de commencer, posez-moi les questions qui vous manquent.', ans:'Avant de proposer l’ordre du jour, trois questions :\n1. Combien de personnes participent, et qui prend les décisions ?\n2. Les nouveaux tarifs sont-ils déjà validés, ou à discuter ?\n3. Faut-il prévoir un temps de retour pour chaque commercial présent au salon ?', notes:['La demande a été dictée, un peu en désordre : ce n’est pas grave.', 'La dernière phrase fait poser à l’IA les questions auxquelles vous n’aviez pas pensé.', 'Vous répondez, et l’ordre du jour sera bien plus juste.']},
  {t:'compare', q:'La réponse est trop longue. Que faites-vous ?', opts:['J’ouvre une nouvelle conversation et je réécris toute ma demande.', 'Je réponds simplement : « Plus court, en 5 lignes. »'], a:1, why:'L’IA garde le fil de la conversation : quelques mots d’ajustement suffisent. « Plus formel », « Ajoutez la date », « Sans jargon » marchent aussi.'},
  {t:'reveal', q:'Pourquoi décrire à quoi ressemblera le résultat une fois fini ?', a:'Parce que l’IA sait alors quand elle a réussi. « Un ordre du jour d’une heure, en 5 points, avec le temps prévu pour chacun » est un objectif clair, contrairement à « un ordre du jour ».'},
  {t:'try', task:'Ouvrez l’application de votre IA, appuyez sur le micro et décrivez une tâche pendant une minute.', prompt:'[Décrivez la tâche à l’oral, dans le désordre si besoin.]\nLe résultat attendu : [à quoi il ressemble une fois fini].\nAvant de commencer, posez-moi les questions qui vous manquent.'}
 ],
 tc17:[
  {t:'order', q:'Pour une demande importante, remettez la bonne méthode dans l’ordre.', items:['Écrire vous-même l’objectif, le contexte et vos consignes', 'Demander à l’IA ce qui manque', 'Répondre à ses questions', 'Relire la version finale et vérifier qu’elle garde vos consignes'], why:'Vous apportez le fond, que vous seul connaissez. L’IA complète la forme.'},
  {t:'compare', q:'Vous préparez l’entretien annuel d’un collaborateur. Quelle demande choisir ?', opts:['Une demande écrite en un clic par un générateur automatique.', 'Votre brouillon (objectifs de l’année, points forts, sujets délicats), suivi de : « Dites ce qui manque, puis proposez une version complète. »'], a:1, why:'Le générateur dépanne pour un essai rapide. Pour une tâche à fort enjeu, il reste générique : il ne connaît ni votre collaborateur ni votre entreprise.'},
  {t:'try', task:'Faites améliorer une demande que vous avez écrite cette semaine.', prompt:'Voici une demande que je veux améliorer : [collez votre brouillon].\nListez ce qui manque pour obtenir un excellent résultat, posez-moi les questions nécessaires, puis proposez la version finale.', sample:'Il manque trois éléments :\n1. Le destinataire : pour qui est ce document ?\n2. Le niveau de détail attendu : une page, ou un dossier complet ?\n3. Un exemple de ce que vous avez déjà fait et qui vous plaît.\nRépondez à ces questions, et je vous propose la version finale.'}
 ],

 /* ——— Module 4 · Vérifier et protéger ——— */
 tc18:[
  {t:'pick', q:'Voici quatre phrases tirées d’une réponse d’IA sur les réunions. Cochez celles à vérifier en priorité.', yes:'À vérifier', no:'Moins risqué', items:[
   ['« Une réunion d’équipe est un bon moment pour partager l’information. »', false, 'Une généralité : rien de précis à vérifier.'],
   ['« Selon une étude de l’université de Lille publiée en 2023, 64 % des réunions sont inutiles. »', true, 'Une étude, une université, une date, un pourcentage : exactement ce qu’une IA peut inventer.'],
   ['« Prévoyez un ordre du jour envoyé la veille. »', false, 'Un conseil, pas un fait.'],
   ['« La loi impose une pause de 20 minutes après 6 heures de travail. »', true, 'Un fait légal précis : vérifiez sur un site officiel. Ici c’est exact, mais l’IA aurait pu se tromper.']]},
  {t:'sort', q:'Quel type d’erreur dans chaque cas ?', cats:['Hallucination', 'Connaissances datées', 'Biais'], items:[
   ['L’IA cite un livre qui n’existe pas.', 0, 'Elle comble un manque avec du plausible.'],
   ['L’IA donne le prix de l’an dernier.', 1, 'Sans recherche, ses connaissances s’arrêtent à la fin de son entraînement.'],
   ['L’IA imagine toujours un « directeur » et une « secrétaire ».', 2, 'Les clichés de ses données d’entraînement se retrouvent dans ses réponses.'],
   ['L’IA invente le numéro d’un article de loi.', 0, 'Un détail précis inventé, présenté comme vrai.'],
   ['L’IA ignore une réforme récente.', 1, 'Elle ne la connaît pas encore.']]},
  {t:'reveal', q:'Pourquoi l’IA invente-t-elle avec autant d’assurance ?', a:'Un modèle de langage écrit la suite la plus probable, mot après mot. Il n’a pas de voyant qui s’allume quand il ne sait pas. Une erreur et une vérité sortent donc avec le même ton. C’est à vous de savoir où il risque de se tromper : les faits précis, récents ou peu connus.'},
  {t:'try', task:'Provoquez une erreur pour apprendre à la repérer.', prompt:'Citez trois articles ou études précises, avec auteur, titre et date, sur [un sujet pointu de votre métier].', sample:'Voici trois références :\n1. Martin, L. (2021). « L’impact du numérique sur les PME artisanales ». Revue française de gestion.\n2. Durand, C. et Petit, A. (2022). « Organisation du travail hybride ». Éditions EMS.\n3. Rapport de l’Observatoire des métiers, édition 2023.\n(Exemple inventé pour la leçon : certaines références de ce type existent, d’autres non. Cherchez chacune avant de la citer.)'}
 ],
 tc19:[
  {t:'compare', q:'Quelle consigne aide le plus l’IA à contrôler son propre travail ?', opts:['Vérifiez bien votre réponse.', 'Chaque montant doit être identique à la facture jointe ; signalez tout écart.'], a:1, why:'Un critère qu’on peut juger par oui ou par non donne un vrai contrôle. « Vérifiez bien » est un vœu.'},
  {t:'order', q:'L’IA vous parle d’un « délai légal de 30 jours ». Remettez les bons gestes dans l’ordre.', items:['Demander à l’IA sa source', 'Ouvrir cette source', 'Vérifier sur un site officiel, comme service-public.fr', 'Seulement alors, reprendre l’information'], why:'Pour un fait précis (loi, prix, délai), seule une source officielle fait foi.'},
  {t:'pick', q:'Dans un texte rédigé par l’IA, que vérifiez-vous vous-même, un par un ?', yes:'À vérifier', no:'Moins prioritaire', items:[
   ['Les noms de personnes et d’entreprises', true, 'Une faute de nom se voit tout de suite chez le client.'],
   ['Les chiffres et les montants', true, 'L’erreur la plus coûteuse.'],
   ['Les dates et les délais', true, 'Souvent inventés ou dépassés.'],
   ['Le choix des synonymes', false, 'Une question de style, pas d’exactitude.']]},
  {t:'try', task:'Reprenez une réponse obtenue plus tôt et demandez à l’IA de se contrôler.', prompt:'Relisez votre réponse précédente.\nCritère : [chaque chiffre doit correspondre au document joint / chaque affirmation doit avoir une source].\nListez ce qui ne respecte pas ce critère, puis corrigez.'}
 ],
 tc20:[
  {t:'sort', q:'Pouvez-vous coller ceci dans une IA autorisée par votre entreprise ?', cats:['Oui', 'Oui, en rendant anonyme', 'Jamais'], items:[
   ['Un article de presse public', 0, 'Rien de confidentiel.'],
   ['Le mail d’un client, avec son nom et sa facture', 1, 'Remplacez par [Client A] et [numéro].'],
   ['Le mot de passe du portail fournisseur', 2, 'Jamais de mot de passe, sous aucun prétexte.'],
   ['Les coordonnées bancaires d’un client', 2, 'Jamais.'],
   ['Le compte rendu d’une réunion interne', 1, 'Retirez les noms et les chiffres sensibles.'],
   ['La plaquette commerciale publique de l’entreprise', 0, 'Elle est déjà publique.']]},
  {t:'reveal', q:'Comment réécrire : « Relance pour M. Martin, facture 2024-118 de 4 320 € » avant de le coller ?', a:'« Relance pour [Client A], facture [numéro] de [montant] ». L’IA comprend la tâche aussi bien, et aucune donnée personnelle ne quitte l’entreprise. Vous remettez les vrais éléments dans votre logiciel habituel.'},
  {t:'reveal', q:'Vous hésitez à coller un document. Quelle est la règle ?', a:'Dans le doute, ne collez pas, et demandez à votre responsable : il sait ce que l’entreprise autorise. Chaque fiche de la bibliothèque Bibl.IA résume aussi ce que deviennent vos données chez l’éditeur.'}
 ],

 /* ——— Module 5 · Aller plus loin ——— */
 tc21:[
  {t:'order', q:'Vous ouvrez une application de livraison et la carte s’affiche. Remettez le trajet de la demande dans l’ordre.', items:['Vous ouvrez la carte dans l’application', 'L’application envoie la demande à l’API du service de cartographie', 'Le service de cartographie prépare la carte', 'L’API rapporte la carte à l’application', 'La carte s’affiche sur votre écran'], why:'Comme au restaurant : vous commandez, le serveur transmet en cuisine, puis rapporte le plat. L’API, c’est le serveur.'},
  {t:'pick', q:'Lesquelles de ces affirmations sur les API sont vraies ?', yes:'Vrai', no:'Faux', items:[
   ['Une API permet à un logiciel d’utiliser le service d’un autre.', true, 'C’est sa raison d’être.'],
   ['Une clé d’API peut se partager librement.', false, 'Elle se garde secrète, comme un mot de passe : elle donne accès à un service, souvent payant.'],
   ['Beaucoup d’outils d’IA s’appuient sur les modèles d’autres entreprises.', true, 'Vos données peuvent donc passer par plusieurs prestataires.'],
   ['Il faut savoir coder pour comprendre ce qu’est une API.', false, 'Il suffit de retenir l’image du serveur au restaurant.']]},
  {t:'reveal', q:'Pourquoi une application de livraison n’a-t-elle pas créé sa propre carte ?', a:'Refaire un service de cartographie coûterait une fortune et des années. Utiliser celui d’un autre éditeur, en payant à l’usage, revient bien moins cher. C’est la même logique pour beaucoup d’outils d’IA : ils louent le modèle d’une grande entreprise au lieu d’entraîner le leur.'}
 ],
 tc22:[
  {t:'sort', q:'Déclencheur ou action ? Classez chaque morceau d’automatisation.', cats:['Déclencheur', 'Action'], items:[
   ['Un mail arrive avec le mot « ressource »', 0, 'C’est l’évènement qui lance tout.'],
   ['Envoyer un mail avec le lien', 1, 'Ce que l’automatisation fait ensuite.'],
   ['Une ligne est ajoutée au tableau des commandes', 0, 'Un nouvel élément lance l’automatisation.'],
   ['Résumer la demande avec une IA', 1, 'Une étape d’IA est une action comme une autre.'],
   ['Chaque lundi à 8 h', 0, 'Une heure fixe peut aussi déclencher une automatisation.']]},
  {t:'pick', q:'Quelles tâches méritent une automatisation ?', yes:'À automatiser', no:'Pas la peine', items:[
   ['Envoyer chaque jour le même lien aux personnes qui le demandent', true, 'Fréquente, répétitive, sans jugement : la cible idéale.'],
   ['Rédiger un discours de départ en retraite', false, 'Unique, et personnel.'],
   ['Recopier chaque commande reçue dans un tableau', true, 'Répétitif, et source d’erreurs à la main.'],
   ['Préparer le rapport annuel', false, 'Une fois par an : le temps de mise en place ne se rattrape pas.'],
   ['Ranger chaque facture reçue dans le bon dossier', true, 'Tous les jours, toujours la même règle.']]},
  {t:'reveal', q:'Pourquoi ne pas automatiser tout ce qui peut l’être ?', a:['Une automatisation se construit, se teste et se surveille : c’est du temps.', 'Elle peut coûter de l’argent à chaque exécution, surtout si elle fait appel à une IA.', 'Faites d’abord la tâche à la main quelques fois : vous saurez si elle revient vraiment, et comment elle doit marcher.']},
  {t:'try', task:'Décrivez une tâche répétitive sous forme d’automatisation, pour en parler à la personne qui gère vos outils.', prompt:'Voici une tâche que je fais souvent : [décrivez-la, avec sa fréquence].\nDécrivez-la sous forme d’automatisation : déclencheur, actions, étape d’IA éventuelle, points à vérifier. Estimez le temps gagné par mois.'}
 ],
 tc23:[
  {t:'order', q:'Remettez dans l’ordre la progression conseillée, de la plus simple à la plus poussée.', items:['Une conversation rapide, pour une question ponctuelle', 'Une conversation longue, avec un titre clair, pour une tâche importante', 'Un assistant personnalisé, pour une tâche qui revient chaque jour'], why:'Inutile de créer un assistant pour une tâche ponctuelle. Il devient rentable quand la tâche revient souvent et que vos instructions sont rodées.'},
  {t:'pick', q:'Qu’est-ce qui change vraiment la qualité d’un assistant personnalisé ?', yes:'Ça compte', no:'Ne change rien', items:[
   ['Ses instructions, précises et testées', true, 'C’est ce qui a le plus d’effet.'],
   ['Les documents de référence que vous lui donnez', true, 'Des documents bien choisis donnent des réponses justes.'],
   ['Son nom', false, 'Il sert seulement à le retrouver.'],
   ['Son image de profil', false, 'Pure décoration.'],
   ['Des exemples de bonnes réponses dans ses instructions', true, 'Comme pour une demande : l’IA imite les exemples.']]},
  {t:'reveal', q:'À quoi servent les « raccourcis » affichés sous un assistant personnalisé ?', a:'Ce sont des demandes toutes prêtes, comme « Récapitulatif de mes mails ». Astuce : écrivez dans les instructions ce que l’assistant doit faire quand on clique sur chaque raccourci. Sinon, il reçoit seulement le mot, sans savoir qu’il doit lancer toute une série de tâches.'},
  {t:'try', task:'Rédigez, avec l’aide de l’IA, les instructions d’un assistant pour une tâche régulière.', prompt:'Aidez-moi à écrire les instructions d’un assistant personnalisé pour cette tâche régulière : [décrivez-la].\nIncluez son rôle, ce qu’il doit toujours faire, ce qu’il ne doit jamais faire, le format des réponses et deux exemples. Posez-moi d’abord vos questions.'}
 ],
 tc24:[
  {t:'reveal', q:'Transformez cette demande en modèle réutilisable : « Rédigez le planning de l’équipe de Lyon pour la semaine du 3 mars, avec Julie en congé jeudi. »', a:'« Rédigez le planning de l’équipe de [ville] pour la semaine du [date], avec [absences]. » Ce qui change chaque semaine passe entre crochets ; le reste ne bouge plus. Rangé dans un document, ce modèle vous fait gagner du temps chaque lundi.'},
  {t:'pick', q:'Que pouvez-vous demander à l’IA de retenir pour la suite ?', yes:'Oui', no:'Non', items:[
   ['« Pas de point d’exclamation dans mes mails »', true, 'Une préférence de style.'],
   ['« Je signe toujours avec mon prénom seul »', true, 'Une habitude utile à retenir.'],
   ['Le mot de passe de votre messagerie', false, 'Jamais, même pour gagner du temps.'],
   ['« Mes comptes rendus tiennent en une page »', true, 'Un format à retenir.']]},
  {t:'try', task:'Transformez la meilleure demande écrite pendant ce parcours en modèle réutilisable.', prompt:'Voici une demande qui a bien marché : [collez-la].\nTransformez-la en modèle : remplacez ce qui change à chaque fois par des [crochets] et gardez le reste.'}
 ],
 tc25:[
  {t:'sort', q:'L’IA peut-elle vous aider, ou la décision reste-t-elle humaine ?', cats:['L’IA peut aider', 'Reste humain'], items:[
   ['Rédiger la première version d’un compte rendu', 0, 'Elle fait le premier jet, vous corrigez.'],
   ['Choisir seul quel candidat recevoir en entretien', 1, 'Une décision qui touche une personne.'],
   ['Proposer trois titres pour une annonce', 0, 'Elle propose, vous choisissez.'],
   ['Décider d’une sanction', 1, 'Jamais sans regard humain.'],
   ['Résumer un long rapport', 0, 'Un gain de temps, à relire.'],
   ['Fixer le montant d’une prime', 1, 'De l’argent et une personne : décision humaine.']]},
  {t:'reveal', q:'Vous passez plus de temps à corriger l’IA qu’à faire vous-même. Que faire ?', a:'Changez d’approche : donnez plus de contexte, ajoutez un exemple, ou faites la tâche vous-même. L’IA n’est pas obligatoire. Votre jugement et votre façon de travailler restent ce qui fait la valeur de votre travail.'},
  {t:'reveal', q:'Comment rester à jour sans passer ses journées à suivre les annonces ?', a:['Réservez une à deux heures par semaine, toujours au même moment, avec quelques sources fiables.', 'Ne courez pas après chaque nouvel outil : l’essentiel du travail se fait avec quelques outils bien maîtrisés.', 'Gardez un objectif précis : apprenez ce qui vous aide dans votre travail, pas tout ce qui sort.']},
  {t:'try', task:'Préparez la suite de votre apprentissage, avec un plan à votre mesure.', prompt:'Je suis [votre métier] et je dispose de [temps] par semaine pour progresser avec l’IA.\nProposez-moi un plan sur 4 semaines : chaque semaine, une tâche réelle de mon travail à essayer avec l’IA, et ce que je dois vérifier.'}
 ]
};
Object.entries(TRONC_ACTS).forEach(([id, acts]) => { if (LESSONS[id]) LESSONS[id].acts = acts; });
