/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEEPBOOK_INDEXER_API?: string;
  readonly VITE_DEFAULT_SUI_PRICE?: string;
  // Add more env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

