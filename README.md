# Vivek Patne | Portfolio

Personal developer portfolio of **Vivek Patne**, a Computer Science & Engineering (Data Science) student at RNS Institute of Technology, Bengaluru.

Built as a fast, terminal-inspired developer portfolio that goes beyond a static personal site — it aggregates and displays **real, live coding activity** across six platforms through a resilient server-side integration layer with persistent caching, graceful degradation, and a production email contact system.

**Live Site:** https://vivekpatne.me
**Source Code:** https://github.com/vivekmpatne/portfolio

---

## Overview

Most portfolios display static text. This one runs a small backend system: server-side adapters pull activity from six coding platforms, normalize it into a common format, merge it into a unified contribution heatmap, compute accurate streaks, and fall back to a persistent last-known-good cache when an upstream platform is temporarily unavailable — without ever showing a misleading zero.

Contact is handled through a real email pipeline on a verified custom domain rather than a `mailto:` link, and the rest of the site (profile, projects, skills, experience) is fully data-driven through a centralized `src/data/` layer, so routine content updates never require touching component code.

---

## Features

### 🖥️ Terminal-Inspired UI
- Custom terminal and phosphor-inspired visual design
- Interactive shell-style elements and command-based navigation
- Animated typewriter role display
- Responsive ASCII portrait generated from a real image
- Refined spacing, typography, and navigation after a full UI polish pass
- Smooth animations and enhanced accessibility
- Light and dark theme support
- Fully responsive across mobile, tablet, and desktop

### 📊 Six-Platform Consistency Dashboard
- Unified yearly contribution heatmap merging GitHub, LeetCode, Codeforces, CodeChef, GeeksforGeeks, and HackerRank
- Accurate current streak and longest streak computation
- Active days and total aggregated activity per year
- Per-platform status: fresh, cached, or unavailable
- Year selection with historical accuracy (a past year never shows a false "current" streak)
- No manual daily updates — everything is fetched and aggregated automatically

### 🔁 Resilient Reliability & Caching
- Persistent last-known-good (LKG) cache backed by Supabase
- A single platform outage never collapses the whole dashboard
- Legitimate zero activity is distinguished from an API/network failure
- Cache survives page reloads, browser restarts, worker restarts, and deployments

### ✉️ Production Contact Form
- Real contact form backed by the Resend email API — no email client dependency
- Server-side email sending, keeping the API key off the client entirely
- Sends from a verified custom domain (DKIM, SPF, MX, DMARC configured)
- Success and error states with toast notifications and a loading state while sending

### 🧩 Data-Driven Projects
- Centralized project configuration with description, tech stack, status, GitHub link, live link, screenshot, and featured flag
- Missing links or images degrade gracefully instead of rendering broken UI

### 🎯 Recruiter-Focused Sections
Hero, About, Engineering Consistency, Achievements, Live Coding Profiles, Technical Skills, Featured Projects, Experience, Contact

### 🔍 SEO
Semantic HTML, Open Graph metadata, Twitter card metadata, canonical URL support, structured website metadata

---

## Consistency Dashboard

| Platform | Integration | Resilience |
| --- | --- | --- |
| GitHub | Authenticated GraphQL API | LKG cache fallback |
| LeetCode | Public GraphQL/data access | LKG cache fallback |
| Codeforces | Public API | LKG cache fallback |
| CodeChef | HTML/page-structure dependent | LKG cache fallback, more fragile to upstream changes |
| GeeksforGeeks | Community stats proxy | LKG cache fallback, may lag |
| HackerRank | Public profile data | LKG cache fallback |

Activity from all six sources is normalized into a common date-based representation and merged into one heatmap and one set of streak/activity statistics. Not every platform exposes an official public API — where it doesn't, the integration relies on best-effort data access and is documented as such rather than overstated.

**Streak logic:**
- If today has activity, the current streak counts backward from today.
- If today has no activity yet but yesterday did, the streak stays alive and counts backward from yesterday (so the streak doesn't falsely reset to zero before today's first submission).
- If neither today nor yesterday has activity, the current streak is 0.
- All dates are normalized in UTC (`YYYY-MM-DD`) for consistency.
- Historical years never report a "current" streak.

---

## Reliability & Caching

```
Upstream fetch succeeds
        │
        ▼
  Return fresh data ──────► Upsert snapshot into
                             persistent LKG cache
                             (Supabase: activity_cache)

Upstream fetch fails
        │
        ▼
  Read last-known-good snapshot
    (key: platform + username + year)
        │
   ┌────┴────┐
   ▼         ▼
Snapshot   No snapshot
 exists      exists
   │            │
   ▼            ▼
Return      Mark only that
cached      platform as
data        unavailable
```

A temporary failure in one platform is isolated — it does not affect the other five. Cached values are clearly last-known-good, not claimed as live, and a fresh successful fetch naturally replaces the stored snapshot on the next request.

**Root cause of the earlier zero-activity bug:** a global Supabase auth middleware previously ran ahead of every public server function, including the six activity endpoints. Any browser-side Supabase session issue blocked those RPCs entirely, making all six sources appear unavailable — and in some cases render as 0 — even when valid cached data existed server-side. The fix removed that unnecessary global middleware, added the LKG cache fallback described above, and added a structural regression test (see Testing & Reliability) so it can't silently return.

---

## Architecture

```
Browser
  │
  ▼
Public TanStack Server Functions   (src/lib/activity.functions.ts)
  │  thin declarations, dynamically import
  │  server-only implementation
  ▼
Server Activity Orchestration      (src/lib/activity.server.ts)
  │
  ▼
Platform Adapters
  ├── GitHub
  ├── LeetCode
  ├── Codeforces
  ├── CodeChef
  ├── GeeksforGeeks
  └── HackerRank
  │
  ▼
Normalized ActivityResult          (src/lib/activity/types.ts)
  │
  ▼
Aggregation + Streak Engine        (src/lib/activity/streak.ts)
  │
  ▼
Persistent LKG Cache               (src/lib/activity/cache.server.ts → Supabase)
  │
  ▼
Consistency Dashboard (UI)
```

**Why server functions are kept thin:** TanStack server-function code splitting can extract a handler while dropping sibling helper declarations if logic lives directly in the function file. Splitting the thin public declaration (`activity.functions.ts`) from the server-only implementation (`activity.server.ts`) avoids this class of bug.

**Auth isolation for public activity functions:** the six activity server functions do not depend on browser Supabase authentication. `src/start.ts` intentionally does not globally register Supabase auth middleware (`functionMiddleware: []`), because a browser-side `supabase.auth.getSession()` call gating every public RPC previously meant that any browser Supabase session issue would make all six activity sources appear unavailable, even when valid cached data existed server-side. Public activity RPCs reach the server independently of browser auth state; only the cache read/write layer uses privileged, server-only Supabase access.

---

## Tech Stack

| Category | Technology |
| --- | --- |
| Framework | TanStack Start |
| Frontend | React 19 |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui + Radix UI |
| Data Fetching | TanStack Query |
| Server Logic | TanStack Server Functions |
| Persistent Cache | Supabase (`activity_cache` table) |
| Transactional Email | Resend (custom verified domain, DKIM/SPF/MX/DMARC) |
| Icons | Lucide React + React Icons |
| Hosting | Lovable Hosting |
| Package Runtime | Bun |

---

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/vivekmpatne/portfolio.git
cd portfolio
```

### 2. Install dependencies
```bash
bun install
```

### 3. Configure environment variables

Create a `.env` file in the project root:
```env
GITHUB_TOKEN=your_github_token
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_api_key
```

- `GITHUB_TOKEN` is used server-side for GitHub GraphQL requests.
- Supabase variables are used server-side for the persistent LKG cache.
- `RESEND_API_KEY` is used server-side to send contact form emails through the verified custom domain.
- LeetCode and Codeforces integrations do not require authentication.

> Never commit `.env` or real credentials to GitHub.

### 4. Start the development server
```bash
bun run dev
```

### 5. Run tests
```bash
bun test
```

### 6. Create a production build
```bash
bun run build
```

---

## Project Structure

```text
portfolio/
├── public/
│   ├── projects/                  # Project screenshots
│   └── ...
│
├── src/
│   ├── routes/
│   │   ├── __root.tsx             # Root layout, SEO, theme bootstrap
│   │   └── index.tsx              # Main portfolio route
│   │
│   ├── components/
│   │   ├── portfolio/             # Hero, Consistency, Achievements, Skills, Projects, Contact, etc.
│   │   └── ui/                    # shadcn/ui primitives
│   │
│   ├── lib/
│   │   ├── activity.functions.ts  # Thin public server-function declarations
│   │   ├── activity.server.ts     # Server-only fetch/orchestration logic
│   │   ├── activity/
│   │   │   ├── types.ts           # Shared activity/platform types
│   │   │   ├── streak.ts          # Pure streak/aggregation computation
│   │   │   └── cache.server.ts    # Persistent LKG cache read/write
│   │   └── activity-schemas.ts    # Validation schemas
│   │
│   ├── data/
│   │   ├── profile.ts             # Profile, coding platform usernames, resume config
│   │   ├── projects.ts            # Project configuration
│   │   ├── skills.ts              # Technical skills
│   │   ├── experience.ts          # Experience timeline
│   │   └── links.ts               # External/social links
│   │
│   ├── hooks/
│   ├── start.ts                   # TanStack Start configuration
│   ├── start.test.ts              # Structural regression guards
│   └── styles.css
│
├── .env                            # Local secrets, never committed
├── .gitignore
├── package.json
└── README.md
```

---

## Configuration / Customization

Most editable content lives in `src/data/` — routine updates should not require touching component logic.

| To change... | Edit |
| --- | --- |
| Profile, bio, coding usernames, resume link | `src/data/profile.ts` |
| Projects | `src/data/projects.ts` |
| Skills | `src/data/skills.ts` |
| Experience/education | `src/data/experience.ts` |
| Social/external links | `src/data/links.ts` |

Project screenshots go in `public/projects/` and are referenced as `/projects/filename.png`. When a project has no repository, live deployment, or screenshot, the corresponding field is set to `null` rather than a fake link — the UI hides that element instead of rendering a broken one.

**Current projects:**
1. **DSA Tracker** — full-stack MERN consistency tracker, live/deployed, with a project screenshot
2. **ChefKart** — full-stack food-delivery platform, in progress, with role-based dashboards for user/chef/admin
3. **Samsung SIC Capstone** — IoT-oriented capstone project (Raspberry Pi, sensors)

---

## Adding Another Activity Platform

The activity architecture is designed so a seventh platform can be added with limited, well-scoped work — not zero code changes:

1. Add the username/profile configuration to `profile.ts`.
2. Add a platform ID/label/type.
3. Add a validation schema if needed (`activity-schemas.ts`).
4. Implement a platform fetch adapter that returns data in the normalized `ActivityResult` shape.
5. Expose it through a thin server function reusing the existing LKG cache strategy.
6. Add platform display metadata to the dashboard.

Caching, aggregation, streak computation, and heatmap merging are shared infrastructure and do not need to be reimplemented per platform.

---

## Testing & Reliability

`src/start.test.ts` contains automated regression tests, currently **14/14 passing**, covering:

- Streak computed correctly when today has activity
- Streak grace period when today is inactive but yesterday is active
- Current streak = 0 when both today and yesterday are inactive
- Month/year boundary handling
- UTC date normalization
- Multi-platform activity merging with no double counting
- Historical years never reporting a false "current" streak
- A structural guard preventing accidental global registration of Supabase auth middleware, since public activity functions do not require it

This covers the activity/streak/caching subsystem specifically, not full application test coverage.

---

## Known Integration Limitations

- GitHub requires a server-side `GITHUB_TOKEN` for authenticated GraphQL access.
- CodeChef data extraction depends on page structure and can be fragile if the site changes.
- GeeksforGeeks depends on a community stats proxy and may lag or become temporarily unavailable.
- HackerRank activity depends on available public profile data.
- LinkedIn is not part of the six-platform automated consistency aggregation; any LinkedIn stats shown elsewhere on the site are manually maintained, not live.
- The persistent cache reduces the impact of temporary upstream failures but does not make a genuinely unavailable source permanently live.

---

## Security

- `GITHUB_TOKEN`, Supabase service-role credentials, and the `RESEND_API_KEY` are server-side only and never exposed to client code.
- Public activity server functions do not require browser Supabase authentication to execute.
- `.env` is gitignored and never committed.
- Privileged cache read/write and email-sending operations are isolated to server-only modules.

Before pushing changes, secrets can be checked with:
```bash
git grep -n -E "ghp_|github_pat_|SUPABASE_SERVICE_ROLE|PRIVATE_KEY|re_[a-zA-Z0-9]"
```

---

## Project Status

**Production Ready**

- Responsive, polished UI with refined spacing, typography, and navigation
- Multi-platform coding activity dashboard with stable caching
- Reliable server functions with structural regression protection
- Professional email contact form on a verified custom domain
- Deployed and live at vivekpatne.me

---

## Contact

**Vivek Patne**
Computer Science & Engineering (Data Science)
RNS Institute of Technology, Bengaluru

- Email: vivekpatnem@gmail.com
- LinkedIn: linkedin.com/in/vivekpatnem
- GitHub: github.com/vivekmpatne
- LeetCode: leetcode.com/u/vivekpatnem
- Codeforces: codeforces.com/profile/vivekpatnem

Or use the contact form on the site directly — messages are delivered via a verified custom domain.

---

## License

MIT © Vivek Patne
