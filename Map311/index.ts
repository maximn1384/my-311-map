import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as L from "leaflet";

/**
 * Status colors for 311 service request map markers.
 * Maps status text to a colour string used when building marker icons.
 */
const STATUS_COLORS: Record<string, string> = {
    "active": "#e74c3c",
    "open": "#e74c3c",
    "in progress": "#f39c12",
    "in-progress": "#f39c12",
    "resolved": "#27ae60",
    "closed": "#95a5a6",
    "cancelled": "#95a5a6",
    "default": "#2980b9",
};

/** Categories mapped to emoji icons for the popup header. */
const CATEGORY_ICONS: Record<string, string> = {
    "pothole": "🕳️",
    "graffiti": "🎨",
    "streetlight": "💡",
    "street light": "💡",
    "trash": "🗑️",
    "garbage": "🗑️",
    "tree": "🌳",
    "sidewalk": "🚶",
    "noise": "📢",
    "water": "💧",
    "sewer": "🔧",
    "default": "📍",
};

/**
 * 311 Service Request Map PCF component.
 *
 * Renders an interactive Leaflet map showing 311 service cases from a
 * Dynamics 365 Customer Service dataset.  Each record is plotted as a
 * colour-coded marker whose colour reflects the request's status.
 * Clicking a marker opens a popup with the request details.
 */
export class Map311 implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private _container: HTMLDivElement;
    private _map: L.Map | undefined;
    private _markerLayer: L.LayerGroup | undefined;
    private _context: ComponentFramework.Context<IInputs>;
    private _mapInitialized: boolean = false;

    /**
     * Empty constructor — PCF lifecycle hooks handle all initialisation.
     */
    constructor() { /* intentionally empty */ }

    /**
     * Used to initialize the control instance. Controls can kick off remote
     * server calls and other initialization actions here.
     */
    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
        this._context = context;
        this._container = container;

        // Request paging of all available records (up to 5000)
        context.parameters.sampleDataSet.paging.setPageSize(5000);

        this._initializeMap();
    }

    /**
     * Called when any value in the property bag has changed.
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        this._context = context;

        if (!this._mapInitialized) {
            this._initializeMap();
            return;
        }

        // Reload when the dataset signals loading has finished
        if (!context.parameters.sampleDataSet.loading) {
            this._renderMarkers();
        }
    }

    /**
     * Returns an object based on nomenclature defined in manifest, expecting
     * object[s] for property marked as "bound" or "output".
     */
    public getOutputs(): IOutputs {
        return {};
    }

    /**
     * Called when the control is to be removed from the DOM tree.
     * Controls should use this call for cleanup (detach event handlers, etc.)
     */
    public destroy(): void {
        if (this._map) {
            this._map.remove();
            this._map = undefined;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    /** Sets up the Leaflet map inside the PCF container element. */
    private _initializeMap(): void {
        // Ensure the container has an explicit size so Leaflet can render
        this._container.style.width = "100%";
        this._container.style.height = "100%";
        this._container.style.minHeight = "400px";
        this._container.style.position = "relative";

        const defaultLat = (this._context.parameters.defaultLatitude.raw as number) ?? 40.7128;
        const defaultLng = (this._context.parameters.defaultLongitude.raw as number) ?? -74.006;
        const defaultZoom = (this._context.parameters.defaultZoom.raw as number) ?? 12;

        try {
            this._map = L.map(this._container, {
                center: [defaultLat, defaultLng],
                zoom: defaultZoom,
                zoomControl: true,
                attributionControl: true,
            });

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19,
            }).addTo(this._map);

            this._markerLayer = L.layerGroup().addTo(this._map);
            this._mapInitialized = true;

            // Render markers if data is already available
            if (!this._context.parameters.sampleDataSet.loading) {
                this._renderMarkers();
            }
        } catch (err) {
            console.error("[Map311] Failed to initialise Leaflet map:", err);
        }
    }

    /**
     * Clears all existing markers and re-plots one marker per dataset record.
     * Only records that have valid latitude and longitude values are plotted.
     */
    private _renderMarkers(): void {
        if (!this._map || !this._markerLayer) {
            return;
        }

        this._markerLayer.clearLayers();

        const dataset = this._context.parameters.sampleDataSet;
        const sortedIds = dataset.sortedRecordIds;

        if (!sortedIds || sortedIds.length === 0) {
            this._showEmptyState();
            return;
        }

        const bounds: L.LatLng[] = [];

        for (const recordId of sortedIds) {
            const record = dataset.records[recordId];
            if (!record) continue;

            const latRaw = record.getValue("latitude");
            const lngRaw = record.getValue("longitude");

            const lat = typeof latRaw === "number" ? latRaw : parseFloat(String(latRaw ?? ""));
            const lng = typeof lngRaw === "number" ? lngRaw : parseFloat(String(lngRaw ?? ""));

            if (!isFinite(lat) || !isFinite(lng)) continue;

            const title = String(record.getValue("title") ?? "Service Request");
            const status = String(record.getValue("status") ?? "").toLowerCase();
            const category = String(record.getValue("category") ?? "").toLowerCase();
            const address = String(record.getValue("address") ?? "");

            const marker = L.marker([lat, lng], {
                icon: this._createMarkerIcon(status),
                title: title,
            });

            const categoryIcon = CATEGORY_ICONS[category] ?? CATEGORY_ICONS["default"];
            const statusLabel = status
                ? `<span class="map311-badge map311-badge--${this._statusClass(status)}">${this._capitalize(status)}</span>`
                : "";

            marker.bindPopup(
                `<div class="map311-popup">
                    <div class="map311-popup__header">
                        <span class="map311-popup__icon">${categoryIcon}</span>
                        <strong>${this._escapeHtml(title)}</strong>
                    </div>
                    ${statusLabel}
                    ${address ? `<div class="map311-popup__address">📍 ${this._escapeHtml(address)}</div>` : ""}
                    ${category ? `<div class="map311-popup__category">Category: ${this._escapeHtml(this._capitalize(category))}</div>` : ""}
                </div>`,
                { maxWidth: 280 }
            );

            marker.addTo(this._markerLayer);
            bounds.push(L.latLng(lat, lng));
        }

        // Fit map to the markers if we have any
        if (bounds.length > 0) {
            try {
                this._map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40], maxZoom: 16 });
            } catch {
                // If fitBounds fails (e.g. single point), just centre on it
                this._map.setView(bounds[0], 14);
            }
        }
    }

    /**
     * Displays a friendly "no data" message when the dataset has no records.
     */
    private _showEmptyState(): void {
        if (!this._map) return;

        const emptyIcon = L.divIcon({
            className: "map311-empty-state",
            html: `<div class="map311-empty-state__inner">
                       <div class="map311-empty-state__icon">🗺️</div>
                       <div class="map311-empty-state__text">No 311 requests found</div>
                   </div>`,
            iconSize: [220, 80],
            iconAnchor: [110, 40],
        });

        const defaultLat = (this._context.parameters.defaultLatitude.raw as number) ?? 40.7128;
        const defaultLng = (this._context.parameters.defaultLongitude.raw as number) ?? -74.006;

        L.marker([defaultLat, defaultLng], { icon: emptyIcon, interactive: false })
            .addTo(this._markerLayer!);
    }

    /**
     * Creates a coloured SVG circle marker icon sized for Leaflet.
     * The fill colour is determined by the record's status value.
     */
    private _createMarkerIcon(status: string): L.DivIcon {
        const color = STATUS_COLORS[status] ?? STATUS_COLORS["default"];
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
            <path d="M12 0C5.4 0 0 5.4 0 12c0 7.2 12 24 12 24S24 19.2 24 12C24 5.4 18.6 0 12 0z"
                  fill="${color}" stroke="#fff" stroke-width="1.5"/>
            <circle cx="12" cy="12" r="5" fill="#fff" opacity="0.85"/>
        </svg>`;

        return L.divIcon({
            className: "map311-marker",
            html: svg,
            iconSize: [24, 36],
            iconAnchor: [12, 36],
            popupAnchor: [0, -36],
        });
    }

    /** Returns a CSS-safe class name segment for a given status string. */
    private _statusClass(status: string): string {
        return status.replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    }

    /** Capitalises the first letter of each word. */
    private _capitalize(text: string): string {
        return text.replace(/\b\w/g, (c) => c.toUpperCase());
    }

    /** Escapes HTML special characters to prevent XSS in popup content. */
    private _escapeHtml(text: string): string {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}
