import type { FilterCategory, CategoryInfo, FilterGroupGql, CategorizedFilters } from '@/features/propertyMap/types';

// ─── Category display config ──────────────────────────────────────────────────

export const CATEGORY_CONFIG: Record<FilterCategory, CategoryInfo> = {
  overture: {
    id: 'overture',
    label: 'Core Attributes',
    icon: '📊',
    color: '#6366F1',
    description: 'Height, floors, materials, basic classifications',
  },
  roofing: {
    id: 'roofing',
    label: 'Roofing & Exterior',
    icon: '🏠',
    color: '#EF4444',
    description: 'Roof material, shape, color, facade',
  },
  outdoor_living: {
    id: 'outdoor_living',
    label: 'Outdoor Living',
    icon: '🏊',
    color: '#3B82F6',
    description: 'Pools, leisure facilities, sports',
  },
  landscaping: {
    id: 'landscaping',
    label: 'Landscaping',
    icon: '🌳',
    color: '#10B981',
    description: 'Gardens, natural features, surfaces',
  },
  utilities: {
    id: 'utilities',
    label: 'Utilities & Infrastructure',
    icon: '⚡',
    color: '#F59E0B',
    description: 'Power, lighting, man-made structures',
  },
  commercial: {
    id: 'commercial',
    label: 'Commercial Features',
    icon: '🏢',
    color: '#8B5CF6',
    description: 'Retail, surveillance, advertising',
  },
  building_features: {
    id: 'building_features',
    label: 'Building Features',
    icon: '🏗️',
    color: '#EC4899',
    description: 'Amenities, accessibility, access',
  },
  other: {
    id: 'other',
    label: 'Other Features',
    icon: '📁',
    color: '#64748B',
    description: 'Miscellaneous property attributes',
  },
};

export const CATEGORY_ORDER: FilterCategory[] = [
  'overture',
  'roofing',
  'outdoor_living',
  'landscaping',
  'utilities',
  'commercial',
  'building_features',
  'other',
];

const FILTER_KEY_TO_CATEGORY: Record<string, FilterCategory> = {
  // Overture core attributes
  height: 'overture',
  num_floors: 'overture',
  roof_height: 'overture',
  roof_area: 'overture',
  is_underground: 'overture',
  subtype: 'overture',
  class: 'overture',

  // Roofing & exterior
  roof_material: 'roofing',
  roof_shape: 'roofing',
  roof_color: 'roofing',
  facade_material: 'roofing',
  facade_color: 'roofing',

  // Outdoor living
  leisure: 'outdoor_living',

  // Landscaping
  landscaping: 'landscaping',

  // Utilities
  utilities: 'utilities',
  lit: 'utilities',

  // Commercial
  shop: 'commercial',
  commercial: 'commercial',

  // Building features / accessibility
  amenity: 'building_features',
  access: 'building_features',
  wheelchair: 'building_features',
  covered: 'building_features',
};

export function getCategoryForKey(key: string): FilterCategory {
  return FILTER_KEY_TO_CATEGORY[key] ?? 'other';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getCategoryInfo(categoryId: string | undefined): CategoryInfo {
  if (!categoryId || !(categoryId in CATEGORY_CONFIG)) {
    return CATEGORY_CONFIG.other;
  }
  return CATEGORY_CONFIG[categoryId as FilterCategory];
}

export function categorizeFilters(filters: FilterGroupGql[]): CategorizedFilters[] {
  const grouped: Partial<Record<FilterCategory, FilterGroupGql[]>> = {};

  for (const filter of filters) {
    const categoryId = getCategoryForKey(filter.key);
    if (!grouped[categoryId]) grouped[categoryId] = [];
    grouped[categoryId]!.push(filter);
  }

  return CATEGORY_ORDER
    .filter(id => grouped[id] && grouped[id]!.length > 0)
    .map(id => ({
      category: CATEGORY_CONFIG[id],
      filters: grouped[id]!,
    }));
}

export function getCategoryColor(categoryId: string | undefined, opacity = 1): string {
  const { color } = getCategoryInfo(categoryId);
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export function getCategoryTailwindClass(categoryId: string | undefined): string {
  const colorMap: Record<FilterCategory, string> = {
    roofing: 'red',
    outdoor_living: 'blue',
    landscaping: 'green',
    utilities: 'amber',
    commercial: 'purple',
    building_features: 'pink',
    overture: 'indigo',
    other: 'slate',
  };
  const category = (categoryId || 'other') as FilterCategory;
  return colorMap[category] ?? 'slate';
}
