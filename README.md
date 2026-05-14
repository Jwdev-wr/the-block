<p align="center">
  <img src="docs/the_block_repo.png" alt="The Block challenge hero image" width="960" />
</p>

# The Block — Buyer Vehicle Auctions

A frontend-only prototype of the buyer side of a vehicle auction marketplace, built against the 200-vehicle synthetic dataset in [`data/vehicles.json`](data/vehicles.json). A buyer can browse the inventory, search and filter by 12+ facets, inspect a vehicle in detail, and place bids that update visible state immediately and persist across page reloads.

The original OPENLANE challenge prompt has been preserved at [`docs/CHALLENGE.md`](docs/CHALLENGE.md). Submission notes live in [`SUBMISSION.md`](SUBMISSION.md), and walkthrough expectations in [`WALKTHROUGH.md`](WALKTHROUGH.md).

---

## Tech stack

- **React 19 + Vite 8 + TypeScript** — fast HMR, strict types end-to-end.
- **Tailwind CSS v4** via the `@tailwindcss/vite` plugin, CSS-variable themed.
- **shadcn/ui** primitives on top of **Radix UI** (Dialog, Select, Separator, Label, Slot) for accessible Button / Input / Card / Badge / Dialog / Sheet / Select / Checkbox / Toaster.
- **React Router 7** declarative routes.
- **sonner** for non-blocking toast notifications.
- **lucide-react** icon set.
- **Vitest + React Testing Library + @testing-library/user-event + jsdom** for unit + component tests.
- **Playwright** for end-to-end tests (desktop Chromium + Pixel 7 mobile project).

There is **no backend, no auth, no database, no payments, no seller workflow**. All state is in-memory plus `localStorage`. This is deliberate, per the challenge brief.

## Node version

This project targets **Node 20.19+ or 22.12+** (Vite 8 requirement). Verified locally with Node 23.8. Use whatever version manager you prefer (`nvm`, `fnm`, `mise`, etc.).

## Quick start

```bash
# Install deps (~40s on a cold cache)
npm install

# Start the dev server with HMR
npm run dev
# → http://localhost:5173

# Build for production
npm run build

# Preview the production bundle
npm run preview
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with HMR. |
| `npm run build` | Type-check (`tsc -b`) and produce a production bundle in `dist/`. |
| `npm run preview` | Serve the production bundle locally. |
| `npm run lint` | ESLint over `src/`. |
| `npm run test` | Vitest in watch mode. |
| `npm run test:run` | Vitest single run (CI mode). |
| `npm run test:coverage` | Vitest with v8 coverage. |
| `npm run e2e` | Playwright tests (auto-spins up `build && preview`). |
| `npm run e2e:ui` | Playwright UI mode for interactive debugging. |

### Running Playwright the first time

```bash
npx playwright install chromium
npm run e2e
```

On a fresh machine Playwright will download the Chromium build it pins. If your network blocks the default install dir, set `PLAYWRIGHT_BROWSERS_PATH` (this repo ignores `.playwright-browsers/`).

## Data source

- `data/vehicles.json` is the canonical 200-vehicle dataset shipped with the challenge. The file is read-only — the app never mutates it.
- A Vite alias `@data` resolves to `data/`, so the JSON is type-checked and tree-shaken into the bundle (see [`vite.config.ts`](vite.config.ts) and [`src/data/index.ts`](src/data/index.ts)).
- The `Vehicle` shape lives in [`src/types/vehicle.ts`](src/types/vehicle.ts) and is the source of truth for all downstream code.

## Bidding rules (documented & tested)

- **Effective current amount** = `current_bid ?? starting_bid`. When a vehicle has no active bid, the starting bid is the floor for the first bid.
- **Tiered bid increments** (applied on top of the effective current amount):
  - below \$10,000 → \$250
  - \$10,000 – \$49,999 → \$500
  - \$50,000 and above → \$1,000
- **Validation** rejects: blank input, non-numeric, decimal, negative, zero, below minimum, equal to the current bid, and bids at or above an existing `buy_now_price` (use Buy Now to purchase outright).
- **Buy Now** is hidden when `buy_now_price` is null. When present, an outline secondary button purchases at the listed price and locks the form into a "purchased" state.
- **Reserve status** is exposed as **No reserve / Reserve met / Reserve not met** — never the dollar amount. This mirrors how real auction floors hide the reserve from buyers.
- A successful bid: updates the displayed current bid, increments `bid_count` by 1, fires a success toast, persists overrides to `localStorage` under the key `the-block:bids:v1`, and is reflected on inventory cards when the user returns.
- A **"Reset demo bids"** affordance appears at the bottom of the inventory page when overrides exist and clears all stored bids.

All of this is covered by ~25 unit tests in [`src/lib/bidding-rules.test.ts`](src/lib/bidding-rules.test.ts) and component tests in [`src/features/bidding/BidPanel.test.tsx`](src/features/bidding/BidPanel.test.tsx).

## Timestamp normalization assumption

`auction_start` values in the dataset are **synthetic scheduling data** (dates in early- to mid-2026). The challenge brief explicitly allows normalizing them relative to "now". In this prototype:

- **Bidding is always enabled** regardless of whether the synthetic auction start is in the past or future. The app is presented as a prototype auction floor; gating bids on a fake date would worsen the demo without illustrating real value.
- Auction start is shown on the detail page labeled "**Auction start (synthetic)**" so the choice is transparent to the reviewer.
- A future iteration with real timestamps would gate the BidPanel by status (upcoming / live / ended) — see _Future improvements_ below.

## Product decisions and tradeoffs

| Decision | Rationale |
| --- | --- |
| **App at repo root, not in a `web/` subfolder** | One `npm install`, one `npm run dev` — reviewers clone and run with zero context-switching. The original `README.md` was moved to `docs/CHALLENGE.md` to make room. |
| **Reserve status, not reserve price** | Real auctions almost never expose the reserve dollar amount to buyers; revealing it would be a poor product signal even though it would simplify some test assertions. |
| **Recommended sort = composite** | Active bids first → higher condition grade → newer year → lower odometer. Optimises for "interesting and trustworthy vehicles first". Documented and unit-tested. |
| **URL-driven filter/sort state** | Search, every filter, and the sort key serialize to query params, so any view is shareable, the back button works, and a refresh keeps the user's place. Implemented in [`src/lib/url-state.ts`](src/lib/url-state.ts). |
| **Two BidPanel instances on the detail page** | A sticky right-rail panel on desktop and a sticky bottom bar on mobile. Both subscribe to the same context, so a bid placed in either is immediately reflected in both. |
| **shadcn-style components hand-written rather than via the CLI** | Faster than running the CLI inside a sandboxed environment, easier to read, and gives us a small, intentional UI surface. The components.json schema is still present for parity. |
| **No watchlist / compare drawer / recently viewed** | Stretch features were deliberately deferred to protect the core flow inside the 4–8 hour timebox. They are listed in _Future improvements_. |
| **Currency in CAD with `en-CA` locale** | The dataset lists Canadian provinces — formatting consistently as CAD keeps the prototype believable. |
| **Lazy localStorage hydration in the bid store** | `useReducer` is initialised from `localStorage` on the first render so the form cannot lose an in-progress edit to a delayed hydrate effect — a subtle bug we encountered and fixed during testing. |

## Architecture

```text
src/
  app/                    # App shell + router
  components/
    ui/                   # shadcn-style primitives (Radix-backed where needed)
    layout/               # Header, PageContainer
  features/
    inventory/            # InventoryPage, VehicleCard, FilterPanel, SortMenu, ActiveFilterChips, EmptyState
    vehicle-detail/       # VehicleDetailPage, ImageGallery, SpecsGrid, ConditionReport, AuctionMeta, NotFound
    bidding/              # BidContext, BidPanel, ReserveStatusBadge
  lib/                    # PURE helpers — no React deps
    formatters.ts         # Currency, odometer, date, grade
    vehicle-search.ts     # Case-insensitive multi-field matcher
    vehicle-filters.ts    # Predicate builders + active-filter count
    vehicle-sort.ts       # Comparators + composite Recommended ranking
    bidding-rules.ts      # Increment tiers, min next bid, validation, reserve status
    bid-merge.ts          # Merges base vehicles with localStorage overrides
    storage.ts            # Typed read/write/clear for localStorage
    url-state.ts          # Filter/sort ⇄ URL query params
    utils.ts              # cn() — clsx + tailwind-merge
  types/vehicle.ts        # Vehicle, BidOverride, FilterState, SortKey
  data/index.ts           # Imports @data/vehicles.json with Vehicle[] type
  test/setup.ts           # jest-dom + jsdom shims for Radix
e2e/                      # Playwright specs
data/vehicles.json        # Untouched dataset
docs/CHALLENGE.md         # The original challenge README
```

The dividing line is hard: anything in `src/lib/` is a pure function with no React dependency and is unit-tested. Anything in `src/features/` is a React component or hook composed on top.

## Testing

| Layer | Tool | Files | Coverage |
| --- | --- | --- | --- |
| Unit | Vitest | `src/lib/*.test.ts` | 89 tests across formatters, search, filters, sort, bid validation, reserve status, storage round-trip, URL serialisation, override merging — including every documented edge case (`null` current bid / reserve / buy-now, decimals, negatives, equal-to-current, mixed-case search, whitespace, unknown enum values). |
| Component | Vitest + React Testing Library | `src/features/**/*.test.tsx` | 26 tests covering inventory rendering, search narrowing, filter chips, sort reordering, mobile filter sheet open/apply/close, card → detail navigation, detail render, empty-damage state, bid form rejection + acceptance, reserve-status transition, Buy Now lock. |
| End-to-end | Playwright | `e2e/*.spec.ts` | 8 specs (7 desktop + 1 mobile) covering the seven flows in the brief plus a mobile filter-sheet + sticky-bid-bar flow. The desktop project skips the mobile spec via `testIgnore`. |

```bash
npm run test:run    # 115 unit + component tests, ~3s
npm run e2e         # 8 Playwright specs, ~13s after first build
```

## Accessibility checklist (what we verified)

- Visible focus rings on every interactive element (`focus-visible:ring-*` Tailwind utilities).
- Keyboard tab order reaches: header logo → search → filter checkboxes (sidebar or sheet trigger) → sort select → vehicle cards → back link → gallery controls → bid input → place-bid button.
- Form controls have explicit `<label>` associations.
- Validation errors are linked to the input via `aria-describedby` and announced via `role="alert"`.
- Radix Dialog/Sheet handle focus trap + restore for the mobile filter sheet.
- Photo gallery announces position via `aria-live="polite"` and supports left/right arrow keys when focused.
- Images have meaningful alt text derived from `year make model trim photo N of M`.
- Color contrast tuned with oklch tokens against a near-white background; the destructive/warning/success badge variants meet WCAG AA at 14px.

## Known limitations

- **Bid persistence is per-browser.** Two browsers see two independent bid states; this is fine for a prototype but obviously not production.
- **Auction state is static.** No countdown ticker, no live-vs-upcoming gating, no extension-on-late-bid behavior. The synthetic timestamps would need to be normalised to wall-clock time to do this well.
- **Reserve hiding is by convention only.** A determined user could read `data/vehicles.json` straight from the bundle. A real implementation would only send `reserve_status`, never the dollar amount.
- **Filter facet counts aren't shown.** The brief permits this, and 200 records is small enough that empty-result feedback is fast.
- **No virtualisation.** 200 cards is well under the budget where virtualisation pays off; if the dataset grew 10× we'd add `react-virtual`.
- **ESLint 10 engine warning.** ESLint 10 requires Node 20.19+ / 22.13+ / 24+; Node 23 emits a warning but works.

## AI / tooling usage

This implementation was built with Cursor's agent mode. The collaboration was:

1. **Brief and decisions** were drafted up front and turned into a `CreatePlan` file (architecture, helpers, components, tests) before any code was written. The plan was confirmed by the user, and the agent worked through the todo list in order.
2. **Pure helpers were written before the UI** and unit tested as they were written. This caught the increment-tier / starting-bid-floor / decimal-rejection edge cases before any component depended on them.
3. **The shadcn-style components were authored manually** rather than via `npx shadcn add`, both to avoid sandboxed CLI prompts and to keep the diff small and reviewable.
4. **Tests were written feature-by-feature**, not at the end. Test failures during development directly drove two real bug fixes: (a) the Checkbox label nesting / `htmlFor` double-click toggle, and (b) the BidContext hydration race (replaced an `useEffect` hydrate with a lazy `useReducer` initialiser).
5. **Visual QA** used the in-IDE browser MCP against the dev server to verify the inventory grid, detail page, bid flow, and toast confirmation rendered correctly before component tests were finalized.
6. **Documentation** (this README) was written last, after everything compiled, tests passed, and decisions were locked in.

Refinements I would make with more time: split the JSON dataset out of the bundle and fetch it as static JSON; switch the desktop sidebar to facet-counts that update with the search query; and add the watchlist / saved-search stretch features.

## Future improvements

- **Watchlist + recently viewed**, keyed in `localStorage`, surfaced as a header counter and a "Watching" filter chip.
- **Live auction state**: normalize `auction_start` against `Date.now()`, gate bids by status (`upcoming` / `live` / `ended`), and surface a countdown.
- **Facet counts on filter checkboxes** so the user sees how many vehicles each option would return.
- **Optimistic bid + undo toast** to let the user back out within ~6 seconds of an accidental bid.
- **Code-split the 200-vehicle JSON** and load it via a `Suspense` boundary, dropping the initial JS chunk below 200 kB.
- **axe-core scan in Playwright** to guard a11y regressions in CI.
- **Internationalisation** (string extraction, locale-aware currency / dates / numbers).

---

If you have any trouble running the project, open an issue or reach out — the README assumes a fresh clone and `npm install` should be enough to get to a working app.
