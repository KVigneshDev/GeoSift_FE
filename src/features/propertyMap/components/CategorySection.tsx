import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { FilterGroup } from "./FilterGroup";
import type { CategorySectionProps } from "@/features/propertyMap/types";

export const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  filters,
  activeFilters,
  onToggleEnum,
  onToggleBoolean,
  onSetRange,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Count active filters in this category
  const activeCount = filters.reduce((count, filter) => {
    const selected = activeFilters.get(filter.key);
    return count + (selected && selected.length > 0 ? 1 : 0);
  }, 0);

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      {/* Category Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors group"
        style={{
          borderLeft: `3px solid ${category.color}`,
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{category.icon}</span>
          <div className="text-left">
            <div className="text-sm font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
              {category.label}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {filters.length} {filters.length === 1 ? 'filter' : 'filters'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <span
              className="px-2 py-1 text-xs font-bold text-white rounded-full"
              style={{ backgroundColor: category.color }}
            >
              {activeCount}
            </span>
          )}
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Category Filters */}
      {isExpanded && (
        <div className="bg-gray-50/30">
          {filters.map((filter) => (
            <FilterGroup
              key={filter.key}
              group={filter}
              selected={activeFilters.get(filter.key) ?? []}
              onToggleEnum={onToggleEnum}
              onToggleBoolean={onToggleBoolean}
              onSetRange={onSetRange}
            />
          ))}
        </div>
      )}
    </div>
  );
};