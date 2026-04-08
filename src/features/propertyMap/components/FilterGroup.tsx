import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { EnumFilter } from "./filters/EnumFilter";
import { BooleanFilter } from "./filters/BooleanFilter";
import { RangeFilter } from "./filters/RangeFilter";
import type { FilterGroupGql } from "@/features/propertyMap/types";

interface FilterGroupProps {
  group: FilterGroupGql;
  selected: string[];
  onToggleEnum: (key: string, value: string) => void;
  onToggleBoolean: (key: string) => void;
  onSetRange: (key: string, min: string, max: string) => void;
}

export const FilterGroup: React.FC<FilterGroupProps> = ({
  group,
  selected,
  onToggleEnum,
  onToggleBoolean,
  onSetRange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasActiveFilters = selected.length > 0;

  return (
    <div className="bg-white border-b border-gray-100 last:border-b-0">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-blue-50/50 transition-all group"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
            {group.label}
          </span>
          {hasActiveFilters && (
            <span className="px-1.5 py-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-full shadow-sm">
              {selected.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {group.type === 'enum' && (
            <span className="text-xs text-gray-400 font-medium">
              {group.values.length} options
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
          )}
        </div>
      </button>

      {/* Content */}
      {isOpen && (
        <div className="px-4 pb-3 bg-gray-50/40">
          <div className="pt-2">
            {group.type === "enum" && (
              <EnumFilter
                group={group}
                selected={selected}
                onToggle={onToggleEnum}
              />
            )}
            {group.type === "boolean" && (
              <BooleanFilter
                group={group}
                isActive={selected.includes("true")}
                onToggle={onToggleBoolean}
              />
            )}
            {group.type === "range" && (
              <RangeFilter
                group={group}
                selected={selected}
                onSet={onSetRange}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};