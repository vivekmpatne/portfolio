// Server function declarations only. All fetch/cache helpers live in
// ./activity.server.ts because TanStack's serverfn code-splitter drops
// sibling declarations from extracted handler chunks (see
// `tanstack-serverfn-splitting`).
import { createServerFn } from "@tanstack/react-start";
import {
  githubInput,
  leetcodeInput,
  codeforcesInput,
  codechefInput,
  hackerrankInput,
  gfgInput,
} from "./activity-schemas";

export type { ActivityResult } from "./activity/types";

export const getGithubActivity = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => githubInput.parse(data))
  .handler(async ({ data }) => {
    const { withCache, fetchGithub } = await import("./activity.server");
    return withCache("github", data.username, data.year, () =>
      fetchGithub(data.username, data.year),
    );
  });

export const getLeetcodeActivity = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => leetcodeInput.parse(data))
  .handler(async ({ data }) => {
    const { withCache, fetchLeetcode } = await import("./activity.server");
    return withCache("leetcode", data.username, data.year, () =>
      fetchLeetcode(data.username, data.year),
    );
  });

export const getCodeforcesActivity = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => codeforcesInput.parse(data))
  .handler(async ({ data }) => {
    const { withCache, fetchCodeforces } = await import("./activity.server");
    return withCache("codeforces", data.username, data.year, () =>
      fetchCodeforces(data.username, data.year),
    );
  });

export const getCodechefActivity = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => codechefInput.parse(data))
  .handler(async ({ data }) => {
    const { withCache, fetchCodechef } = await import("./activity.server");
    return withCache("codechef", data.username, data.year, () =>
      fetchCodechef(data.username, data.year),
    );
  });

export const getHackerrankActivity = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => hackerrankInput.parse(data))
  .handler(async ({ data }) => {
    const { withCache, fetchHackerrank } = await import("./activity.server");
    return withCache("hackerrank", data.username, data.year, () =>
      fetchHackerrank(data.username, data.year),
    );
  });

export const getGfgActivity = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => gfgInput.parse(data))
  .handler(async ({ data }) => {
    const { withCache, fetchGfg } = await import("./activity.server");
    return withCache("gfg", data.username, data.year, () =>
      fetchGfg(data.username, data.year),
    );
  });
