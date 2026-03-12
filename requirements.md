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