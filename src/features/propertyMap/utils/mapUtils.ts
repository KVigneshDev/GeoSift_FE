import type {
  BoundingBoxInput,
  ActiveFilterInput,
  ActiveFilters,
  PropertyLayoutGql,
  PropertyFeaturesGql,
  KeyValueGql,
} from "@/features/propertyMap/types";
import { getCategoryInfo } from "@/features/propertyMap/constants/categories";

// ─── Bbox helpers ─────────────────────────────────────────────────────────────

export function bboxFromBounds(bounds: google.maps.LatLngBounds): BoundingBoxInput {
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  return {
    swLng: sw.lng(),
    swLat: sw.lat(),
    neLng: ne.lng(),
    neLat: ne.lat(),
  };
}

export function activeToGql(active: ActiveFilters): ActiveFilterInput[] {
  const result: ActiveFilterInput[] = [];
  active.forEach((values, key) => {
    if (values.length > 0) result.push({ key, values });
  });
  return result;
}

export const isContained = (
  inner: google.maps.LatLngBounds,
  outer: google.maps.LatLngBounds,
): boolean =>
  outer.contains(inner.getNorthEast()) && outer.contains(inner.getSouthWest());

export function expandBounds(
  bounds: google.maps.LatLngBounds,
  multiplier = 1.2,
): google.maps.LatLngBounds {
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();
  const latPad = ((ne.lat() - sw.lat()) * (multiplier - 1)) / 2;
  const lngPad = ((ne.lng() - sw.lng()) * (multiplier - 1)) / 2;
  return new google.maps.LatLngBounds(
    { lat: sw.lat() - latPad, lng: sw.lng() - lngPad },
    { lat: ne.lat() + latPad, lng: ne.lng() + lngPad },
  );
}

// ─── GeoJSON → polygon paths ──────────────────────────────────────────────────

export function geoJsonToPaths(geo: any): google.maps.LatLngLiteral[][] | null {
  if (!geo?.type || !geo?.coordinates) return null;
  if (geo.type === "Polygon") return geo.coordinates.map(ring2latlng);
  if (geo.type === "MultiPolygon")
    return geo.coordinates.flatMap((poly: any) => poly.map(ring2latlng));
  return null;
}

function ring2latlng(ring: number[][]): google.maps.LatLngLiteral[] {
  return ring.map(([lng, lat]) => ({ lat, lng }));
}

// ─── Info window content ──────────────────────────────────────────────────────
//
// `buildInfoContent` now accepts the lazy-loaded PropertyFeaturesGql object
// (fetched on click) rather than the full BuildingFeatureGql that used to
// bundle everything together.

export function buildInfoContent(
  id: string,
  features: PropertyFeaturesGql,
): string {
  const f = features;

  const coreRows = [
    f.subtype        && row("Type",            f.subtype),
    f.class          && row("Class",           f.class),
    f.height    != null && row("Height",       `${f.height.toFixed(1)} m`),
    f.numFloors != null && row("Floors",       String(f.numFloors)),
    f.roofMaterial   && row("Roof Material",   f.roofMaterial),
    f.roofShape      && row("Roof Shape",      f.roofShape),
    f.roofHeight != null && row("Roof Height", `${f.roofHeight.toFixed(1)} m`),
    f.roofArea   != null && row("Roof Area",   `${f.roofArea.toFixed(0)} m²`),
    f.facadeMaterial && row("Facade Material", f.facadeMaterial),
    f.facadeColor    && row("Facade Color",    f.facadeColor),
    f.isUnderground  && row("Underground",     "Yes"),
  ].filter(Boolean);

  const osmSections = buildOsmSections(f.osmAttributes);

  const allSections: string[] = [];

  if (coreRows.length > 0) {
    allSections.push(section("📊 Core Attributes", "#3B82F6", coreRows.join("")));
  }
  allSections.push(...osmSections);

  return `
    <div style="font-family:system-ui,sans-serif;max-width:320px;max-height:500px;overflow-y:auto;padding:16px">
      <div style="font-size:18px;font-weight:800;color:#111827;margin-bottom:16px;padding-bottom:12px;border-bottom:3px solid #E5E7EB">
        🏢 Building Details
      </div>
      ${allSections.join("") || '<p style="color:#6B7280;font-size:13px">No data available</p>'}
      <div style="margin-top:16px;padding-top:12px;border-top:2px solid #F3F4F6;font-size:10px;color:#9CA3AF;font-family:monospace">
        ID: ${id.slice(0, 24)}…
      </div>
    </div>
  `;
}

/** Skeleton shown while features are loading after a click. */
export function buildLoadingContent(): string {
  return `
    <div style="font-family:system-ui,sans-serif;padding:20px;display:flex;align-items:center;gap:12px;min-width:200px">
      <div style="width:20px;height:20px;border:3px solid #E5E7EB;border-top-color:#3B82F6;border-radius:50%;animation:spin 0.8s linear infinite"></div>
      <span style="color:#6B7280;font-size:14px;font-weight:600">Loading details…</span>
      <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
    </div>
  `;
}

// ─── OSM attribute categorisation (used only in info window) ──────────────────

const OSM_CATEGORY_MAP: Record<string, string> = {
  // key prefix → categoryId
};

function categorizeSingleAttr(attr: KeyValueGql): string {
  const { key } = attr;
  if (key.startsWith('roof:') || key === 'building:material' || key === 'building:cladding')
    return 'roofing';
  if (['leisure', 'sport'].includes(key))
    return 'outdoor_living';
  if (key === 'barrier' || key.startsWith('fence'))
    return 'outdoor_living';
  if (['garden', 'natural', 'landuse'].some(p => key.startsWith(p)))
    return 'landscaping';
  if (key === 'amenity' && ['charging_station', 'parking'].includes(attr.value))
    return 'utilities';
  if (['man_made', 'power'].includes(key))
    return 'utilities';
  if (['wheelchair', 'surveillance', 'access', 'camera:type'].includes(key))
    return 'commercial';
  if (key === 'building' || key.startsWith('building:'))
    return 'building_features';
  return 'other';
}

function buildOsmSections(attrs: KeyValueGql[]): string[] {
  if (!attrs.length) return [];

  const grouped: Record<string, KeyValueGql[]> = {};
  for (const attr of attrs) {
    const cat = categorizeSingleAttr(attr);
    (grouped[cat] ??= []).push(attr);
  }

  return Object.entries(grouped).map(([categoryId, items]) => {
    const info = getCategoryInfo(categoryId);
    const rows = items
      .map(attr => row(formatAttrLabel(attr.key), attr.value))
      .join("");
    return section(`${info.icon} ${info.label}`, info.color, rows);
  });
}

function formatAttrLabel(key: string): string {
  return key
    .split(':')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).replace(/_/g, ' '))
    .join(' – ');
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:5px 12px 5px 0;color:#6B7280;font-weight:600;vertical-align:top;white-space:nowrap">${label}</td>
    <td style="padding:5px 0;color:#111827;font-weight:700">${value}</td>
  </tr>`;
}

function section(title: string, color: string, tableRows: string): string {
  return `
    <div style="margin-bottom:16px">
      <div style="font-size:13px;font-weight:700;color:${color};margin-bottom:8px;padding-bottom:4px;border-bottom:2px solid ${color}33">
        ${title}
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:12px">${tableRows}</table>
    </div>`;
}
