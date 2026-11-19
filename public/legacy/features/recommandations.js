/* ——— Recommandation ——— */
const WEAK = new Set(['client','fournisseur','message','lire','notes','pdf','projet','donnees','prix','comparer','information','trouver','support','image','carte','photo','ton','langue','poste','preparer','organiser','presenter','ecrire a','reponse','repondre','courrier','lettre','devis','source','reunion','rapport','animation','evenement','cadeau','colonne','ventes','chiffre','calcul','idee','plus clair','plus court']);
const MEETING_EXTRA = ['preparer une reunion','preparer la reunion','organiser une reunion','animer une reunion'];
function detect(text) {
  const t = ' ' + norm(text).replace(/\s+/g, ' ') + ' ';
  let best = null, top = 0;
  INTENTS.forEach(it => {
    let s = 0;
    const kws = it.id === 'meeting' ? [...it.kw, ...MEETING_EXTRA] : it.kw;
    kws.forEach(k => { const nk = norm(k); if (t.includes(' ' + nk)) s += WEAK.has(nk) ? 1 : (nk.includes(' ') ? 3 : 2); });
    if (s > top) { top = s; best = it; }
  });
  return best || GENERAL;
}
function pick(intent) {
  const p = S.profile, seen = new Set();
  const ok = c => isAllowed(c.ai) && !isHidden(c.ai) && (!c.when || c.when(p)) && !seen.has(c.ai) && seen.add(c.ai);
  let list = intent.cands.filter(ok);
  if (!list.length) list = GENERAL.cands.filter(ok);
  else if (list.length < 2) list = list.concat(GENERAL.cands.filter(ok));
  return {main:list[0], alt:list[1]};
}
const markPrompt = s => { let k = 0; return esc(s).replace(/\[([^\]]+)\]/g, (_, t) => `<mark style="--m:${k++}">[${t}]</mark>`); };

/* ——— Contexte placé en tête des prompts : entreprise (dirigeant) + profil (salarié) ——— */
const low = s => String(s).charAt(0).toLowerCase() + String(s).slice(1);
/* « Autre » : on reprend ce que la personne a précisé (withOther, listWithOther : voir catalogue.js) */
const jobName = p => { const q = personaOf(p).job; return q && q.other ? withOther(p.job, q.other, p.jobOther) : (p.job || '').trim(); };
const sectorName = c => withOther(c.sector, 'Autre secteur', c.sectorOther);
const langNames = p => p.langs.map(x => x === 'Autre langue' ? (p.langsOther || '').trim() : x).filter(Boolean);
const listFr = a => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' et ' + a[a.length - 1];
const dot = s => { s = String(s).trim(); return /[.!?…]$/.test(s) ? s : s + '.'; };
/* Qui est la personne : la phrase dépend de sa situation (salarié, étudiant, freelance…) */
function whoLine(p) {
  const job = jobName(p), j = job ? low(job) : '';
  const lvl = withOther(p.studyLevel, 'Autre niveau', p.studyLevelOther);
  switch (p.situation || 'salarie') {
    case 'salarie': return j ? `Mon métier : ${j}.` : '';
    case 'etudiant': return `Je suis étudiant·e${j ? ` en ${j}` : ''}${lvl ? ` (${low(lvl)})` : ''}.`;
    case 'independant': return `Je travaille à mon compte${j ? ` : ${j}` : ''}.`;
    case 'freelance': return `Je suis freelance${j ? ` : ${j}` : ''}.`;
    case 'dirigeant': return `Je dirige une entreprise${j ? `, secteur ${j}` : ''}.`;
    case 'recherche': return `Je cherche un emploi${j && job !== 'Je ne sais pas encore' ? ` : ${j}` : ''}.`;
    case 'perso': return 'J’utilise l’IA pour ma vie personnelle.';
    default: { const sl = situationLabel(p); return sl || j ? `Ma situation : ${[sl, job].filter(Boolean).map(low).join(', ')}.` : ''; }
  }
}
/* Chaque ligne de contexte porte une clé : un prompt ne garde que les lignes utiles à sa tâche (CTX_FOR).
   « Mon profil » et le texte de mémoire, eux, les gardent toutes. */
function ctxItems(part) {
  const c = S.company, p = S.profile, L = [];
  const add = (k, t) => L.push({k, t});
  const has = id => empQuestions(p).some(q => q.id === id); /* une réponse ne compte que si la question existe encore */
  /* L'entreprise, présentée par le dirigeant : seulement dans un compte entreprise */
  if (part !== 'employee' && !isPerso()) {
    if (c.name || sectorName(c) || c.activity) {
      const size = c.size ? (c.size === '250 et plus' ? ', 250 salariés et plus' : `, ${c.size} salariés`) : '';
      const clients = listWithOther(c.clients, 'Autres clients', c.clientsOther);
      const values = listWithOther(c.values, 'Autre atout', c.valuesOther);
      const area = withOther(c.area, 'Autre zone', c.areaOther), voice = withOther(c.voice, 'Autre façon', c.voiceOther);
      add('co', `Mon entreprise : ${c.name || 'une PME'}${sectorName(c) ? `, secteur ${low(sectorName(c))}` : ''}${size}.${c.activity ? ' ' + dot(c.activity) : ''}`);
      if (clients.length) add('clients', `Nos clients : ${listFr(clients.map(low))}.`);
      if (area) add('region', `Nous travaillons ${low(area)}.`);
      if (values.length) add('values', `Ce qui nous distingue : ${listFr(values.map(low))}.`);
      if (voice) add('voice', `Avec nos clients : ${low(voice)}.`);
      if (c.rules) add('rules', `Règles de l’entreprise : ${dot(c.rules)}`);
      if (c.notes) add('co', `À savoir sur l’entreprise : ${dot(c.notes)}`);
    } else if (part !== 'company' && (p.situation || 'salarie') === 'salarie') add('co', 'Je travaille dans une PME.');
  }
  if (part !== 'company') {
    const who = whoLine(p), aud = listWithOther(p.audience, AUD_OTHER, p.audienceOther);
    if (who) add('who', who);
    const sector = withOther(p.employerSector, 'Autre secteur', p.employerSectorOther);
    if (has('employerSector') && (sector || p.employerSize)) add('co', `Mon employeur : ${[sector ? `secteur ${low(sector)}` : '', p.employerSize ? low(p.employerSize) : ''].filter(Boolean).join(', ')}.`);
    if (has('companyActivity') && p.companyActivity) add('co', `Mon entreprise : ${dot(p.companyActivity)}${p.employerSize ? ` ${p.employerSize}.` : ''}`);
    if (has('experience') && p.experience) add('exp', `Expérience : ${low(p.experience)}.`);
    if (has('project') && p.project) add('project', `En ce moment : ${dot(p.project)}`);
    if (aud.length) add('aud', `Je m’adresse surtout à : ${listFr(aud.map(low))}.`);
    if (p.tasks.includes('other') && (p.tasksOther || '').trim()) add('tasks', `J’utilise aussi l’IA pour : ${dot(p.tasksOther.trim())}`);
    if (langNames(p).some(x => x !== 'Français')) add('langs', `Langues de travail : ${listFr(langNames(p).map(low))}.`);
    if (p.tools.includes('other-ai') && (p.toolsOther || '').trim()) add('tools', `J’utilise aussi : ${dot(p.toolsOther.trim())}`);
    if (p.region) add('region', `Je suis basé·e : ${dot(p.region)}`);
    if (p.notes) add('notes', `À savoir sur moi : ${dot(p.notes)}`);
  }
  return L;
}
const ctxLines = part => ctxItems(part).map(x => x.t);
/* Le contexte utile à chaque tâche. Toujours gardés : qui je suis, les règles de l'entreprise, mes notes. */
const CTX_ALWAYS = ['who', 'rules', 'notes'];
const CTX_FOR = {
  mail: ['co', 'clients', 'voice', 'aud'],
  slides: ['co', 'clients', 'values', 'aud', 'exp', 'project'],
  summary: ['co', 'project'],
  translate: ['langs', 'aud', 'voice'],
  correct: ['aud', 'project', 'voice'],
  search: ['co', 'region', 'project', 'exp'],
  visual: ['co', 'values', 'aud', 'voice'],
  sheet: ['exp', 'tools'],
  meeting: ['co', 'aud'],
  hr: ['co', 'values', 'region'],
  ideas: ['co', 'clients', 'region', 'project', 'aud'],
};
const ctxFor = intentId => {
  const keep = CTX_FOR[intentId];
  return ctxItems().filter(x => !keep || CTX_ALWAYS.includes(x.k) || keep.includes(x.k)).map(x => x.t);
};
const contextBlock = intentId => { const L = ctxFor(intentId); return L.length ? 'Mon contexte :\n' + L.map(x => '- ' + x).join('\n') + '\n\n' : ''; };
const promptPreview = part => ctxLines(part).map(x => '- ' + x).join('\n') || 'Rien pour l’instant.';
/* Préférences de réponse : ton, format, niveau, ce qu'il faut éviter */
function prefLines() {
  const p = S.profile, L = [];
  if (formatName(p)) L.push(`Réponses : ${low(formatName(p))}.`);
  if (p.level === 'Je débute') L.push('Expliquez simplement les termes techniques.');
  else if (p.level === 'Je l’utilise régulièrement') L.push('Inutile de m’expliquer le fonctionnement de l’IA.');
  if ((p.avoid || '').trim()) L.push(`À éviter : ${dot(p.avoid.trim())}`);
  return L;
}
function prefsBlock() { const L = prefLines(); return L.length ? `\n\nMes préférences :\n${L.map(x => '- ' + x).join('\n')}` : ''; }
/* L'exemple de style collé dans le profil, coupé proprement s'il est long */
const styleSample = (max) => { const s = (S.profile.styleSample || '').trim().replace(/\s+\n/g, '\n'); return s.length > max ? s.slice(0, s.lastIndexOf(' ', max)) + '…' : s; };
const STYLE_TASKS = ['mail', 'correct', 'hr', 'visual'];

/* ——— Construction du prompt ———
   Un prompt solide, sans en faire trop : un rôle d'expert sobre, la demande telle que la personne l'a écrite,
   le contexte utile à cette tâche (rien s'il est déjà dans la mémoire de l'IA), les fichiers à joindre,
   la consigne de la tâche, les préférences, et la permission de poser des questions. Les [crochets] restent
   pour ce que seule la personne connaît ; ceux que la demande remplit déjà sont retirés. */
const EXPERTS = {
  mail: 'un expert de la communication écrite professionnelle, précis et diplomate',
  slides: 'un consultant spécialiste des présentations qui convainquent',
  summary: 'un assistant de direction rigoureux, spécialiste des comptes rendus fidèles et actionnables',
  translate: 'un traducteur professionnel, attentif au ton et aux usages du pays',
  correct: 'un correcteur et éditeur professionnel',
  search: 'un documentaliste méthodique, qui vérifie et date chacune de ses sources',
  visual: 'un directeur artistique, qui sait adapter un visuel à son public et à son support',
  sheet: 'un expert d’Excel et de l’analyse de données, pédagogue',
  meeting: 'un facilitateur de réunions efficace',
  hr: 'un chargé de recrutement expérimenté, attentif à la non-discrimination',
  ideas: 'un consultant en créativité, concret et réaliste',
  general: 'un assistant expérimenté, qui sait aller à l’essentiel'
};
function expertFor(intent, p) {
  const base = EXPERTS[intent.id] || EXPERTS.general, job = jobName(p);
  return job && (p.situation || 'salarie') !== 'etudiant' ? `${base}, qui connaît bien mon domaine (${low(job)})` : base;
}
/* Crochets génériques que la demande remplit déjà (« [sujet] », « [objet : …] », « [décrivez la tâche] ») */
const COVERED = /\[(sujet|thème|objet[^\]]*|décrivez[^\]]*|objectif)\]/gi;
function buildPrompt(intent, text) {
  const p = S.profile, ask = String(text || '').trim(), kit = kitOf(intent.id);
  let body = intent.prompt(p).replace(/^\s+/, '');
  if (ask.length > 25) body = body.replace(COVERED, (m, w) => /^d/i.test(w) ? 'ma demande ci-dessus' : /^o/i.test(w) && !/^objectif/i.test(w) ? 'l’objet de ma demande' : /^objectif/i.test(w) ? 'l’objectif de ma demande' : 'le sujet de ma demande');
  /* Publics habituels (questions au moment de la tâche) : un seul, on l'écrit ; plusieurs, on les propose */
  const pubs = kit.publics || [];
  if (pubs.length) body = body.replace(/\[qui va la voir[^\]]*\]/, pubs.length === 1 ? low(pubs[0]) : `[${listFr(pubs.map(low)).replace(' et ', ' ou ')}]`);
  if (intent.id === 'mail' && (p.signature || '').trim()) body += `\nSignez : ${p.signature.trim()}.`;
  /* Avec un skill déjà créé, l'IA a ses règles, ses fichiers et le contexte : le prompt du jour reste court. */
  if (kit.skill && SKILLS[intent.id]) {
    return `(Utilisez mon skill « ${SKILLS[intent.id].name} ».)\n\n${ask || '[votre demande]'}`
      + '\n\nAvant de commencer, posez-moi les questions qui vous manquent (trois au maximum).';
  }
  const files = kitFiles(intent.id);
  const style = !p.memoryOn && STYLE_TASKS.includes(intent.id) && styleSample(500);
  return `Vous êtes ${expertFor(intent, p)}.\n\n`
    + (ask ? `Ma demande : « ${ask.replace(/\s+/g, ' ')} »\n\n` : '')
    + (p.memoryOn ? '' : contextBlock(intent.id))
    + (files.length ? `Je joins :\n${files.map(x => '- ' + x).join('\n')}\n\n` : '')
    + `Ce que j’attends :\n${body}`
    + (style ? `\n\nImitez mon style d’écriture, dont voici un exemple :\n« ${style} »` : '')
    + prefsBlock()
    + '\n\nAvant de répondre : s’il vous manque une information indispensable, posez-moi d’abord vos questions (trois au maximum). Sinon, répondez directement.';
}

/* ——— Questions au moment de la tâche ———
   La première fois qu'une personne demande une présentation (ou un mail, un visuel…), on lui pose une
   seule fois deux ou trois questions. Ses réponses ajoutent au prompt les fichiers à joindre, et ouvrent
   la proposition de skill quand elle a déjà de quoi le remplir. */
const YES = q => ({...q, type:'yn'});
const KITS = {
  slides: [YES({id:'charte', q:'Avez-vous une charte graphique ou un modèle PowerPoint ?'}), YES({id:'exemples', q:'Avez-vous 2 ou 3 présentations que vous trouvez réussies ?'}),
    {id:'publics', q:'Pour qui faites-vous le plus souvent vos présentations ?', type:'multi', options:['Clients', 'Direction', 'Équipe', 'Partenaires ou financeurs']}],
  mail: [YES({id:'exemples', q:'Avez-vous quelques mails déjà envoyés qui ont bien marché ?'})],
  visual: [YES({id:'charte', q:'Avez-vous une charte graphique (logo, couleurs, polices) ?'}), YES({id:'exemples', q:'Avez-vous des visuels déjà publiés qui vous plaisent ?'})],
  summary: [YES({id:'modele', q:'Avez-vous un modèle de compte rendu ?'}), YES({id:'exemples', q:'Avez-vous un compte rendu que vous jugez exemplaire ?'})],
  hr: [YES({id:'exemples', q:'Avez-vous une annonce qui a attiré de bons candidats ?'})]
};
const kitOf = id => (S.kits && S.kits[id]) || {};
function kitFiles(id) {
  const k = kitOf(id), F = [];
  if (k.charte) F.push(id === 'visual' ? 'notre charte graphique : respectez strictement couleurs, polices et logo ;' : 'notre charte graphique ou notre modèle : respectez couleurs, polices, logo et mise en page ;');
  if (k.modele) F.push('notre modèle de compte rendu : suivez sa structure ;');
  if (k.exemples) F.push('des exemples réussis : inspirez-vous de leur structure, de leur ton et de leur longueur.');
  return F;
}
function kitBox(intent) {
  const qs = KITS[intent.id]; if (!qs) return '';
  const k = kitOf(intent.id);
  if (k.done) {
    const got = qs.filter(q => q.type === 'yn' && k[q.id]).map(q => q.id === 'charte' ? 'votre charte' : q.id === 'modele' ? 'votre modèle' : 'vos exemples');
    return `<p class="small muted kit-sum" data-step style="--step:1">${ic('check', 'i-sm')}${got.length ? `Le texte tient compte de ${got.join(' et de ')}, à joindre dans l’IA.` : 'Vos réponses sont enregistrées.'} <button class="ulink" type="button" data-kit-edit>Modifier mes réponses</button></p>`;
  }
  return `<div class="kit" data-step style="--step:1"><p class="label">Une seule fois, pour de meilleurs résultats</p>
    ${qs.map(q => `<div class="kit-q"><p>${esc(q.q)}</p><div class="choice" role="group" aria-label="${esc(q.q)}">${
      (q.type === 'yn' ? [['1', 'Oui'], ['0', 'Non']] : q.options.map(o => [o, o])).map(([v, l]) => `<button class="chip" type="button" data-kit="${q.id}" data-v="${esc(v)}" data-multi="${q.type === 'multi'}" aria-pressed="${q.type === 'multi' ? (k[q.id] || []).includes(v) : (k[q.id] === undefined ? false : String(+!!k[q.id]) === v)}">${esc(l)}</button>`).join('')
    }</div></div>`).join('')}
    <div class="row"><button class="btn btn-primary btn-sm" type="button" data-kit-save>Adapter mon texte</button><button class="btn btn-quiet btn-sm" type="button" data-kit-skip>Plus tard</button></div></div>`;
}

/* ——— Le contexte dans la mémoire de l'IA ———
   Plutôt que de répéter le contexte dans chaque demande, on l'enregistre une fois dans les réglages de l'IA. */
function memoryText() {
  const ctx = ctxLines(), prefs = prefLines(), p = S.profile;
  const tone = toneName(p);
  const L = ['À retenir pour toutes nos conversations.'];
  const sig = WORKING.includes(p.situation || 'salarie') && (p.signature || '').trim() ? [`Ma signature : ${p.signature.trim()}`] : [];
  if (ctx.length || sig.length) L.push('', 'Qui je suis :', ...[...ctx, ...sig].map(x => '- ' + x));
  const R = [...(tone ? [`Ton de mes écrits : ${low(tone)}.`] : []), ...prefs, 'Répondez en français, sauf si je vous demande une autre langue.', 'Si une information vous manque pour bien répondre, posez-moi la question au lieu de l’inventer.'];
  L.push('', 'Comment me répondre :', ...R.map(x => '- ' + x));
  const style = styleSample(1200);
  if (style) L.push('', 'Mon style d’écriture, à imiter quand vous rédigez pour moi :', `« ${style} »`);
  return L.join('\n');
}
const MEMORY_HOWTO = [
  {ai:'chatgpt', steps:'Paramètres › Personnalisation › Instructions personnalisées : collez le texte dans « Que doit savoir ChatGPT sur vous ? ». Vérifiez aussi que la mémoire est activée.'},
  {ai:'claude', steps:'Paramètres › Profil : collez le texte dans les préférences personnelles. Pour un sujet précis (un client, un dossier), créez plutôt un projet et collez-le dans ses instructions.'},
  {ai:'lechat', steps:'Paramètres › Mémoire ou Instructions : collez le texte. Sinon, envoyez-le dans une conversation en ajoutant « Retenez ces informations sur moi ».'},
  {ai:'copilot', steps:'Paramètres › Personnalisation et mémoire : activez la mémoire, puis envoyez le texte dans une conversation en ajoutant « Retenez ces informations sur moi ».'},
  {ai:'gemini', steps:'Paramètres › Infos enregistrées (ou Instructions pour Gemini) : collez le texte.'}
];

/* ——— Skills : pour une tâche qui revient, on prépare l'IA une fois pour toutes ———
   Un skill (Claude), un projet ou un GPT (ChatGPT), un agent (Le Chat) : des instructions permanentes,
   plus des fichiers de référence (charte graphique, exemples réussis). Ensuite, une phrase suffit. */
const SKILLS = {
  slides: {name:'Présentations', slug:'presentations', when:'une présentation, un diaporama, un PowerPoint ou un pitch',
    gather:['la charte graphique : logo, couleurs, polices, modèle PowerPoint', 'deux ou trois présentations que vous trouvez réussies', 'les règles de la maison : mentions obligatoires, mots à éviter'],
    rules:['Appliquez la charte graphique jointe : couleurs, polices, logo, place du titre.', 'Inspirez-vous des présentations d’exemple pour la structure, la densité et le ton.', 'Une idée par diapositive, un titre qui dit la conclusion, trois points au plus.', 'Terminez par une diapositive « Prochaines étapes ».'],
    ask:'Faites la présentation du lancement de [produit] pour [public], en [nombre] diapositives.'},
  mail: {name:'Mails clients', slug:'mails-clients', when:'un mail ou une réponse à un client, un fournisseur ou un partenaire',
    gather:['cinq ou six mails que vous avez envoyés et qui ont bien marché', 'votre signature et vos formules habituelles', 'les sujets délicats : retards, litiges, prix'],
    rules:['Écrivez dans le style des mails d’exemple : longueur, ton, formules.', 'Une seule demande ou information principale par mail, et une prochaine étape claire.', 'Signez avec la signature fournie.'],
    ask:'Répondez à ce client : [collez son message]. Je veux lui dire que [votre réponse].'},
  visual: {name:'Visuels', slug:'visuels', when:'un visuel, une affiche ou une publication pour les réseaux sociaux',
    gather:['la charte graphique : logo, couleurs, polices', 'trois visuels déjà publiés qui vous plaisent', 'les formats utilisés : publication carrée, story, affiche A4'],
    rules:['Respectez strictement les couleurs et les polices de la charte.', 'Reprenez le style des visuels d’exemple.', 'Un message principal, lisible en deux secondes.'],
    ask:'Créez le visuel de [événement ou offre] au format [format].'},
  summary: {name:'Comptes rendus', slug:'comptes-rendus', when:'un compte rendu ou une synthèse de réunion',
    gather:['un ou deux comptes rendus que vous jugez exemplaires', 'la liste des participants habituels et leurs rôles', 'le modèle de compte rendu de l’équipe, s’il existe'],
    rules:['Suivez la structure des comptes rendus d’exemple.', 'Séparez décisions, actions (qui, quoi, pour quand) et points en suspens.', 'N’ajoutez aucune information absente des notes.'],
    ask:'Voici mes notes de la réunion du [date] : [collez-les].'},
  hr: {name:'Annonces de recrutement', slug:'annonces-recrutement', when:'une offre d’emploi ou une annonce de recrutement',
    gather:['deux annonces qui ont attiré de bons candidats', 'la présentation de l’entreprise et ses avantages', 'les mentions obligatoires'],
    rules:['Reprenez la structure et le ton des annonces d’exemple.', 'Langage inclusif, aucune mention discriminante.', 'Terminez par la marche à suivre pour postuler.'],
    ask:'Rédigez l’annonce pour un poste de [intitulé], [type de contrat], à [lieu].'}
};
function skillText(intent) {
  const sk = SKILLS[intent.id], p = S.profile, ctx = ctxFor(intent.id);
  return [`Vous êtes ${EXPERTS[intent.id]}. Ce skill sert à préparer mes ${low(sk.name)}.`,
    ...(ctx.length && !p.memoryOn ? ['', 'Mon contexte :', ...ctx.map(x => '- ' + x)] : []),
    '', 'À chaque demande :', ...sk.rules.map((r, i) => `${i + 1}. ${r}`),
    ...(prefLines().length ? ['', 'Mes préférences :', ...prefLines().map(x => '- ' + x)] : []),
    '', 'S’il vous manque une information, posez vos questions avant de commencer. Si une demande sort du cadre de ces fichiers, dites-le.'].join('\n');
}
/* Le skill au format de Claude : un dossier avec un fichier SKILL.md (nom et usage en en-tête, puis les
   instructions) et des dossiers où la personne dépose ses fichiers de référence. */
function skillMd(intent) {
  const sk = SKILLS[intent.id], who = !isPerso() && S.company.name ? ` de ${S.company.name}` : '';
  return `---\nname: ${sk.slug}\ndescription: Prépare les ${low(sk.name)}${who} en respectant la charte et le style des exemples fournis. À utiliser dès qu’on demande ${sk.when}.\n---\n\n# ${sk.name}\n\n${skillText(intent)}\n\n## Fichiers de référence\n\nAvant chaque demande, lisez les fichiers du dossier \`ressources\` :\n\n- \`ressources/charte\` : charte graphique, logo, modèle ;\n- \`ressources/exemples\` : exemples réussis à imiter.\n`;
}
function skillZip(intent) {
  const sk = SKILLS[intent.id], enc = new TextEncoder(), dir = `${sk.slug}/`;
  const lisez = t => enc.encode(`Déposez ici ${t}, puis compressez le dossier ${sk.slug} et importez-le dans Claude.\n`);
  return zipBlob([
    {name:dir + 'SKILL.md', data:enc.encode(skillMd(intent))},
    {name:dir + 'ressources/charte/LISEZMOI.txt', data:lisez('votre charte graphique, votre logo ou votre modèle')},
    {name:dir + 'ressources/exemples/LISEZMOI.txt', data:lisez('2 ou 3 exemples réussis')}
  ]);
}
/* Petit fichier ZIP, sans compression (format « stored ») : assez pour un dossier de quelques fichiers texte. */
const CRC_T = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = d => { let c = 0xFFFFFFFF; for (let i = 0; i < d.length; i++) c = CRC_T[(c ^ d[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
function zipBlob(files) {
  const enc = new TextEncoder(), parts = [], central = []; let off = 0;
  files.forEach(f => {
    const name = enc.encode(f.name), crc = crc32(f.data), n = f.data.length;
    const h = new DataView(new ArrayBuffer(30));
    [[0, 0x04034b50, 4], [4, 20, 2], [6, 0x0800, 2], [8, 0, 2], [10, 0, 2], [12, 0x21, 2], [14, crc, 4], [18, n, 4], [22, n, 4], [26, name.length, 2], [28, 0, 2]].forEach(([o, v, s]) => s === 4 ? h.setUint32(o, v, true) : h.setUint16(o, v, true));
    const c = new DataView(new ArrayBuffer(46));
    [[0, 0x02014b50, 4], [4, 20, 2], [6, 20, 2], [8, 0x0800, 2], [10, 0, 2], [12, 0, 2], [14, 0x21, 2], [16, crc, 4], [20, n, 4], [24, n, 4], [28, name.length, 2], [30, 0, 2], [32, 0, 2], [34, 0, 2], [36, 0, 2], [38, 0, 4], [42, off, 4]].forEach(([o, v, s]) => s === 4 ? c.setUint32(o, v, true) : c.setUint16(o, v, true));
    parts.push(h, name, f.data); central.push(c, name);
    off += 30 + name.length + n;
  });
  const size = central.reduce((s, x) => s + x.byteLength, 0), e = new DataView(new ArrayBuffer(22));
  [[0, 0x06054b50, 4], [4, 0, 2], [6, 0, 2], [8, files.length, 2], [10, files.length, 2], [12, size, 4], [16, off, 4], [20, 0, 2]].forEach(([o, v, s]) => s === 4 ? e.setUint32(o, v, true) : e.setUint16(o, v, true));
  return new Blob([...parts, ...central, e], {type:'application/zip'});
}
function skillBox(intent) {
  const sk = SKILLS[intent.id]; if (!sk) return '';
  const id = 'skill-' + intent.id, k = kitOf(intent.id), ready = k.charte || k.exemples || k.modele;
  return `<details class="skillbox" data-step style="--step:3"${ready && !k.skill ? ' open' : ''}><summary>${ic('spark', 'i-sm')}<span>${k.skill ? `<b>Votre skill « ${esc(sk.name)} » est prêt.</b> Le texte à copier en tient compte.` : ready ? `<b>Vous avez déjà de quoi créer un skill.</b> Préparez l’IA une fois pour toutes` : `<b>Vous faites souvent des ${esc(low(sk.name))} ?</b> Préparez l’IA une fois pour toutes`}</span></summary>
    <div class="skillbox-in">
      <p>Créez un <b>skill</b> dans Claude (ou un projet, ou un GPT dans ChatGPT) : vous y déposez une fois vos fichiers de référence et vos règles. Ensuite, une phrase suffit.</p>
      <div class="skill-cols"><div><p class="label">1. Rassemblez</p><ul class="ticks">${sk.gather.map(g => `<li>${ic('check', 'i-sm')}<span>${esc(g)}</span></li>`).join('')}</ul></div>
        <div><p class="label">2. Créez-le</p><p class="small">Le plus simple dans Claude : téléchargez le dossier du skill, ajoutez vos fichiers dans <code>ressources</code>, compressez-le, puis importez-le (Paramètres › Capacités › Skills). Dans ChatGPT : un projet ou un GPT, avec les instructions ci-dessous.</p>
        <p class="small muted">Les intitulés des menus changent selon les versions.</p>
        <button class="btn btn-ghost btn-sm" type="button" data-skill-zip="${intent.id}">${ic('doc', 'i-sm')}Télécharger le skill pour Claude</button></div></div>
      <div class="prompt"><div class="prompt-h"><span>3. Les instructions du skill</span><button class="btn btn-quiet copy" type="button" data-copy-skill="${id}">${ic('copy', 'i-sm')}Copier</button></div><pre id="${id}">${esc(skillText(intent))}</pre></div>
      <p class="small"><b>4. Ensuite, il suffit d’écrire :</b> « ${esc(sk.ask)} »</p>
      <label class="lchk mem-on"><input type="checkbox" data-skill-done="${intent.id}"${k.skill ? ' checked' : ''}><span>C’est fait : j’ai créé ce skill. Le texte à copier devient une simple phrase.</span></label>
    </div></details>`;
}

/* ——— Dernière demande : conservée quand on ouvre une fiche puis qu'on revient ——— */
let lastAsk = null;
try { lastAsk = JSON.parse(sessionStorage.getItem(KEY + '-ask')); } catch (e) {}
function keepAsk(v) { lastAsk = v; try { v ? sessionStorage.setItem(KEY + '-ask', JSON.stringify(v)) : sessionStorage.removeItem(KEY + '-ask'); } catch (e) {} }

function clearAskErr() {
  const er = $('#askErr'), ta = $('#askInput'), box = $('.ask-box');
  if (er) er.hidden = true; if (ta) ta.removeAttribute('aria-invalid'); if (box) box.classList.remove('invalid');
}
function runReco(text, instant, chip) {
  const out = $('#result'); if (!out) return;
  clearAskErr();
  const intent = detect(text), {main, alt} = pick(intent);
  keepAsk({text, chip:chip || null, t:instant && lastAsk && lastAsk.t ? lastAsk.t : Date.now()});
  if (instant) return renderReco(out, text, intent, main, alt, true);
  renderReco(out, text, intent, main, alt);
  /* Recommandation par l'IA de Bibl.IA (back, src/api/client.js) : tant qu'elle n'est pas branchée, elle
     répond null et le calcul local ci-dessus reste affiché. La demande est lue puis effacée (contrat § 7). */
  if (window.BiblAPI && window.BiblAPI.recommander) {
    window.BiblAPI.recommander({
      demande:text, profil:S.profile, entreprise:isPerso() ? null : S.company,
      ia_disponibles:visibleAIs().map(a => a.id),
      deja_en_place:{memoire:!!S.profile.memoryOn, fichiers:S.kits || {}}
    }).then(r => { if (r && r.prompt && AI[r.ia] && $('#result') === out) renderReco(out, text, intent, {ai:r.ia, why:r.pourquoi}, alt, true, r.prompt); }).catch(() => {});
  }
  requestAnimationFrame(() => out.scrollIntoView({behavior:RM.matches ? 'auto' : 'smooth', block:'nearest'}));
}

function renderReco(out, text, intent, main, alt, instant, override) {
  if (!main) {
    out.innerHTML = `<div class="notice">${ic('lock')}<span>Aucune IA ${allowedPhrase()} ne correspond à cette tâche pour l’instant. Vous pouvez <a class="ulink" href="#bibliotheque" data-act="suggest">suggérer une IA</a>${isPerso() ? '' : ' à votre responsable'}.</span></div>`;
    return;
  }
  const a = AI[main.ai], p = S.profile, prompt = override || buildPrompt(intent, text), lesson = LESSONS[`${a.id}-31`];
  const src = [!isPerso() && S.company.done ? 'la présentation de votre entreprise' : '', p.done ? 'votre profil' : ''].filter(Boolean);
  const fit = src.length ? `Texte personnalisé avec ${src.join(' et ')}.${p.done ? '' : ` <a class="ulink" href="#profil" data-act="onboard">Complétez votre profil</a> pour l’affiner.`}` : `Conseil général. <a class="ulink" href="#profil" data-act="onboard">Complétez votre profil</a> pour des textes sur mesure.`;
  const tip = JOB_TIPS[p.job];
  const key = intent.id + ':' + a.id;
  out.innerHTML = `<article class="reco${instant ? ' no-anim' : ''}" style="--b:${a.color}" aria-label="Recommandation">
    <header class="reco-top">${tile(a.id, 'tile-lg')}
      <div class="stack" style="gap:6px;min-width:0"><p class="label">L’IA la plus adaptée</p><h2 class="h3">${esc(a.name)}</h2>
      <p class="checked">${ic('check', 'i-sm')}Choisie parmi les ${visibleAIs().length} IA ${allowedPhrase()}${jobName(p) ? `, pour votre métier : ${esc(low(jobName(p)))}` : ''}</p></div>
    </header>
    <div class="reco-grid">
      <div class="reco-main">
        <div class="stack" data-step style="--step:0;gap:10px"><p class="label">Pourquoi</p><p class="why">${esc(main.why)}</p><p class="small muted">${fit}</p></div>
        ${override ? '' : kitBox(intent)}
        <div class="prompt" data-step style="--step:1"><div class="prompt-h"><span>Le texte à copier dans l’IA <span class="tiny" style="font-weight:400">(on l’appelle un « prompt »)</span></span><button class="btn btn-quiet copy" type="button" id="copyBtn">${ic('copy', 'i-sm')}Copier</button></div><pre id="promptText">${markPrompt(prompt)}</pre></div>
        <div class="row" data-step style="--step:2">
          <a class="btn btn-cta has-arrow" href="${a.url}" target="_blank" rel="noopener">Ouvrir ${esc(a.short || a.name)} ${ic('ext', 'i-sm')}</a>
          <a class="btn btn-ghost has-arrow" href="#ia-${a.id}">Voir la fiche ${ARW}</a>
          ${lesson ? `<a class="link has-arrow" href="#lecon-${lesson.id}" style="margin-left:8px">${ic('cap', 'i-sm')}Apprendre en ${lesson.dur} min ${ARW}</a>` : ''}
        </div>
        ${tip ? `<p class="callout" data-step style="--step:3"><strong style="font-weight:500">Le bon réflexe · </strong>${esc(tip)}</p>` : ''}
        ${skillBox(intent)}
      </div>
      <aside class="reco-side">
        ${alt ? `<div class="alt" data-step style="--step:2"><p class="label">Autre option possible</p>
          <a class="alt-card" href="#ia-${alt.ai}">${tile(alt.ai)}<span class="stack" style="gap:4px"><strong style="font-weight:500">${esc(AI[alt.ai].name)}</strong><span class="small muted">${esc(alt.why)}</span></span></a></div>` : ''}
        <div class="rate" data-step style="--step:3"><p class="small">Cette recommandation vous a-t-elle aidé ?</p>
          <div class="row" id="rateRow">
            <button class="btn btn-ghost vote" type="button" data-vote="up" aria-pressed="${S.ratings[key] === 'up'}"><span class="thumb">${ic('up', 'i-sm')}</span>Utile</button>
            <button class="btn btn-ghost vote" type="button" data-vote="down" aria-pressed="${S.ratings[key] === 'down'}"><span class="thumb">${ic('down', 'i-sm')}</span>Pas pertinente</button>
          </div><div id="rateMsg"></div>
          <button class="btn btn-quiet" type="button" id="newAsk" style="align-self:flex-start">${ic('refresh', 'i-sm')}Faire une nouvelle demande</button>
        </div>
      </aside>
    </div></article>`;
  $('#copyBtn', out).addEventListener('click', e => copyText(prompt, e.currentTarget, $('#promptText', out)));
  $$('[data-copy-skill]', out).forEach(b => b.addEventListener('click', () => { const pre = $('#' + b.dataset.copySkill, out); copyText(pre.textContent, b, pre); }));
  $$('.vote', out).forEach(b => b.addEventListener('click', () => {
    S.ratings[key] = b.dataset.vote; save();
    $$('.vote', out).forEach(x => x.setAttribute('aria-pressed', x === b));
    $('#rateMsg', out).innerHTML = b.dataset.vote === 'up'
      ? '<p class="rate-thanks">Merci ! Votre avis est enregistré.</p>'
      : `<div class="stack rate-thanks"><p>Merci. Qu’est-ce qui n’allait pas ?</p><div class="row">${['Pas la bonne IA', 'Texte pas adapté', 'Explication pas claire'].map(r => `<button class="chip" type="button" data-why>${r}</button>`).join('')}</div></div>`;
    $$('[data-why]', out).forEach(c => c.addEventListener('click', () => { $('#rateMsg', out).innerHTML = `<p class="rate-thanks">Noté. ${alt ? `Essayez l’autre option, ${esc(AI[alt.ai].name)}, ou reformulez votre demande.` : 'Essayez de reformuler votre demande.'}</p>`; }));
  }));
  /* Questions au moment de la tâche : on garde les réponses, puis on réécrit la recommandation sans animation */
  const redraw = () => renderReco(out, text, intent, main, alt, true);
  const kitState = Object.assign({}, kitOf(intent.id));
  $$('[data-kit]', out).forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.kit, v = b.dataset.v;
    if (b.dataset.multi === 'true') { const s = new Set(kitState[id] || []); s.has(v) ? s.delete(v) : s.add(v); kitState[id] = [...s]; b.setAttribute('aria-pressed', s.has(v)); }
    else { kitState[id] = v === '1'; $$(`[data-kit="${id}"]`, out).forEach(x => x.setAttribute('aria-pressed', x === b)); }
  }));
  const ks = $('[data-kit-save]', out); if (ks) ks.addEventListener('click', () => { S.kits = Object.assign({}, S.kits, {[intent.id]:Object.assign(kitState, {done:true})}); save(); redraw(); toast('Noté. Le texte à copier en tient compte.'); });
  const kk = $('[data-kit-skip]', out); if (kk) kk.addEventListener('click', () => { const k = $('.kit', out); k && k.remove(); });
  const ke = $('[data-kit-edit]', out); if (ke) ke.addEventListener('click', () => { S.kits[intent.id] = Object.assign({}, kitOf(intent.id), {done:false}); save(); redraw(); });
  const kz = $('[data-skill-zip]', out); if (kz) kz.addEventListener('click', () => {
    const url = URL.createObjectURL(skillZip(intent)), a = document.createElement('a');
    a.href = url; a.download = SKILLS[intent.id].slug + '.zip'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Dossier du skill téléchargé. Ajoutez vos fichiers dans « ressources », puis importez-le dans Claude.');
  });
  const kd = $('[data-skill-done]', out); if (kd) kd.addEventListener('change', () => { S.kits = Object.assign({}, S.kits, {[intent.id]:Object.assign({}, kitOf(intent.id), {skill:kd.checked})}); save(); redraw(); });
  $('#newAsk', out).addEventListener('click', () => {
    keepAsk(null); out.innerHTML = ''; const t = $('#askInput'); t.value = ''; t.dispatchEvent(new Event('input'));
    $$('#chips .chip').forEach(c => c.setAttribute('aria-pressed', 'false'));
    $('#hero').scrollIntoView({behavior:RM.matches ? 'auto' : 'smooth'}); setTimeout(() => t.focus({preventScroll:true}), 350);
  });
  armHover(out);
}

