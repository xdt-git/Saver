# Universal Saver — Client

Web client for **Universal Saver**, a movie and series tracker: discover films, series, anime, cartoons and games, keep them in a personal library (Planned / Watching / Completed), rate them, follow other users and see your viewing statistics.

The backend lives in a separate repository: **saver-api** (Node.js, Express, PostgreSQL).

## Stack

Current: React 18, Vite, React Router, SCSS.
Target: React, TypeScript, Feature-Sliced Design, SCSS Modules, React Router, i18next, TanStack Query.

## Getting started

```bash
npm install
npm run dev
```

## Branches

- `master` — stable releases (MVP is merged here).
- `dev` — integration branch.
- One branch per task, named after the task (for example `C1.1-fix-routes`), created from `dev` and merged back into `dev`.

## Roadmap

Legend: `[x]` done, `[ ]` to do. The current landing page is the visual foundation: new screens follow its style.

### C1. Stabilization (no visual changes)
- [ ] C1.1 Fix routes: "Start" button target, "Random content" link, catch-all 404 route
- [ ] C1.2 Fix `Card` (propTypes declared before the component) and category images (wrong pink imports)
- [ ] C1.3 Remove leftovers: `console.log`, commented-out code, empty files
- [ ] C1.4 Convert images to WebP, remove unused ones
- [ ] C1.5 Project metadata: `package.json` name, README

### C2. Foundation: TypeScript and FSD
- [ ] C2.1 Add TypeScript (strict, `allowJs` during migration), path aliases
- [ ] C2.2 FSD structure: `app`, `pages`, `widgets`, `features`, `entities`, `shared`, public APIs via `index.ts`
- [ ] C2.3 Move existing components into layers and convert to `.tsx` (visual check before/after)
- [ ] C2.4 SCSS Modules, shared mixins in `shared/styles`
- [ ] C2.5 ESLint, Prettier, FSD import rules

### C3. Design system (based on the current style)
- [ ] C3.1 Design tokens as CSS variables: colors, neon glow, gradients, spacing, radii, shadows, fonts
- [ ] C3.2 UI kit in `shared/ui`: Button variants, Input, Select, Modal, Card, Loader, Skeleton, EmptyState, ErrorState
- [ ] C3.3 Interaction states: hover, focus, disabled, animations

### C4. Global providers
- [ ] C4.1 i18n (RU / EN), language detection, all texts moved out of JSX
- [ ] C4.2 ThemeProvider: System / Dark / Light, no flash on load
- [ ] C4.3 API client: base URL from env, unified response format, error handling, token refresh
- [ ] C4.4 Request caching with TanStack Query
- [ ] C4.5 Toast notifications (success, error, warning, info)
- [ ] C4.6 Routing: lazy pages, public and protected routes

### C5. Header and footer
- [ ] C5.1 Header: navigation, language and theme switchers, profile icon, mobile menu
- [ ] C5.2 Footer with About and Contacts popups

### C6. Landing
- [ ] C6.1 Platform switcher (Browser, Mobile, Telegram, Desktop) with per-platform highlight color
- [ ] C6.2 Right case shows the selected platform illustration
- [ ] C6.3 "Start" action depends on platform and auth state; links come from config
- [ ] C6.4 Responsive layout

### C7. Authentication
- [ ] C7.1 Registration page with field-level validation
- [ ] C7.2 Login page (email or username)
- [ ] C7.3 AuthProvider: current user, logout, expired session handling
- [ ] C7.4 Protected routes

### C8. Discover / Random
- [ ] C8.1 Categories: all, films, series, anime, cartoons, games
- [ ] C8.2 Search with debounce
- [ ] C8.3 Combined filters: genre, year, rating, type
- [ ] C8.4 Random pick that respects filters, "another one" action
- [ ] C8.5 Result card with actions: Planned / Watching / Completed, rate, details
- [ ] C8.6 Content details page
- [ ] C8.7 Pagination, skeletons, empty and error states

### C9. Library
- [ ] C9.1 Status tabs: Planned, Watching, Completed
- [ ] C9.2 Library grid with search and filters
- [ ] C9.3 Manual add form with poster upload
- [ ] C9.4 Edit entries and change status in place
- [ ] C9.5 Delete with confirmation
- [ ] C9.6 Rating

### C10. Profile and social
- [ ] C10.1 My profile
- [ ] C10.2 Edit profile
- [ ] C10.3 Other user's profile, follow / unfollow
- [ ] C10.4 Followers and following lists
- [ ] C10.5 Activity feed

### C11. Statistics and theme
- [ ] C11.1 Stats summary: completed count, watch time, average rating, favorite genres, 7 / 30 day activity
- [ ] C11.2 Charts: by month, by category, by genre, top content
- [ ] C11.3 Light theme

### C12. Quality
- [ ] C12.1 Tests (Vitest, Testing Library): routing, forms, theme, language, API errors
- [ ] C12.2 Performance: code splitting, lazy images, re-renders
- [ ] C12.3 Responsive check of all pages
