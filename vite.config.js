import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill"; // <-- add this

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      buffer: "buffer", // <-- alias for buffer module
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis", // <-- polyfill global
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true, // <-- enable Buffer polyfill
        }),
      ],
    },
  },
});
