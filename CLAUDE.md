# CLAUDE.md — JNB-Dashboard

Guide for AI assistants working on this codebase.

---

## Project Overview

**JNB-Dashboard** is a real-time operations dashboard for catering operations at Johannesburg O.R. Tambo International Airport (JNB). It tracks airline flight schedules including ETA, ETD, sealing times, and truck departure times.

**Architecture:** Single monolithic `index.html` file (~1662 lines) containing all HTML, CSS, and JavaScript. No build tools, no framework, no dependencies beyond Google Fonts.

---

## Repository Structure

```
JNB-Dashboard/
└── index.html      # The entire application (HTML + embedded CSS + embedded JS)
```

There is no `src/`, `dist/`, `package.json`, or build pipeline. All changes go directly into `index.html`.

---

## Technology Stack

- **Vanilla HTML5 / CSS3 / JavaScript (ES6+)** — no frameworks
- **Google Sheets CSV export** — primary data source, auto-synced every 5 minutes
- **localStorage** — persists all user preferences and settings
- **Web Audio API** — generates alert beep tones
- **Google Fonts** — Share Tech Mono, Barlow Condensed, Barlow (loaded via CDN)
- **FlightAware** — external links only (not an API integration)

---

## Running the Application

Open `index.html` directly in a browser, or serve it via any static HTTP server:

```bash
# Python
python3 -m http.server 8000

# Node
npx serve .

# VS Code Live Server extension
```

No build step. No compilation. No installation.

---

## Data Flow

1. **On load:** `fetchGSheet()` fetches the Google Sheets CSV export URL (`GSHEET_CSV_URL`)
2. **Parsing:** `parseCSVRow()` parses each row into flight objects
3. **Storage:** Parsed flights are stored in the `flights` array and persisted to `localStorage` (`cop_data`)
4. **Auto-refresh:** `setInterval` re-fetches every 5 minutes with cache-busting (`?cachebust=Date.now()`)
5. **Rendering:** All views read from the `flights` global array and render to DOM

**Google Sheets CSV URL** (constant `GSHEET_CSV_URL`):
`https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?output=csv`

**CSV columns:** `ID, Airline, Meal Type, Flight, ETA, ETD, Sealing, Truck, Days`

---

## Data Schemas

### Flight Object
```javascript
{
  id: string,       // 'gs' + index (e.g., 'gs0')
  airline: string,  // Airline name (e.g., 'Emirates')
  mealType: string, // 'halal', 'western', or ''
  flight: string,   // Flight number (e.g., 'EK768')
  eta: string,      // 'HH:MM' or ''
  etd: string,      // 'HH:MM' or ''
  sealing: string,  // 'HH:MM' or ''
  truck: string,    // 'HH:MM' or ''
  days: string[]    // ['MON', 'TUE', ...] from 'MON' to 'SUN'
}
```

### Airline Object
```javascript
{
  id: string,    // Short identifier
  name: string,  // Display name
  color: string  // Hex color (e.g., '#d71921')
}
```

---

## localStorage Keys

| Key            | Contents                               |
|----------------|----------------------------------------|
| `cop_data`     | Cached flight data from Google Sheets  |
| `cop_airlines` | Airline list with colors               |
| `cop_display`  | Display settings (zoom, block height)  |
| `cop_filters`  | Active filter state                    |
| `cop_alerts`   | Alert on/off and warning minutes       |
| `cop_bg`       | Background theme (hue, brightness)     |

---

## Views / Modes

The app has five main views, toggled by showing/hiding DOM sections:

| View           | DOM ID              | Function          | Description                           |
|----------------|---------------------|-------------------|---------------------------------------|
| Timeline       | `#timeline-view`    | `buildTimeline()` | Chronological hour-by-hour grid       |
| Airline        | `#airline-view`     | `buildAirlineView()` | Cards grouped by airline           |
| Production     | `#production-view`  | `buildProductionView()` | Slot-based D-1 / D planning     |
| Week           | `#week-view`        | `buildWeekView()` | 7-day calendar grid                   |
| Config         | `#config-panel`     | (settings panel)  | User preferences and customization    |

**Current view** is tracked by the `currentView` global and refreshed with `refreshCurrentView()`.

---

## Key Functions Reference

| Function                | Purpose                                          |
|-------------------------|--------------------------------------------------|
| `fetchGSheet()`         | Fetches and parses Google Sheets CSV data        |
| `parseCSVRow(row)`      | Parses a single CSV row handling quoted commas   |
| `buildTimeline()`       | Renders the timeline view                        |
| `buildAirlineView()`    | Renders the airline card view                    |
| `buildProductionView()` | Renders the production slot view                 |
| `buildWeekView()`       | Renders the 7-day week view                      |
| `refreshCurrentView()`  | Re-renders whichever view is currently active    |
| `checkAlerts()`         | Evaluates and triggers sealing/truck alerts      |
| `playAlertSound()`      | Generates audio beeps via Web Audio API          |
| `saveSettings()`        | Persists display/config settings to localStorage |
| `loadSettings()`        | Reads stored settings on startup                 |
| `testAlert()`           | Triggers a manual test alert modal               |
| `isMobile()`            | Returns `true` if viewport width < 768px         |

---

## Naming Conventions

| Convention | Pattern | Example |
|------------|---------|---------|
| HTML IDs | kebab-case | `#timeline-view`, `#mob-drawer` |
| CSS Classes | kebab-case | `.eblock`, `.al-card`, `.fs-timing-card` |
| JS Functions | camelCase | `buildTimeline()`, `toggleHamburger()` |
| JS Variables | camelCase | `airlines`, `activeFilters`, `viewDate` |
| JS Constants | UPPER_SNAKE | `GSHEET_CSV_URL`, `ALLDAYS`, `DEF_AIRLINES` |

**Prefix conventions for related DOM elements:**
- `fs-` — Flight sheet (detail modal)
- `cfg-` — Config panel
- `mob-` — Mobile-specific elements
- `dr-` — Drawer elements

---

## CSS Architecture

All styles are embedded in a `<style>` block within `index.html`. Key patterns:

- **CSS Custom Properties** (`--var-name`) for theme colors, scale, and spacing
- **`--scale`** variable drives responsive sizing across the whole UI
- **HSL-based theming** — `bgTheme` object controls hue/brightness dynamically
- **Night mode** — automatically activates between 00:00–06:00
- **CSS Grid + Flexbox** — used throughout; no CSS framework

---

## Responsive Design

The app targets three breakpoints:
- **Desktop** (≥1024px): Full timeline, multi-column layouts
- **Tablet** (768–1023px): Condensed timeline
- **Mobile** (<768px): Simplified views, hamburger nav, slide-up drawer

`isMobile()` gates JavaScript behavior. CSS `@media` queries handle layout.

---

## Alert System

Alerts fire when current time is within `alertSettings.warningMinutes` of a sealing or truck time:

1. `checkAlerts()` runs on a timer interval
2. Matching flights trigger `showAlertModal(flight, type)`
3. `playAlertSound()` generates audio via `AudioContext`
4. Alert is dismissed by user or auto-expires

---

## Development Guidelines

### Making Changes

Since the entire app is one file, locate the relevant section by its comment headers before editing. The file is organized top-to-bottom:

1. `<style>` block — all CSS
2. `<body>` — HTML structure
3. `<script>` block — all JavaScript

### Section Headers in Code

The JavaScript section uses block comments to delimit logical areas:

```javascript
// ─── TIMELINE VIEW ───────────────────────────────
// ─── ALERT SYSTEM ────────────────────────────────
// ─── GOOGLE SHEETS SYNC ──────────────────────────
```

Search for these headers when navigating the file.

### Adding a New View

1. Add HTML structure inside `<body>` with a new `id` (e.g., `#my-view`)
2. Add a `buildMyView()` function in the script section
3. Add a nav button that calls `showView('my-view')`
4. Update `refreshCurrentView()` to handle the new view ID

### Modifying the Data Source

The Google Sheets URL is stored in `GSHEET_CSV_URL` constant near the top of the `<script>` block. Column mapping is in the `fetchGSheet()` function.

### Adding an Airline

Airlines are in the `DEF_AIRLINES` array and can be customized via the Config panel at runtime (stored in `cop_airlines` localStorage key).

---

## Testing

There is no automated test suite. Manual testing approach:

1. Open `index.html` in a browser
2. Use `testAlert()` (accessible from Config panel) to verify the alert system
3. Use browser DevTools console for debugging
4. Test responsive behavior using DevTools device emulation
5. Verify Google Sheets sync by checking the Network tab

---

## Git Workflow

- **Main branch:** `main` (production)
- **Feature branches:** `claude/<description>-<id>` for AI-assisted development
- Commit messages are informal (e.g., "Update index.html", "week view")
- No CI/CD pipeline; deployment is manual (push to host, or file transfer)
- No pre-commit hooks configured

---

## Common Pitfalls

- **Don't add build tooling** unless explicitly requested — the zero-dependency nature is intentional
- **Don't split into multiple files** unless explicitly requested — single-file deployment is a feature
- **localStorage keys are fixed** — changing them breaks existing user data; migrate carefully
- **Google Sheets URL is hardcoded** — changes require updating `GSHEET_CSV_URL`
- **No error boundaries** — JavaScript errors in one view can break the whole app; handle defensively
- **Audio context requires user gesture** — `playAlertSound()` may be blocked by browser policy on first load
