import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import macrosPlugin from 'vite-plugin-babel-macros'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  server: {
    allowedHosts: true, // 모든 호스트를 허용
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: 'order.me',
        short_name: 'order.me',
        description: 'AI 얼굴인식 키오스크 오더미, 사용자를 위한 앱 입니다.',
        start_url: '.',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        lang: 'ko',
        icons: [
          {
            src: 'icons/apple-touch-icon-57x57.png',
            sizes: '57x57',
            type: 'image/png',
          },
          {
            src: 'icons/apple-touch-icon-60x60.png',
            sizes: '60x60',
            type: 'image/png',
          },
          {
            src: 'icons/apple-touch-icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
          },
          {
            src: 'icons/apple-touch-icon-76x76.png',
            sizes: '76x76',
            type: 'image/png',
          },
          {
            src: 'icons/apple-touch-icon-114x114.png',
            sizes: '114x114',
            type: 'image/png',
          },
          {
            src: 'icons/apple-touch-icon-120x120.png',
            sizes: '120x120',
            type: 'image/png',
          },
          {
            src: 'icons/apple-touch-icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
          },
          {
            src: 'icons/apple-touch-icon-152x152.png',
            sizes: '152x152',
            type: 'image/png',
          },
          {
            src: 'icons/favicon-16x16.png',
            sizes: '16x16',
            type: 'image/png',
          },
          {
            src: 'icons/favicon-32x32.png',
            sizes: '32x32',
            type: 'image/png',
          },
          {
            src: 'icons/favicon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
          },
          {
            src: 'icons/favicon-128.png',
            sizes: '128x128',
            type: 'image/png',
          },
          {
            src: 'icons/favicon-196x196.png',
            sizes: '196x196',
            type: 'image/png',
          },
          {
            src: 'icons/mstile-70x70.png',
            sizes: '70x70',
            type: 'image/png',
          },
          {
            src: 'icons/mstile-144x144.png',
            sizes: '144x144',
            type: 'image/png',
          },
          {
            src: 'icons/mstile-150x150.png',
            sizes: '150x150',
            type: 'image/png',
          },
          {
            src: 'icons/mstile-310x310.png',
            sizes: '310x310',
            type: 'image/png',
          },
        ],
      },
    }),
    macrosPlugin(),
  ],
  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
  },
})
