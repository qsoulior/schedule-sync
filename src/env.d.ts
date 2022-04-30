/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AAD_APPID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
