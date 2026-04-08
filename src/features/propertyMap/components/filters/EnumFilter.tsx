import React from "react";
import { Check } from "lucide-react";
import type { FilterGroupGql, FilterValueGql } from "@/features/propertyMap/types";

interface EnumFilterProps {
  group: FilterGroupGql;
  selected: string[];
  onToggle: (key: string, value: string) => void;
}

export const EnumFilter: React.FC<EnumFilterProps> = ({
  group,
  selected,
  onToggle,
}) => {
  // Show top 10 by default, with option to expand
  const [showAll, setShowAll] = React.useState(false);
  const displayValues = showAll ? group.values : group.values.slice(0, 10);
  const hasMore = group.values.length > 10;

  return (
    <div className="space-y-2">
      {displayValues.map((filterValue: FilterValueGql) => {
        const isSelected = selected.includes(filterValue.value);

        return (
          <label
            key={filterValue.value}
            className="flex items-center gap-3 cursor-pointer group py-1 hover:bg-blue-50/50 -mx-2 px-2 rounded-md transition-all"
          >
            {/* Custom Checkbox */}
            <div
              className={`relative w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shadow-sm ${isSelected
                  ? "bg-gradient-to-br from-blue-600 to-indigo-600 border-blue-600 shadow-blue-200"
                  : "border-gray-300 bg-white group-hover:border-blue-400"
                }`}
            >
              {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3.5} />}
            </div>

            {/* Label */}
            <span className="flex-1 text-sm text-gray-700 group-hover:text-gray-900 font-medium">
              {filterValue.label}
            </span>

            {/* Count Badge */}
            <span className={`text-xs font-bold px-2 py-1 rounded-md transition-all ${isSelected
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600"
              }`}>
              {filterValue.count.toLocaleString()}
            </span>

            {/* Hidden native checkbox for accessibility */}
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggle(group.key, filterValue.value)}
              className="sr-only"
            />
          </label>
        );
      })}

      {/* Show More Button */}
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-2 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-all"
        >
          {showAll ? `Show less` : `Show ${group.values.length - 10} more`}
        </button>
      )}
    </div>
  );
};
