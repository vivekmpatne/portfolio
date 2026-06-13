# Vivek Patne — Portfolio

Personal portfolio of **Vivek Patne**, a 3rd-year Computer Science & Engineering (Data Science) student at RNS Institute of Technology, Bengaluru. Built as a modern, fast, recruiter-friendly site that surfaces **live coding activity** from GitHub, LeetCode, and Codeforces alongside featured projects.

🔗 Live: https://vivekpatne.me
🐙 Source Code: https://github.com/vivekmpatne/portfolio

---

## ✨ Features

- **Live GitHub stats** — repos, followers, following, and a real contribution heatmap via the GitHub GraphQL API.
- **Live LeetCode stats** — contest rating, total solved, Easy / Medium / Hard breakdown via LeetCode's public GraphQL.
- **Live Codeforces stats** — rating, rank, and per-day submissions via the Codeforces REST API (with retry + backoff).
- **Consistency dashboard** — unified contribution heatmap merging all three platforms with per-source tooltips.
- **Dark mode by default** with pre-hydration bootstrap (no flash) and `localStorage` persistence.
- **SEO-ready** — semantic HTML, full Open Graph + Twitter card metadata, canonical URLs.
- **Resilient** — APIs that fail show "Unavailable" instead of misleading zeros; broken/missing links are hidden instead of rendered.
- **Responsive** — works cleanly from 360px mobile up to wide desktop.

---

## 🛠 Tech Stack

- **Framework:** [TanStack Start](https://tanstack.com/start) (React 19, SSR) on Vite 7
- **Styling:** Tailwind CSS v4 (via `@import` + theme tokens in `src/styles.css`)
- **UI primitives:** shadcn/ui + Radix UI
- **Data fetching:** TanStack Query + TanStack Server Functions
- **Icons:** lucide-react, react-icons
- **Runtime:** Cloudflare Workers (edge) via Lovable Cloud
- **Language:** TypeScript (strict)

---

## 🚀 Getting Started

```bash
# Install
bun install

# Dev server
bun run dev

# Production build
bun run build
```

The app expects a `GITHUB_TOKEN` (scope: `read:user`) for the GitHub GraphQL integration:

```bash
# .env
GITHUB_TOKEN=ghp_xxx
```

LeetCode and Codeforces APIs require no authentication.

---

## 📁 Project Structure

```
src/
├── routes/              # File-based routing (TanStack Router)
│   ├── __root.tsx       # Root layout, SEO metadata, theme bootstrap
│   └── index.tsx        # Home page
├── components/portfolio/ # Hero, About, Skills, Projects, Consistency, LiveStats, Contact, ...
├── components/ui/       # shadcn/ui primitives
├── lib/
│   └── activity.functions.ts  # Server functions: GitHub / LeetCode / Codeforces
├── data/
│   ├── profile.ts       # Name, bio, handles, coding profiles (single source of truth)
│   ├── projects.ts      # Project list
│   ├── skills.ts        # Skills
│   ├── experience.ts    # Experience timeline
│   └── links.ts         # External links
├── hooks/               # Reusable hooks (e.g. useResumeAvailable)
└── styles.css           # Tailwind v4 + design tokens
```

---

## ✏️ Customising

Most content lives in `src/data/`:

- **Profile / handles** → `src/data/profile.ts` (`profile.codingProfiles.github.username` is the single source of truth for GitHub URLs)
- **Projects** → `src/data/projects.ts` (set `githubUrl` / `liveUrl` to `null` to hide that button)
- **Skills** → `src/data/skills.ts`
- **Experience** → `src/data/experience.ts`
- **Resume** → drop `resume.pdf` into `public/`; the Resume button appears automatically.

---

## 📡 Live Integrations — How They Work

All third-party calls run server-side via TanStack `createServerFn` to avoid CORS and to keep `GITHUB_TOKEN` out of the bundle.

| Source     | Endpoint                                     | Auth      | Cached |
|------------|----------------------------------------------|-----------|--------|
| GitHub     | `https://api.github.com/graphql`             | Token     | 10 min |
| LeetCode   | `https://leetcode.com/graphql` (public)      | None      | 10 min |
| Codeforces | `https://codeforces.com/api/*` (with retry)  | None      | 10 min |

Failures degrade gracefully:
1. Loading skeleton
2. Last successful cached value (TanStack Query `staleTime`)
3. "Unavailable" — never an incorrect `0`

---

## 📫 Contact

- **Email:** vivekpatnem@gmail.com
- **LinkedIn:** https://www.linkedin.com/in/vivekpatnem/
- **LeetCode:** https://leetcode.com/u/vivekpatnem
- **Codeforces:** https://codeforces.com/profile/vivekpatnem

---

## 📄 License

MIT © Vivek Patne
