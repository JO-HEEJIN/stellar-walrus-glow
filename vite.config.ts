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
    exclude: ['aws-amplify', '@aws-amplify/utils'], // Keep main amplify and utils excluded
    include: ['crc-32', '@aws-amplify/auth'], // Explicitly include crc-32 and @aws-amplify/auth for pre-bundling
  },
}));