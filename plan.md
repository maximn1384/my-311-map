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
