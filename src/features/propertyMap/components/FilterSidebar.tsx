import React, { useMemo } from "react";
import {
  Search, X, RefreshCw, Trash2, Loader2,
  Filter, AlertCircle, Layers,
} from "lucide-react";
import { CategorySection } from "@/features/propertyMap/components/CategorySection";
import { categorizeFilters } from "@/features/propertyMap/constants/categories";
import type { FilterGroupGql, ActiveFilters } from "@/features/propertyMap/types";

interface FilterSidebarProps {
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
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  isOpen,
  filters,
  activeFilters,
  searchTerm,
  loading,
  initializing = false,
  error,
  onSearchChange,
  onToggleEnum,
  onToggleBoolean,
  onSetRange,
  onClearAll,
  onRefresh,
}) => {
  const filteredFilters = useMemo(() => {
    if (!searchTerm) return filters;
    const term = searchTerm.toLowerCase();
    return filters.filter(
      (f) =>
        f.label?.toLowerCase().includes(term) ||
        f.values.some((v) => v.label?.toLowerCase().includes(term)),
    );
  }, [filters, searchTerm]);

  const categorizedFilters = useMemo(
    () => categorizeFilters(filteredFilters),
    [filteredFilters],
  );

  const activeCount = activeFilters.size;
  const totalFilterCount = filters.length;

  if (!isOpen) return null;

  return (
    // min-h-0 is critical: it lets this flex child shrink below its content
    // height, so the inner overflow-y-auto actually kicks in instead of the
    // sidebar growing to full content height and making the page scroll.
    <div className="w-80 min-h-0 bg-white border-r border-stone-200 flex flex-col shadow-lg overflow-hidden">

      {/* ── Header — fixed, never scrolls ──────────────────────────────── */}
      <div className="flex-none p-4 border-b border-stone-200 bg-gradient-to-br from-teal-50/30 to-stone-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-700 to-teal-900 rounded-xl blur opacity-20" />
              <div className="relative w-9 h-9 bg-gradient-to-br from-teal-700 to-teal-900 rounded-xl flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-black text-stone-900">Filters</h2>
              <div className="text-xs text-stone-500 font-semibold -mt-0.5">
                {totalFilterCount} available
              </div>
            </div>
          </div>

          <button
            onClick={onRefresh}
            disabled={initializing || loading}
            className="p-2 hover:bg-stone-100 rounded-xl transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh filters"
          >
            <RefreshCw
              className={`w-4 h-4 text-stone-600 group-hover:text-teal-700 transition-colors ${loading ? "animate-spin" : ""
                }`}
            />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search filters..."
            disabled={initializing || loading}
            className="w-full pl-9 pr-9 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 disabled:bg-stone-50 disabled:cursor-not-allowed transition-all font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Active filter badge */}
        {activeCount > 0 && (
          <div className="flex items-center justify-between bg-gradient-to-br from-teal-700 to-teal-900 rounded-xl px-3 py-2 shadow-lg shadow-teal-700/30">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-xs font-black text-white">
                {activeCount}
              </span>
              <span className="text-sm font-bold text-white">Active</span>
            </div>
            <button
              onClick={onClearAll}
              className="flex items-center gap-1 px-2 py-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all"
            >
              <Trash2 className="w-3.5 h-3.5 text-white" />
              <span className="text-xs font-bold text-white">Clear</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Filter list — scrollable, fills remaining height ────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto bg-stone-50/30">
        {error ? (
          <div className="p-4">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-red-900 mb-1">Error Loading</h3>
                  <p className="text-xs text-red-700 mb-3">{error}</p>
                  <button
                    onClick={onRefresh}
                    className="text-xs font-bold text-red-700 hover:text-red-900 underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>

        ) : initializing ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 px-4">
            <div className="relative">
              <div className="absolute inset-0 bg-teal-600 rounded-full blur-xl opacity-20 animate-pulse" />
              <Loader2 className="relative w-12 h-12 text-teal-700 animate-spin" />
            </div>
            <div className="text-center">
              <span className="text-sm font-bold text-stone-700 block mb-1">Initializing...</span>
              <span className="text-xs text-stone-500">Loading property data</span>
            </div>
          </div>

        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-10 h-10 text-teal-700 animate-spin" />
            <span className="text-sm font-bold text-stone-600">Discovering filters...</span>
          </div>

        ) : categorizedFilters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center px-4">
            <div className="relative">
              <div className="absolute inset-0 bg-stone-300 rounded-full blur-lg opacity-20" />
              <Filter className="relative w-14 h-14 text-stone-300" />
            </div>
            <div>
              <span className="text-sm font-bold text-stone-700 block mb-1">
                {searchTerm ? "No filters found" : "No filters available"}
              </span>
              <span className="text-xs text-stone-500">
                {searchTerm ? "Try adjusting your search" : "Search the area to get filters"}
              </span>
            </div>
          </div>

        ) : (
          <div className="bg-white">
            {categorizedFilters.map(({ category, filters: categoryFilters }) => (
              <CategorySection
                key={category.id}
                category={category}
                filters={categoryFilters}
                activeFilters={activeFilters}
                onToggleEnum={onToggleEnum}
                onToggleBoolean={onToggleBoolean}
                onSetRange={onSetRange}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Footer — count bar, only shown when filters are visible ─────── */}
      {!error && !initializing && categorizedFilters.length > 0 && (
        <div className="flex-none border-t border-stone-200 bg-white px-4 py-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-600 font-semibold">
              {categorizedFilters.length}{" "}
              {categorizedFilters.length === 1 ? "category" : "categories"}
            </span>
            <span className="text-stone-500 font-medium">
              {filteredFilters.length} / {totalFilterCount}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
