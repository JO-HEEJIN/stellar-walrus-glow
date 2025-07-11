import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";

export default defineConfig(() => ({
  build: {
    rollupOptions: {
      cache: false // 캐시 비활성화
    }
  },
  plugins: [dyadComponentTagger(), react()],
}));