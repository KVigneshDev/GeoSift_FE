import { useState, useCallback, createContext, useContext } from "react";
import type {
  BoundingBoxInput,
  PropertyLayoutGql,
} from "@/features/propertyMap/types";

// 1. Define the full shape of the Context Value
interface MapState {
  bbox: BoundingBoxInput | null;
  setBbox: (bbox: BoundingBoxInput) => void;
  fetchedBBox: BoundingBoxInput | null;
  setFetchedBBox: (bbox: BoundingBoxInput | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

// 3. The Hook that manages the local state logic
export const useMapState = () => {
  const [bbox, setBbox] = useState<BoundingBoxInput | null>(null);
  const [fetchedBBox, setFetchedBBox] = useState<BoundingBoxInput | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSetBbox = useCallback((newBbox: BoundingBoxInput) => setBbox(newBbox), []);
  const handleSetFetchedBBox = useCallback((newBbox: BoundingBoxInput | null) => setFetchedBBox(newBbox), []);
  const handleSetSidebarOpen = useCallback((open: boolean) => setSidebarOpen(open), []);
  const handleSetSelectedId = useCallback((id: string | null) => setSelectedId(id), []);
  const handleSetSearchTerm = useCallback((t: string) => setSearchTerm(t), []);

  return {
    bbox, setBbox: handleSetBbox,
    fetchedBBox, setFetchedBBox: handleSetFetchedBBox,
    sidebarOpen, setSidebarOpen: handleSetSidebarOpen,
    selectedId, setSelectedId: handleSetSelectedId,
    searchTerm, setSearchTerm: handleSetSearchTerm,
  };
};

// 4. Create the Context (This is the variable that was causing your error)
export const MapContext = createContext<MapState | undefined>(undefined);

// 6. Custom Hook to use the Context
export const useMapContext = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMapContext must be used within a MapStateProvider");
  }
  return context;
};