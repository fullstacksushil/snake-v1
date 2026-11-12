import { describe, expect, it } from "vitest";
import { buildSettings } from "./index";

describe("buildSettings", () => {
  it("builds the server app at / when no base path is set", () => {
    expect(buildSettings(undefined)).toEqual({ basePath: "/", ssr: true });
  });

  it("treats an empty base path or / as no base path", () => {
    expect(buildSettings("")).toEqual({ basePath: "/", ssr: true });
    expect(buildSettings("/")).toEqual({ basePath: "/", ssr: true });
  });

  it("builds a static site under the base path when one is set", () => {
    expect(buildSettings("/snake-v1/")).toEqual({ basePath: "/snake-v1/", ssr: false });
  });

  it("adds the missing slashes around the base path", () => {
    for (const value of ["snake-v1", "/snake-v1", "snake-v1/", "//snake-v1//"]) {
      expect(buildSettings(value).basePath, value).toBe("/snake-v1/");
    }
  });

  it("keeps a nested base path", () => {
    expect(buildSettings("games/snake").basePath).toBe("/games/snake/");
  });
});
