// Structural regression guard.
//
// History: `attachSupabaseAuth` was re-added to global `functionMiddleware`
// multiple times (via integration regeneration and manual edits). Each time
// it broke the six public activity server functions on real browser reloads,
// because the browser Supabase client throws when `VITE_SUPABASE_*` is not
// baked into the client bundle, and `.client()` middleware runs before the
// RPC leaves the browser.
//
// This test fails the build if:
//   1. `src/start.ts` imports `attachSupabaseAuth`, OR
//   2. `src/start.ts` registers any middleware in `functionMiddleware` while
//      no server function in the project uses `requireSupabaseAuth`.
//
// If a future feature genuinely needs authenticated server functions, use
// `requireSupabaseAuth` on those specific functions — this test will then
// allow (but not require) a global attacher to be registered.

import { describe, it, expect } from "bun:test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}

const startSrc = readFileSync("src/start.ts", "utf8");
const allSrc = walk("src");

const usesRequireAuth = allSrc.some((f) => {
  if (f.endsWith("start.ts") || f.endsWith("start.test.ts")) return false;
  if (f.includes("/integrations/supabase/")) return false;
  return /requireSupabaseAuth/.test(readFileSync(f, "utf8"));
});

describe("src/start.ts middleware guard", () => {
  it("does not import attachSupabaseAuth", () => {
    expect(startSrc).not.toMatch(/attachSupabaseAuth/);
  });

  it("does not register global functionMiddleware unless a server fn requires auth", () => {
    if (usesRequireAuth) return; // allowed once real protected fns exist
    // Must be exactly an empty array in the createStart config.
    expect(startSrc).toMatch(/functionMiddleware:\s*\[\s*\]/);
  });
});
