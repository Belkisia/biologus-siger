import { defineConfig } from "@tanstack/react-start/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  tsr: {
    autoCodeSplitting: true,
  },
  vite: {
    plugins: [tsconfigPaths()],
  },
  server: {
    preset: "vercel",
  },
});
