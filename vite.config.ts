import { defineConfig } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [dyadComponentTagger(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    // Remove aws-amplify from exclude, and explicitly include it along with @aws-amplify/auth
    exclude: ['@aws-amplify/utils'], // Keep utils excluded if it's not causing issues
    include: ['crc-32', 'aws-amplify', '@aws-amplify/auth'], // Explicitly include both
  },
}));