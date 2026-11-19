/* Page de présentation (publique) : #decouverte, et #decouverte-offres pour arriver directement sur les prix.
   La page se lit bloc par bloc : chaque bloc fait un écran, et le défilement s'arrête au début de chacun.
   Le bloc « Comment ça marche » reste épinglé le temps de passer ses 4 étapes. Le reste ne bouge qu'à l'arrivée (le haut, une fois)
   et pour répondre à la main (survol, appui). */
import React, { useEffect, useRef, useState } from 'react';
import { BarrePublique, PiedPublic, LogoIA, Icone, Fleche, euros, useOffres, lireHash } from './commun';

const reduit = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const HAUT_BARRE = 64; // hauteur de la barre du haut (--pub-top)

/* Fait défiler jusqu'à un repère placé juste avant un bloc (un bloc collé a une position faussée). */
function allerA(repere, decalage = 0) {
  if (!repere) return;
  const y = repere.getBoundingClientRect().top + window.scrollY - HAUT_BARRE + decalage;
  window.scrollTo({ top: y, behavior: reduit() ? 'auto' : 'smooth' });
}

/* Défilement section par section : chaque bloc fait un écran, et un coup de molette (ou de doigt)
   amène au bloc suivant. C'est le navigateur qui s'en charge (CSS scroll-snap), activé seulement sur cette page.
   Dans « Comment ça marche », chaque étape est elle-même un point d'arrêt. */
function useDefilementParBloc() {
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add('snap-page');
    return () => html.classList.remove('snap-page');
  }, []);
}

function Bloc({ className = '', children, ...rest }) {
  return (
    <section className={`bloc ${className}`} {...rest}>
      <div className="bloc-in">{children}</div>
    </section>
  );
}

/* Les [crochets] d'une demande, surlignés comme dans le site. */
function Demande({ texte }) {
  let n = 0;
  return texte.split(/(\[[^\]]+\])/).map((bout, i) =>
    bout.startsWith('[')
      ? <mark key={i} className="hlx" style={{ '--n': n++ }}>{bout}</mark>
      : <React.Fragment key={i}>{bout}</React.Fragment>
  );
}

/* ——— 1. Le haut de page ——— */

const BIBLIO = [
  { id: 'chatgpt', nom: 'ChatGPT', role: 'Rédiger, reformuler, trouver des idées' },
  { id: 'claude', nom: 'Claude', role: 'Rédaction soignée, longs documents' },
  { id: 'lechat', nom: 'Le Chat', role: 'L’assistant français, avec recherche web' },
  { id: 'perplexity', nom: 'Perplexity', role: 'Chercher, avec les sources citées' },
  { id: 'gemini', nom: 'Gemini', role: 'Dans Gmail, Docs et Sheets' },
  { id: 'deepl', nom: 'DeepL', role: 'Traduire en gardant la mise en page' },
  { id: 'notebooklm', nom: 'NotebookLM', role: 'Interroger vos propres documents' },
  { id: 'canva', nom: 'Canva', role: 'Affiches et visuels à partir de modèles' },
  { id: 'copilot', nom: 'Copilot', role: 'Dans Word, Excel, Outlook et Teams' },
];

function Haut({ verOffres }) {
  return (
    <Bloc className="phero" aria-labelledby="hero-t">
      <div className="pub-wrap phero-in">
        <div className="hero-txt">
          <h1 id="hero-t" className="hero-h">La bibliothèque des IA pour <em>bien travailler</em> avec elles</h1>
          <p className="hero-sub">Dites ce que vous devez faire&nbsp;: Bibl.IA vous indique l’IA adaptée et vous donne une demande prête à compléter. Puis, IA après IA, vous progressez de l’essentiel jusqu’aux usages avancés.</p>
          <div className="hero-cta">
            <a className="btn btn-primary has-arrow" href="/inscription">Créer un compte gratuit <Fleche /></a>
            <button type="button" className="btn btn-ghost" onClick={verOffres}>Voir les offres</button>
          </div>
          <ul className="hero-facts" aria-label="En bref">
            <li><b>10&nbsp;IA</b> présentées et comparées</li>
            <li><b>De l’essentiel à l’avancé</b> sur chacune</li>
            <li><b>Sans carte</b> pour commencer</li>
          </ul>
        </div>
        <div className="hero-vis" aria-hidden="true">
          <div className="frame">
            <div className="frame-bar"><span /><span /><span /><i>Bibliothèque des IA</i></div>
            <div className="lib">
              {BIBLIO.map((a) => (
                <div key={a.id} className={`lib-c${a.id === 'claude' ? ' is-pick' : ''}`}>
                  <LogoIA id={a.id} taille={36} />
                  <div><b>{a.nom}</b><span>{a.role}</span></div>
                  {a.id === 'claude' && <em className="lib-tag">Pour votre demande</em>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Bloc>
  );
}

/* ——— 2. Comment ça marche : le bloc épinglé ——— */

const ETAPES = [
  { t: 'Dites ce que vous devez faire', d: 'En une phrase, comme à un collègue. Ce que vous tapez reste dans votre navigateur : Bibl.IA ne l’envoie nulle part.' },
  { t: 'Bibl.IA choisit l’IA adaptée', d: 'Pour un mail, une présentation ou une traduction, Bibl.IA vous dit quelle IA convient le mieux, et pourquoi.' },
  { t: 'Complétez la demande prête', d: 'La demande est déjà écrite, avec ce que Bibl.IA sait de vous et de votre entreprise. Il ne reste qu’à compléter le passage surligné, puis à la copier dans l’IA en un clic.' },
  { t: 'Progressez sur chaque IA', d: 'Commencez par l’essentiel, puis apprenez chaque IA, de la prise en main jusqu’aux usages avancés.' },
];

const DEMANDE = 'Rédigez un mail de relance à [nom du client], qui n’a pas répondu depuis deux semaines au devis de rénovation de ses bureaux envoyé le 4 novembre.\nContexte : je suis commercial chez Menuiseries Martin, une PME de 12 salariés ; le devis porte sur le remplacement de 14 fenêtres.\nTon : courtois et professionnel, vouvoiement, phrases courtes.\nTerminez en proposant un appel de 10 minutes cette semaine.';

const PARCOURS = [
  { id: 'claude', nom: 'Claude', niveau: 'Avancé', p: 0.9 },
  { id: 'chatgpt', nom: 'ChatGPT', niveau: 'Usages concrets', p: 0.6 },
  { id: 'lechat', nom: 'Le Chat', niveau: 'Prise en main', p: 0.3 },
  { id: 'perplexity', nom: 'Perplexity', niveau: 'À commencer', p: 0 },
];

function Scene({ i, actif, children }) {
  return <div className="scene" data-on={i === actif || undefined} aria-hidden={i !== actif}>{children}</div>;
}

function Etapes({ refRepere }) {
  const sec = useRef(null);
  const barre = useRef(null);
  const [actif, setActif] = useState(0);

  useEffect(() => {
    let raf = 0;
    const maj = () => {
      raf = 0;
      const el = sec.current;
      const rep = refRepere.current;
      if (!el || !rep) return;
      /* Le repère (non collé) donne la vraie position du début du bloc. */
      const debut = rep.getBoundingClientRect().top;
      const course = Math.max(1, el.offsetHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, -debut / course));
      if (barre.current) barre.current.style.transform = `scaleY(${p})`;
      setActif(Math.min(ETAPES.length - 1, Math.floor(p * ETAPES.length)));
    };
    const demander = () => { if (!raf) raf = requestAnimationFrame(maj); };
    window.addEventListener('scroll', demander, { passive: true });
    window.addEventListener('resize', demander);
    maj();
    return () => { window.removeEventListener('scroll', demander); window.removeEventListener('resize', demander); cancelAnimationFrame(raf); };
  }, [refRepere]);

  /* Cliquer une étape fait défiler jusqu'à elle. */
  const aller = (i) => {
    const course = sec.current.offsetHeight - window.innerHeight;
    allerA(refRepere.current, HAUT_BARRE + ((i + 0.5) / ETAPES.length) * course);
  };

  return (
    <section className="bloc tour" ref={sec} aria-labelledby="how-t" style={{ '--n': ETAPES.length }}>
      {ETAPES.map((_, i) => i > 0 && <span key={i} className="tour-snap" style={{ '--i': i }} aria-hidden="true" />)}
      <div className="tour-pin">
        <div className="bloc-in tour-panel">
          <div className="pub-wrap tour-in">
            <div className="tour-txt">
              <h2 id="how-t" className="pub-h2">Comment ça marche</h2>
              <ol className="tour-steps">
                <span className="tour-rail" aria-hidden="true"><span ref={barre} /></span>
                {ETAPES.map((e, i) => (
                  <li key={i} className={i === actif ? 'is-on' : i < actif ? 'is-past' : ''}>
                    <button type="button" onClick={() => aller(i)} aria-current={i === actif ? 'step' : undefined}>
                      <span className="tour-n">{i + 1}</span>
                      <span className="tour-st">{e.t}</span>
                    </button>
                    <p className="tour-d">{e.d}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="tour-vis">
              <div className="frame tour-frame">
                <div className="frame-bar"><span /><span /><span /><i>{actif === 3 ? 'Formations' : 'Accueil'}</i></div>
                <div className="scenes">
                  <Scene i={0} actif={actif}>
                    <p className="sc-k">Que devez-vous faire aujourd’hui&nbsp;?</p>
                    <div className="sc-input"><span>Mon client n’a toujours pas répondu au devis de rénovation envoyé il y a deux semaines, comment le relancer sans être lourd&nbsp;?<i className="sc-caret" /></span></div>
                    <div className="sc-chips">
                      <span className="chip">Écrire un mail à un client</span>
                      <span className="chip">Faire une présentation</span>
                      <span className="chip">Résumer un compte rendu</span>
                      <span className="chip">Traduire un document</span>
                    </div>
                    <p className="sc-note"><Icone id="lock" petit />Votre texte reste dans votre navigateur.</p>
                  </Scene>

                  <Scene i={1} actif={actif}>
                    <p className="sc-k">Pour relancer un client sur un devis</p>
                    <div className="sc-cands">
                      <div className="cand is-top"><LogoIA id="claude" taille={40} /><div><b>Claude <em className="tag">Recommandée</em></b><span>Rédige un mail soigné et naturel à partir de quelques indications.</span></div></div>
                      <div className="cand"><LogoIA id="lechat" taille={40} /><div><b>Le Chat</b><span>Rédige un mail clair en français, et l’ajuste en une phrase.</span></div></div>
                      <div className="cand"><LogoIA id="chatgpt" taille={40} /><div><b>ChatGPT</b><span>Propose plusieurs versions du mail, pour garder la meilleure.</span></div></div>
                    </div>
                  </Scene>

                  <Scene i={2} actif={actif}>
                    <p className="sc-k">Votre demande pour Claude</p>
                    <p className="sc-prompt"><Demande texte={DEMANDE} /></p>
                    <div className="sc-btns">
                      <span className="btn btn-ghost btn-sm"><Icone id="copy" petit />Copier</span>
                      <span className="btn btn-primary btn-sm"><Icone id="ext" petit />Copier et ouvrir Claude</span>
                    </div>
                  </Scene>

                  <Scene i={3} actif={actif}>
                    <p className="sc-k">Vos parcours <span className="sc-done"><Icone id="check" petit />L’essentiel&nbsp;: acquis</span></p>
                    <ul className="sc-paths">
                      {PARCOURS.map((x) => (
                        <li key={x.id}>
                          <LogoIA id={x.id} taille={32} />
                          <span className="sc-pn"><b>{x.nom}</b><span>{x.niveau}</span></span>
                          <span className="sc-prog"><span style={{ '--p': x.p }} /></span>
                        </li>
                      ))}
                    </ul>
                    <p className="sc-rev"><Icone id="refresh" petit />Révision du jour&nbsp;: 1 question, 30 secondes</p>
                  </Scene>
                </div>
              </div>
            </div>
            <div className="tour-cap" aria-live="polite"><b>{ETAPES[actif].t}</b><p>{ETAPES[actif].d}</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ——— 3. Progresser : de l'essentiel à l'avancé ——— */

const NIVEAUX = [
  { t: 'L’essentiel', d: 'Ce qu’est une IA, comment bien lui demander, comment vérifier sa réponse et protéger vos données.' },
  { t: 'La prise en main', d: 'Pour chaque IA : l’ouvrir, la régler, retrouver vos travaux.' },
  { t: 'Les usages concrets', d: 'Les tâches de votre métier, IA par IA : mails, synthèses, présentations, recherches.' },
  { t: 'Le niveau avancé', d: 'Réutiliser vos meilleures demandes, combiner plusieurs IA, savoir quand ne pas s’en servir.' },
];

function Progresser() {
  return (
    <Bloc className="grow" aria-labelledby="grow-t">
      <div className="pub-wrap grow-in">
        <div className="grow-head">
          <h2 id="grow-t" className="pub-h2">Devenez à l’aise avec <em>toutes</em> les IA</h2>
          <p className="pub-lead">L’objectif n’est pas de connaître une IA, mais de savoir vous servir de chacune, au bon moment. Bibl.IA vous fait progresser de l’essentiel jusqu’au niveau avancé, à votre rythme.</p>
        </div>
        <ol className="ladder">
          {NIVEAUX.map((n, i) => (
            <li key={n.t} style={{ '--i': i }}>
              <span className="ladder-n">Niveau {i + 1}</span>
              <h3>{n.t}</h3>
              <p>{n.d}</p>
            </li>
          ))}
        </ol>
        <div className="grow-ais">
          <p>Un parcours pour chaque IA</p>
          <div className="grow-logos" aria-hidden="true">
            {BIBLIO.map((a) => <LogoIA key={a.id} id={a.id} taille={40} />)}
          </div>
          <p className="grow-rev"><Icone id="refresh" petit />Des révisions espacées pour retenir ce que vous apprenez.</p>
        </div>
      </div>
    </Bloc>
  );
}

/* ——— 4. Entreprises ——— */

function Entreprises() {
  const ia = [['chatgpt', 'ChatGPT', 42], ['claude', 'Claude', 27], ['lechat', 'Le Chat', 19], ['deepl', 'DeepL', 12]];
  const pers = [['Léa', 56], ['Marc', 32], ['Inès', 80]];
  return (
    <Bloc className="pro" aria-labelledby="pro-t">
      <div className="pub-wrap pro-in">
        <div className="pro-txt">
          <h2 id="pro-t" className="pub-h2">Pour l’entreprise&nbsp;: un espace dirigeant</h2>
          <p className="pub-lead">Vous choisissez les IA autorisées, vous invitez vos salariés, et vous suivez l’avancement des formations. Le reste ne vous regarde pas, et Bibl.IA ne le montre pas.</p>
          <div className="pro-lists">
            <div>
              <h3 className="pro-h3"><Icone id="eye" petit />Ce que vous voyez</h3>
              <p>Des chiffres d’équipe, sans nom&nbsp;: IA les plus utilisées, évolution de l’utilisation, salariés actifs. Et, pour chaque salarié, son avancement dans les formations.</p>
            </div>
            <div>
              <h3 className="pro-h3"><Icone id="eyeoff" petit />Ce que vous ne verrez jamais</h3>
              <p>Le contenu des demandes de vos salariés, ni qui utilise quelle IA, ni combien de fois. Les chiffres d’utilisation n’apparaissent qu’à partir de 5&nbsp;salariés actifs.</p>
            </div>
          </div>
        </div>
        <div className="pro-vis" aria-hidden="true">
          <div className="frame">
            <div className="frame-bar"><span /><span /><span /><i>Espace dirigeant</i></div>
            <div className="dash">
              <div className="dash-stats">
                <div><b>12</b><span>salariés actifs sur 15</span></div>
                <div><b>87</b><span>leçons terminées</span></div>
              </div>
              <div className="dash-box">
                <p className="dash-k">IA les plus utilisées <em>anonyme</em></p>
                {ia.map(([id, nom, p]) => (
                  <div key={id} className="dash-bar"><LogoIA id={id} taille={24} /><span>{nom}</span><i style={{ '--p': p / 42 }} /><b>{p}&nbsp;%</b></div>
                ))}
              </div>
              <div className="dash-box">
                <p className="dash-k">Suivi des formations</p>
                {pers.map(([n, p]) => (
                  <div key={n} className="dash-row"><span className="dash-av">{n[0]}</span><span>{n}</span><i style={{ '--p': p / 100 }} /><b>{p}&nbsp;%</b></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Bloc>
  );
}

/* ——— 5. Offres (les prix viennent de GET /api/offres) ——— */

function Periode({ valeur, onChange }) {
  return (
    <div className="pseg" role="radiogroup" aria-label="Facturation" data-v={valeur}>
      <span className="seg-ind" aria-hidden="true" />
      <button type="button" role="radio" aria-checked={valeur === 'mensuelle'} onClick={() => onChange('mensuelle')}>Mensuelle</button>
      <button type="button" role="radio" aria-checked={valeur === 'annuelle'} onClick={() => onChange('annuelle')}>Annuelle</button>
    </div>
  );
}

/* Le prix change avec un léger flou, pour que l'œil lise un seul chiffre qui se transforme. */
function Prix({ valeur, unite, detail }) {
  const [aff, setAff] = useState(valeur);
  const [flou, setFlou] = useState(false);
  useEffect(() => {
    if (valeur === aff) return undefined;
    if (reduit()) { setAff(valeur); return undefined; }
    setFlou(true);
    const t = setTimeout(() => { setAff(valeur); setFlou(false); }, 120);
    return () => clearTimeout(t);
  }, [valeur]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="price">
      <p className="price-v"><span className={flou ? 'is-blur' : ''}>{aff}</span>{unite && <small>{unite}</small>}</p>
      <p className="price-d">{detail || ' '}</p>
    </div>
  );
}

const moinsCher = (annuelParMois, mensuel) => Math.round((1 - annuelParMois / mensuel) * 100);

function Inclus({ items }) {
  return <ul className="offer-inc">{items.map((t) => <li key={t}><Icone id="check" petit />{t}</li>)}</ul>;
}

function Offres() {
  const { offres, chargement, erreur, recharger } = useOffres();
  const [periode, setPeriode] = useState('annuelle');
  const an = periode === 'annuelle';

  let contenu;
  if (chargement) contenu = <div className="offers is-loading" aria-busy="true">{[1, 2, 3, 4].map((i) => <div key={i} className={`offer sk o${i}`} />)}</div>;
  else if (erreur) contenu = <div className="pub-alert" role="alert"><Icone id="info" petit />Les offres n’ont pas pu s’afficher. <button type="button" className="ulink" onClick={recharger}>Réessayer</button></div>;
  else {
    const { decouverte: d, solo: s, entreprise: e, sur_mesure: m } = offres;
    const prixE = an ? e.prix_annuel_ht_par_salarie_par_mois : e.prix_mensuel_ht_par_salarie;
    /* Une seule grille pour les 4 offres : elles ont toutes la même largeur et la même hauteur. */
    contenu = (
      <>
        <div className="offers">
          <p className="offers-l l1">Pour vous <span>prix TTC</span></p>
          <article className="offer o1">
            <h3>{d.nom}</h3>
            <Prix valeur={d.prix_mensuel_ttc ? euros(d.prix_mensuel_ttc) : 'Gratuit'} detail="Pour découvrir, sans limite de durée" />
            <a className="btn btn-ghost" href="/inscription/particulier?offre=decouverte">Commencer gratuitement</a>
            <Inclus items={d.inclus} />
          </article>
          <article className="offer o2">
            <h3>{s.nom}</h3>
            <Prix valeur={an ? euros(s.prix_annuel_ttc) : euros(s.prix_mensuel_ttc)} unite={an ? '/an' : '/mois'}
              detail={an ? `soit ${euros(Math.round((s.prix_annuel_ttc / 12) * 100) / 100)} par mois, ${moinsCher(s.prix_annuel_ttc / 12, s.prix_mensuel_ttc)} % de moins` : 'Sans engagement'} />
            <a className="btn btn-primary" href={`/inscription/particulier?offre=solo&periode=${periode}`}>Choisir Plus</a>
            <Inclus items={s.inclus} />
          </article>
          <p className="offers-l l2">Pour votre entreprise <span>prix HT</span></p>
          <article className="offer o3">
            <h3>{e.nom} <span className="tag">{e.salaries_min} à {e.salaries_max} salariés</span></h3>
            <Prix valeur={euros(prixE)} unite="/salarié/mois" detail={an ? `Facturé à l’année, ${moinsCher(e.prix_annuel_ht_par_salarie_par_mois, e.prix_mensuel_ht_par_salarie)} % de moins` : 'Facturé au mois, sans engagement'} />
            <a className="btn btn-primary" href={`/inscription/entreprise?periode=${periode}`}>Essayer {e.essai_jours} jours gratuitement</a>
            <Inclus items={e.inclus} />
          </article>
          <article className="offer o4">
            <h3>{m.nom} <span className="tag tag-line">{m.salaries_min} salariés et plus</span></h3>
            <Prix valeur="Sur devis" detail="Selon la taille et l’accompagnement" />
            <a className="btn btn-ghost" href="/contact">Nous contacter</a>
            <Inclus items={m.inclus} />
          </article>
        </div>
        <p className="offers-note">
          Essai de {e.essai_jours} jours sans carte bancaire. Vous ne payez que les salariés qui ont rejoint votre équipe&nbsp;: pour 10&nbsp;salariés, {euros(prixE * 10)}&nbsp;HT par mois.
          {e.options && e.options[0] && e.options[0].prix_ht ? ` En option : ${e.options[0].nom.toLowerCase()}, ${euros(e.options[0].prix_ht)} HT.` : ''}
        </p>
      </>
    );
  }

  return (
    <Bloc className="offres" aria-labelledby="off-t">
      <div className="pub-wrap">
        <div className="offres-head">
          <div>
            <h2 id="off-t" className="pub-h2" tabIndex={-1}>Les offres</h2>
            <p className="pub-lead">Bien moins cher qu’un abonnement à une IA. Gratuit pour découvrir.</p>
          </div>
          <Periode valeur={periode} onChange={setPeriode} />
        </div>
        {contenu}
      </div>
    </Bloc>
  );
}

/* ——— 6. Questions et dernier appel ——— */

const FAQ = [
  ['Bibl.IA remplace-t-il ChatGPT ou Claude ?', 'Non. Bibl.IA vous aide à choisir l’IA adaptée et à bien lui parler. Vous utilisez ensuite l’IA elle-même, avec votre propre compte, souvent gratuit.'],
  ['Ce que je tape est-il envoyé à Bibl.IA ?', 'Non. La recommandation est calculée dans votre navigateur. Le texte de votre demande ne quitte jamais votre ordinateur.'],
  ['Que se passe-t-il à la fin de l’essai ?', 'Sans abonnement, le compte passe en version gratuite. Rien n’est effacé : dès que vous vous abonnez, tout revient comme avant.'],
  ['Mon employeur voit-il ce que je fais ?', 'Il voit votre avancement dans les formations, et rien d’autre : ni vos demandes, ni les IA que vous ouvrez.'],
];

function Fin() {
  return (
    <Bloc className="fin" aria-labelledby="faq-t">
      <div className="pub-wrap fin-in">
        <div>
          <h2 id="faq-t" className="pub-h2">Questions fréquentes</h2>
          <div className="faq">
            {FAQ.map(([q, r]) => (
              <details key={q}>
                <summary>{q}<Icone id="chev" petit /></summary>
                <p>{r}</p>
              </details>
            ))}
          </div>
        </div>
        <div className="fin-cta">
          <p className="fin-big">Votre prochaine demande à une IA peut être la bonne.</p>
          <a className="btn btn-primary has-arrow" href="/inscription">Créer un compte gratuit <Fleche /></a>
          <a className="ulink fin-alt" href="/inscription/entreprise">Équiper mon entreprise, 14 jours d’essai</a>
        </div>
      </div>
    </Bloc>
  );
}

export default function Decouverte({ hash }) {
  const refMain = useRef(null);
  const repTour = useRef(null);
  const repOffres = useRef(null);
  useDefilementParBloc();

  const verOffres = () => {
    allerA(repOffres.current);
    const t = document.getElementById('off-t');
    if (t) t.focus({ preventScroll: true });
  };
  /* #decouverte-offres : arriver directement sur les prix. */
  const { route } = lireHash(hash);
  useEffect(() => {
    if (route === 'decouverte-offres') requestAnimationFrame(() => {
      const r = repOffres.current;
      if (r) window.scrollTo({ top: r.getBoundingClientRect().top + window.scrollY - HAUT_BARRE, behavior: 'auto' });
    });
    else window.scrollTo({ top: 0, behavior: 'auto' });
  }, [route]);

  return (
    <div className="pub pub-home">
      <BarrePublique verOffres={verOffres} />
      <main id="main" tabIndex={-1} className="blocs" ref={refMain}>
        <Haut verOffres={verOffres} />
        <span className="repere" ref={repTour} aria-hidden="true" />
        <Etapes refRepere={repTour} />
        <Progresser />
        <Entreprises />
        <span className="repere" ref={repOffres} aria-hidden="true" />
        <Offres />
        <Fin />
      </main>
      <PiedPublic />
    </div>
  );
}
