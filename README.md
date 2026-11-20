# Universal Saver — Client

Web client for **Universal Saver**, a movie and series tracker: discover films, series, anime, cartoons and games, keep them in a personal library (Planned / Watching / Completed), rate them, follow other users and see your viewing statistics.

The backend lives in a separate repository: **saver-api** (Node.js, Express, PostgreSQL).

## Stack

Current: React 18, TypeScript (strict), Vite, React Router, SCSS, Feature-Sliced Design.
Next: SCSS Modules, i18next, TanStack Query.

## Getting started

```bash
npm install
npm run dev
```

Scripts: `npm run build` (type check + build), `npm test`, `npm run check` (types, lint, formatting, tests), `npm run format`.

Every stage ships with tests; `npm run check` must pass before a task branch is merged.

## Code principles

-   Feature-Sliced Design: a layer imports only from layers below it, slices of one layer do not import each other, and other slices are imported only through their public API (`index.ts`). ESLint enforces this.
-   No duplicated code: reusable components configured through props.
-   Colors, sizes and other constants live in one place (design tokens) and are imported from there.

## Branches

-   `master` — stable releases (MVP is merged here).
-   `dev` — integration branch.
-   One branch per task, named after the task (for example `C1.1-fix-routes`), created from `dev` and merged back into `dev`.

## Roadmap

Legend: `[x]` done, `[ ]` to do. The current landing page is the visual foundation: new screens follow its style.

### C1. Stabilization (no visual changes)

-   [x] C1.1 Fix routes: "Start" button target, "Random content" link, catch-all 404 route
-   [x] C1.2 Fix `Card` (propTypes declared before the component) and category images (wrong pink imports)
-   [x] C1.3 Remove leftovers: `console.log`, commented-out code, empty files (footer About text kept for C5.2)
-   [x] C1.4 Convert images to WebP (53.2 MB -> 2.1 MB); unused images kept as style references
-   [x] C1.5 Project metadata: `package.json` name, page title, favicon, README

### C2. Foundation: TypeScript and FSD

-   [x] C2.1 Add TypeScript (strict, `allowJs` during migration), path aliases
-   [x] C2.2 FSD structure: move existing components into `app`, `pages`, `widgets`, `entities`, `shared`, public APIs via `index` files (pixel-identical before/after)
-   [x] C2.3 Convert components to `.tsx` with typed props (pixel-identical before/after)
-   [x] C2.4 SCSS Modules: every component has scoped styles, shared utilities in `shared/styles`, button styles in `shared/ui/button` (pixel-identical before/after)
-   [x] C2.5 ESLint FSD import rules (layer order, no cross-slice imports, public API only), Prettier, LF line endings
-   [x] C2.6 Tests: Vitest + Testing Library, tests for routing, header, category cards and design rules (only tokens in styles, no inline styles); `npm run check` runs everything

### C3. Design system (based on the current style)

-   [x] C3.1 Design tokens as CSS variables: colors, neon glow, gradients, spacing, radii, shadows, fonts
-   [x] C3.2 UI kit, part 1: `Button` (primary, icon, nav; renders a link when `to` is set), `Text` (any tag, `glow`), category card layout fix
-   [x] C3.2b UI kit, part 2: Input and Select on a shared FormField, Modal, Loader, Skeleton, EmptyState / ErrorState, Button sizes and secondary variant; dev-only showcase at `/ui-kit`
-   [x] C3.3 Interaction states from tokens: hover, pressed, keyboard focus ring (`:focus-visible`), disabled, modal enter animation, one global reduced-motion rule

### C4. Global providers

-   [x] C4.1 i18n (RU / EN) with typed keys, browser language detection with English fallback, saved choice, all texts moved out of JSX, RU / EN switcher in the header (`features/switch-language`)
-   [x] C4.2 ThemeProvider: System / Light / Dark (dark neon is the default by product decision), saved choice independent of language, live OS sync in System mode, no flash on load (inline script in `index.html`), first light palette in tokens, shared `SegmentedControl` for theme and language switchers
-   [x] C4.3 API client (`shared/api`): base URL from `VITE_API_URL`, cookies included, unified response format unwrapped to `data`, typed `ApiError` with codes and field errors, single shared refresh on 401 with one retry, CSRF header on mutating requests, localized error texts by code
-   [x] C4.4 TanStack Query: app-wide `QueryClient` (30 s stale time, retries only for network and 5xx errors, no mutation retries), `createQueryKeys` key factory, providers in `app/providers`
-   [x] C4.5 Toast notifications (`shared/ui/toast`): success, error, warning, info, `apiError` translated by code, optional action, auto and manual dismiss, stack limit, screen-reader roles, both themes, phone layout
-   [x] C4.6 Routing: all paths in `shared/config/routes.ts`, every page lazy-loaded into its own chunk with a page loader, `RouteGuard` for protected and guest-only routes (remembers the requested page; wired to the session in C7)

### C5. Header and footer

-   [x] C5.1 Header: navigation, language and theme switchers, mobile menu below `md` (burger, drop-down panel, closes on Escape / outside click / navigation, scroll lock); shared `NavLinks`, `useScrollLock`, `useEscapeKey` (Modal uses them too). Profile icon becomes a link in C7
-   [x] C5.2 Footer on every page: tagline, About and Contacts dialogs on the shared `Modal`, copyright. Contacts come from `shared/config/contacts.ts` (real links only; personal contacts to be added by the author)
-   [x] C5.3 Settings dock: semi-transparent round language (globe) and theme buttons pinned bottom-left above everything; each opens into its options (RU / EN, Dark / Light) on the shared `ExpandablePicker`. "System" theme removed from the UI by product decision (still supported in the model). Switchers removed from the header and mobile menu

### C6. Landing

-   [x] C6.1 Platform switcher (Telegram, Mobile, Desktop, Web) with per-platform glow color; platforms in `shared/config/platforms.ts`
-   [x] C6.2 Right case shows the selected platform illustration (Telegram bot and desktop mockups added by the owner), heights balanced across platforms; EN versions of the screenshots still to come
-   [x] C6.3 "Start" action depends on the platform: Web opens the library; Telegram, Mobile and Desktop show an apology toast ("temporarily unavailable") until they are released (auth-aware target comes in C7)
-   [x] C6.4 Responsive landing: hero above the preview below `md`, full-width preview, smaller platform icons; on laptops (1024–1280) the preview shrinks so the hero is no longer cut off. Checked at 360–1440 px with no element outside the screen; 1440 px layout unchanged
-   [x] C6.5 Laptop layout (owner feedback): hero 45% with padding from the left edge, preview fills the rest and matches it in size, fluid Start button and platform icons (one row, wider gaps), language and theme buttons split to the bottom corners, footer padded clear of them
-   [x] C6.6 Platform previews for Telegram and Desktop (owner mockups), balanced preview heights, apology toast for unreleased platforms, author's Telegram in Contacts
-   [x] C6.7 Library page layout (owner feedback): centered column, smaller fluid card images, larger gaps, descriptions wrap to a readable width, alternating card layout via `CategoryCard reversed`
-   [x] C6.8 Full-height page layout (owner feedback): header / page / footer column so the footer stays on screen when content is short, landing content centered vertically, previews in one 16:10 frame and larger on big screens; library cards wider with bigger glowing images and larger text

### C7. Authentication

-   [ ] C7.1 Registration page with field-level validation
-   [ ] C7.2 Login page (email or username)
-   [ ] C7.3 AuthProvider: current user, logout, expired session handling
-   [ ] C7.4 Protected routes

### C8. Discover / Random

-   [ ] C8.1 Categories: all, films, series, anime, cartoons, games
-   [ ] C8.2 Search with debounce
-   [ ] C8.3 Combined filters: genre, year, rating, type
-   [ ] C8.4 Random pick that respects filters, "another one" action
-   [ ] C8.5 Result card with actions: Planned / Watching / Completed, rate, details
-   [ ] C8.6 Content details page
-   [ ] C8.7 Pagination, skeletons, empty and error states

### C9. Library

-   [ ] C9.1 Status tabs: Planned, Watching, Completed
-   [ ] C9.2 Library grid with search and filters
-   [ ] C9.3 Manual add form with poster upload
-   [ ] C9.4 Edit entries and change status in place
-   [ ] C9.5 Delete with confirmation
-   [ ] C9.6 Rating

### C10. Profile and social

-   [ ] C10.1 My profile
-   [ ] C10.2 Edit profile
-   [ ] C10.3 Other user's profile, follow / unfollow
-   [ ] C10.4 Followers and following lists
-   [ ] C10.5 Activity feed

### C11. Statistics and theme

-   [ ] C11.1 Stats summary: completed count, watch time, average rating, favorite genres, 7 / 30 day activity
-   [ ] C11.2 Charts: by month, by category, by genre, top content
-   [ ] C11.3 Light theme polish (first palette exists since C4.2)

### C12. Quality

-   [ ] C12.1 Tests (Vitest, Testing Library): routing, forms, theme, language, API errors
-   [ ] C12.2 Performance: code splitting, lazy images, re-renders
-   [ ] C12.3 Responsive check of all pages
