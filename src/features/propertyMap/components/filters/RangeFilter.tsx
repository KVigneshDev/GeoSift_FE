import React, { useState, useEffect } from "react";
import type { FilterGroupGql } from "@/features/propertyMap/types";

interface RangeFilterProps {
  group: FilterGroupGql;
  selected: string[];
  onSet: (key: string, min: string, max: string) => void;
}

export const RangeFilter: React.FC<RangeFilterProps> = ({
  group,
  selected,
  onSet,
}) => {
  console.log(group, 'group');
  const minAbs = Number(group.values[0]?.count ?? 0);
  const maxAbs = Number(group.values[1]?.count ?? 100);

  const [localMin, setLocalMin] = useState(
    selected.length === 2 ? Number(selected[0]) : minAbs
  );
  const [localMax, setLocalMax] = useState(
    selected.length === 2 ? Number(selected[1]) : maxAbs
  );

  const [isDragging, setIsDragging] = useState(false);

  // Sync local state with selected values
  useEffect(() => {
    if (selected.length === 2) {
      setLocalMin(Number(selected[0]));
      setLocalMax(Number(selected[1]));
    } else {
      setLocalMin(minAbs);
      setLocalMax(maxAbs);
    }
  }, [selected, minAbs, maxAbs]);

  const commitRange = () => {
    setIsDragging(false);
    onSet(group.key, String(localMin), String(localMax));
  };

  const handleMinChange = (value: number) => {
    setIsDragging(true);
    setLocalMin(Math.min(value, localMax - 1));
  };

  const handleMaxChange = (value: number) => {
    setIsDragging(true);
    setLocalMax(Math.max(value, localMin + 1));
  };

  const pctMin = maxAbs === minAbs ? 0 : ((localMin - minAbs) / (maxAbs - minAbs)) * 100;
  const pctMax = maxAbs === minAbs ? 100 : ((localMax - minAbs) / (maxAbs - minAbs)) * 100;

  return (
    <div className="space-y-4 py-3">
      {/* Value Display */}
      <div className="flex justify-between items-center gap-3">
        <div className="flex-1">
          <div className="text-xs text-gray-500 font-medium mb-1">Min</div>
          <div className="px-3 py-2 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg shadow-sm">
            <span className="text-sm font-bold text-blue-900">{localMin.toLocaleString()}</span>
          </div>
        </div>
        <div className="text-sm text-gray-400 font-bold pt-5">→</div>
        <div className="flex-1">
          <div className="text-xs text-gray-500 font-medium mb-1">Max</div>
          <div className="px-3 py-2 bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200 rounded-lg shadow-sm">
            <span className="text-sm font-bold text-indigo-900">{localMax.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Visual Range Bar */}
      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        <div
          className={`absolute h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all ${isDragging ? 'shadow-lg' : ''
            }`}
          style={{ left: `${pctMin}%`, width: `${pctMax - pctMin}%` }}
        />
        {/* Handles */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-blue-600 rounded-full shadow-md transition-all"
          style={{ left: `${pctMin}%`, transform: `translate(-50%, -50%) ${isDragging ? 'scale(1.2)' : ''}` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-indigo-600 rounded-full shadow-md transition-all"
          style={{ left: `${pctMax}%`, transform: `translate(-50%, -50%) ${isDragging ? 'scale(1.2)' : ''}` }}
        />
      </div>

      {/* Dual Range Sliders */}
      <div className="relative -mt-2">
        <input
          type="range"
          min={minAbs}
          max={localMax}
          value={localMin}
          onChange={(e) => handleMinChange(Number(e.target.value))}
          onMouseUp={commitRange}
          onTouchEnd={commitRange}
          className="range-input w-full"
          style={{ zIndex: localMin > minAbs + (maxAbs - minAbs) * 0.5 ? 5 : 3 }}
        />
        <input
          type="range"
          min={localMin}
          max={maxAbs}
          value={localMax}
          onChange={(e) => handleMaxChange(Number(e.target.value))}
          onMouseUp={commitRange}
          onTouchEnd={commitRange}
          className="range-input w-full absolute top-0"
          style={{ zIndex: localMax <= minAbs + (maxAbs - minAbs) * 0.5 ? 5 : 3 }}
        />
      </div>

      {/* Range Labels */}
      <div className="flex justify-between text-xs text-gray-500 font-semibold">
        <span>{minAbs.toLocaleString()}</span>
        <span>{maxAbs.toLocaleString()}</span>
      </div>

      {/* Reset Button */}
      {(localMin !== minAbs || localMax !== maxAbs) && (
        <button
          onClick={() => {
            setLocalMin(minAbs);
            setLocalMax(maxAbs);
            onSet(group.key, String(minAbs), String(maxAbs));
          }}
          className="w-full py-1.5 text-xs font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
        >
          Reset to full range
        </button>
      )}
    </div>
  );
};
