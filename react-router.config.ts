import type { Config } from "@react-router/dev/config";
import { buildSettings } from "./app/modules/build/index.ts";

// BASE_PATH unset: server-rendered at `/`. BASE_PATH set: the static Pages build.
const { basePath, ssr } = buildSettings(process.env.BASE_PATH);

export default {
  ssr,
  basename: basePath,
} satisfies Config;
