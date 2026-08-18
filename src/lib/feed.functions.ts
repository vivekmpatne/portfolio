// Server function declarations only — helpers live in ./feed.server.ts
// (TanStack's serverfn code-splitter drops sibling module-scope declarations).
import { createServerFn } from "@tanstack/react-start";
import { feedInput } from "./feed-schemas";

export type { FeedEvent } from "./feed.server";

export const getActivityFeed = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => feedInput.parse(data))
  .handler(async ({ data }) => {
    const { buildFeed } = await import("./feed.server");
    return buildFeed(data);
  });
