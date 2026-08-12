import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("local Supabase OAuth configuration", () => {
  it("allow-lists the exact application callback URLs", () => {
    const config = readFileSync(join(process.cwd(), "supabase/config.toml"), "utf8");

    expect(config).toContain('"http://localhost:3000/auth/callback"');
    expect(config).toContain('"http://127.0.0.1:3000/auth/callback"');
  });
});
