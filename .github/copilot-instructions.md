This repository is a small React + Vite single-page site (Tailwind CSS) for an education/consulting site.

Quick context
- Framework: React 19 + Vite (see `package.json` / `vite.config.js`). Run with `npm run dev`.
- Styling: Tailwind CSS (look at `index.css` and utility classes across components).
- Routing: `react-router-dom` is used. Routes are defined in `src/App.jsx` — important routes:
  - `/` -> `src/Pages/Home/Home.jsx`
  - `/single_university` -> `src/Pages/Universities/Single_university.jsx` (accepts navigation state: `{ city, universities }`)
  - `/booking`, `/events`, `/news`, etc.

What I need from you (AI agent guidance)
- When changing navigation or routes, update `src/App.jsx` and the `Navbar` (`src/Pages/Navbar/Navbar.jsx`) so the route and hash navigation remain consistent.
- University listing flow: the `Universities` page should pass the selected city and its `universities` array to `Single_university` using `navigate('/single_university', { state: { city, universities } })`. `Single_university.jsx` uses this pattern — prefer transmitting data this way rather than global state.
- Language selection: components read the active language from `localStorage.getItem('lang') || 'uz'` and switch text via inline `t = {...}[lang]` objects. Follow this convention when adding translatable text.

Important project patterns and examples
- Page transitions: use `framer-motion` wrapper `PageTransitionWrapper` in `src/App.jsx` for route transitions. Keep motion props consistent with existing pages.
- Small, embedded datasets: many pages embed sample arrays (see `Single_university.jsx`, `Home.jsx`). For small local data use the same inline array style; for larger data add a new module under `src/data/` and import it.
- Navigation state transfer: Home's city cards and the Universities page navigate using `navigate('/single_university', { state: { city: city.name } })`. Reuse this when you need to route to a page with contextual data.
- Tailwind usage: utility classes are used everywhere; avoid introducing global CSS unless necessary. Keep responsive classes and existing color tokens (`#8F0810`, `#274F94`).

Developer workflows
- Start dev server: `npm install` (if needed) then `npm run dev`.
- Build for production: `npm run build`; preview: `npm run preview`.
- Lint: `npm run lint` (eslint).

Where to look when editing UI
- `src/Pages/*` — pages are mostly self-contained. Examples:
  - `src/Pages/Home/Home.jsx` (city cards, partner carousels)
  - `src/Pages/Universities/Universities.jsx` (new page — country/variant/city flow)
  - `src/Pages/Universities/Single_university.jsx` (city-specific list; accepts `universities` via navigation state)

Common pitfalls to avoid
- Don't change route paths in a single file. Update `src/App.jsx` and any `navigate(...)` uses in components.
- Language strings: adding new text should follow `localStorage`-based lang selection to avoid inconsistent UIs.
- Images: many pages use external image URLs — prefer adding images to `public/` if they must be bundled.

Examples (copy-paste patterns)
- Navigate and pass data:
  navigate('/single_university', { state: { city: city.name, universities: city.universities } });

- Read language and pick strings:
  const lang = localStorage.getItem('lang') || 'uz';
  const t = { uz: {...}, en: {...} }[lang];

If you need more
- If you want to introduce centralized data (API or static JSON), add `src/data/` and update imports; prefer passing arrays through navigation state for small lists to avoid adding global stores.
- Ask for guidance if you plan to change global styles, routing structure, or introduce a state manager (Redux/Context) — those are larger changes.

If anything in this file looks wrong or incomplete, tell me which feature or file you'd like clarified.
