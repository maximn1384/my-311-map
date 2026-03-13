311 Service Map: MVP Requirements

Epic: Geographical Case Visualization
As a Customer Service Agent, I need an interactive map to visualize, search, and manage citizen service requests.

User Story 1: Geolocation on Load

As a Customer Service Agent...

I want the map to automatically detect my current location when the screen loads and default the view there...

So that I immediately see the 311 requests in my vicinity.

Acceptance Criteria: The app requests browser geolocation. If granted, the map centers on the user's coordinates.

User Story 2: Custom Coordinates & Case Type Coloring

As a Customer Service Agent...

I want cases colored by their Case Type (casetypecode) and plotted using custom coordinates...

So that I can visually distinguish case types on the map.

Acceptance Criteria: The app reads hippo_latitude and hippo_longitude from the incident table to place pins. It applies distinct colors to the pins based on the casetypecode field.

User Story 3: Search Window

As a Customer Service Agent...

I want a search window available on the screen...

So that I can search for specific cases by their Number (ticketnumber) and Title (title).

Acceptance Criteria: A text search input filters the displayed map pins in real-time based on matches in the case title or number.

User Story 4: Case Details Pop-up & Open Full Form

As a Customer Service Agent...

I want a pop-up with case details when I click a pin, including an option to open the full case form...

So that I can preview the issue and easily navigate to Dynamics 365 for full details.

Acceptance Criteria: Clicking a pin opens a callout with basic details and a button that uses standard Power Apps routing to open the native Dynamics 365 Case record form.

User Story 5: Create New Case Button

As a Customer Service Agent...

I want a button on the app that allows me to create a new case...

So that I can quickly log a new request from the map interface.

Acceptance Criteria: A prominent button triggers the native Dynamics 365 "Create New Case" form.

**Epic 2: Multi-Tab Navigation & Persistent Configuration**
As a Customer Service Agent and Administrator, I need a tabbed application shell to toggle between the visual map, a data grid view with analytics, and a configuration screen to control the app's data feed.

**User Story 6: Tabbed Application Shell**
* **As a** user...
* **I want** the application to have a top-level tabbed navigation menu (using Fluent UI v9 `TabList`)...
* **So that** I can seamlessly switch between the Map, the List View, and the Settings screen.
* *Acceptance Criteria:* The app shell implements three tabs: "Map" (Tab 1), "List" (Tab 2), and "Settings" (Tab 3). 

**User Story 7: Settings Tab & Persistent FetchXML**
* **As a** Power User...
* **I want** a Settings tab containing a text area to input custom FetchXML, and I want the app to remember this input...
* **So that** I can dynamically filter the cases without having to re-enter the XML every time I load the app.
* *Acceptance Criteria:* The Settings tab contains a multiline text area for `FetchXML`. The app uses browser `localStorage` to save and retrieve this string so the configuration persists across sessions.

**User Story 8: Dynamic Data Retrieval & Error Handling**
* **As the** system...
* **I need** to fetch Dataverse records using the stored FetchXML (or a default active cases query if empty), adhering strictly to our proxy class rules...
* **So that** the app safely retrieves data without hitting SDK proxy errors or failing silently.
* *Acceptance Criteria:* 1. The `DataverseCaseService` must use `ListRecordsWithOrganization(orgUrl, 'incidents', ...)` passing the FetchXML as a query parameter.
  2. The service must cast the returned `EntityItem` directly, bypassing `dynamicProperties` completely.
  3. The TanStack Query hook invoking this service must explicitly expose `isError` and `error`, and the UI must render a Fluent UI error state (e.g., `MessageBar`) if the query fails.

**User Story 9: List View & Summary Chart (Single Source of Truth)**
* **As a** Customer Service Agent...
* **I want** the List tab to display the exact same cases that are currently loaded on the map, along with a visual summary...
* **So that** I can review the raw data and get a quick analytical glance without querying the database a second time.
* *Acceptance Criteria:* The List tab includes a Fluent UI v9 `DataGrid` that binds to the exact same `ICase[]` array used by the map. Above the grid, a simple bar chart displays an aggregation of those loaded cases (e.g., case count grouped by Case Type).