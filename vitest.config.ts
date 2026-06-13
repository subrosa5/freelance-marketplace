import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    environmentMatchGlobs: [
      ["src/components/**", "jsdom"],
    ],
  },
  resolve: {
    alias: { "@": resolve(__dirname, "./src") },
  },
});
