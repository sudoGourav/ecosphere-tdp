# EcoSphere MVP

A responsive React + Vite climate-action website for a student project.

## Requirements
- Node.js 20 or newer (LTS recommended)
- npm (included with Node.js)

## Run locally
1. Extract this folder.
2. Open a terminal in the `ecosphere-mvp` folder.
3. Run `npm install`
4. Run `npm run dev`
5. Open the local URL shown by Vite (usually http://localhost:5173).

## Production build
Run `npm run build`. The generated site is placed in `dist/`.

## What's included
- Responsive landing page and navigation
- Educational carbon-footprint estimator (simplified assumptions; not a validated audit)
- Interactive daily-action checklist with progress indicator
- Climate learning cards and links to IPCC, NASA, and UN resources
- Accessible labels, keyboard-friendly buttons, and reduced-motion support

## Current limitations
- No login or backend database.
- Checklist state resets when the page is refreshed.
- Footprint calculation is illustrative and should not be presented as an official or scientifically validated personal estimate.
- Google Fonts requires an internet connection; the page falls back to local sans-serif fonts.

## Suggested next milestone
Add persistent progress (local storage first), verify and cite the calculation methodology, then add a backend only when the MVP is stable.


## Midterm demo polish
- Daily action checklist progress is saved in the browser for the current day (local device only).
- A reset control is available in the daily-actions progress card for repeatable live demonstrations.
- Keyboard focus styling has been added for more accessible navigation.
- The carbon estimator remains a simplified educational illustration, not a validated carbon audit.


## Impact tracking features
- Log car travel, bus travel, electricity use, general waste, and air travel with a date and optional note.
- View local activity totals, a seven-day logged-emissions trend, category breakdown, and recent activity records.
- Activity records persist in browser localStorage on the current device; no account or cloud sync is implemented.
- Delete individual records or clear all local records.
- Climate Pulse contains dated links to Carbon Brief and Reuters reporting, with positive developments and challenges separated for context.

### Emissions estimate caveat
The tracker uses simplified starter factors (car 0.21 kg CO2e/km, bus 0.08 kg CO2e/km, electricity 0.70 kg CO2e/kWh, waste 0.50 kg CO2e/kg, air travel 0.15 kg CO2e/passenger-km). These are illustrative placeholders, not official location-specific factors or a validated carbon audit. Replace them with documented, geographically appropriate factors before using the results for research or decisions.

## Corporate emissions explorer (new)

The `Companies` navigation link opens a corporate/industrial emissions section. It requests public source records from the Climate TRACE API (`https://api.climatetrace.org/v7/sources`) for the selected year and provides client-side search/filtering, a source table, refresh control, and official data/report links. It does not substitute sample figures when the API fails.

### Important limitations
- Climate TRACE records may represent individual facilities/assets, not consolidated company-wide inventories. Ownership or location may be absent.
- API fields and access behavior may change; the section handles common response formats but should be tested in the target browser. If CORS/network/API errors occur, use the linked API documentation and NSE BRSR disclosure portal.
- Do not call an asset total a company's Scope 1/2/3 total unless source methodology explicitly supports that comparison. Never interpret missing data as zero emissions.
- NSE India BRSR reports are public filings but are not automatically parsed into the live table. CDP's detailed corporate datasets may require a license.

Useful sources:
- Climate TRACE API docs: https://api.climatetrace.org/v7/docs/index.html
- NSE India BRSR filings: https://www.nseindia.com/companies-listing/corporate-filings-bussiness-sustainabilitiy-reports
- CDP data: https://www.cdp.net/en/data
