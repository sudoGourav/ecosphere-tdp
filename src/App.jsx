import { useMemo, useState } from 'react';
import {
  ArrowDownRight, ArrowRight, Check, ChevronRight, CloudSun, Droplets,
  Earth, Leaf, Menu, Recycle, Sprout, Sun, Trees, Wind, X, Zap
} from 'lucide-react';

const actions = [
  { id: 1, icon: Droplets, title: 'Save water today', detail: 'Take a shorter shower or turn off the tap while brushing.', tag: 'WATER' },
  { id: 2, icon: Recycle, title: 'Choose reusable', detail: 'Carry a reusable bottle, cup, or shopping bag.', tag: 'WASTE' },
  { id: 3, icon: Wind, title: 'Travel a little greener', detail: 'Walk, cycle, or use public transport for one trip.', tag: 'TRAVEL' },
  { id: 4, icon: Zap, title: 'Cut standby power', detail: 'Switch off lights and unplug unused chargers.', tag: 'ENERGY' },
];

const lessons = [
  { icon: CloudSun, category: 'CLIMATE BASICS', title: 'Why a warmer planet matters', body: 'Greenhouse gases trap heat in the atmosphere. Cutting emissions helps limit future warming and its impacts.' },
  { icon: Sun, category: 'CLEAN ENERGY', title: 'Powering a cleaner future', body: 'Solar and wind energy generate electricity without burning fossil fuels during operation.' },
  { icon: Trees, category: 'NATURE & BIODIVERSITY', title: 'Nature is part of the solution', body: 'Healthy forests, wetlands, and soils support biodiversity and store carbon while helping ecosystems thrive.' },
];

function estimateFootprint({ travel, electricity, diet }) {
  // Simplified educational estimate only — not a validated personal carbon audit.
  const transport = Number(travel) * 0.21;
  const power = Number(electricity) * 0.42;
  const food = ({ mostly: 1.5, mixed: 2.4, meat: 3.4 })[diet] ?? 2.4;
  return (transport + power + food).toFixed(1);
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({ travel: '8', electricity: '3', diet: 'mixed' });
  const [estimate, setEstimate] = useState(null);
  const [done, setDone] = useState([]);
  const [showAll, setShowAll] = useState(false);

  const progress = Math.round((done.length / actions.length) * 100);
  const footprint = useMemo(() => estimateFootprint(form), [form]);

  function updateForm(key, value) {
    setForm(current => ({ ...current, [key]: value }));
  }

  function calculate(event) {
    event.preventDefault();
    setEstimate(footprint);
  }

  function toggleAction(id) {
    setDone(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  }

  function jumpTo(id) {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="EcoSphere home">
          <span className="brand-mark"><Leaf size={21} strokeWidth={2.4} /></span>
          <span>eco<span className="brand-light">sphere</span><small>CLIMATE ACTION, MADE HUMAN</small></span>
        </a>
        <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <X /> : <Menu />}
        </button>
        <nav className={menuOpen ? 'nav nav-open' : 'nav'}>
          <a href="#impact" onClick={() => setMenuOpen(false)}>Your impact</a>
          <a href="#actions" onClick={() => setMenuOpen(false)}>Take action</a>
          <a href="#learn" onClick={() => setMenuOpen(false)}>Explore</a>
          <button className="nav-cta" onClick={() => jumpTo('impact')}>Start your journey <ArrowRight size={16} /></button>
        </nav>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> YOUR EVERYDAY CLIMATE COMPANION</div>
            <h1>A healthier planet<br />starts with <em>us.</em></h1>
            <p className="hero-intro">Understand your footprint. Discover better habits. Turn small everyday choices into meaningful climate action.</p>
            <div className="hero-actions">
              <button className="button button-dark" onClick={() => jumpTo('impact')}>Explore your impact <ArrowRight size={17} /></button>
              <button className="text-button" onClick={() => jumpTo('learn')}>Discover the why <ArrowDownRight size={17} /></button>
            </div>
            <div className="hero-note"><span className="avatar-stack"><i>🌱</i><i>🌍</i><i>♻️</i></span><span><strong>Progress, not perfection.</strong><br />Every action is a place to begin.</span></div>
          </div>
          <div className="hero-art" role="img" aria-label="Illustration of a green planet surrounded by leaves">
            <div className="art-sun"></div>
            <div className="orbit orbit-one"></div><div className="orbit orbit-two"></div>
            <div className="planet">
              <div className="planet-shine"></div>
              <div className="continent continent-one"></div>
              <div className="continent continent-two"></div>
              <div className="continent continent-three"></div>
              <div className="planet-leaf"><Leaf size={45} /></div>
            </div>
            <div className="floating-note note-top"><span className="mini-icon"><Sprout size={18}/></span><span><b>Grow good habits</b><small>One day at a time</small></span></div>
            <div className="floating-note note-bottom"><span className="mini-icon mini-sun"><Sun size={19}/></span><span><b>Make an impact</b><small>Start where you are</small></span></div>
            <div className="art-caption">ONE PLANET. SHARED FUTURE.</div>
          </div>
          <div className="hero-bottom"><span>01 / THE BIG PICTURE</span><span>SMALL STEPS. COLLECTIVE CHANGE.</span><span className="scroll-cue">SCROLL TO EXPLORE ↓</span></div>
        </section>

        <section className="intro-strip">
          <div className="strip-label"><span className="tiny-line"></span> CLIMATE ACTION, SIMPLIFIED</div>
          <p>Climate change is a big challenge.<br /><strong>Knowing where to start shouldn't be.</strong></p>
          <div className="strip-aside">No guilt. No perfection required.<br />Just practical steps forward.</div>
        </section>

        <section className="impact-section section-pad" id="impact">
          <div className="section-heading">
            <div><div className="eyebrow"><span className="eyebrow-dot" /> KNOW YOUR STARTING POINT</div><h2>Your footprint,<br /><em>your next step.</em></h2></div>
            <p>A few everyday details can help you explore how lifestyle choices relate to emissions. Use this estimate as a learning tool, not a precise measurement.</p>
          </div>
          <div className="calculator-layout">
            <div className="calculator-card">
              <div className="card-topline"><span>PERSONAL FOOTPRINT EXPLORER</span><Earth size={19}/></div>
              <form onSubmit={calculate}>
                <label htmlFor="travel">Typical travel per day <span>km</span></label>
                <div className="input-wrap"><input id="travel" type="number" min="0" max="300" value={form.travel} onChange={e => updateForm('travel', e.target.value)} required /><span>km / day</span></div>
                <label htmlFor="electricity">Household electricity use <span>estimate</span></label>
                <div className="input-wrap"><input id="electricity" type="number" min="0" max="100" value={form.electricity} onChange={e => updateForm('electricity', e.target.value)} required /><span>kWh / day</span></div>
                <label htmlFor="diet">Your usual diet</label>
                <select id="diet" value={form.diet} onChange={e => updateForm('diet', e.target.value)}>
                  <option value="mostly">Mostly plant-based</option><option value="mixed">Mixed diet</option><option value="meat">Meat most days</option>
                </select>
                <button className="button button-lime calc-button" type="submit">Calculate my estimate <ArrowRight size={17}/></button>
              </form>
              <p className="fine-print">Educational model with simplified assumptions. Real emissions vary by location, energy source, vehicle, and other factors.</p>
            </div>
            <div className="result-panel">
              <div className="result-orb"><div className="orb-inner"><Leaf size={27}/><span>YOUR<br/>PLANET</span></div></div>
              <span className="result-kicker">{estimate === null ? 'READY WHEN YOU ARE' : 'YOUR ESTIMATED DAILY IMPACT'}</span>
              {estimate === null ? <h3>Every journey<br />starts somewhere.</h3> : <h3><strong>{estimate}</strong><small> kg CO₂e / day*</small></h3>}
              <p>{estimate === null ? 'Enter your details to get a simple illustrative estimate and start thinking about the choices within your control.' : 'Use this as a starting point for reflection. It is not a complete or validated carbon-footprint assessment.'}</p>
              <div className="result-divider"></div>
              <div className="result-tip"><span><Sprout size={20}/></span><div><b>Your next step</b><p>Try one action below this week. Small changes are easier to sustain when they fit your life.</p></div></div>
              <button className="result-link" onClick={() => jumpTo('actions')}>Find a practical action <ChevronRight size={17}/></button>
            </div>
          </div>
          <div className="metric-row">
            <div><span className="metric-icon"><Leaf size={18}/></span><span><b>Understand</b><small>Learn what shapes impact</small></span></div>
            <div><span className="metric-icon"><Sprout size={18}/></span><span><b>Choose</b><small>Find changes that fit</small></span></div>
            <div><span className="metric-icon"><Trees size={18}/></span><span><b>Keep growing</b><small>Build habits over time</small></span></div>
          </div>
        </section>

        <section className="actions-section section-pad" id="actions">
          <div className="section-heading action-heading">
            <div><div className="eyebrow"><span className="eyebrow-dot" /> SMALL ACTIONS, REAL MOMENTUM</div><h2>Make today a little<br /><em>greener.</em></h2></div>
            <div className="progress-card"><div className="progress-top"><span>TODAY'S ACTIONS</span><b>{done.length} OF {actions.length}</b></div><div className="progress-track"><span style={{ width: `${progress}%` }}></span></div><small>{progress === 100 ? 'Amazing — you completed today’s list!' : `${progress}% complete · Every step counts`}</small></div>
          </div>
          <div className="actions-grid">
            {actions.map((action, index) => {
              const Icon = action.icon;
              const checked = done.includes(action.id);
              return <button className={`action-card ${checked ? 'action-done' : ''}`} key={action.id} onClick={() => toggleAction(action.id)} aria-pressed={checked}>
                <div className="action-card-top"><span className="action-icon"><Icon size={21}/></span><span className="action-tag">{action.tag}</span><span className="action-check">{checked ? <Check size={17}/> : <span>{String(index + 1).padStart(2, '0')}</span>}</span></div>
                <h3>{action.title}</h3><p>{action.detail}</p><span className="action-bottom">{checked ? 'COMPLETED' : 'MARK AS DONE'} <ArrowRight size={14}/></span>
              </button>;
            })}
          </div>
          <div className="action-footnote"><Leaf size={17}/><span>Your checklist is stored in this page's current session only. Saving progress between visits is planned for a later version.</span></div>
        </section>

        <section className="learn-section section-pad" id="learn">
          <div className="learn-top">
            <div><div className="eyebrow"><span className="eyebrow-dot" /> KNOWLEDGE GROWS CHANGE</div><h2>Understand the<br /><em>bigger picture.</em></h2></div>
            <p>Explore a few foundations of climate action. Better information helps us make better choices and ask better questions.</p>
          </div>
          <div className="lessons-grid">
            {lessons.map((lesson, i) => {
              const Icon = lesson.icon;
              return <article className="lesson-card" key={lesson.title}>
                <div className={`lesson-art lesson-art-${i + 1}`}><span className="lesson-number">0{i + 1}</span><Icon size={43} strokeWidth={1.3}/><span className="lesson-deco">{i === 0 ? 'CO₂' : i === 1 ? '☼' : '✳'}</span></div>
                <div className="lesson-copy"><span className="lesson-category">{lesson.category}</span><h3>{lesson.title}</h3><p>{lesson.body}</p></div>
              </article>;
            })}
          </div>
          <div className="learning-note"><span className="note-star">✳</span><p><b>Stay curious. Check your sources.</b><br />Climate science evolves as evidence improves. For deeper research, use trusted sources such as the IPCC, NASA, and the UN.</p><button onClick={() => setShowAll(!showAll)}>{showAll ? 'Hide resources' : 'Explore trusted sources'} <ArrowRight size={16}/></button></div>
          {showAll && <div className="source-list">
            <a href="https://www.ipcc.ch/" target="_blank" rel="noreferrer">IPCC — climate science assessments <ArrowRight size={14}/></a>
            <a href="https://climate.nasa.gov/" target="_blank" rel="noreferrer">NASA Climate Change <ArrowRight size={14}/></a>
            <a href="https://www.un.org/en/climatechange" target="_blank" rel="noreferrer">United Nations — Climate Action <ArrowRight size={14}/></a>
          </div>}
        </section>

        <section className="closing-cta">
          <div className="closing-leaf"><Leaf size={34}/></div>
          <div><span className="eyebrow">THE FUTURE IS A SHARED PROJECT</span><h2>Better habits.<br /><em>Brighter future.</em></h2><p>You don't have to do everything. Begin with one thing, then keep going.</p></div>
          <button className="button button-lime" onClick={() => jumpTo('actions')}>Choose your first action <ArrowRight size={17}/></button>
          <span className="closing-decoration">GROW<br/>TOGETHER</span>
        </section>
      </main>

      <footer className="footer">
        <a className="brand footer-brand" href="#home"><span className="brand-mark"><Leaf size={20}/></span><span>eco<span className="brand-light">sphere</span><small>CLIMATE ACTION, MADE HUMAN</small></span></a>
        <p>A student-led climate-action project.<br />Built to learn, act, and grow together.</p>
        <div className="footer-meta"><span>PROJECT MVP · 2026</span><a href="#home">BACK TO TOP ↑</a></div>
      </footer>
    </div>
  );
}

export default App;