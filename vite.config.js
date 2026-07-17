import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: {
        enabled: true // Permite testar o service worker rodando npm run dev
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}']
      },
      manifest: {
        name: "Ponto PWA",
        short_name: "Ponto",
        description: "Sistema de registro de ponto simples e offline.",
        theme_color: "#4f46e5",
        background_color: "#0f172a",
        display: "standalone",
        start_url: ".",
        icons: [
          {
            src: "vite.svg",
            sizes: "192x192",
            type: "image/svg+xml"
          },
          {
            src: "vite.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable"
          }
        ]
      }
    })
  ],
  base: './', // Permite que os caminhos funcionem em qualquer subdiretório no GitHub Pages
})
