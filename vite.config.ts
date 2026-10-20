import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const persistStatePath = process.env.PERSIST_STATE_PATH;

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    cloudflare({ persistState: persistStatePath ? { path: persistStatePath } : true }),
  ],
});
