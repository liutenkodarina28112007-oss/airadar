import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" дозволяє розгортати збірку в будь-якій підпапці (GitHub Pages, Netlify тощо)
export default defineConfig({
  plugins: [react()],
  base: "./",
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api.php": {
        target: "https://freeserp.ai",
        changeOrigin: true,
        secure: true,
      },
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    proxy: {
      "/api.php": {
        target: "https://freeserp.ai",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
