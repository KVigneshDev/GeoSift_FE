import React from "react";
import { LoadScriptNext } from "@react-google-maps/api";
import { InputComponentProps } from "@/features/ui/types";

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

const GoogleMapsLoader: React.FC<InputComponentProps> = React.memo(({ children }) => {
    return (
        <LoadScriptNext
            googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}
            libraries={libraries}
            mapIds={[import.meta.env.VITE_GOOGLE_MAPID]}
        >
            <>{children}</>
        </LoadScriptNext>
    );
});

GoogleMapsLoader.displayName = "mapLoader";

export default GoogleMapsLoader;
