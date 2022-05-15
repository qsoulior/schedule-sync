/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AAD_APPID: string;
  readonly VITE_GCP_APPID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
