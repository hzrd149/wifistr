import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import tailwindcss from "@tailwindcss/vite";
import devtools from "solid-devtools/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  build: {
    sourcemap: true,
    target: ["chrome89", "edge89", "firefox89", "safari15"],
  },
  plugins: [
    solid(),
    tailwindcss(),
    devtools({ autoname: true }),
    VitePWA({
      injectRegister: "auto",
      registerType: "autoUpdate",
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,txt}"],
        maximumFileSizeToCacheInBytes: 1024 * 1024 * 1024,
      },
      manifest: {
        name: "Wifistr",
        theme_color: "#0000ff",
      },
    }),
  ],
});
