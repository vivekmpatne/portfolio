// Persistent last-known-good cache for platform activity.
// Server-only: reads/writes through the Supabase service-role client.
//
// Rules (see activity.functions.ts for the wrapper that enforces them):
//   • A failed upstream fetch NEVER overwrites cache.
//   • A successful fetch always upserts a fresh snapshot (including legitimate zeros).
//   • Concurrent writers use `updated_at` monotonic guard on upsert.

import type { DayMap, ActivityMeta, PlatformId } from "./types";

export type CachedSnapshot = {
  calendar: DayMap;
  meta: ActivityMeta;
  fetchedAt: string; // ISO timestamp when upstream last succeeded
};

export type CacheKey = { platform: PlatformId; username: string; year: number };

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  // Table isn't in the generated types yet (migration just added it).
  // Cast to `any` narrowly here so we don't touch auto-generated files.
  return supabaseAdmin as unknown as {
    from: (t: string) => {
      select: (c: string) => {
        eq: (
          c: string,
          v: unknown,
        ) => {
          eq: (
            c: string,
            v: unknown,
          ) => {
            eq: (
              c: string,
              v: unknown,
            ) => {
              maybeSingle: () => Promise<{
                data: {
                  calendar: DayMap;
                  meta: ActivityMeta;
                  fetched_at: string;
                } | null;
                error: unknown;
              }>;
            };
          };
        };
      };
      upsert: (
        row: Record<string, unknown>,
        opts?: { onConflict?: string },
      ) => Promise<{ error: unknown }>;
    };
  };
}

export async function readSnapshot(
  key: CacheKey,
): Promise<CachedSnapshot | null> {
  try {
    const db = await admin();
    const { data, error } = await db
      .from("activity_cache")
      .select("calendar, meta, fetched_at")
      .eq("platform", key.platform)
      .eq("username", key.username)
      .eq("year", key.year)
      .maybeSingle();
    if (error || !data) return null;
    return {
      calendar: data.calendar ?? {},
      meta: data.meta ?? {},
      fetchedAt: data.fetched_at,
    };
  } catch (e) {
    console.warn("[activity-cache] read failed", key, e);
    return null;
  }
}

export async function writeSnapshot(
  key: CacheKey,
  snapshot: Omit<CachedSnapshot, "fetchedAt"> & { fetchedAt?: string },
): Promise<void> {
  try {
    const db = await admin();
    const fetchedAt = snapshot.fetchedAt ?? new Date().toISOString();
    const { error } = await db.from("activity_cache").upsert(
      {
        platform: key.platform,
        username: key.username,
        year: key.year,
        calendar: snapshot.calendar,
        meta: snapshot.meta,
        fetched_at: fetchedAt,
      },
      { onConflict: "platform,username,year" },
    );
    if (error) console.warn("[activity-cache] write failed", key, error);
  } catch (e) {
    console.warn("[activity-cache] write threw", key, e);
  }
}
