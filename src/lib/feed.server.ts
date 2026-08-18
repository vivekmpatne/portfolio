// Server-only helpers for feed.functions.ts (live system activity log).
// Only three platforms expose a public per-event API: GitHub, LeetCode,
// Codeforces. The rest get an explicit "API not publicly available" note.

export type FeedEvent = {
  platform: string;      // display label
  ts: string;            // ISO timestamp (UTC)
  text: string;          // human-readable line
  note?: boolean;        // true => informational placeholder, not real activity
};

const UA = "Mozilla/5.0 (compatible; lovable-portfolio/1.0)";

async function githubEvents(username: string): Promise<FeedEvent[]> {
  const token = process.env["GITHUB_TOKEN"];
  const res = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=30`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "lovable-portfolio",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  );
  if (!res.ok) throw new Error("github");
  const json: any = await res.json();
  if (!Array.isArray(json)) throw new Error("github");

  const out: FeedEvent[] = [];
  for (const e of json) {
    const repo = e?.repo?.name ?? "repository";
    let text: string | null = null;
    switch (e?.type) {
      case "PushEvent": {
        const n = e?.payload?.commits?.length ?? e?.payload?.size ?? 1;
        text = `pushed ${n} commit${n === 1 ? "" : "s"} to ${repo}`;
        break;
      }
      case "CreateEvent":
        text = `created ${e?.payload?.ref_type ?? "ref"} in ${repo}`;
        break;
      case "PullRequestEvent":
        text = `${e?.payload?.action ?? "updated"} pull request in ${repo}`;
        break;
      case "IssuesEvent":
        text = `${e?.payload?.action ?? "updated"} issue in ${repo}`;
        break;
      case "IssueCommentEvent":
        text = `commented on issue in ${repo}`;
        break;
      case "WatchEvent":
        text = `starred ${repo}`;
        break;
      case "ForkEvent":
        text = `forked ${repo}`;
        break;
      case "ReleaseEvent":
        text = `published a release in ${repo}`;
        break;
      default:
        text = null;
    }
    if (text && e?.created_at) {
      out.push({ platform: "GitHub", ts: new Date(e.created_at).toISOString(), text });
    }
  }
  return out.slice(0, 20);
}

async function leetcodeEvents(username: string): Promise<FeedEvent[]> {
  const query = `
    query recentAc($username: String!, $limit: Int!) {
      recentAcSubmissionList(username: $username, limit: $limit) {
        title
        timestamp
      }
    }`;
  const res = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": UA,
      Referer: `https://leetcode.com/u/${username}/`,
    },
    body: JSON.stringify({ query, variables: { username, limit: 20 } }),
  });
  if (!res.ok) throw new Error("leetcode");
  const json: any = await res.json();
  const list = json?.data?.recentAcSubmissionList;
  if (!Array.isArray(list)) throw new Error("leetcode");
  return list.map((s: any) => ({
    platform: "LeetCode",
    ts: new Date(Number(s.timestamp) * 1000).toISOString(),
    text: `solved "${s.title}"`,
  }));
}

async function codeforcesEvents(handle: string): Promise<FeedEvent[]> {
  const res = await fetch(
    `https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=30`,
    { headers: { "User-Agent": UA } },
  );
  if (!res.ok) throw new Error("codeforces");
  const json: any = await res.json();
  if (json?.status !== "OK" || !Array.isArray(json.result)) throw new Error("codeforces");
  return json.result.slice(0, 20).map((s: any) => {
    const name = s?.problem?.name ?? "problem";
    const idx = `${s?.problem?.contestId ?? ""}${s?.problem?.index ?? ""}`;
    const ok = s?.verdict === "OK";
    return {
      platform: "Codeforces",
      ts: new Date(Number(s.creationTimeSeconds) * 1000).toISOString(),
      text: ok
        ? `solved ${idx} — ${name}`
        : `submitted ${idx} — ${name} (${String(s?.verdict ?? "pending").toLowerCase()})`,
    } as FeedEvent;
  });
}

const UNSUPPORTED = ["CodeChef", "HackerRank", "GeeksforGeeks", "TUF+"];

export async function buildFeed(handles: {
  github: string;
  leetcode: string;
  codeforces: string;
}): Promise<{ events: FeedEvent[]; generatedAt: string }> {
  const settled = await Promise.allSettled([
    githubEvents(handles.github),
    leetcodeEvents(handles.leetcode),
    codeforcesEvents(handles.codeforces),
  ]);

  const labels = ["GitHub", "LeetCode", "Codeforces"];
  const events: FeedEvent[] = [];
  settled.forEach((r, i) => {
    if (r.status === "fulfilled") events.push(...r.value);
    else
      events.push({
        platform: labels[i],
        ts: new Date().toISOString(),
        text: "feed temporarily unavailable",
        note: true,
      });
  });

  events.sort((a, b) => b.ts.localeCompare(a.ts));

  const notes: FeedEvent[] = UNSUPPORTED.map((p) => ({
    platform: p,
    ts: new Date().toISOString(),
    text: "API not publicly available",
    note: true,
  }));

  return {
    events: [...events.slice(0, 40), ...notes],
    generatedAt: new Date().toISOString(),
  };
}
