/// <reference types="@types/google.maps" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPID: string;
  readonly VITE_GRAPHQL_ENDPOINT: string;
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}