import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const stylesheet = readFileSync(join(projectRoot, "app/globals.css"), "utf8");
const artwork = readFileSync(
  join(projectRoot, "public/images/login/hero-background.webp"),
);

describe("login background artwork", () => {
  it("uses the clean Figma export instead of the patched bitmap", () => {
    expect(stylesheet).toContain('url("/images/login/hero-background.webp")');
    expect(stylesheet).not.toContain('url("/images/login/hero-artwork.webp")');
  });

  it("keeps the Figma scrims as scalable CSS layers", () => {
    expect(stylesheet).toContain(
      "linear-gradient(90deg, #00101a 0%, #00101a 25.41%, rgba(0, 16, 26, 0) 100%)",
    );
    expect(stylesheet).toContain(
      "linear-gradient(0deg, #00101a 22.48%, rgba(0, 19, 32, 0) 51.74%)",
    );
  });

  it("guards the approved lossless artwork against accidental destructive edits", () => {
    const digest = createHash("sha256").update(artwork).digest("hex");

    expect(digest).toBe(
      "41ac5bf1089ae102bdc809174eff5a6448b0639ec9433e45a4a9308540d42df3",
    );
  });
});
