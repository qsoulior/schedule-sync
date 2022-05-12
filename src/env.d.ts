/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AAD_APPID: string;
  readonly VITE_GCP_APPID: string;
  readonly VITE_MANAGER_API_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
