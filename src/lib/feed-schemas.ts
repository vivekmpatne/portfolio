// Validation schema for the live activity feed server function.
import { z } from "zod";
import { ALLOWED_USERNAMES } from "./activity-schemas";

const allowed = (set: ReadonlySet<string>) =>
  z.string().min(1).max(64).refine((u) => set.has(u), { message: "Username not allowed" });

export const feedInput = z.object({
  github: allowed(ALLOWED_USERNAMES.github),
  leetcode: allowed(ALLOWED_USERNAMES.leetcode),
  codeforces: allowed(ALLOWED_USERNAMES.codeforces),
});
