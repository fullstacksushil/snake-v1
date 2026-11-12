import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// The README drifted from the project once (issue #9). These checks catch the
// mechanical part of that drift: commands and files that no longer exist.
const root = import.meta.dirname;
const readme = readFileSync(join(root, "README.md"), "utf8");
const scripts: Record<string, string> = JSON.parse(
  readFileSync(join(root, "package.json"), "utf8"),
).scripts;
const cited = [...readme.matchAll(/npm run ([\w:-]+)/g)].map((m) => m[1]);

describe("README", () => {
  it("cites only npm scripts that package.json defines", () => {
    expect(cited.length).toBeGreaterThan(0);
    for (const name of cited) expect(scripts, name).toHaveProperty(name);
  });

  it("documents every npm script a contributor runs", () => {
    const internal = new Set(["prepare"]);
    for (const name of Object.keys(scripts).filter((s) => !internal.has(s))) {
      expect(cited, name).toContain(name);
    }
  });

  it("links only to files that exist", () => {
    const links = [...readme.matchAll(/\]\(([^)#:]+)\)/g)].map((m) => m[1]);
    expect(links.length).toBeGreaterThan(0);
    for (const path of links) expect(existsSync(join(root, path)), path).toBe(true);
  });

  it("lists only app files that exist", () => {
    const layout = readme.match(/```text\n(app\/[\s\S]*?)```/)?.[1] ?? "";
    expect(layout).not.toBe("");
    const paths: string[] = [];
    const dirs: string[] = [];
    for (const line of layout.split("\n")) {
      const match = line.match(/^([│ ]*)(?:├── |└── )?([^\s#]+)/);
      if (!match) continue;
      const depth = match[1].length / 4 + (line.includes("── ") ? 1 : 0);
      dirs.length = depth;
      const path = [...dirs, match[2]].join("");
      paths.push(path);
      if (match[2].endsWith("/")) dirs[depth] = match[2];
    }
    for (const path of paths) expect(existsSync(join(root, path)), path).toBe(true);
  });
});
