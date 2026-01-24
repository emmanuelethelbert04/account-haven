import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Ensure runtime secrets provided by the platform are available to the client build.
  // We only expose the public Supabase URL + anon key (safe to ship to browsers).
  define: (() => {
    // NOTE: Vite's `loadEnv` reads from `.env*` files. In this environment, secrets are
    // provided as real OS env vars, so we must also read from `process.env`.
    const fileEnv = loadEnv(mode, process.cwd(), "");

    const read = (key: string) => process.env[key] || fileEnv[key] || "";

    const supabaseUrl = read("VITE_SUPABASE_URL") || read("SUPABASE_URL");
    const supabaseAnonKey = read("VITE_SUPABASE_ANON_KEY") || read("SUPABASE_ANON_KEY");

    return {
      __SUPABASE_URL__: JSON.stringify(supabaseUrl),
      __SUPABASE_ANON_KEY__: JSON.stringify(supabaseAnonKey),
    };
  })(),
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
