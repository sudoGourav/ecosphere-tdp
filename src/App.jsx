import { useMemo, useState } from 'react';
import {
  ArrowDownRight, ArrowRight, Check, ChevronRight, CloudSun, Droplets,
  Earth, Leaf, Menu, Recycle, Sprout, Sun, Trees, Wind, X, Zap,
  Activity, CalendarDays, Car, Bus, Trash2, Plus, Newspaper, ExternalLink, TrendingUp
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


const activityTypes = [
  { id: 'car', label: 'Car travel', unit: 'km', factor: 0.21, icon: Car, category: 'Transport', hint: 'Distance travelled by car' },
  { id: 'bus', label: 'Bus travel', unit: 'km', factor: 0.08, icon: Bus, category: 'Transport', hint: 'Distance travelled by bus' },
  { id: 'electricity', label: 'Electricity use', unit: 'kWh', factor: 0.70, icon: Zap, category: 'Home energy', hint: 'Electricity consumed' },
  { id: 'waste', label: 'General waste', unit: 'kg', factor: 0.50, icon: Recycle, category: 'Waste', hint: 'Waste sent to landfill (rough estimate)' },
  { id: 'flight', label: 'Air travel', unit: 'passenger-km', factor: 0.15, icon: Wind, category: 'Transport', hint: 'Approximate passenger distance flown' },
];

const climateNews = [
  {
    mood: 'POSITIVE DEVELOPMENT',
    kind: 'good',
    title: "India's power-sector emissions flat for two years amid clean-energy growth",
    summary: 'Carbon Brief reports that growth in clean electricity helped hold power-sector emissions steady, while the transition still has work to do.',
    source: 'Carbon Brief',
    date: '17 Sep 2026',
    url: 'https://www.carbonbrief.org/topics/renewables',
  },
  {
    mood: 'CHALLENGE TO WATCH',
    kind: 'watch',
    title: 'Grid limits are wasting some of India’s solar electricity',
    summary: 'Reuters reported that transmission constraints prevented some generated solar power from being used, showing why grid upgrades matter alongside new capacity.',
    source: 'Reuters',
    date: '12 Oct 2026',
    url: 'https://www.reuters.com/business/energy/india-wastes-4-solar-power-amid-power-shortages-july-august-report-shows-2026-10-12/',
  },
  {
    mood: 'NATURE UNDER PRESSURE',
    kind: 'watch',
    title: 'Amazon fires surge amid dry conditions and climate pressures',
    summary: 'Reuters reports rising fire activity in Brazil’s Amazonas region, highlighting risks to communities, air quality and biodiversity.',
    source: 'Reuters',
    date: '14 Oct 2026',
    url: 'https://www.reuters.com/business/environment/fires-surge-brazils-amazon-fueled-by-el-nio-climate-change-2026-10-14/',
  },
];

function loadActivities() {
  try {
    const parsed = JSON.parse(localStorage.getItem('ecosphere-emissions') || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatKg(value) {
  return `${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })} kg`;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({ travel: '8', electricity: '3', diet: 'mixed' });
  const [estimate, setEstimate] = useState(null);
  const [done, setDone] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('ecosphere-actions') || '{}');
      const today = new Date().toLocaleDateString('en-CA');
      return saved.date === today && Array.isArray(saved.done) ? saved.done : [];
    } catch {
      return [];
    }
  });
  const [showAll, setShowAll] = useState(false);
  const [activityLogs, setActivityLogs] = useState(loadActivities);
  const [activityForm, setActivityForm] = useState({
    type: 'car',
    amount: '5',
    date: new Date().toLocaleDateString('en-CA'),
    note: '',
  });
  const [activityMessage, setActivityMessage] = useState('');
  const selectedActivity = activityTypes.find(item => item.id === activityForm.type) || activityTypes[0];
  const previewKg = Math.max(0, Number(activityForm.amount) || 0) * selectedActivity.factor;
  const totalKg = activityLogs.reduce((sum, item) => sum + item.kg, 0);
  const todayKey = new Date().toLocaleDateString('en-CA');
  const todayKg = activityLogs.filter(item => item.date === todayKey).reduce((sum, item) => sum + item.kg, 0);
  const last7 = Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - index));
    const key = day.toLocaleDateString('en-CA');
    return {
      key,
      label: day.toLocaleDateString(undefined, { weekday: 'short' }),
      kg: activityLogs.filter(item => item.date === key).reduce((sum, item) => sum + item.kg, 0),
    };
  });
  const categoryTotals = [...new Set(activityTypes.map(type => type.category))].reduce((acc, category) => {
    acc[category] = activityLogs.filter(item => item.category === category).reduce((sum, item) => sum + item.kg, 0);
    return acc;
  }, {});
  const maxDayKg = Math.max(1, ...last7.map(day => day.kg));

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
    setDone(current => {
      const next = current.includes(id) ? current.filter(item => item !== id) : [...current, id];
      try {
        localStorage.setItem('ecosphere-actions', JSON.stringify({
          date: new Date().toLocaleDateString('en-CA'),
          done: next
        }));
      } catch {
        // The checklist still works for this session if storage is unavailable.
      }
      return next;
    });
  }

  function resetActions() {
    setDone([]);
    try {
      localStorage.removeItem('ecosphere-actions');
    } catch {
      // Ignore storage restrictions; the in-memory reset still works.
    }
  }

  function updateActivityForm(key, value) {
    setActivityForm(current => ({ ...current, [key]: value }));
  }

  function saveActivity(event) {
    event.preventDefault();
    const amount = Number(activityForm.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setActivityMessage('Enter an amount greater than zero.');
      return;
    }
    const entry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type: selectedActivity.id,
      label: selectedActivity.label,
      category: selectedActivity.category,
      amount,
      unit: selectedActivity.unit,
      kg: Number((amount * selectedActivity.factor).toFixed(3)),
      factor: selectedActivity.factor,
      date: activityForm.date || todayKey,
      note: activityForm.note.trim(),
    };
    const next = [entry, ...activityLogs].slice(0, 500);
    setActivityLogs(next);
    try {
      localStorage.setItem('ecosphere-emissions', JSON.stringify(next));
      setActivityMessage('Activity saved on this device.');
    } catch {
      setActivityMessage('Saved for this session only; browser storage is unavailable.');
    }
    setActivityForm(current => ({ ...current, amount: '', note: '' }));
  }

  function deleteActivity(id) {
    const next = activityLogs.filter(item => item.id !== id);
    setActivityLogs(next);
    try {
      localStorage.setItem('ecosphere-emissions', JSON.stringify(next));
    } catch {
      // Keep the in-memory update even when browser storage is unavailable.
    }
  }

  function clearActivities() {
    if (!window.confirm('Delete all saved activity records from this browser?')) return;
    setActivityLogs([]);
    try {
      localStorage.removeItem('ecosphere-emissions');
      setActivityMessage('All activity records cleared.');
    } catch {
      setActivityMessage('Records cleared for this session.');
    }
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
          <a href="#tracker" onClick={() => setMenuOpen(false)}>Track data</a>
          <a href="#news" onClick={() => setMenuOpen(false)}>Climate pulse</a>
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


        <section className="tracker-section section-pad" id="tracker">
          <div className="section-heading">
            <div><div className="eyebrow"><span className="eyebrow-dot" /> YOUR ACTIVITY, YOUR DATA</div><h2>Track the things<br /><em>that add up.</em></h2></div>
            <p>Log everyday activities and see an illustrative CO₂-equivalent estimate. Records stay in this browser on this device.</p>
          </div>

          <div className="tracker-stats">
            <article className="tracker-stat"><span>ALL LOGGED ACTIVITIES</span><strong>{activityLogs.length}</strong><small>Entries saved locally</small></article>
            <article className="tracker-stat"><span>ESTIMATED TODAY</span><strong>{formatKg(todayKg)}</strong><small>From your logged activities</small></article>
            <article className="tracker-stat"><span>ALL-TIME LOGGED TOTAL</span><strong>{formatKg(totalKg)}</strong><small>Not a complete personal footprint</small></article>
          </div>

          <div className="tracker-layout">
            <div className="activity-form-card">
              <div className="card-topline"><span><Activity size={16} /> ADD AN ACTIVITY</span><Plus size={18}/></div>
              <form onSubmit={saveActivity}>
                <label htmlFor="activity-type">Activity</label>
                <select id="activity-type" value={activityForm.type} onChange={e => updateActivityForm('type', e.target.value)}>
                  {activityTypes.map(type => <option key={type.id} value={type.id}>{type.label}</option>)}
                </select>
                <p className="activity-hint">{selectedActivity.hint}</p>
                <label htmlFor="activity-amount">Amount <span>{selectedActivity.unit}</span></label>
                <div className="input-wrap"><input id="activity-amount" type="number" min="0.01" step="any" value={activityForm.amount} onChange={e => updateActivityForm('amount', e.target.value)} required /><span>{selectedActivity.unit}</span></div>
                <label htmlFor="activity-date">Date</label>
                <div className="input-wrap date-input"><input id="activity-date" type="date" value={activityForm.date} onChange={e => updateActivityForm('date', e.target.value)} required /><CalendarDays size={16}/></div>
                <label htmlFor="activity-note">Note <span>optional</span></label>
                <input className="note-input" id="activity-note" type="text" maxLength="100" placeholder="e.g. commute to campus" value={activityForm.note} onChange={e => updateActivityForm('note', e.target.value)} />
                <div className="estimate-preview"><span>Estimated emissions</span><strong>{formatKg(previewKg)} CO₂e</strong></div>
                <button className="button button-lime calc-button" type="submit">Save activity <Plus size={17}/></button>
                {activityMessage && <p className="form-feedback" role="status">{activityMessage}</p>}
              </form>
            </div>

            <div className="activity-insights">
              <div className="insight-panel">
                <div className="insight-title"><div><span className="eyebrow">LAST 7 DAYS</span><h3>Emission trend</h3></div><TrendingUp size={21}/></div>
                <div className="trend-chart" role="img" aria-label="Estimated logged emissions over the last seven days">
                  {last7.map(day => <div className="trend-column" key={day.key} title={`${day.key}: ${formatKg(day.kg)}`}>
                    <span className="trend-value">{day.kg ? day.kg.toFixed(1) : '—'}</span>
                    <div className="trend-bar-track"><span style={{ height: `${day.kg ? Math.max(5, (day.kg / maxDayKg) * 100) : 0}%` }} /></div>
                    <small>{day.label}</small>
                  </div>)}
                </div>
                <p className="chart-caption">Only activities you log are included. An empty day does not mean zero real-world emissions.</p>
              </div>
              <div className="insight-panel category-panel">
                <div className="insight-title"><div><span className="eyebrow">WHERE IT COMES FROM</span><h3>Category breakdown</h3></div><Earth size={21}/></div>
                {Object.entries(categoryTotals).map(([category, kg]) => <div className="category-row" key={category}>
                  <div><span>{category}</span><strong>{formatKg(kg)}</strong></div>
                  <div className="category-track"><span style={{ width: `${totalKg ? (kg / totalKg) * 100 : 0}%` }} /></div>
                </div>)}
                <p className="chart-caption">Breakdown of your saved records, not a full life-cycle analysis.</p>
              </div>
            </div>
          </div>

          <div className="activity-history">
            <div className="history-heading"><div><span className="eyebrow">YOUR RECORDS</span><h3>Recent activities</h3></div><button className="reset-actions" type="button" disabled={!activityLogs.length} onClick={clearActivities}>Clear all records</button></div>
            {activityLogs.length === 0 ? <div className="empty-activity"><Leaf size={22}/><strong>Your activity log starts here.</strong><span>Add your first activity to build a personal record.</span></div> :
              <div className="activity-table-wrap"><table className="activity-table"><thead><tr><th>Activity</th><th>Date</th><th>Amount</th><th>Estimated CO₂e</th><th><span className="sr-only">Delete</span></th></tr></thead><tbody>
                {activityLogs.slice(0, 12).map(item => <tr key={item.id}><td><strong>{item.label}</strong>{item.note && <small>{item.note}</small>}</td><td>{item.date}</td><td>{item.amount} {item.unit}</td><td><strong>{formatKg(item.kg)}</strong></td><td><button className="delete-entry" type="button" aria-label={`Delete ${item.label} entry`} onClick={() => deleteActivity(item.id)}><Trash2 size={16}/></button></td></tr>)}
              </tbody></table></div>}
          </div>
          <p className="tracker-disclaimer">Method note: starter factors are simplified illustrative defaults, not official location-specific factors. Real emissions vary by grid mix, vehicle, occupancy, waste treatment and methodology. Use verified local factors before research or policy decisions.</p>
        </section>

        <section className="actions-section section-pad" id="actions">
          <div className="section-heading action-heading">
            <div><div className="eyebrow"><span className="eyebrow-dot" /> SMALL ACTIONS, REAL MOMENTUM</div><h2>Make today a little<br /><em>greener.</em></h2></div>
            <div className="progress-card"><div className="progress-top"><span>TODAY'S ACTIONS</span><b>{done.length} OF {actions.length}</b></div><div className="progress-track" role="progressbar" aria-label="Daily climate actions completed" aria-valuemin="0" aria-valuemax={actions.length} aria-valuenow={done.length}><span style={{ width: `${progress}%` }}></span></div><small>{progress === 100 ? 'Amazing — you completed today’s list!' : `${progress}% complete · Every step counts`}</small><button className="reset-actions" type="button" onClick={resetActions} disabled={done.length === 0}>Reset checklist</button></div>
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
          <div className="action-footnote"><Leaf size={17}/><span>Your daily checklist is saved in this browser and resets for a new day. Progress is stored on this device only.</span></div>
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


        <section className="news-section section-pad" id="news">
          <div className="section-heading">
            <div><div className="eyebrow"><span className="eyebrow-dot" /> CLIMATE PULSE</div><h2>Reasons for hope.<br /><em>Reasons to act.</em></h2></div>
            <p>Climate progress and climate risks can happen at the same time. These dated reports link to their publishers so you can read the full context.</p>
          </div>
          <div className="news-grid">
            {climateNews.map(item => <article className={`news-card news-${item.kind}`} key={item.title}>
              <div className="news-card-top"><span className="news-label">{item.kind === 'good' ? <Sprout size={15}/> : <CloudSun size={15}/>} {item.mood}</span><span className="news-date">{item.date}</span></div>
              <h3>{item.title}</h3><p>{item.summary}</p>
              <div className="news-card-bottom"><span>{item.source}</span><a href={item.url} target="_blank" rel="noreferrer">Read report <ExternalLink size={14}/></a></div>
            </article>)}
          </div>
          <div className="news-source-note"><Newspaper size={19}/><span><strong>Stay informed, check the evidence.</strong><br/>Headlines are a snapshot, not the whole story. Open the publisher links for full reporting and updates.</span><a href="https://www.carbonbrief.org/" target="_blank" rel="noreferrer">More climate coverage <ArrowRight size={15}/></a></div>
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