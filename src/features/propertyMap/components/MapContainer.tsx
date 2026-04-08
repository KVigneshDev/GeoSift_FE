import React, { useEffect, MutableRefObject } from "react";
import { Loader2, Search, MapPin } from "lucide-react";
import {
  buildInfoContent,
  buildLoadingContent,
  geoJsonToPaths,
} from "@/features/propertyMap/utils/mapUtils";
import { MAP_STYLES } from "@/features/propertyMap/constants/mapStyles";
import type { PropertyLayoutGql, PropertyFeaturesGql } from "@/features/propertyMap/types";

interface MapContainerProps {
  mapRef: MutableRefObject<HTMLDivElement | null>;
  mapInstance: MutableRefObject<google.maps.Map | null>;
  polygons: MutableRefObject<google.maps.Polygon[]>;
  infoWindow: MutableRefObject<google.maps.InfoWindow | null>;
  layouts: PropertyLayoutGql[];
  loading: boolean;
  onBoundsChange: (bounds: google.maps.LatLngBounds) => void;
  onMapReady?: () => void;
  showSearchButton?: boolean;
  onSearchThisArea?: () => void;
  isSearching?: boolean;
  /** Lazy-load per-building details; called when user clicks a polygon. */
  onBuildingClick: (
    id: string,
    latLng: google.maps.LatLng,
  ) => Promise<PropertyFeaturesGql | null>;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  mapRef,
  mapInstance,
  polygons,
  infoWindow,
  layouts,
  loading,
  onBoundsChange,
  onMapReady,
  showSearchButton = false,
  onSearchThisArea,
  isSearching = false,
  onBuildingClick,
}) => {
  // ── Map initialisation ────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 48.8404, lng: 2.3082 },
      zoom: 17,
      mapId: import.meta.env.VITE_GOOGLE_MAPID || '',
      renderingType: google.maps.RenderingType.VECTOR,
      tilt: 0, // Set to 45 to see the 3D building perspective immediately
      styles: MAP_STYLES,
      disableDefaultUI: true,
      mapTypeId: "satellite",
      rotateControl: false,
      zoomControl: true,
      mapTypeControl: true,
      fullscreenControl: true,
      zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
      mapTypeControlOptions: { position: google.maps.ControlPosition.TOP_RIGHT },
      fullscreenControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
    });

    // map.setTilt(0);

    mapInstance.current = map;
    infoWindow.current = new google.maps.InfoWindow();

    const handleIdle = () => {
      const bounds = map.getBounds();
      if (bounds) onBoundsChange(bounds);
    };

    map.addListener("idle", handleIdle);
    onMapReady?.();
    handleIdle();

    return () => {
      google.maps.event.clearInstanceListeners(map);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Render building polygons ──────────────────────────────────────────────
  useEffect(() => {
    polygons.current.forEach(p => p.setMap(null));
    polygons.current = [];

    if (!mapInstance.current) return;

    const newPolygons: google.maps.Polygon[] = [];

    for (const layout of layouts) {
      try {
        const geo = JSON.parse(layout.geometry);
        const paths = geoJsonToPaths(geo);
        if (!paths) continue;

        const polygon = new google.maps.Polygon({
          paths,
          fillColor: "#3b82f6",
          fillOpacity: 0.3,
          strokeColor: "#2563eb",
          strokeWeight: 2,
          strokeOpacity: 0.8,
        });

        polygon.setMap(mapInstance.current);
        newPolygons.push(polygon);

        // Hover state
        polygon.addListener("mouseover", () =>
          polygon.setOptions({ fillOpacity: 0.5, strokeWeight: 3 }),
        );
        polygon.addListener("mouseout", () =>
          polygon.setOptions({ fillOpacity: 0.3, strokeWeight: 2 }),
        );

        // Click → show loading skeleton → lazy-load details → update content
        polygon.addListener("click", async (event: google.maps.PolyMouseEvent) => {
          if (!infoWindow.current || !event.latLng) return;

          // Show loading indicator immediately so the user sees feedback
          infoWindow.current.setContent(buildLoadingContent());
          infoWindow.current.setPosition(event.latLng);
          infoWindow.current.open({ map: mapInstance.current! });

          const features = await onBuildingClick(layout.id, event.latLng);

          if (features) {
            infoWindow.current.setContent(buildInfoContent(layout.id, features));
          } else {
            infoWindow.current.setContent(
              `<div style="padding:16px;font-family:system-ui;color:#6B7280;font-size:13px">
                No details available for this building.
              </div>`,
            );
          }
        });
      } catch {
        console.warn("Failed to parse building geometry for id:", layout.id);
      }
    }

    polygons.current = newPolygons;
  }, [layouts, mapInstance, polygons, infoWindow, onBuildingClick]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="relative flex-1">
      <div ref={mapRef} className="w-full h-full" />

      {/* Search This Area button */}
      {showSearchButton && onSearchThisArea && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={onSearchThisArea}
            disabled={isSearching}
            className="group relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white px-6 py-3.5 rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="relative flex items-center gap-3">
              {isSearching ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-bold text-sm tracking-wide">Searching…</span>
                </>
              ) : (
                <>
                  <div className="relative">
                    <MapPin className="w-5 h-5 animate-bounce" />
                    <div className="absolute inset-0 blur-sm bg-white/50 animate-ping" />
                  </div>
                  <span className="font-bold text-sm tracking-wide">Search This Area</span>
                  <Search className="w-4 h-4 opacity-80" />
                </>
              )}
            </div>
          </button>
        </div>
      )}

      {/* Loading overlay */}
      {loading && !showSearchButton && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-gray-200 flex items-center gap-3 z-10">
          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
          <span className="text-sm font-semibold text-gray-700">Loading buildings…</span>
        </div>
      )}
    </div>
  );
};
