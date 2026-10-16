import { useEffect, useMemo, useState } from 'react';
import { Building2, ExternalLink, Factory, Globe2, RefreshCw, Search, ShieldCheck, TrendingDown, Info } from 'lucide-react';

const API_ROOT = 'https://api.climatetrace.org/v7';
const YEAR_OPTIONS = [2025, 2024, 2023, 2022, 2021];
const INDIA_TERMS = ['india', 'indian'];
const COMPANY_LINKS = [
  { name: 'NSE India — BRSR filings', description: 'Official sustainability reports filed by listed Indian companies.', url: 'https://www.nseindia.com/companies-listing/corporate-filings-bussiness-sustainabilitiy-reports', region: 'India' },
  { name: 'Climate TRACE', description: 'Open emissions estimates for individual assets and sectors; estimates are not the same as company-wide audited inventories.', url: 'https://www.climatetrace.org/', region: 'Global' },
  { name: 'Climate TRACE API documentation', description: 'Technical source for the live facility/asset emissions feed used below.', url: 'https://api.climatetrace.org/v7/docs/index.html', region: 'Global' },
  { name: 'CDP data portal', description: 'Corporate climate disclosures and public datasets; some detailed datasets require a license.', url: 'https://www.cdp.net/en/data', region: 'Global' },
];

function getText(...values) {
  return values.find(value => typeof value === 'string' && value.trim()) || '';
}
function getNumber(...values) {
  for (const value of values) {
    const number = Number(value);
    if (value !== null && value !== undefined && value !== '' && Number.isFinite(number)) return number;
  }
  return null;
}
function normalizeSource(item, index) {
  const owner = typeof item.owner === 'object' ? item.owner : {};
  const location = typeof item.location === 'object' ? item.location : {};
  const emissions = getNumber(item.emissionsQuantity, item.emissions_quantity, item.emissions, item.co2e, item.totalEmissions, item.total_emissions);
  return {
    id: getText(String(item.id ?? ''), String(item.sourceId ?? ''), `asset-${index}`),
    name: getText(item.name, item.sourceName, item.source_name, item.assetName, item.asset_name, item.facilityName, item.facility_name, 'Unnamed emissions source'),
    owner: getText(item.ownerName, item.owner_name, owner.name, item.company, item.companyName, item.company_name, item.operator, 'Owner not listed'),
    country: getText(location.country, item.country, item.countryName, item.country_name, item.countryCode, item.country_code, 'Location not listed'),
    sector: getText(item.sector, item.subsector, item.sectorName, item.sector_name, 'Sector not listed'),
    emissions,
    unit: getText(item.emissionsUnit, item.unit, item.units, 'tonnes CO₂e'),
    raw: item,
  };
}
function displayEmissions(value) {
  if (value === null) return 'Not provided';
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })} t CO₂e`;
}

export default function CorporateEmissions() {
  const [year, setYear] = useState(2025);
  const [region, setRegion] = useState('all');
  const [query, setQuery] = useState('');
  const [sources, setSources] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');

  async function loadSources() {
    setStatus('loading');
    setError('');
    try {
      // Public Climate TRACE endpoint. The response can vary by API version, so the UI normalizes common field names.
      const url = `${API_ROOT}/sources?year=${year}&gas=co2e_100yr&limit=500`;
      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`Climate TRACE returned HTTP ${response.status}.`);
      const payload = await response.json();
      const list = Array.isArray(payload) ? payload : (payload.sources || payload.data || payload.results || payload.items || payload.assets || []);
      if (!Array.isArray(list) || list.length === 0) throw new Error('The public API did not return a source list in the expected format. Open the API documentation to inspect current endpoints.');
      setSources(list.map(normalizeSource));
      setUpdatedAt(new Date().toLocaleString());
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(`${err.message || 'Could not load emissions data.'} This may be caused by a temporary API issue or browser CORS restrictions. Use the official source links below; no demo figures are substituted.`);
    }
  }

  useEffect(() => { loadSources(); /* initial load and year changes */ }, [year]);

  const filtered = useMemo(() => sources.filter(source => {
    const haystack = `${source.name} ${source.owner} ${source.country} ${source.sector}`.toLowerCase();
    const matchesQuery = !query.trim() || haystack.includes(query.trim().toLowerCase());
    const country = source.country.toLowerCase();
    const isIndia = INDIA_TERMS.some(term => country.includes(term)) || country === 'in' || country === 'ind';
    const matchesRegion = region === 'all' || (region === 'india' ? isIndia : !isIndia);
    return matchesQuery && matchesRegion;
  }), [sources, query, region]);

  const totalKnown = filtered.reduce((sum, item) => sum + (item.emissions ?? 0), 0);
  const knownCount = filtered.filter(item => item.emissions !== null).length;

  return (
    <section className="corporate-section section-pad" id="corporate">
      <div className="section-heading">
        <div><div className="eyebrow"><span className="eyebrow-dot" /> COMPANY & INDUSTRY WATCH</div><h2>Who is emitting?<br /><em>Follow the data.</em></h2></div>
        <p>Explore a live public emissions feed alongside official company disclosure sources. Asset-level estimates and company-reported totals are different measures and should not be mixed without context.</p>
      </div>

      <div className="corporate-intro">
        <div className="corporate-intro-icon"><Globe2 size={23}/></div>
        <div><strong>Live public data — not a company guilt score</strong><p>Climate TRACE estimates emissions from individual facilities and other sources. It may not provide a complete, consolidated inventory for every company, and an asset owner may be missing. We show only data returned by the source and never invent missing values.</p></div>
        <a href="https://api.climatetrace.org/v7/docs/index.html" target="_blank" rel="noreferrer">API methodology <ExternalLink size={14}/></a>
      </div>

      <div className="corporate-controls">
        <label className="corporate-search"><Search size={17}/><input aria-label="Search company, facility, country or sector" placeholder="Search company, facility, country, sector…" value={query} onChange={e => setQuery(e.target.value)}/></label>
        <label className="corporate-select-label">Region<select value={region} onChange={e => setRegion(e.target.value)}><option value="all">All regions</option><option value="india">India (where location is provided)</option><option value="global">Outside India / other</option></select></label>
        <label className="corporate-select-label">Emissions year<select value={year} onChange={e => setYear(Number(e.target.value))}>{YEAR_OPTIONS.map(item => <option key={item} value={item}>{item}</option>)}</select></label>
        <button className="corporate-refresh" onClick={loadSources} disabled={status === 'loading'}><RefreshCw size={15} className={status === 'loading' ? 'spin-icon' : ''}/>{status === 'loading' ? 'Loading…' : 'Refresh data'}</button>
      </div>

      <div className="corporate-stats">
        <article><span>SOURCES LOADED</span><strong>{status === 'success' ? sources.length.toLocaleString() : '—'}</strong><small>API records for {year}</small></article>
        <article><span>SEARCH MATCHES</span><strong>{status === 'success' ? filtered.length.toLocaleString() : '—'}</strong><small>After your filters</small></article>
        <article><span>SUM OF MATCHED RECORDS</span><strong>{status === 'success' && knownCount ? `${(totalKnown / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })}k` : '—'}</strong><small>API-reported quantity; verify units and scope</small></article>
      </div>

      {status === 'loading' && <div className="corporate-state"><RefreshCw size={21} className="spin-icon"/><strong>Connecting to Climate TRACE…</strong><span>Fetching public emissions data for {year}.</span></div>}
      {status === 'error' && <div className="corporate-state corporate-error"><Info size={22}/><strong>Live feed could not be loaded</strong><span>{error}</span><a href="https://api.climatetrace.org/v7/docs/index.html" target="_blank" rel="noreferrer">Open Climate TRACE API docs <ExternalLink size={14}/></a></div>}
      {status === 'success' && filtered.length === 0 && <div className="corporate-state"><Search size={22}/><strong>No matching sources in the loaded records</strong><span>Try a broader search or another year. This does not mean the company has zero emissions.</span></div>}
      {status === 'success' && filtered.length > 0 && <div className="corporate-table-wrap"><div className="corporate-table-top"><span><Factory size={17}/> PUBLIC EMISSIONS SOURCES</span><small>{updatedAt ? `Updated ${updatedAt}` : ''}</small></div><div className="corporate-table-scroll"><table className="corporate-table"><thead><tr><th>Facility / source</th><th>Owner / company</th><th>Country</th><th>Sector</th><th>Emissions ({year})</th></tr></thead><tbody>{filtered.slice(0, 100).map((source, index) => <tr key={`${source.id}-${index}`}><td><strong>{source.name}</strong><small>Asset/source record</small></td><td>{source.owner}</td><td>{source.country}</td><td>{source.sector}</td><td><strong>{displayEmissions(source.emissions)}</strong></td></tr>)}</tbody></table></div>{filtered.length > 100 && <p className="corporate-footnote">Showing the first 100 of {filtered.length.toLocaleString()} matching records. Refine your search to narrow the list.</p>}</div>}

      <div className="corporate-links-heading"><div><span className="eyebrow">VERIFIABLE SOURCES</span><h3>Company reports & open data</h3></div><span>Open the source to confirm reporting year, boundaries and methodology.</span></div>
      <div className="corporate-source-grid">{COMPANY_LINKS.map(link => <a className="corporate-source-card" href={link.url} target="_blank" rel="noreferrer" key={link.name}><span className="corporate-source-region">{link.region}</span><strong>{link.name}</strong><p>{link.description}</p><span className="corporate-source-link">Open source <ExternalLink size={14}/></span></a>)}</div>
      <p className="corporate-disclaimer"><ShieldCheck size={16}/> Interpretation guide: Scope 1 = direct emissions; Scope 2 = purchased energy; Scope 3 = value chain. Climate TRACE asset estimates are not equivalent to company-reported Scope 1/2/3 totals. Compare companies only when year, boundary, units, sector and methodology align. A missing record is not zero emissions.</p>
    </section>
  );
}
