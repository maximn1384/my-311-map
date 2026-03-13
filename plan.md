# Technical Implementation Plan: 311 Service Map Code App

---

## Critical Pre-Work: Template Conflict

The Vite starter scaffold uses **shadcn/ui + Tailwind CSS + Radix UI**. The `copilot-instructions.md` mandates **Fluent UI v9 exclusively**. These conflict. The existing `src/components/ui/` components, `ThemeProvider`, and `mode-toggle.tsx` are all shadcn/Tailwind artifacts that must be **bypassed** (not deleted — they can stay dormant, but must never be used in new code). Every new component we write must use `@fluentui/react-components` only.

---

## Phase 1 — Foundation: Fluent UI & Provider Wiring

**Goal:** Replace the shadcn theme layer with a Fluent UI v9 `FluentProvider` that honours the Power Apps host theme. All subsequent phases depend on this.

**Steps:**

1. **Install packages** (`npm install` step — must confirm success):
   - `@fluentui/react-components`
   - `@fluentui/react-icons`

2. **Create `src/providers/FluentAppProvider.tsx`**
   Wraps `FluentProvider` from `@fluentui/react-components`. Reads the Power Apps host theme context from `@microsoft/power-apps` SDK (if available) and maps it to Fluent UI theme tokens. Falls back to `webLightTheme` locally.

3. **Refactor `src/App.tsx`**
   Replace `<ThemeProvider>` and `<SonnerProvider>` with `<FluentAppProvider>`. Retain `<QueryProvider>` (TanStack Query stays). The target provider stack:
   ```
   FluentAppProvider → QueryProvider → RouterProvider
   ```

4. **Clean the router**
   Update `src/router.tsx` and `src/pages/_layout.tsx` to render a blank shell page (`MapPage`) as the index route. Remove references to the shadcn `mode-toggle` and any shadcn components from the layout.

---

## Phase 2 — Data Layer: `ICase`, `ICaseService`, and `ServiceFactory`

**Goal:** A fully typed, mockable data layer before any UI is built. No Dataverse calls are made yet.

**Steps:**

1. **Define `src/types/ICase.ts`**
   Strict TypeScript interface. Fields derived from `requirements.md` and the `incident` table:
   ```
   incidentid, title, ticketnumber, statuscode, casetypecode,
   hippo_latitude, hippo_longitude, createdon, description
   ```
   Note: `hippo_latitude` / `hippo_longitude` are custom publisher-prefixed fields (Decimal). `casetypecode` standard values: `1`=Question, `2`=Problem, `3`=Request. All coordinate fields must be `number | null` — null cases are not plotted.

2. **Define `src/services/ICaseService.ts`**
   Single-method interface:
   ```ts
   getCases(searchTerm?: string): Promise<ICase[]>
   ```

3. **Create `src/services/MockCaseService.ts`**
   In-memory implementation. ~12–15 hardcoded cases distributed around a realistic city coordinate area, with varied `casetypecode` values, `statuscode` values, and non-null `hippo_latitude`/`hippo_longitude`. Simulates `Promise` async behaviour.

4. **Create `src/services/DataverseCaseService.ts`**
   Wraps `MicrosoftDataverseService.ListRecords()` from `src/generated/`. Uses OData `$select` to fetch only the 9 required fields. Maps raw `EntityItem` response to `ICase[]`. Handles `null` coordinates defensively.

5. **Create `src/services/ServiceFactory.ts`**
   Returns `MockCaseService` when `import.meta.env.DEV` is true (or a `VITE_USE_MOCK` env flag), `DataverseCaseService` otherwise. This is the **only** place the environment switch lives.

---

## Phase 3 — Map Component & Geolocation

**Goal:** A working interactive map centred on the user's location, with colour-coded pins for each case.

**Prerequisite terminal step** (`npm install` — must confirm):
- Decision point: `react-leaflet` + `leaflet` (recommended for MVP: no API key, proven React integration, performant for hundreds of markers) with `@types/leaflet`.
- Azure Maps (`azure-maps-control` + `react-azure-maps`) noted as the production upgrade path per instructions, requiring an Azure Maps subscription key.

**Steps:**

1. **Create `src/constants/caseTypeColors.ts`**
   Maps `casetypecode` to hex colour strings:
   ```
   1 (Question) → blue
   2 (Problem)  → red
   3 (Request)  → green
   unknown      → grey (fallback)
   ```

2. **Create `src/hooks/useGeolocation.ts`**
   Calls `navigator.geolocation.getCurrentPosition`. Returns `{ coords: GeolocationCoordinates | null, error: string | null, loading: boolean }`. Used to set the initial map centre.

3. **Create `src/components/map/CasePin.tsx`**
   A `react-leaflet` `Marker` with a custom `divIcon` coloured by `casetypecode` via `caseTypeColors`. Accepts an `ICase` and an `onSelect` callback.

4. **Create `src/components/map/CaseMap.tsx`**
   Renders the `MapContainer` and `TileLayer`. Accepts `cases: ICase[]` and `selectedCaseId`. Centres on geolocation coords when available; defaults to a sensible city-level view. Renders a `CasePin` for each case where both coordinate fields are non-null. Uses `useMemo` to avoid re-rendering all pins on unrelated state changes.

---

## Phase 4 — Search, Case Details Callout & UI Shell

**Goal:** Full interactive UI — search bar, pin callout, action buttons — built exclusively with Fluent UI v9.

**Steps:**

1. **Create `src/hooks/useCases.ts`**
   TanStack Query `useQuery` hook that calls `ServiceFactory.getService().getCases()`. Exposes `data`, `isLoading`, `isError`.

2. **Create `src/hooks/useFilteredCases.ts`**
   `useMemo` that takes `cases: ICase[]` and `searchTerm: string`. Returns cases where `title` or `ticketnumber` contains the search term (case-insensitive). Returns the full list if `searchTerm` is empty.

3. **Create `src/components/SearchBar.tsx`**
   Fluent UI v9 `Input` with a `SearchRegular` icon (`@fluentui/react-icons`). Controlled component: emits `onSearch(term: string)`. Positioned as a floating overlay on the map.

4. **Create `src/components/CaseCallout.tsx`**
   Fluent UI v9 `Popover` or `Dialog` triggered when a pin is selected. Displays: title, ticket number, status, case type. Contains two `Button` elements:
   - **"Open in Dynamics 365"** — Phase 5 wiring point (left as a `console.log` stub here)
   - **"Close"** — clears `selectedCase` state

5. **Create `src/components/CreateCaseButton.tsx`**
   Fluent UI v9 `Button` (appearance `"primary"`). Positioned in the top toolbar. Phase 5 wiring point (stub here).

6. **Build `src/pages/MapPage.tsx`**
   Assembles the full layout. Manages state:
   - `searchTerm: string`
   - `selectedCase: ICase | null`

   Composes: `SearchBar` → `CreateCaseButton` → `CaseMap` → `CaseCallout`.

---

## Phase 5 — Dynamics 365 Routing & Live Data

**Goal:** Wire the "Open" and "Create" buttons to native D365 forms using the Power Apps SDK. Switch to live Dataverse data.

**Steps:**

1. **Research `@microsoft/power-apps` SDK navigation API**
   Identify the correct method signatures for:
   - Opening an existing record: likely `Navigation.openForm({ entityName: 'incident', entityId: case.incidentid })`
   - Opening a new record form: `Navigation.openForm({ entityName: 'incident' })`
   This must be verified against the installed SDK version before writing the code.

2. **Wire `CaseCallout` "Open in Dynamics 365" button**
   Replace the stub with the SDK navigation call, passing `incidentid` from the selected case.

3. **Wire `CreateCaseButton`**
   Replace the stub with the SDK navigation call for a new `incident` record.

4. **Switch to live data**
   Set `VITE_USE_MOCK=false` (or rely on the production build flag). Verify `DataverseCaseService` returns correctly shaped `ICase[]` objects. Confirm `hippo_latitude`/`hippo_longitude` are populated on real records.

5. **OData query optimisation**
   Add `$filter` to exclude cases with null coordinates at the API level (avoids fetching un-plottable records). Add `$top=500` guard for large datasets. Evaluate whether `$orderby createdon desc` is needed.

---

## Dependency Map (phases unlock in order)

```
Phase 1 (Fluent UI)
  └─► Phase 2 (Data Layer / Mock)
        └─► Phase 3 (Map + Pins)       ← needs npm install confirmation
              └─► Phase 4 (UI Shell)
                    └─► Phase 5 (D365 Routing + Live Data)
```

---

# Epic 2: Multi-Tab Navigation & Persistent Configuration

## Architectural Decisions

### Tab Navigation: Component State, Not URL Routing
The app already uses `createBrowserRouter` with a `BASENAME` normalization for Power Apps hosting. Do **not** introduce `/list` and `/settings` child routes — manipulating browser history inside a Power Apps iframe is fragile. Instead, `_layout.tsx` manages a single `activeTab` state value and conditionally renders the correct page component. The router stays as-is: one route (`/`) renders `<Layout />`, and `<Layout />` owns tab switching internally.

### Single Source of Truth for Cases: TanStack Query Cache
User Story 9 requires the List tab to display the **exact same** `ICase[]` as the map — without a second Dataverse round-trip. This is solved entirely by TanStack Query's shared in-memory cache. Both `MapPage` and `ListPage` call the same `useCases()` hook. As long as the `queryKey` is identical, TanStack Query returns the cached result instantly — no prop drilling, no Zustand for case data.

### FetchXML Global State: Zustand + localStorage
`fetchXml` is the only piece of client-owned persistent state in the app. Zustand (already declared in `package.json` but unused) is the right tool:
- `appStore.ts` holds `fetchXml: string` and a `setFetchXml` setter
- `setFetchXml` writes to `localStorage` as a side-effect
- The store initialises from `localStorage` on module load
- `useCases()` reads `fetchXml` from the store and includes it in the `queryKey`, so any change automatically triggers a refetch

### FetchXML vs OData Modes
When `fetchXml` is a non-empty string, it fully replaces the default OData query inside `DataverseCaseService`. The `$select`, `$filter`, `$orderby`, and `$top` OData parameters are **omitted** — the FetchXML defines the complete query. The `searchTerm` text filter continues to work client-side via `useFilteredCases` in both modes.

---

## Phase 6 — App Shell & Tab Navigation

**Goal:** Introduce the Fluent UI tabbed shell. `MapPage` becomes Tab 1. Tabs 2 and 3 are stubs. No existing functionality breaks.

**Steps:**

1. **Create `src/store/appStore.ts`**
   Zustand store. Single concern: FetchXML persistence.
   ```ts
   interface AppState {
     fetchXml: string                    // empty = use default OData query
     setFetchXml: (xml: string) => void  // writes to localStorage as side-effect
   }
   const STORAGE_KEY = '311map-fetchxml'
   ```
   Initialise `fetchXml` by reading `localStorage.getItem(STORAGE_KEY) ?? ''` at store creation time. `setFetchXml` calls `localStorage.setItem` then updates store state.

2. **Update `src/pages/_layout.tsx`**
   - Add `activeTab: 'map' | 'list' | 'settings'` via `useState` (default `'map'`).
   - Add a Fluent UI v9 `TabList` above the `<main>` block with three `Tab` items: **Map**, **List**, **Settings**.
   - Replace `<Outlet />` with a conditional render: `activeTab === 'map'` → `<MapPage />`, `'list'` → `<ListPage />` (stub), `'settings'` → `<SettingsPage />` (stub).
   - The `<main>` block retains `flex: 1` so the active page still fills the remaining height.

3. **Update `src/router.tsx`**
   Remove `MapPage` as a child route. `_layout.tsx` now manages page rendering directly. The router becomes a single root entry:
   ```ts
   { path: '/', element: <Layout />, errorElement: <NotFoundPage /> }
   ```

4. **Create stub `src/pages/ListPage.tsx`**
   Minimal placeholder: a centred Fluent UI `Text` reading "List View — coming soon". Accepts no props.

5. **Create stub `src/pages/SettingsPage.tsx`**
   Minimal placeholder: a centred Fluent UI `Text` reading "Settings — coming soon". Accepts no props.

---

## Phase 7 — Settings Tab

**Goal:** Full settings screen. FetchXML persists across sessions. Includes basic validation and a reset path.

**Steps:**

1. **Implement `src/pages/SettingsPage.tsx`**
   - On mount, populate a local `draft` state from `appStore.fetchXml` (so edits are staged locally before saving).
   - Render a Fluent UI v9 `Textarea` (large, monospace font) bound to `draft`.
   - **Save button** (`appearance="primary"`): validates that if `draft` is non-empty it starts with `<fetch` (basic guard against invalid XML); on pass, calls `appStore.setFetchXml(draft)` and shows a success `MessageBar`; on fail, shows an error `MessageBar` with guidance.
   - **Reset to Default button** (`appearance="subtle"`): calls `appStore.setFetchXml('')` and clears `draft`, restoring the default OData query.
   - Below the buttons, render a `Text` hint: "Leave blank to use the default active-cases filter."
   - The `MessageBar` feedback (success/error) auto-dismisses after 3 seconds via a `useEffect` timeout.

---

## Phase 8 — Dynamic FetchXML Data Retrieval

**Goal:** Wire the Zustand FetchXML into the data pipeline. A FetchXML change triggers an automatic refetch. All existing SDK proxy rules are preserved.

**Steps:**

1. **Update `src/services/ICaseService.ts`**
   Add optional parameter to `getCases`:
   ```ts
   getCases(fetchXml?: string): Promise<ICase[]>
   ```
   Remove the `searchTerm` parameter — server-side search is not used; client-side filtering via `useFilteredCases` is sufficient.

2. **Update `src/services/MockCaseService.ts`**
   Accept `fetchXml?: string` silently (no behaviour change — mock always returns the same data).

3. **Update `src/services/DataverseCaseService.ts`**
   Two execution paths depending on whether `fetchXml` is non-empty:

   **FetchXML mode** (non-empty `fetchXml`):
   ```ts
   ListRecordsWithOrganization(
     orgUrl, 'incidents',
     undefined, undefined, undefined, undefined,  // prefer, accept, metadata, mip
     undefined, undefined, undefined, undefined,  // $select, $filter, $orderby, $expand
     fetchXml,                                    // ← FetchXML controls everything
   )
   ```

   **OData mode** (empty/undefined `fetchXml`):
   ```ts
   ListRecordsWithOrganization(
     orgUrl, 'incidents',
     undefined, undefined, undefined, undefined,
     SELECT_FIELDS, BASE_FILTER, 'createdon desc', undefined,
     undefined,   // no fetchXml
     TOP,
   )
   ```

   Response mapping is identical in both modes — the `data.value` cast to `Record<string,unknown>[]` works for both response shapes.

4. **Update `src/hooks/useCases.ts`**
   - Import `useAppStore` from `@/store/appStore`.
   - Read `fetchXml` from the store.
   - Include `fetchXml` in the query key so any change triggers an automatic refetch:
     ```ts
     queryKey: ['cases', fetchXml],
     queryFn: () => ServiceFactory.getService().getCases(fetchXml),
     ```

---

## Phase 9 — List View & Summary Chart

**Goal:** A fully functional List tab bound to the shared TanStack Query cache. No second Dataverse call is made.

**Steps:**

1. **Create `src/utils/caseAggregations.ts`**
   Pure function `groupByType(cases: ICase[]): { label: string; count: number }[]`.
   Maps `casetypecode` values to human labels (`1 → 'Question'`, `2 → 'Problem'`, `3 → 'Request'`, `null/other → 'Unknown'`), groups, and returns sorted by count descending. Used for the chart.

2. **Create `src/components/CaseTypeChart.tsx`**
   - Props: `cases: ICase[]`.
   - Computes aggregation via `useMemo(() => groupByType(cases), [cases])`.
   - Renders a Recharts `BarChart` (Recharts is already installed) with a single `Bar` series for count, `XAxis` by label, `YAxis`, `Tooltip`, and `CartesianGrid`.
   - Fixed height (e.g. `240px`), `ResponsiveContainer` for width.
   - Bar colour uses Fluent UI token `tokens.colorBrandBackground` (read via `getComputedStyle` or hardcoded to its default hex for Recharts compatibility).

3. **Implement `src/pages/ListPage.tsx`**
   - Call `useCases()` (returns cached data instantly if Map tab loaded first; shows spinner if navigated directly).
   - Handle `isLoading` → Fluent UI `Spinner`. Handle `isError` → Fluent UI `MessageBar` with error message.
   - Render `<CaseTypeChart cases={cases} />` above the grid.
   - Render a Fluent UI v9 `DataGrid` with the following columns (all sortable):

     | Column | Field | Notes |
     |---|---|---|
     | Ticket # | `ticketnumber` | |
     | Title | `title` | |
     | Status | `statuscode` | Map to label: `1=Active`, `2=Resolved`, `3=Cancelled` |
     | Case Type | `casetypecode` | Map to label: `1=Question`, `2=Problem`, `3=Request` |
     | Created | `createdon` | Format as `MMM d, yyyy` via `date-fns` (already installed) |

   - Row click handler calls `openCaseRecord(row.incidentid)` from `@/utils/d365Navigation`.

---

## Dependency Map (Epic 2)

```
Phase 6 (App Shell + Tabs + Zustand Store)
  └─► Phase 7 (Settings Tab — FetchXML UI + localStorage)
        └─► Phase 8 (Dynamic Data Retrieval — FetchXML wired to useCases)
              └─► Phase 9 (List View + Chart — shared Query cache)
```

## Pre-Work Checklist
- [ ] No new `npm install` steps required — Recharts, Zustand, `@tanstack/react-table`, `date-fns`, and Fluent UI are all already in `package.json`.
- [ ] `DataGrid` is part of `@fluentui/react-components` — no separate install.
- [ ] Confirm `npx power-apps push` after each phase before starting the next.
