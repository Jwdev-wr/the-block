# Walkthrough — The Block

A guided tour of **The Block**, the frontend-only buyer experience built against the 200-vehicle synthetic dataset in [`data/vehicles.json`](data/vehicles.json). The goal of this document is to make the project legible end-to-end: features, architecture, trade-offs, what's tested, what's intentionally absent, and the interesting problems encountered along the way.

> **Stack:** React 19 · Vite 8 · TypeScript · Tailwind CSS v4 · shadcn-style components on Radix UI · React Router 7 · sonner toasts · Vitest + React Testing Library · Playwright (desktop Chromium + Pixel 7 mobile).

For setup, scripts, and submission notes see [`README.md`](README.md). The original challenge prompt is preserved at [`docs/CHALLENGE.md`](docs/CHALLENGE.md).

---

## 1. What's shipped

A single-page React application with two routes and one persistent overlay:

**`/` — Inventory page**
- A search box that filters the 200 cards by year, make, model, trim, VIN, lot, city, province, or selling dealership (case-insensitive, whitespace-trimmed, all fields searched).
- A filter panel with twelve facets: quick toggles (Has Buy Now, No reserve), Make (multi-select), Body style, Province, Title status, Fuel type, Drivetrain, Transmission, Minimum condition grade, Current bid range (min/max in CAD), and Odometer range (min/max in km).
- A sort menu with six options: Recommended (a composite ranking), Year newest, Odometer lowest, Bid lowest, Bid highest, and Bids most.
- Active filters surface as removable chips above the grid, and an inventory count ("Showing 47 of 200 vehicles") sits beneath the page heading.
- An empty state with a "Clear filters" call-to-action when no vehicles match.
- A "Reset demo bids" affordance appears at the bottom of the page once any local bids exist, and clears every override at once.

**`/vehicles/:vehicleId` — Vehicle detail page**
- Image gallery with prev/next buttons, thumbnail strip, arrow-key navigation, and `aria-live` position announcements.
- Specs grid (engine, transmission, drivetrain, fuel type, body style, odometer, exterior/interior color, location).
- Condition report (grade badge, condition text, damage notes — with a "No damage notes reported" empty state when the array is empty).
- Auction & dealer panel (synthetic auction start, selling dealership, location, VIN).
- A bid panel: current bid (or starting bid), bid count, reserve status badge ("No reserve" / "Reserve met" / "Reserve not met"), bid input with inline validation, optional Buy Now button when `buy_now_price` is non-null.
- Back-to-inventory link that **preserves the previous search, filter, and sort state**.

**Invalid vehicle URL — friendly 404**
- A NotFound view with a "Back to inventory" button.

**Global affordances**
- A header that links back to the inventory.
- A sonner toaster that announces bid placements and the demo-reset action.
- Mobile (`<lg`): filters move into a slide-in `Sheet` with focus trap and a "Show N vehicles" footer; the bid panel becomes a sticky bottom bar on the detail page.
- Desktop (`≥lg`): filters live in a sticky sidebar; the bid panel lives in a sticky right rail.

---

## 2. Repository layout

```text
src/
  app/                     # Router, BidProvider, header, footer, global toaster
  components/
    ui/                    # shadcn-style primitives — Button, Input, Card, Dialog, Sheet, Select, Checkbox, …
    layout/                # Header, PageContainer
  features/
    inventory/             # InventoryPage, VehicleCard, FilterPanel, ActiveFilterChips, SortMenu, EmptyState
    vehicle-detail/        # VehicleDetailPage, ImageGallery, SpecsGrid, ConditionReport, AuctionMeta, NotFound
    bidding/               # BidContext, BidPanel, ReserveStatusBadge
  lib/                     # Pure helpers — every file has a co-located *.test.ts
    formatters.ts          #   currency / odometer / date / vehicle title
    vehicle-search.ts      #   case-insensitive multi-field matcher
    vehicle-filters.ts     #   predicate builders + active-filter counter
    vehicle-sort.ts        #   comparators + composite "Recommended"
    bidding-rules.ts       #   increment tiers, min next bid, validation, reserve status
    bid-merge.ts           #   merges base vehicles with localStorage overrides
    storage.ts             #   typed read/write/clear for localStorage
    url-state.ts           #   FilterState/SortKey ⇄ URLSearchParams
    utils.ts               #   cn() — clsx + tailwind-merge
  types/vehicle.ts         # Vehicle, BidOverride, FilterState, SortKey, ReserveStatus
  data/index.ts            # Imports @data/vehicles.json with Vehicle[] type
  test/setup.ts            # jest-dom + jsdom shims for Radix
e2e/                       # Playwright specs
data/vehicles.json         # The 200-vehicle dataset — never mutated
docs/CHALLENGE.md          # Original challenge brief
README.md                  # Reviewer-facing setup, scripts, decisions
WALKTHROUGH.md             # This file
```

The dividing line is hard: anything under `src/lib/` is a pure function with no React dependency and is unit-tested. Anything under `src/features/` is a React component, hook, or context composed on top.

---

## 3. Architecture decisions

The decisions that shape the codebase, each with the trade-off made.

### 3.1 App at the repo root, not in a `web/` subfolder
The Vite project files (`vite.config.ts`, `index.html`, `src/`) sit at the repo root next to `data/vehicles.json`. One `npm install`, one `npm run dev` from a fresh clone — no context-switching. The original challenge `README.md` was moved to `docs/CHALLENGE.md` to make room for a project-specific README.

### 3.2 Pure helpers before any UI
Every helper in `src/lib/` is a framework-agnostic function with its own `*.test.ts` co-located next to it. The bidding rules and filter logic are the heart of the product; specifying and testing them in isolation made the edge cases (decimal bids, equal-to-current bids, null reserve, mixed-case search) visible before any component depended on them. The test pyramid is correctly weighted as a result: 89 pure unit tests at the base, 26 component tests in the middle, 9 end-to-end tests at the top.

### 3.3 The dataset is read-only
`data/vehicles.json` is imported once via the `@data` Vite alias into `src/data/index.ts` and typed as `Vehicle[]`. The base array is **never** mutated. Bids and Buy-Now actions write to a separate `Record<vehicleId, BidOverride>` map maintained by `BidContext`. The merge step in `bid-merge.ts` produces a derived `Vehicle[]` where each entry is `{ ...base, ...override }`. Components only see the merged array via `useBidStore()`.

Treating the dataset as input rather than state keeps persistence behavior unambiguous and decouples test isolation from data loading.

### 3.4 State management: React Context + `useReducer` + `localStorage`
A single `BidProvider` at the app root owns the override map. The reducer accepts three actions: `PLACE_BID`, `BUY_NOW`, `RESET`. The `useBidStore()` hook exposes `vehicles`, `getVehicle`, `placeBid`, `buyNow`, `resetAll`, `hasOverrides`, and `isBoughtNow`.

The app is read-mostly with very small, infrequent writes; a redux-like store would be overkill. Context + reducer gives a single source of truth, predictable updates, and trivial testing.

**Hydration nuance:** `useReducer` is initialised lazily with a function that reads from `localStorage` — *not* with an empty initial state and a `useEffect` that hydrates after mount. The lazy init avoids the "first render saw empty state, second render hydrated" flash and a subtle race in the bid form where a user typing right after mount could have their value clobbered.

The persistence key is `the-block:bids:v1`, and reads/writes are wrapped in try/catch so private-mode browsers don't blow up.

### 3.5 URL is the source of truth for view state
Every filter, the search query, and the sort key serialize into `URLSearchParams`. The `parseUrlState` and `serializeUrlState` functions in `src/lib/url-state.ts` are the only adapter. Three consequences:

- Any view is a shareable, reload-safe link — paste a filtered URL and you get the same view.
- The browser back button does the right thing, which makes the new "search preserved on back" UX trivial to implement.
- There's no second state container for view state.

The trade-off is that the URL grows when many filters are active. Worth it.

### 3.6 Bidding rules are explicit, documented, and tested
The whole spec lives in `src/lib/bidding-rules.ts` and is unit-tested in `bidding-rules.test.ts`.

- **Effective current** = `current_bid ?? starting_bid`. When a vehicle has no active bid, the starting bid is the floor for the first bid.
- **Tiered bid increments** layered on top of the effective current:
  - below \$10,000 → \$250
  - \$10,000 – \$49,999 → \$500
  - \$50,000 and above → \$1,000
- **Validation** rejects: blank input, non-numeric, decimals, negatives, zero, below minimum, equal to the current bid, and bids at or above an existing `buy_now_price` (the user is directed to use Buy Now instead).
- **Reserve status** is the enum `"none" | "met" | "not_met"`. Components never see the reserve dollar amount — only the status. This mirrors how real auctions hide the reserve from buyers.
- **Buy Now** is hidden when `buy_now_price` is null. When present, the button purchases at the listed price and locks the form into a "purchased" state via an `isBoughtNow` flag in the override.

A successful bid updates the displayed current bid, increments `bid_count` by 1, fires a success toast, and persists. A successful Buy Now does the same plus locks the form.

### 3.7 Two BidPanel instances per detail page
The detail page renders the same `<BidPanel>` twice — once in a sticky right-rail (desktop), once in a sticky bottom bar (mobile, with a `compact` prop that hides the price header). Both subscribe to the same `BidContext`, so a bid placed in either is immediately reflected in both. The mobile sticky bar gives one-thumb access to the primary action on small screens.

Each panel's input and error elements use variant-scoped DOM IDs (`bid-input-desktop-${vehicleId}` vs `bid-input-mobile-${vehicleId}`) so that exactly one `<label>` is associated with each input. An earlier version shared a single ID and produced the accessible name `"Your bid Your bid"` because both labels matched the same input.

### 3.8 shadcn-style components on Radix
`src/components/ui/` contains Button, Input, Label, Card, Badge, Separator, Dialog, Sheet, Select, Checkbox, and Toaster. Components that need real accessibility behavior (Dialog, Select, Label, Slot) are built on Radix UI primitives. The rest are thin Tailwind-styled wrappers around native elements.

The components are hand-written rather than scaffolded via `npx shadcn add`. This kept the UI surface small and intentional, and a `components.json` is still present so the standard `shadcn` CLI would work if more primitives were ever needed.

### 3.9 Recommended sort = composite ranking
The default "Recommended" sort orders by:

1. Vehicles with active bids first (`current_bid !== null`),
2. then higher `condition_grade`,
3. then newer `year`,
4. then lower `odometer_km`.

This optimises for "interesting and trustworthy vehicles first" — active interest signals are real, and condition and recency are reasonable defaults for buyers without an explicit query. Each tiebreaker tier is tested independently in `vehicle-sort.test.ts`.

### 3.10 Search and filters are preserved across navigation
Each `<VehicleCard>` link passes `state={{ from: location.pathname + location.search }}` when navigating to `/vehicles/:id`. The detail page reads `location.state.from` and uses it as the `to` for its **Back to inventory** link, falling back to `/` if the user landed on the detail page directly.

Without this, clicking a card → back would drop the user on the unfiltered inventory and they'd lose their place. The trade-off is that this state lives in `history.state`, not the URL, so a hard reload of the detail page loses the "from" memory. That's acceptable because the URL of the detail page is intentionally share-targeted at the vehicle.

### 3.11 Responsive layout
- **Desktop sidebar:** a sticky filter rail at `top-20` with `max-h-[calc(100vh-6rem)] overflow-y-auto`. The rail scrolls independently of the page so a tall filter list never clips off-screen.
- **Mobile sheet:** a Radix Dialog-backed `Sheet` (focus trap + restore for free). The sheet is `flex flex-col h-full`. The middle filter container is `min-h-0 flex-1 overflow-y-auto`. The header stays pinned at the top, the "Show N vehicles" footer stays pinned at the bottom, and only the filter list scrolls between them.
- **Sticky mobile bid bar:** `fixed inset-x-0 bottom-0 lg:hidden` with a `pb-32` shim on the detail page's main column so the last section isn't covered.
- **Filter sections** use `flex flex-col gap-2` internally to guarantee that the `inline-flex` Checkbox elements always stack vertically rather than flowing onto the same line.

### 3.12 Timestamp normalization
The dataset's `auction_start` values are synthetic dates in early- to mid-2026. The brief explicitly permits normalising them. The implementation choice is to **always enable bidding**, regardless of whether the synthetic auction start is past or future. The detail page labels the field "Auction start (synthetic)" so the choice is transparent.

A real-data implementation would gate the BidPanel by `upcoming | live | ended` and surface a countdown. That's listed in [§8 What's deliberately absent](#8-whats-deliberately-absent).

---

## 4. State and persistence in detail

The persistent state in this app is exactly one map: vehicle ID → override. Everything else is derived.

```ts
interface BidOverride {
  vehicleId: string
  current_bid: number      // overrides the base value
  bid_count: number        // base + N successful bids
  isBoughtNow: boolean     // true after Buy Now closes the lot
}
```

- **Reading** the merged inventory: `useBidStore()` returns `{ vehicles, getVehicle, ... }`. The `vehicles` array is `useMemo`-ed against the overrides map and the base array.
- **Writing** a bid: `placeBid(vehicleId, amount)` dispatches `PLACE_BID`, which produces a new override with `current_bid = amount`, `bid_count = previousCount + 1`, `isBoughtNow = previous` (typically false). The reducer's writes go to both React state and `localStorage` via the `storage.ts` adapter.
- **Buying now**: `buyNow(vehicleId, price)` dispatches `BUY_NOW`. Same shape as a bid, plus `isBoughtNow: true`. The BidPanel reads `isBoughtNow` and replaces the form with a confirmation state.
- **Resetting**: `resetAll()` dispatches `RESET`, clears `localStorage`, and the toaster announces it.

The reducer is defensive about missing base vehicles (e.g., when used with test fixtures): a vehicle that isn't in the base map still produces a valid override, defaulting `bid_count` to 0.

---

## 5. URL state in detail

`src/lib/url-state.ts` is the single point at which `FilterState`/`SortKey` round-trip to and from a URL.

| Filter field | URL key | Encoding |
| --- | --- | --- |
| `search` | `q` | raw string |
| `hasBuyNow` | `buyNow` | `1` if true, absent otherwise |
| `noReserve` | `noReserve` | `1` if true, absent otherwise |
| `makes`, `provinces`, `bodyStyles`, `titleStatuses`, `fuelTypes`, `drivetrains`, `transmissions` | same name | comma-separated |
| `gradeMin` | `gradeMin` | number string |
| `priceMin`, `priceMax`, `odometerMin`, `odometerMax` | same name | number string |
| Sort key | `sort` | enum (`recommended` is the default and omitted) |

Default/empty values are *omitted* from the URL so the URL stays short for the typical user.

The inventory page uses `useSearchParams` from React Router and calls `setSearchParams(serializeUrlState(filters, sort), { replace: true })` on every change so back-button history isn't flooded with intermediate states.

---

## 6. Accessibility

- Visible focus rings on every interactive element via `focus-visible:ring-*` tokens.
- Keyboard tab order: header logo → search → filter checkboxes (sidebar or sheet trigger) → sort select → vehicle cards → back link → gallery controls → bid input → place-bid button.
- Form controls have associated `<label>`s. Validation errors are linked to inputs via `aria-describedby` and announced with `role="alert"`.
- Heading hierarchy on the detail page: `h1` vehicle title → `h2` sections (Specs, Condition report, Auction & dealer) → `h3` Condition → `h4` Damage notes.
- The photo gallery is a `region` with `aria-live="polite"` for position announcements and supports left/right arrow keys when focused.
- Image alt text is meaningful: `"<Year> <Make> <Model> <Trim> photo N of M"`.
- Radix handles focus trap + restore for the mobile filter sheet automatically.
- Color tokens are oklch-based. Contrast is tuned for WCAG AA at 14px, including the destructive / warning / success badge variants.

---

## 7. Testing strategy

| Layer | Tool | Count | Lives in |
| --- | --- | ---: | --- |
| Unit | Vitest | 89 | `src/lib/*.test.ts` |
| Component | Vitest + React Testing Library + user-event | 26 | `src/features/**/*.test.tsx` |
| End-to-end | Playwright (Chromium + Pixel 7) | 9 | `e2e/*.spec.ts` |

- The 115 unit + component tests run in ≈4 seconds and cover every documented edge case (`null` current bid / reserve / buy-now, decimal bids, negatives, equal-to-current, mixed-case search, whitespace, unknown enum values, hydrate-then-reset of `localStorage`, URL round-trips).
- The 9 Playwright specs cover the seven flows in the challenge brief plus a search-preservation flow and a mobile filter / sticky-bid-bar flow. They run against `npm run build && npm run preview`, not the dev server, so they exercise the production bundle.
- Component test fixtures live in `src/lib/__fixtures__.ts` and are minimal vehicles constructed by hand rather than slices of the real dataset. This means regenerating `data/vehicles.json` cannot break tests.
- `src/test/setup.ts` stubs `Element.prototype.scrollIntoView`, `hasPointerCapture`, `releasePointerCapture`, and `window.matchMedia` because jsdom doesn't implement them and Radix uses all four.
- The Playwright config defines two projects so the same mobile spec doesn't run twice: the `chromium` project ignores `mobile.spec.ts` and the `mobile-chromium` project (Pixel 7 emulation) matches only it.

To run everything: `npm run lint && npm run test:run && npm run e2e`.

---

## 8. What's deliberately absent

These are visible omissions in the prototype and the priority order in which a follow-on iteration would add them:

- **Watchlist + recently viewed.** Keyed in `localStorage`, surfaced as a header counter and a "Watching" filter chip.
- **Live auction state.** Normalise `auction_start` against `Date.now()`, gate the BidPanel by `upcoming | live | ended`, surface a countdown, and show an "auction extended by 30s" snackbar when a bid lands in the final minute.
- **Facet counts on filters.** The hard part is making counts update against the intersection of all *other* active filters without rerunning the filter pipeline N times. Solvable with a single pass that emits per-facet counts.
- **Optimistic bid + undo toast** to recover from an accidental bid within ~6 seconds.
- **Code-split the JSON** behind a `Suspense` boundary so the initial JS chunk drops below 200 kB.
- **axe-core in Playwright** to guard a11y regressions in CI.
- **i18n.** Currency and dates are already locale-aware (`en-CA`); the strings are not extracted.

---

## 9. Notable problems encountered during the build

Each of these surfaced as a test failure or a visual issue and is worth a short story:

- **Checkbox double-toggle.** A native `<input type="checkbox">` nested inside a `<label htmlFor={sameId}>` fires two click events in some configurations — one on the input itself, one delegated from the label — so the checkbox toggled and immediately un-toggled. Surfaced by Playwright's `.check()` failing to flip state. Fix: drop the redundant `htmlFor` since label-by-nesting is sufficient.
- **Persistence test wiped its own state.** An earlier Playwright `beforeEach` used `context.addInitScript()` to clear `localStorage` before each test. `addInitScript` fires on **every** navigation, including the persistence test's own `page.goto(detailUrl)` reload, so the just-placed bid was wiped before the assertion ran. Fix: clear `localStorage` exactly once at the start of each test via `page.evaluate`, then `reload()`.
- **Doubled accessible name on the bid input.** Two `BidPanel` instances mounted with the same input `id`; both labels associated with both inputs, producing the accessible name `"Your bid Your bid"`. Fix: scope IDs by variant.
- **Filter sidebar uncroppable.** A sticky aside taller than the viewport clipped its bottom off-screen. Fix: `max-h-[calc(100vh-6rem)] overflow-y-auto` on the aside, with padding moved to an inner wrapper so the scrollbar hugs the rail's edge.
- **Mobile filter sheet didn't scroll cleanly.** With `overflow-y-auto` on `SheetContent`, the footer scrolled away with the content. Fix: make the *middle* filter container the only scroll container (`min-h-0 flex-1 overflow-y-auto`); header and footer stay pinned.
- **`space-y-2` didn't stack inline-flex children.** The Quick toggles and Title status sections had two `inline-flex` Checkbox elements with no wrapper, so they flowed inline. Fix: change `FilterSection`'s inner container to `flex flex-col gap-2`.
- **Heading hierarchy hop on the detail page.** A `h2 "Condition report"` (sr-only) was followed by `h2 "Condition"` and `h3 "Damage notes"`, producing two sibling `h2`s inside the same region. Fix: make the section header `h2` visible and demote the inner headings to `h3`/`h4`.

---

## 10. How it was built

Order of operations, top to bottom:

1. **Plan first.** The challenge brief was turned into an architecture document — file layout, helpers, components, tests — and confirmed before any code was written.
2. **Pure helpers + their tests first.** Bidding rules, search, filters, sort, URL state — all written and unit-tested before any UI component imported them.
3. **UI primitives next.** Hand-written shadcn-style components on top of Radix primitives.
4. **Inventory page first, then detail page, then bidding store.** The bidding store was last because by then every primitive and rule it needed was already in place.
5. **Component tests written alongside features**, not at the end. Two real bugs surfaced from this (Checkbox double-click, BidContext hydration race) and were fixed in the components rather than papered over in the tests.
6. **Visual QA via the in-IDE browser** against the dev server before each polish round.
7. **End-to-end and accessibility pass last.** Playwright drove the final bug fixes (Checkbox double-toggle, persistence test, the bid input accessible name).
8. **README and this walkthrough were written last** so they reflect what was shipped, not what was planned.

No external services, no auth, no deploy step. All state is in-memory plus `localStorage`. This is deliberate, per the brief.

---

## 11. The product decisions in one paragraph

The Block treats `data/vehicles.json` as a read-only product catalogue and persists exactly one piece of user data — a map of vehicle ID to local bid override — to `localStorage`. The UI is URL-driven so every view is shareable and reload-safe; bidding logic is centralised in pure functions that are exhaustively unit-tested before any component depends on them; the component library is small and intentional; the responsive layout treats mobile and desktop as first-class shapes rather than a desktop view squeezed onto a phone; and the accessibility work is woven through the build rather than bolted on at the end. The result is a prototype that demonstrates real product thinking against a synthetic dataset — buy-side browsing, inspection, and bidding — in a codebase you can clone, run, and navigate cold.
