import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      buffer: "buffer",
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
         mui: ["@mui/material", "@mui/icons-material", "@mui/x-data-grid"],
          agGrid: ["ag-grid-community", "ag-grid-react"],
          charts: ["chart.js", "react-chartjs-2"],
          pdf: ["jspdf", "jspdf-autotable", "@react-pdf/renderer", "html2pdf.js"],
          excel: ["exceljs", "file-saver"],
          forms: ["react-hook-form", "@hookform/resolvers", "zod"],
          query: ["@tanstack/react-query"],
          ui: [
            "@radix-ui/react-avatar",
            "@radix-ui/react-collapsible",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-label",
            "@radix-ui/react-popover",
            "@radix-ui/react-select",
            "@radix-ui/react-separator",
            "@radix-ui/react-slot",
            "@radix-ui/react-tooltip",
            "class-variance-authority",
            "clsx",
            "tailwind-merge",
            "tailwindcss-animate",
            "lucide-react",
          ],
          i18n: ["i18next", "i18next-browser-languagedetector", "i18next-http-backend", "react-i18next"],
          utils: ["axios", "date-fns", "to-words", "react-select", "react-datepicker", "react-day-picker", "react-hot-toast", "react-toastify", "zustand"],
        },
      },
    },
  },
});
