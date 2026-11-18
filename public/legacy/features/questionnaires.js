/* ——— Questionnaires (profil salarié, présentation de l’entreprise) ——— */
const chipSet = (items, sel, name, multi) => `<div class="choice" role="group">${items.map(it => {
  const id = typeof it === 'string' ? it : it.id, label = typeof it === 'string' ? it : it.label;
  return `<button class="chip" type="button" data-${name}="${esc(id)}" aria-pressed="${multi ? (sel || []).includes(id) : sel === id}">${esc(label)}</button>`; }).join('')}</div>`;
/* form-labels : chaque champ est relié à sa question (et à son aide) pour les lecteurs d'écran */
function qField(q, val, other) {
  const lab = `aria-labelledby="qt-${q.id}"${q.help ? ` aria-describedby="qh-${q.id}"` : ''}`;
  if (q.type === 'single' || q.type === 'multi') {
    const on = q.other && (q.type === 'multi' ? (val || []).includes(q.other) : val === q.other);
    const extra = q.other ? `<input class="input other-input" id="q-${q.id}-other" type="text" value="${esc(other)}" placeholder="${esc(q.otherPh || 'Précisez')}" aria-label="${esc(q.otherPh || 'Précisez')}" autocomplete="off"${on ? '' : ' hidden'}>` : '';
    return chipSet(q.options, val, 'q-' + q.id, q.type === 'multi').replace('role="group"', `role="group" ${lab}`) + extra;
  }
  if (q.type === 'text') return `<input class="input" id="q-${q.id}" type="text" ${lab} value="${esc(val)}" placeholder="${esc(q.ph || '')}" autocomplete="off">`;
  return `<textarea class="input" id="q-${q.id}" rows="4" ${lab} placeholder="${esc(q.ph || '')}">${esc(val)}</textarea>`;
}
function bindQ(scope, q, data) {
  if (q.type === 'text' || q.type === 'textarea') { const el = $('#q-' + q.id, scope); if (el) el.addEventListener('input', () => data[q.id] = el.value); return; }
  const attr = 'data-q-' + q.id, multi = q.type === 'multi', oth = $(`#q-${q.id}-other`, scope);
  if (oth) oth.addEventListener('input', () => data[q.id + 'Other'] = oth.value);
  $$(`[${attr}]`, scope).forEach(b => b.addEventListener('click', () => {
    const id = b.getAttribute(attr);
    if (multi) {
      let v = data[q.id] || [];
      v = v.includes(id) ? v.filter(x => x !== id) : [...v, id];
      if (q.exclusive) v = id === q.exclusive ? v.filter(x => x === q.exclusive) : v.filter(x => x !== q.exclusive);
      data[q.id] = v;
    } else data[q.id] = data[q.id] === id ? '' : id;
    if (q.adapt) adaptProfile(data);
    const cur = data[q.id];
    $$(`[${attr}]`, scope).forEach(x => x.setAttribute('aria-pressed', multi ? cur.includes(x.getAttribute(attr)) : cur === x.getAttribute(attr)));
    if (oth) {
      const show = multi ? cur.includes(q.other) : cur === q.other;
      if (show && oth.hidden) { oth.hidden = false; oth.classList.remove('appear'); void oth.offsetWidth; oth.classList.add('appear'); if (id === q.other) oth.focus(); }
      else if (!show) oth.hidden = true;
    }
    /* La situation a changé : les questions suivantes changent aussi */
    if (q.adapt) scope.dispatchEvent(new CustomEvent('q-adapt', {bubbles:true}));
  }));
}
/* Fenêtre « une question à la fois » */
/* questions : une liste, ou une fonction qui la calcule à partir des réponses (le profil s'adapte à la situation) */
function openQuiz({label, questions: qsrc, data, onDone, done}) {
  let step = 0, questions = [], N = 0;
  const refresh = () => { questions = typeof qsrc === 'function' ? qsrc(data) : qsrc; N = questions.length; };
  refresh();
  const render = () => {
    refresh();
    if (step >= N) return `<div class="modal-top"><span class="small muted">${esc(label)}</span><button class="rp-close" data-close aria-label="Fermer">${ic('x')}</button></div>
      <div class="modal-in"><div class="onb-pane">${DONE_MARK}<h2 class="h3">${esc(done.title)}</h2><p class="lead">${esc(done.text)}</p>
        <div class="ctx"><p class="label">Ajouté au début des textes à copier</p><pre>${esc(done.preview())}</pre></div></div>
      <div class="row" style="margin-top:28px;justify-content:flex-end"><button class="btn btn-primary has-arrow" type="button" id="qNext">${esc(done.btn)} ${ARW}</button></div></div>`;
    const q = questions[step];
    return `<div class="modal-top"><span class="small muted">${esc(label)} · question ${step + 1} sur ${N}</span><button class="rp-close" data-close aria-label="Fermer">${ic('x')}</button></div>
      <div class="modal-in"><div class="onb-steps" aria-hidden="true">${questions.map((x, i) => `<i class="${i <= step ? 'on' : ''}"></i>`).join('')}</div>
      <div class="onb-pane"><h2 class="h3" id="qt-${q.id}">${esc(q.title)}</h2>${q.help ? `<p class="muted" id="qh-${q.id}">${esc(q.help)}</p>` : ''}${qField(q, data[q.id], data[q.id + 'Other'])}</div>
      <div class="row" style="margin-top:28px;justify-content:space-between">${step > 0 ? '<button class="btn btn-ghost" type="button" id="qBack">Retour</button>' : '<span></span>'}
        <span class="row"><button class="btn btn-quiet" type="button" id="qSkip">Passer</button><button class="btn btn-primary has-arrow" type="button" id="qNext">${step === N - 1 ? 'Terminer' : 'Continuer'} ${ARW}</button></span></div></div>`;
  };
  const m = openModal(render(), {label});
  const box = $('.modal-box', m);
  const go = () => { if (step === N - 1) onDone(data); step++; draw(); };
  const bind = () => {
    if (step < N) bindQ(box, questions[step], data);
    const bk = $('#qBack', box); if (bk) bk.addEventListener('click', () => { step--; draw(); });
    const sk = $('#qSkip', box); if (sk) sk.addEventListener('click', go);
    $('#qNext', box).addEventListener('click', () => { if (step >= N) { closeModal(); done.after && done.after(); } else go(); });
  };
  const draw = () => {
    box.innerHTML = render(); bind();
    const f = step < N ? ($('#q-' + questions[step].id, box) || $('.choice .chip', box)) : null;
    (f || $('#qNext', box)).focus();
  };
  bind();
}
function openOnboarding() {
  openQuiz({label:'Mon profil', questions:empQuestions, data:JSON.parse(JSON.stringify(S.profile)),
    onDone:d => { S.profile = Object.assign(d, {done:true}); save(); },
    done:{title:'C’est prêt.', text:'Vos réponses sont ajoutées au début de chaque texte à copier, avec la présentation de votre entreprise.', btn:'Faire ma première demande',
      preview:() => promptPreview(),
      after:() => { if ((location.hash || '#accueil') === '#accueil') route(); else location.hash = '#accueil'; setTimeout(() => { const t = $('#askInput'); t && t.focus(); }, 350); }}});
}
function openCompanyQuiz() {
  openQuiz({label:'Présentation de l’entreprise', questions:CO_Q, data:JSON.parse(JSON.stringify(S.company)),
    onDone:d => { S.company = Object.assign(d, {done:true}); save(); },
    done:{title:'Votre entreprise est présentée.', text:'Ces informations sont ajoutées au début des textes proposés à tous vos salariés. Vous pouvez les modifier à tout moment.', btn:'Fermer',
      preview:() => promptPreview('company'),
      after:() => { if (location.hash === '#dirigeant') renderView(true); }}});
}

