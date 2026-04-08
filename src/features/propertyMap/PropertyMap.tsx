import React, { useRef, useCallback, useState, useMemo } from "react";
import { useQuery, useLazyQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  GET_AVAILABLE_FILTERS,
  GET_PROPERTY_FEATURES,
} from "@/apollo/propertyOperations";
import { useMapState } from "./hooks/useMapState";
import { useFilterState } from "./hooks/useFilterState";
import { MapContainer } from "./components/MapContainer";
import { FilterSidebar } from "./components/FilterSidebar";
import { Header } from "./components/Header";
import {
  bboxFromBounds,
  activeToGql,
  expandBounds,
  isContained,
} from "@/features/propertyMap/utils/mapUtils";
import type {
  FilterGroupGql,
  PropertyLayoutGql,
  PropertyFeaturesGql,
} from "@/features/propertyMap/types";
import toast from "react-hot-toast";

const PropertyMap: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { bbox, setBbox, sidebarOpen, setSidebarOpen, fetchedBBox, setFetchedBBox } =
    useMapState();
  const { active, searchTerm, setSearchTerm, toggleEnum, toggleBoolean, setRange, clearAll } =
    useFilterState();

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const polygons = useRef<google.maps.Polygon[]>([]);
  const infoWindow = useRef<google.maps.InfoWindow | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const [hasMapMoved, setHasMapMoved] = useState(false);

  const lastFetchedBoundsRef = useRef<google.maps.LatLngBounds | null>(null);

  const gqlFilters = useMemo(() => activeToGql(active), [active]);

  // ── Main query — single round-trip for filters + layouts + totalCount ──────
  const { data, loading, error, refetch } = useQuery(GET_AVAILABLE_FILTERS, {
    variables: { bbox: fetchedBBox, filters: gqlFilters },
    skip: !fetchedBBox || !mapReady,
    fetchPolicy: "cache-and-network",
    onError: (err) => console.error("Failed to fetch data:", err),
  });

  const filters: FilterGroupGql[] = data?.availableFilters?.filters ?? [];
  const layouts: PropertyLayoutGql[] = data?.availableFilters?.layouts ?? [];
  const totalCount: number = data?.availableFilters?.totalCount ?? 0;

  // ── Lazy query — per-building details, fired on polygon click ─────────────
  const [fetchPropertyFeatures] = useLazyQuery(GET_PROPERTY_FEATURES, {
    fetchPolicy: "cache-first",
  });

  const handleBuildingClick = useCallback(
    async (id: string, _latLng: google.maps.LatLng): Promise<PropertyFeaturesGql | null> => {
      try {
        const { data: featureData } = await fetchPropertyFeatures({
          variables: { propertyId: id },
        });
        return featureData?.propertyFeatures ?? null;
      } catch (err) {
        console.error("Failed to load building features:", err);
        return null;
      }
    },
    [fetchPropertyFeatures],
  );

  // ── Map bounds handler ─────────────────────────────────────────────────────
  const handleMapBoundsChange = useCallback(
    (bounds: google.maps.LatLngBounds) => {
      setBbox(bboxFromBounds(bounds));

      const zoom = mapInstance.current?.getZoom() ?? 0;
      if (zoom < 15) return;

      if (lastFetchedBoundsRef.current && isContained(bounds, lastFetchedBoundsRef.current)) {
        setHasMapMoved(false);
        return;
      }

      setHasMapMoved(true);
    },
    [setBbox],
  );

  // ── "Search This Area" ────────────────────────────────────────────────────
  const handleSearchThisArea = useCallback(async () => {
    if (!bbox || loading) return;

    if (active.size === 0 && (mapInstance.current?.getZoom() ?? 0) < 15) {
      toast.error("Zoom in closer or apply filters to search this area.");
      return;
    }

    const currentBounds = mapInstance.current?.getBounds();
    if (!currentBounds) return;

    const paddedBounds = expandBounds(currentBounds, 1.3);
    lastFetchedBoundsRef.current = paddedBounds;
    setFetchedBBox(bboxFromBounds(paddedBounds));
    setHasMapMoved(false);
  }, [bbox, loading, active, setFetchedBBox]);

  const handleClearAllFilters = useCallback(() => clearAll(), [clearAll]);
  const handleMapReady = useCallback(() => setMapReady(true), []);
  const handleLogout = useCallback(() => {
    logout();
    navigate("/");
  }, [logout, navigate]);

  const isInitializing = !mapReady || (!bbox && mapReady);
  const isLoadingFilters = mapReady && !!bbox && loading;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      <Header
        user={user}
        totalCount={totalCount}
        activeFilterCount={active.size}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onLogout={handleLogout}
      />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <FilterSidebar
          isOpen={sidebarOpen}
          filters={filters}
          activeFilters={active}
          searchTerm={searchTerm}
          loading={isLoadingFilters}
          initializing={isInitializing}
          error={!!error ? "Failed to load filters. Please try refreshing." : undefined}
          onSearchChange={setSearchTerm}
          onToggleEnum={toggleEnum}
          onToggleBoolean={toggleBoolean}
          onSetRange={setRange}
          onClearAll={handleClearAllFilters}
          onRefresh={() => refetch()}
        />

        <MapContainer
          mapRef={mapRef}
          mapInstance={mapInstance}
          polygons={polygons}
          infoWindow={infoWindow}
          layouts={layouts}
          loading={loading}
          onBoundsChange={handleMapBoundsChange}
          onMapReady={handleMapReady}
          showSearchButton={hasMapMoved}
          onSearchThisArea={handleSearchThisArea}
          isSearching={loading}
          onBuildingClick={handleBuildingClick}
        />
      </div>
    </div>
  );
};

export default PropertyMap;
