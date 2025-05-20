/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL: string
  readonly VITE_FACE_URL: string
  readonly VITE_VAPID_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
