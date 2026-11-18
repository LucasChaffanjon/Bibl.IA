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
  if (part !== 'employee') {
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
      if (c.rules) L.push(`Règles à respecter : ${dot(c.rules)}`);
      if (c.notes) L.push(`À savoir sur l’entreprise : ${dot(c.notes)}`);
    } else if (part !== 'company' && (p.situation || 'salarie') === 'salarie') L.push('Je travaille dans une PME.');
  }
  if (part !== 'company') {
    const who = whoLine(p), aud = listWithOther(p.audience, AUD_OTHER, p.audienceOther);
    if (who) L.push(who);
    if (aud.length) L.push(`Je m’adresse surtout à : ${listFr(aud.map(low))}.`);
    if (p.tasks.includes('other') && (p.tasksOther || '').trim()) L.push(`J’utilise aussi l’IA pour : ${dot(p.tasksOther.trim())}`);
    if (langNames(p).some(x => x !== 'Français')) L.push(`Langues de travail : ${listFr(langNames(p).map(low))}.`);
    if (p.tools.includes('other-ai') && (p.toolsOther || '').trim()) L.push(`J’utilise aussi : ${dot(p.toolsOther.trim())}`);
    if (p.notes) L.push(`À savoir sur moi : ${dot(p.notes)}`);
  }
  return L;
}
const contextBlock = () => 'Contexte :\n' + ctxLines().map(x => '- ' + x).join('\n') + '\n\n';
const promptPreview = part => ctxLines(part).map(x => '- ' + x).join('\n') || 'Rien pour l’instant.';
function prefsBlock() {
  const p = S.profile, L = [];
  if (formatName(p)) L.push('réponses ' + low(formatName(p)));
  if (p.level === 'Je débute') L.push('expliquez simplement les termes techniques');
  return L.length ? `\n\nMes préférences : ${L.join(' ; ')}.` : '';
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
    out.innerHTML = `<div class="notice">${ic('lock')}<span>Aucune IA autorisée par votre entreprise ne correspond à cette tâche pour l’instant. Vous pouvez <a class="ulink" href="#bibliotheque" data-act="suggest">suggérer une IA</a> à votre responsable.</span></div>`;
    return;
  }
  const a = AI[main.ai], p = S.profile, prompt = intent.prompt(p) + prefsBlock(), lesson = LESSONS[`${a.id}-31`];
  const src = [S.company.done ? 'la présentation de votre entreprise' : '', p.done ? 'votre profil' : ''].filter(Boolean);
  const fit = src.length ? `Texte personnalisé avec ${src.join(' et ')}.${p.done ? '' : ` <a class="ulink" href="#profil" data-act="onboard">Complétez votre profil</a> pour l’affiner.`}` : `Conseil général. <a class="ulink" href="#profil" data-act="onboard">Complétez votre profil</a> pour des textes sur mesure.`;
  const tip = JOB_TIPS[p.job];
  const key = intent.id + ':' + a.id;
  out.innerHTML = `<article class="reco${instant ? ' no-anim' : ''}" style="--b:${a.color}" aria-label="Recommandation">
    <header class="reco-top">${tile(a.id, 'tile-lg')}
      <div class="stack" style="gap:6px;min-width:0"><p class="label">L’IA la plus adaptée</p><h2 class="h3">${esc(a.name)}</h2>
      <p class="checked">${ic('check', 'i-sm')}Choisie parmi les ${visibleAIs().length} IA autorisées par votre entreprise${jobName(p) ? `, pour votre métier : ${esc(low(jobName(p)))}` : ''}</p></div>
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

