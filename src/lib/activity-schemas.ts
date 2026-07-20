// Shared validation schemas for activity server functions.
// Kept in a separate module because createServerFn's code-splitter drops
// sibling module-scope declarations in the production bundle — imports survive.
import { z } from "zod";

export const ALLOWED_USERNAMES = {
  github: new Set(["vivekmpatne"]),
  leetcode: new Set(["vivekpatnem"]),
  codeforces: new Set(["vivekpatnem"]),
  codechef: new Set(["vivekpatnem"]),
  hackerrank: new Set(["vivekpatnem"]),
  gfg: new Set(["vivekpcom8"]),
} as const;

const makeSchema = (allowed: ReadonlySet<string>) =>
  z.object({
    username: z.string().min(1).max(64).refine((u) => allowed.has(u), {
      message: "Username not allowed",
    }),
    year: z.number().int().min(2010).max(2100),
  });

export const githubInput = makeSchema(ALLOWED_USERNAMES.github);
export const leetcodeInput = makeSchema(ALLOWED_USERNAMES.leetcode);
export const codeforcesInput = makeSchema(ALLOWED_USERNAMES.codeforces);
export const codechefInput = makeSchema(ALLOWED_USERNAMES.codechef);
export const hackerrankInput = makeSchema(ALLOWED_USERNAMES.hackerrank);
export const gfgInput = makeSchema(ALLOWED_USERNAMES.gfg);
