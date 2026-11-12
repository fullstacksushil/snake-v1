import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { buildSettings } from "./app/modules/build/index.ts";

export default defineConfig({
  base: buildSettings(process.env.BASE_PATH).basePath,
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
});
