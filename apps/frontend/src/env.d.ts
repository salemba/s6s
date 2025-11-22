/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // Add any other VITE_ variables used in your client code here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
