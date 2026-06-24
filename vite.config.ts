import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    tanstackStart({
      target: "vercel",
    }),
  ],
  build: {
    assetsDir: "_app",
  },
});
