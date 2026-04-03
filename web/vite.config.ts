import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: __dirname,
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3456",
        changeOrigin: true,
      },
    },
  },
});
