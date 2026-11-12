// How the app is built. Read by vite.config.ts and react-router.config.ts.
//
// With no base path the app builds as before: server-rendered, served at `/`
// by `npm run start` and the Docker image. With a base path it builds as a
// static site under that path (the Pages build), because GitHub Pages serves
// files only and hosts a project site at `/<repo>/`.

export type BuildSettings = {
  /** The URL path the app is served under. Starts and ends with `/`. */
  basePath: string;
  /** Whether the build includes a server that renders each request. */
  ssr: boolean;
};

/**
 * Turns the `BASE_PATH` environment variable into build settings. `snake-v1`,
 * `/snake-v1` and `/snake-v1/` all mean the same path. Unset, empty or `/`
 * means the server build at `/`.
 */
export function buildSettings(basePathVariable: string | undefined): BuildSettings {
  const parts = (basePathVariable ?? "").split("/").filter((part) => part !== "");
  if (parts.length === 0) return { basePath: "/", ssr: true };
  return { basePath: `/${parts.join("/")}/`, ssr: false };
}
