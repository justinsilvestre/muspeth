import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const persistStatePath = process.env.PERSIST_STATE_PATH;

export default defineConfig({
  // Worktrees symlink node_modules to the main checkout, so the default cache
  // inside node_modules would be shared and overwritten between dev servers.
  cacheDir: ".vite",
  plugins: [
    react(),
    tailwindcss(),
    cloudflare({ persistState: persistStatePath ? { path: persistStatePath } : true }),
  ],
});
