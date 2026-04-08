/**
 * PropertyMap Module Type Definitions
 */

import type { User } from "@/features/auth/types";

// ─── GraphQL Types — must mirror the updated property.graphql schema ──────────

export interface BoundingBoxInput {
  swLng: number;
  swLat: number;
  neLng: number;
  neLat: number;
}

export interface ActiveFilterInput {
  key: string;
  values: string[];
}

// Local UI state: key → selected values
export type ActiveFilters = Map<string, string[]>;

// ─── Filter types ─────────────────────────────────────────────────────────────

export interface FilterValueGql {
  value: string;
  label: string | null; // null means use raw value
  count: number;
}

export interface FilterGroupGql {
  key: string;
  label: string | null;
  type: 'enum' | 'boolean' | 'range';
  values: FilterValueGql[];
  // NOTE: `category` is NOT in the backend schema. It is derived client-side
  // by FILTER_KEY_TO_CATEGORY in constants/categories.ts.
}

// ─── Layout + combined result ─────────────────────────────────────────────────

export interface PropertyLayoutGql {
  id: string;
  geometry: string; // GeoJSON string
}

export interface AvailableFiltersResultGql {
  filters: FilterGroupGql[];
  totalCount: number;
  layouts: PropertyLayoutGql[];
}

// ─── Per-building detail (lazy-loaded on polygon click) ───────────────────────

export interface KeyValueGql {
  key: string;
  value: string;
}

export interface PropertyFeaturesGql {
  subtype: string | null;
  class: string | null;
  height: number | null;
  numFloors: number | null;
  roofMaterial: string | null;
  roofShape: string | null;
  roofHeight: number | null;
  roofArea: number | null;
  facadeMaterial: string | null;
  facadeColor: string | null;
  isUnderground: boolean | null;
  osmAttributes: KeyValueGql[];
}

// ─── Category types (frontend-only) ──────────────────────────────────────────

export type FilterCategory =
  | 'overture'
  | 'roofing'
  | 'outdoor_living'
  | 'landscaping'
  | 'utilities'
  | 'commercial'
  | 'building_features'
  | 'other';

export interface CategoryInfo {
  id: FilterCategory;
  label: string;
  icon: string;
  color: string;
  description: string;
}

export interface CategorizedFilters {
  category: CategoryInfo;
  filters: FilterGroupGql[];
}

// ─── Component Props ──────────────────────────────────────────────────────────

export interface HeaderProps {
  user: User | null;
  totalCount: number;
  activeFilterCount: number;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onLogout: () => void;
}

export interface MapContainerProps {
  mapRef: React.MutableRefObject<HTMLDivElement | null>;
  mapInstance: React.MutableRefObject<google.maps.Map | null>;
  polygons: React.MutableRefObject<google.maps.Polygon[]>;
  infoWindow: React.MutableRefObject<google.maps.InfoWindow | null>;
  layouts: PropertyLayoutGql[];
  loading: boolean;
  onBoundsChange: (bounds: google.maps.LatLngBounds) => void;
  onMapReady?: () => void;
  showSearchButton?: boolean;
  onSearchThisArea?: () => void;
  isSearching?: boolean;
  onBuildingClick: (id: string, latLng: google.maps.LatLng) => Promise<PropertyFeaturesGql | null>;
}

export interface FilterSidebarProps {
  isOpen: boolean;
  filters: FilterGroupGql[];
  activeFilters: ActiveFilters;
  searchTerm: string;
  loading: boolean;
  initializing?: boolean;
  error?: string;
  onSearchChange: (term: string) => void;
  onToggleEnum: (key: string, value: string) => void;
  onToggleBoolean: (key: string) => void;
  onSetRange: (key: string, min: string, max: string) => void;
  onClearAll: () => void;
  onRefresh: () => void;
  hasChanges?: boolean;
  onApplyFilters?: () => void;
  isApplying?: boolean;
}

export interface FilterGroupProps {
  group: FilterGroupGql;
  selected: string[];
  onToggleEnum: (key: string, value: string) => void;
  onToggleBoolean: (key: string) => void;
  onSetRange: (key: string, min: string, max: string) => void;
}

export interface CategorySectionProps {
  category: CategoryInfo;
  filters: FilterGroupGql[];
  activeFilters: ActiveFilters;
  onToggleEnum: (key: string, value: string) => void;
  onToggleBoolean: (key: string) => void;
  onSetRange: (key: string, min: string, max: string) => void;
}

export interface EnumFilterProps {
  group: FilterGroupGql;
  selected: string[];
  onToggle: (key: string, value: string) => void;
}

export interface BooleanFilterProps {
  group: FilterGroupGql;
  isActive: boolean;
  onToggle: (key: string) => void;
}

export interface RangeFilterProps {
  group: FilterGroupGql;
  selected: string[];
  onSet: (key: string, min: string, max: string) => void;
}

// ─── Hook Return Types ────────────────────────────────────────────────────────

export interface MapStateHook {
  bbox: BoundingBoxInput | null;
  setBbox: (bbox: BoundingBoxInput) => void;
  fetchedBBox: BoundingBoxInput | null;
  setFetchedBBox: (bbox: BoundingBoxInput | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export interface FilterStateHook {
  active: ActiveFilters;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  toggleEnum: (key: string, value: string) => void;
  toggleBoolean: (key: string) => void;
  setRange: (key: string, min: string, max: string) => void;
  clearAll: () => void;
}

// ─── Utility Types ────────────────────────────────────────────────────────────

export interface GeoJSONGeometry {
  type: "Polygon" | "MultiPolygon";
  coordinates: number[][][] | number[][][][];
}

export type MapEventHandler = (event: google.maps.MapMouseEvent) => void;
export type PolygonEventHandler = (event: google.maps.PolyMouseEvent) => void;

// ─── Constants ────────────────────────────────────────────────────────────────

export const DEFAULT_MAP_CENTER: google.maps.LatLngLiteral = {
  lat: 48.8566,
  lng: 2.3522,
};

export const DEFAULT_MAP_ZOOM = 15;
export const FILTER_SEARCH_PLACEHOLDER = "Search filters...";

// ─── Type Guards ──────────────────────────────────────────────────────────────

export function isEnumFilter(group: FilterGroupGql): boolean {
  return group.type === "enum";
}

export function isBooleanFilter(group: FilterGroupGql): boolean {
  return group.type === "boolean";
}

export function isRangeFilter(group: FilterGroupGql): boolean {
  return group.type === "range";
}

// ─── Error Types ──────────────────────────────────────────────────────────────

export class MapInitializationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MapInitializationError";
  }
}

export class FilterValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FilterValidationError";
  }
}

export class GeometryParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeometryParseError";
  }
}