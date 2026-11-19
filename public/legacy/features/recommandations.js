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
function ctxLines(part) {
  const c = S.company, p = S.profile, L = [];
  const has = id => empQuestions(p).some(q => q.id === id); /* une réponse ne compte que si la question existe encore */
  /* L'entreprise, présentée par le dirigeant : seulement dans un compte entreprise */
  if (part !== 'employee' && !isPerso()) {
    if (c.name || sectorName(c) || c.activity) {
      const size = c.size ? (c.size === '250 et plus' ? ', 250 salariés et plus' : `, ${c.size} salariés`) : '';
      const clients = listWithOther(c.clients, 'Autres clients', c.clientsOther);
      const values = listWithOther(c.values, 'Autre atout', c.valuesOther);
      const area = withOther(c.area, 'Autre zone', c.areaOther), voice = withOther(c.voice, 'Autre façon', c.voiceOther);
      L.push(`Mon entreprise : ${c.name || 'une PME'}${sectorName(c) ? `, secteur ${low(sectorName(c))}` : ''}${size}.${c.activity ? ' ' + dot(c.activity) : ''}`);
      if (clients.length) L.push(`Nos clients : ${listFr(clients.map(low))}.`);
      if (area) L.push(`Nous travaillons ${low(area)}.`);
      if (values.length) L.push(`Ce qui nous distingue : ${listFr(values.map(low))}.`);
      if (voice) L.push(`Avec nos clients : ${low(voice)}.`);
      if (c.rules) L.push(`Règles de l’entreprise : ${dot(c.rules)}`);
      if (c.notes) L.push(`À savoir sur l’entreprise : ${dot(c.notes)}`);
    } else if (part !== 'company' && (p.situation || 'salarie') === 'salarie') L.push('Je travaille dans une PME.');
  }
  if (part !== 'company') {
    const who = whoLine(p), aud = listWithOther(p.audience, AUD_OTHER, p.audienceOther);
    if (who) L.push(who);
    const sector = withOther(p.employerSector, 'Autre secteur', p.employerSectorOther);
    if (has('employerSector') && (sector || p.employerSize)) L.push(`Mon employeur : ${[sector ? `secteur ${low(sector)}` : '', p.employerSize ? low(p.employerSize) : ''].filter(Boolean).join(', ')}.`);
    if (has('companyActivity') && p.companyActivity) L.push(`Mon entreprise : ${dot(p.companyActivity)}${p.employerSize ? ` ${p.employerSize}.` : ''}`);
    if (has('experience') && p.experience) L.push(`Expérience : ${low(p.experience)}.`);
    if (has('project') && p.project) L.push(`En ce moment : ${dot(p.project)}`);
    if (aud.length) L.push(`Je m’adresse surtout à : ${listFr(aud.map(low))}.`);
    if (p.tasks.includes('other') && (p.tasksOther || '').trim()) L.push(`J’utilise aussi l’IA pour : ${dot(p.tasksOther.trim())}`);
    if (langNames(p).some(x => x !== 'Français')) L.push(`Langues de travail : ${listFr(langNames(p).map(low))}.`);
    if (p.tools.includes('other-ai') && (p.toolsOther || '').trim()) L.push(`J’utilise aussi : ${dot(p.toolsOther.trim())}`);
    if (p.region) L.push(`Je suis basé·e : ${dot(p.region)}`);
    if (p.notes) L.push(`À savoir sur moi : ${dot(p.notes)}`);
  }
  return L;
}
const contextBlock = () => { const L = ctxLines(); return L.length ? 'Mon contexte :\n' + L.map(x => '- ' + x).join('\n') + '\n\n' : ''; };
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

/* ——— Construction du prompt ———
   Un prompt solide, sans en faire trop : un rôle d'expert, la demande telle que la personne l'a écrite,
   son contexte (sauf s'il est déjà dans la mémoire de l'IA), la consigne de la tâche, ses préférences,
   et la permission de poser des questions avant de répondre. Les [crochets] restent pour ce que seule
   la personne connaît. */
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
function buildPrompt(intent, text) {
  const p = S.profile, ask = String(text || '').trim();
  let body = intent.prompt(p).replace(/^\s+/, '');
  if (intent.id === 'mail' && (p.signature || '').trim()) body += `\nSignez : ${p.signature.trim()}.`;
  const ctx = p.memoryOn ? '' : contextBlock();
  return `Vous êtes ${expertFor(intent, p)}.\n\n`
    + (ask ? `Ma demande : « ${ask.replace(/\s+/g, ' ')} »\n\n` : '')
    + ctx
    + `Ce que j’attends :\n${body}`
    + prefsBlock()
    + '\n\nAvant de répondre : s’il vous manque une information indispensable, posez-moi d’abord vos questions (trois au maximum). Sinon, répondez directement.';
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
  slides: {name:'Présentations', gather:['la charte graphique : logo, couleurs, polices, modèle PowerPoint', 'deux ou trois présentations que vous trouvez réussies', 'les règles de la maison : mentions obligatoires, mots à éviter'],
    rules:['Appliquez la charte graphique jointe : couleurs, polices, logo, place du titre.', 'Inspirez-vous des présentations d’exemple pour la structure, la densité et le ton.', 'Une idée par diapositive, un titre qui dit la conclusion, trois points au plus.', 'Terminez par une diapositive « Prochaines étapes ».'],
    ask:'Faites la présentation du lancement de [produit] pour [public], en [nombre] diapositives.'},
  mail: {name:'Mails clients', gather:['cinq ou six mails que vous avez envoyés et qui ont bien marché', 'votre signature et vos formules habituelles', 'les sujets délicats : retards, litiges, prix'],
    rules:['Écrivez dans le style des mails d’exemple : longueur, ton, formules.', 'Une seule demande ou information principale par mail, et une prochaine étape claire.', 'Signez avec la signature fournie.'],
    ask:'Répondez à ce client : [collez son message]. Je veux lui dire que [votre réponse].'},
  visual: {name:'Visuels', gather:['la charte graphique : logo, couleurs, polices', 'trois visuels déjà publiés qui vous plaisent', 'les formats utilisés : publication carrée, story, affiche A4'],
    rules:['Respectez strictement les couleurs et les polices de la charte.', 'Reprenez le style des visuels d’exemple.', 'Un message principal, lisible en deux secondes.'],
    ask:'Créez le visuel de [événement ou offre] au format [format].'},
  summary: {name:'Comptes rendus', gather:['un ou deux comptes rendus que vous jugez exemplaires', 'la liste des participants habituels et leurs rôles', 'le modèle de compte rendu de l’équipe, s’il existe'],
    rules:['Suivez la structure des comptes rendus d’exemple.', 'Séparez décisions, actions (qui, quoi, pour quand) et points en suspens.', 'N’ajoutez aucune information absente des notes.'],
    ask:'Voici mes notes de la réunion du [date] : [collez-les].'},
  hr: {name:'Annonces de recrutement', gather:['deux annonces qui ont attiré de bons candidats', 'la présentation de l’entreprise et ses avantages', 'les mentions obligatoires'],
    rules:['Reprenez la structure et le ton des annonces d’exemple.', 'Langage inclusif, aucune mention discriminante.', 'Terminez par la marche à suivre pour postuler.'],
    ask:'Rédigez l’annonce pour un poste de [intitulé], [type de contrat], à [lieu].'}
};
function skillText(intent) {
  const sk = SKILLS[intent.id], p = S.profile, ctx = ctxLines();
  return [`Vous êtes ${EXPERTS[intent.id]}. Ce skill sert à préparer mes ${low(sk.name)}.`,
    ...(ctx.length && !p.memoryOn ? ['', 'Mon contexte :', ...ctx.map(x => '- ' + x)] : []),
    '', 'À chaque demande :', ...sk.rules.map((r, i) => `${i + 1}. ${r}`),
    ...(prefLines().length ? ['', 'Mes préférences :', ...prefLines().map(x => '- ' + x)] : []),
    '', 'S’il vous manque une information, posez vos questions avant de commencer. Si une demande sort du cadre de ces fichiers, dites-le.'].join('\n');
}
function skillBox(intent) {
  const sk = SKILLS[intent.id]; if (!sk) return '';
  const id = 'skill-' + intent.id;
  return `<details class="skillbox" data-step style="--step:3"><summary>${ic('spark', 'i-sm')}<span><b>Vous faites souvent des ${esc(low(sk.name))} ?</b> Préparez l’IA une fois pour toutes</span></summary>
    <div class="skillbox-in">
      <p>Créez un <b>skill</b> dans Claude (ou un projet, ou un GPT dans ChatGPT) : vous y déposez une fois vos fichiers de référence et vos règles. Ensuite, une phrase suffit.</p>
      <div class="skill-cols"><div><p class="label">1. Rassemblez</p><ul class="ticks">${sk.gather.map(g => `<li>${ic('check', 'i-sm')}<span>${esc(g)}</span></li>`).join('')}</ul></div>
        <div><p class="label">2. Créez-le</p><p class="small">Dans Claude : Projets › Nouveau projet, ou Paramètres › Capacités › Skills. Dans ChatGPT : un projet, ou Explorer les GPT › Créer. Déposez les fichiers, puis collez les instructions ci-dessous.</p>
        <p class="small muted">Les intitulés des menus changent selon les versions.</p></div></div>
      <div class="prompt"><div class="prompt-h"><span>3. Les instructions du skill</span><button class="btn btn-quiet copy" type="button" data-copy-skill="${id}">${ic('copy', 'i-sm')}Copier</button></div><pre id="${id}">${esc(skillText(intent))}</pre></div>
      <p class="small"><b>4. Ensuite, il suffit d’écrire :</b> « ${esc(sk.ask)} »</p>
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
  requestAnimationFrame(() => out.scrollIntoView({behavior:RM.matches ? 'auto' : 'smooth', block:'nearest'}));
}

function renderReco(out, text, intent, main, alt, instant) {
  if (!main) {
    out.innerHTML = `<div class="notice">${ic('lock')}<span>Aucune IA ${allowedPhrase()} ne correspond à cette tâche pour l’instant. Vous pouvez <a class="ulink" href="#bibliotheque" data-act="suggest">suggérer une IA</a>${isPerso() ? '' : ' à votre responsable'}.</span></div>`;
    return;
  }
  const a = AI[main.ai], p = S.profile, prompt = buildPrompt(intent, text), lesson = LESSONS[`${a.id}-31`];
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
  $('#newAsk', out).addEventListener('click', () => {
    keepAsk(null); out.innerHTML = ''; const t = $('#askInput'); t.value = ''; t.dispatchEvent(new Event('input'));
    $$('#chips .chip').forEach(c => c.setAttribute('aria-pressed', 'false'));
    $('#hero').scrollIntoView({behavior:RM.matches ? 'auto' : 'smooth'}); setTimeout(() => t.focus({preventScroll:true}), 350);
  });
  armHover(out);
}

