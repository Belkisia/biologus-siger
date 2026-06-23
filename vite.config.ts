import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    TanStackRouterVite({ autoCodeSplitting: true }),
    react(),
    tsconfigPaths(),
  ],
  server: {
    port: 8080,
    host: "0.0.0.0",
  },
  build: {
    outDir: "dist",
  },
  define: {
    // garante que process.env funciona no client
    "process.env": {},
  },
});
