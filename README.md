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

The API (**saver-api**) runs on `http://localhost:3000`; in development Vite proxies `/api` to it, so auth cookies work without CORS and no `.env.local` is needed. Set `VITE_API_URL` only to use another API address.

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

-   [x] C7.1 Registration page (`/register`) with field-level validation, the same rules as the API (email, username 3–32 latin letters / digits / \_, password 8+ with lower, upper and digit, up to 72 bytes, confirmation); taken email / username from the API shown next to their fields
-   [x] C7.2 Login page (`/login`, email or username); one message for wrong credentials, too many attempts explained; links between login and register keep the page to return to
-   [x] C7.3 `AuthProvider` (`entities/session`): current user from `/auth/me` (renews an expired access token once), sign in stores the returned user, sign out ends the server session and drops cached private data, expired session turns the user into a guest with a notice; header profile icon links guests to login and opens a menu with the name and Sign out
-   [x] C7.4 Protected routes: the library (`/Save`) for signed-in users, login and register for guests; guards wait for the session check, guests return to the requested page after signing in. Checked end to end in the browser against the API (in-memory repositories)

-   [x] C7.5 Email: "Forgot your password?" on the login page, `/forgot-password` (same answer for any email), `/reset-password?token=` (new password, every session ends), `/verify-email?token=` (confirms once, offers a new email when the link is used or expired), a strip under the header with "Send again" until the email is confirmed; emails in the UI language

### C8. Discover / Random

-   [x] C8.1 Catalog page `/discover`: category tabs (all, films, series, anime, cartoons, games); filters live in the URL (shareable, back button works)
-   [x] C8.2 Title search with debounce (`useDebouncedValue`, 400 ms)
-   [x] C8.3 Combined filters: type, genre (translated, from `/genres`), year range, minimum rating, sorting; reset keeps the sorting
-   [x] C8.4 Random pick dialog that respects the filters, "another one" action, clear message when nothing matches
-   [x] C8.5 Content card: poster or placeholder, type, year, real duration, genres, rating; Planned / Watching / Completed (adds to the library or changes the status in place) and a 1–10 rating; guests are sent to sign in and come back; the API returns the viewer's own status and rating with each item
-   [x] C8.6 Content details page `/content/:id` with the same actions, not-found state
-   [x] C8.7 Pagination (`shared/ui/pagination`), card skeletons, empty and error states with retry. Checked in the browser against the API with in-memory data, also at 375 px

### C9. Library

-   [x] C9.1 My library page `/collection` (signed-in only): status tabs All / Planned / Watching / Completed; category cards on `/Save` open it filtered by type, the profile menu links to it; filters live in the URL
-   [x] C9.2 Library grid with debounced search, type, genre and sorting (recently changed, recently added, title), pagination, skeletons, empty states that tell "nothing added yet" from "nothing found" and link to the catalog for the same category
-   [x] C9.3 Manual add form (same rules as the API, duration fields by type, genre chips, initial status, type preset from the category); poster by link for now
-   [ ] C9.3b Poster upload (needs B12)
-   [x] C9.4 Status changes in place; note and completion date editor (past dates only); the author edits their own content with the same form (PUT)
-   [x] C9.5 Remove from the library with a confirmation dialog (the catalog item and the rating stay)
-   [x] C9.6 Rating on library cards (the API returns the owner's status and rating with every entry). Checked in the browser against the API with in-memory data, also at 375 px

### C10. Profile and social

-   [x] C10.1 Profile page `/users/:id` (public): avatar or initials, names, bio, join date, privacy badge, follower and following counters; "My profile" and "My feed" in the profile menu
-   [x] C10.2 Edit own profile: display name, bio, avatar link, private profile (PATCH `/users/me`); the header menu updates at once
-   [x] C10.3 Follow / unfollow on other profiles with the counter updated at once; guests are sent to sign in and come back
-   [x] C10.4 Followers and following in a dialog with tabs and paging, each user links to their profile
-   [x] C10.5 Activity on profiles and the `/feed` page (followed users, public profiles only): real events in words with relative time, "show more" by cursor; private profiles show a clear message to others. Signing in refreshes data loaded as a guest. Checked in the browser against the API with in-memory data, also at 375 px

### C11. Statistics and theme

-   [x] C11.1 Stats summary on the profile: completed, watch time from real durations only (items without a duration are named, not guessed), average rating, 7 / 30 day activity; private profiles and an empty library get clear messages
-   [x] C11.2 Charts (`shared/ui/charts`, no chart library): completions by month as single-hue columns with hover / focus tooltips and a table view, ranked bars by category and favorite genre, top rated list; refreshed after status and rating changes
-   [x] C11.3 Light theme: status colors darkened to WCAG contrast on white; a test checks text (4.5:1) and UI (3:1) contrast of both themes from `tokens.scss`

### C13. External catalog

-   [x] C13.1 "Not here? Find it in TMDB" under the catalog results (signed-in users, only when the server has a TMDB token): search with the catalog text, "Add to the catalog" imports and opens the item, "Open" for titles already imported; TMDB attribution under the block and in About
-   [x] C13.2 Suggestions while typing in the catalog search ("нару" → "Наруто"): poster, type, year, IMDb score; arrows, Enter and Escape; TMDB titles to import when the catalog has few matches
-   [x] C13.3 Rating badges on cards and the details page: Saver next to IMDb and Shikimori (TMDB as the fallback), votes in short form, links to IMDb and Shikimori on the details page
-   [x] C13.4 Catalog sorted by popularity by default, plus IMDb rating; 24 titles per page and numbered pagination (1 … 6 7 8 … 262) everywhere

### C14. Images

-   [x] C14.1 `ImageField` (`shared/ui/image-field`) for the avatar and the poster: paste a link or upload a file, round / 2:3 preview, "Remove"; type and size checked before sending, server refusals explained; the API client sends `FormData` as multipart

### C15. News

-   [x] C15.1 "News" in the header (`/news`): people search by name or @username with followers and a Follow button (`widgets/people-search`), then activity with "Everyone" and "Following" tabs (the tab is kept in the URL; guests see everyone). The old `/feed` opens the Following tab
-   [x] C15.2 Feed events with the item's poster, a heart (instant, guests go to sign in) and comments: the two newest under each event, "More" opens the thread with a form and delete for your own; the news page is one centered column; profile menu on a raised surface

### C12. Quality

-   [x] C12.1 Tests (Vitest, Testing Library): routing and guards, forms, theme, language and plural forms, API errors, catalog, library, profiles, feed, statistics, theme contrast; `npm run test:coverage` — 98.6% lines, 94.9% branches
-   [x] C12.2 Performance: every page is its own chunk; React, router, TanStack Query and i18next in separate long-cached chunks (app entry 26 KB gzip); posters, avatars and category pictures below the fold load lazily; context values memoized
-   [x] C12.3 Responsive check of all pages at 320 / 375 / 768 / 1024 / 1440 / 1920 px, signed in and as a guest (`C:\dev\tools\visual\responsive-check.browser.js`); segmented controls now wrap at 320 px
