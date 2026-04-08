import { useState, useCallback } from "react";
import type { ActiveFilters } from "@/features/propertyMap/types";

interface FilterState {
  active: ActiveFilters;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  toggleEnum: (key: string, value: string) => void;
  toggleBoolean: (key: string) => void;
  setRange: (key: string, min: string, max: string) => void;
  clearAll: () => void;
}

export const useFilterState = (): FilterState => {
  const [active, setActive] = useState<ActiveFilters>(new Map());
  const [searchTerm, setSearchTerm] = useState("");

  const toggleEnum = useCallback((key: string, value: string) => {
    setActive((prev) => {
      const next = new Map(prev);
      const current = next.get(key) ?? [];
      const newValues = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];

      if (newValues.length === 0) {
        next.delete(key);
      } else {
        next.set(key, newValues);
      }
      return next;
    });
  }, []);

  const toggleBoolean = useCallback((key: string) => {
    setActive((prev) => {
      const next = new Map(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.set(key, ["true"]);
      }
      return next;
    });
  }, []);

  const setRange = useCallback((key: string, min: string, max: string) => {
    setActive((prev) => {
      const next = new Map(prev);
      next.set(key, [min, max]);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setActive(new Map());
  }, []);

  const handleSetSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  return {
    active,
    searchTerm,
    setSearchTerm: handleSetSearchTerm,
    toggleEnum,
    toggleBoolean,
    setRange,
    clearAll,
  };
};