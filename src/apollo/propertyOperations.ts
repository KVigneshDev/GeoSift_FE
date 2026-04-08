import { gql } from '@apollo/client';

// ─── Fragments ────────────────────────────────────────────────────────────────

const FILTER_GROUP_FRAGMENT = gql`
  fragment FilterGroupFields on FilterGroup {
    key
    label
    type
    values {
      value
      label
      count
    }
  }
`;

const PROPERTY_LAYOUT_FRAGMENT = gql`
  fragment PropertyLayoutFields on PropertyLayout {
    id
    geometry
  }
`;

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Single combined query — returns filters + building polygon layouts + totalCount.
 * Replaces the old GET_AVAILABLE_FILTERS + GET_BUILDINGS pair.
 *
 * When activeFilters change, the filtered layouts are returned alongside the
 * counts for each remaining filter value — one round-trip for everything.
 */
export const GET_AVAILABLE_FILTERS = gql`
  ${FILTER_GROUP_FRAGMENT}
  ${PROPERTY_LAYOUT_FRAGMENT}
  query GetAvailableFilters(
    $bbox: BoundingBoxInput!
    $filters: [ActiveFilterInput!]
  ) {
    availableFilters(bbox: $bbox, filters: $filters) {
      filters {
        ...FilterGroupFields
      }
      totalCount
      layouts {
        ...PropertyLayoutFields
      }
    }
  }
`;

/**
 * Lazy per-building detail query — only fired when a user clicks a polygon.
 * Keeps the main query lean (layouts are just id + geometry).
 */
export const GET_PROPERTY_FEATURES = gql`
  query GetPropertyFeatures($propertyId: String!) {
    propertyFeatures(propertyId: $propertyId) {
      subtype
      class
      height
      numFloors
      roofMaterial
      roofShape
      roofHeight
      roofArea
      facadeMaterial
      facadeColor
      isUnderground
      osmAttributes {
        key
        value
      }
    }
  }
`;
