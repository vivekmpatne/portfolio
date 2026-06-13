# Vivek Patne — Personal Portfolio

A clean, minimal, data-driven personal portfolio website. All content lives in
plain TypeScript files under `src/data/` so updating projects, skills, or
experience is a one-file edit — no component changes required.

**Live demo:** _// TODO: add Vercel link after deploy_

## Tech Stack

- React 19 + TypeScript
- TanStack Start / TanStack Router (file-based routing)
- Tailwind CSS v4
- Shadcn/UI primitives
- Lucide React icons
- Vite 7

## Run Locally

```bash
git clone https://github.com/vivekpatnem/portfolio.git
cd portfolio
npm install   # or bun install
npm run dev
```

Open http://localhost:5173 (or the port Vite prints).

## How to Update Content

All editable content lives in **`src/data/`**. You never need to touch component
code to update what's on the site.

| File | What it controls |
| --- | --- |
| `src/data/profile.ts` | Name, tagline, bio, location, email, phone, stats, resume URL |
| `src/data/links.ts` | All social + coding-profile URLs (GitHub, LinkedIn, LeetCode, etc.) |
| `src/data/skills.ts` | Skills grouped by category (chip clusters) |
| `src/data/projects.ts` | Project cards — add/remove projects here |
| `src/data/experience.ts` | Education & experience timeline entries |

### Add a new project

Open `src/data/projects.ts` and append a new object to the `projects` array:

```ts
{
  title: "My New Project",
  description: "Short pitch of what it does and why it matters.",
  techStack: ["React", "Node.js", "Postgres"],
  githubUrl: "https://github.com/you/repo",  // or null
  liveUrl: "https://example.com",            // or null
  status: "live",                            // "live" | "in-progress" | "planned"
  featured: true,
}
```

That's it — the Projects section re-renders automatically.

### Add a timeline entry

Open `src/data/experience.ts` and append to `timeline`. `type` can be
`"education"`, `"experience"`, or `"achievement"`.

### Replace placeholders

Search the repo for `TODO:` — every placeholder (real email, repo URLs, resume
PDF, stats, etc.) is marked with a comment so they're easy to find.

Drop `resume.pdf` into `/public` to wire up the Resume button.

## Deploy

Any static-friendly host works (Vercel, Netlify, Cloudflare Pages). Build with
`npm run build` and serve the output.
