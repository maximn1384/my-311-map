# my-311-map

A **Power Apps Component Framework (PCF)** dataset control that renders 311 service requests on an interactive map inside **Dynamics 365 Customer Service**.

## Overview

311 is the non-emergency civic service number used by municipalities to let citizens report issues such as potholes, graffiti, broken streetlights, and more.  This PCF control takes a Dataverse dataset (typically the **Case** table) and plots each record as a coloured, clickable pin on an [OpenStreetMap](https://www.openstreetmap.org/) base map powered by [Leaflet.js](https://leafletjs.com/).

| Feature | Detail |
|---|---|
| Map engine | Leaflet 1.9 + OpenStreetMap tiles (no API key required) |
| Pin colour | Reflects the record's **Status** (red = open, orange = in-progress, green = resolved, grey = closed) |
| Category icons | Emoji icons in popups for common categories (pothole, graffiti, streetlight, …) |
| Popup content | Title, status badge, address, and category |
| Auto-fit | Map automatically fits the viewport to all visible markers |
| Configuration | Default centre latitude/longitude and zoom level are configurable |

### Screenshot

The map renders inside a Dynamics 365 Customer Service view with a marker per case:

```
┌──────────────────────────────────────────────────────┐
│  311 Service Request Map                             │
│  ┌──────────────────────────────────────────────┐   │
│  │       [OSM map with coloured pins]           │   │
│  │    📍 Pothole reported – 5th Ave             │   │
│  │    ●  Open   ●  In Progress  ●  Resolved     │   │
│  └──────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

## Project structure

```
my-311-map/
├── Map311/
│   ├── ControlManifest.Input.xml   # Component definition & properties
│   ├── index.ts                    # Component logic (TypeScript)
│   ├── css/
│   │   └── Map311.css              # Styles for map, markers, and popups
│   └── strings/
│       └── Map311.1033.resx        # English string resources
├── package.json
├── tsconfig.json
├── featureconfig.json
└── .eslintrc.json
```

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 16 or later
- [Power Apps CLI (`pac`)](https://learn.microsoft.com/en-us/power-platform/developer/cli/introduction) for solution packaging and deployment

### Install dependencies & build

```bash
npm install
npm run build
```

### Test locally (harness)

```bash
npm start
```

This starts the PCF test harness at `http://localhost:8181` so you can exercise the control without a Dynamics 365 environment.

### Lint

```bash
npm run lint
```

## Deployment to Dynamics 365

1. **Create a solution project** (if you don't have one already):
   ```bash
   pac solution init --publisher-name MyPublisher --publisher-prefix mpub
   pac solution add-reference --path ../my-311-map
   ```

2. **Build the solution**:
   ```bash
   msbuild /t:build /restore
   ```

3. **Import** the generated `.zip` from the `bin/` folder into your Dynamics 365 environment via the Power Apps Maker portal or:
   ```bash
   pac solution import --path bin/Debug/SolutionName.zip
   ```

## Configuring the control in D365 CS

1. In the Power Apps Maker portal open your **Case** (or custom) table view.
2. Select **Controls → Add control** and choose **311 Service Request Map**.
3. Map the dataset columns:

   | Control column | Suggested Dataverse column |
   |---|---|
   | `latitude` | `new_latitude` (Decimal) |
   | `longitude` | `new_longitude` (Decimal) |
   | `title` | `title` |
   | `status` | `statuscode` (formatted value) |
   | `category` | `new_category` |
   | `address` | `new_address` or `msdyn_streetaddress` |

4. (Optional) Set **Default Latitude**, **Default Longitude**, and **Default Zoom** to centre the map on your municipality.

## Status colours

| Status text | Colour |
|---|---|
| Open / Active | 🔴 Red |
| In Progress | 🟠 Orange |
| Resolved | 🟢 Green |
| Closed / Cancelled | ⚫ Grey |

## License

MIT
