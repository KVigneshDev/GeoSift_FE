import React from "react";
import type { FilterGroupGql } from "@/features/propertyMap/types";

interface BooleanFilterProps {
  group: FilterGroupGql;
  isActive: boolean;
  onToggle: (key: string) => void;
}

export const BooleanFilter: React.FC<BooleanFilterProps> = ({
  group,
  isActive,
  onToggle,
}) => {
  return (
    <div className="py-1">
      <label className="flex items-center justify-between cursor-pointer group hover:bg-blue-50/50 -mx-2 px-2 py-2 rounded-md transition-all">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
            Enable
          </span>
          {group.values[0] && (
            <span className={`text-xs font-bold px-2 py-1 rounded-md transition-all ${isActive
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-500"
              }`}>
              {group.values[0].count.toLocaleString()}
            </span>
          )}
        </div>

        {/* Enhanced Toggle Switch */}
        <button
          onClick={() => onToggle(group.key)}
          className={`relative w-14 h-7 rounded-full transition-all duration-200 shadow-inner ${isActive
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-200"
              : "bg-gray-300 hover:bg-gray-400"
            }`}
        >
          <div
            className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-200 flex items-center justify-center ${isActive ? "left-7" : "left-0.5"
              }`}
          >
            {isActive && (
              <div className="w-2 h-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full" />
            )}
          </div>
        </button>
      </label>
    </div>
  );
};
