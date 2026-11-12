import { describe, expect, it } from "vitest";
import { links } from "./root";

describe("root links", () => {
  it("links the favicon under the base path, not the domain root", () => {
    const icon = links().find((link) => "rel" in link && link.rel === "icon");
    expect(icon).toMatchObject({ href: `${import.meta.env.BASE_URL}favicon.ico` });
  });
});
