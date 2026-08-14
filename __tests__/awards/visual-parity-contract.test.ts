import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const page = readFileSync(join(root, "app/awards/page.tsx"), "utf8");
const stylesheet = readFileSync(join(root, "app/globals.css"), "utf8");
const list = readFileSync(join(root, "components/awards/awards-list.tsx"), "utf8");
const row = readFileSync(join(root, "components/awards/award-row.tsx"), "utf8");
const artwork = readFileSync(join(root, "components/awards/award-artwork.tsx"), "utf8");

describe("/awards Figma geometry contract", () => {
  it("uses the 1440x627 cover, recovered desktop badge size, and exact desktop columns", () => {
    expect(page).toContain("aspect-1440/627");
    expect(page).toContain("lg:w-[338px]");
    expect(page).toContain("xl:grid-cols-[178px_854px]");
    expect(page).toContain("xl:gap-[120px]");
  });

  it("crops the shared keyvisual to the middle/lower Figma band on desktop", () => {
    expect(stylesheet).toMatch(/background-position:\s*center,\s*center 63%/);
    expect(stylesheet).toMatch(/background-size:\s*100% 100%,\s*100% auto/);
  });

  it("pins the award-list width and restores the Figma row rhythm", () => {
    expect(list).toContain("xl:w-[854px]");
    expect(list).toContain("py-20");
    expect(row).toContain("lg:flex-row");
    expect(row).toContain("whitespace-pre-line");
  });

  it("clips the artwork glow to the rounded Figma card edge", () => {
    expect(artwork).toContain("rounded-2xl");
    expect(artwork).toContain("ring-1");
  });
});
