# Vivek Patne | Developer Portfolio

Personal developer portfolio of **Vivek Patne**, a Computer Science & Engineering (Data Science) student at RNS Institute of Technology, Bengaluru, graduating in 2028.

Built as a fast, terminal-inspired developer portfolio showcasing my **software engineering journey, projects, technical skills, and live coding activity** across multiple competitive programming and development platforms.

## Live Portfolio

**Live Website:** https://vivekpatne.me

**Source Code:** https://github.com/vivekmpatne/portfolio

---

## Features

### Terminal-Inspired Developer UI

- Custom terminal and phosphor-inspired visual design
- Interactive shell-style elements and command-based navigation
- Animated typewriter role display
- Responsive ASCII portrait generated from a real image
- Light and dark theme support
- Fully responsive layout across mobile, tablet, and desktop

### Live Coding Profiles

The portfolio dynamically retrieves coding statistics instead of relying entirely on manually maintained values.

- **GitHub**
  - Public repositories
  - Followers and following
  - Contribution activity
  - Contribution calendar data

- **LeetCode**
  - Contest rating
  - Total problems solved
  - Easy / Medium / Hard breakdown
  - Coding activity

- **Codeforces**
  - Current rating
  - Maximum rating
  - Rank
  - Submission activity

### Engineering Consistency Dashboard

A unified activity dashboard aggregates coding activity across:

- GitHub
- LeetCode
- Codeforces
- CodeChef
- GeeksforGeeks
- HackerRank

The dashboard includes:

- Unified yearly contribution heatmap
- Current activity streak
- Longest streak
- Active days
- Total engineering activity
- Platform-wise contribution counts
- Year-based activity view

This provides a broader view of engineering consistency instead of measuring activity from a single platform.

### Projects

Projects are managed through a centralized data configuration.

Each project can include:

- Description
- Technology stack
- Development status
- GitHub repository
- Live deployment
- Project screenshot
- Featured project status

Missing repository, deployment, or image links are handled gracefully instead of rendering broken UI.

### Recruiter-Focused Sections

- Hero / introduction
- About
- Engineering consistency
- Achievements
- Live coding profiles
- Technical skills
- Featured projects
- Experience
- Contact and social profiles

### Reliability and Performance

- Server-side API integrations
- TanStack Query caching
- Graceful API failure handling
- Loading skeletons
- Missing data shown as `Unavailable` instead of misleading values
- Environment variables kept server-side
- Production build validation
- Responsive image and asset handling

### SEO

- Semantic HTML
- Metadata configuration
- Open Graph metadata
- Twitter card metadata
- Canonical URL support
- Structured website metadata

---

## Tech Stack

| Category | Technology |
| --- | --- |
| Framework | TanStack Start |
| Frontend | React 19 |
| Language | TypeScript |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui + Radix UI |
| Data Fetching | TanStack Query |
| Server Logic | TanStack Server Functions |
| Icons | Lucide React + React Icons |
| Runtime / Deployment | Vercel |
| Package Runtime | Bun |

---

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd portfolio
```

### 2. Install dependencies

```bash
bun install
```

### 3. Configure environment variables

Create a `.env` file in the project root.

```env
GITHUB_TOKEN=your_github_token
```

The GitHub token is used server-side for GitHub GraphQL requests.

> Never commit `.env` or real API tokens to GitHub.

LeetCode and Codeforces integrations do not require authentication.

Additional environment variables may be required if optional integrations such as Supabase are enabled.

### 4. Start the development server

```bash
bun run dev
```

The development server will normally be available at:

```text
http://localhost:8080
```

### 5. Create a production build

```bash
bun run build
```

A successful build verifies that the application can be compiled for production deployment.

---

## Project Structure

```text
portfolio/
├── public/
│   ├── projects/
│   │   └── dsa-tracker.png       # Project screenshots
│   └── ...                        # Public static assets
│
├── src/
│   ├── assets/
│   │   ├── vivek-portrait.png     # Source image for ASCII portrait
│   │   └── ...                    # Other bundled assets
│   │
│   ├── components/
│   │   ├── portfolio/
│   │   │   ├── Hero.tsx           # Hero and terminal-style introduction
│   │   │   ├── AsciiPortrait.tsx  # Dynamic ASCII portrait renderer
│   │   │   ├── About.tsx
│   │   │   ├── Consistency.tsx    # Engineering activity dashboard
│   │   │   ├── Achievements.tsx
│   │   │   ├── LiveStats.tsx      # Live coding profile statistics
│   │   │   ├── Skills.tsx
│   │   │   ├── Projects.tsx
│   │   │   ├── Experience.tsx
│   │   │   ├── Contact.tsx
│   │   │   └── ...
│   │   │
│   │   └── ui/                    # shadcn/ui primitives
│   │
│   ├── data/
│   │   ├── profile.ts             # Profile and coding platform usernames
│   │   ├── projects.ts            # Project configuration
│   │   ├── skills.ts              # Technical skills
│   │   ├── experience.ts          # Experience timeline
│   │   └── links.ts               # External/social links
│   │
│   ├── hooks/
│   │   └── ...                    # Reusable React hooks
│   │
│   ├── integrations/
│   │   └── supabase/              # Optional Supabase integration
│   │
│   ├── lib/
│   │   └── activity.functions.ts  # Server-side coding platform integrations
│   │
│   ├── routes/
│   │   ├── __root.tsx             # Root layout, SEO and theme bootstrap
│   │   └── index.tsx              # Main portfolio route
│   │
│   ├── routeTree.gen.ts           # Auto-generated TanStack route tree
│   ├── start.ts                   # TanStack Start configuration
│   └── styles.css                 # Tailwind v4 and global design tokens
│
├── .env                           # Local secrets, never committed
├── .gitignore
├── package.json
└── README.md
```

> `routeTree.gen.ts` is generated automatically by TanStack Router and should generally not be edited manually.

---

## Data Architecture

The portfolio keeps most manually maintained information inside `src/data/`, providing a centralized source of truth.

### Profile and Coding Accounts

Edit:

```text
src/data/profile.ts
```

This contains:

- Name
- Bio
- Location
- Contact information
- Coding platform usernames
- Coding profile URLs
- Manually maintained statistics
- Resume configuration

The `codingProfiles` object centralizes platform usernames for integrations such as:

```text
GitHub
LinkedIn
LeetCode
Codeforces
CodeChef
GeeksforGeeks
HackerRank
AtCoder
Codolio
```

### Projects

Edit:

```text
src/data/projects.ts
```

To add a project, append another project object.

Project screenshots should be placed inside:

```text
public/projects/
```

Example:

```text
public/projects/my-project.png
```

Then reference it as:

```text
/projects/my-project.png
```

Set `githubUrl`, `liveUrl`, or `image` to `null` when they are not available.

This prevents fake links and broken image requests.

### Skills

Edit:

```text
src/data/skills.ts
```

### Experience

Edit:

```text
src/data/experience.ts
```

### External Links

Edit:

```text
src/data/links.ts
```

---

## Live Integrations

Third-party coding platform requests are handled through server-side functions where appropriate.

This prevents sensitive credentials such as the GitHub token from being exposed in the browser bundle.

| Platform | Data | Authentication |
| --- | --- | --- |
| GitHub | Profile + contribution activity | GitHub token |
| LeetCode | Problems, rating and activity | None |
| Codeforces | Rating, rank and submissions | None |
| CodeChef | Activity data | Integration dependent |
| GeeksforGeeks | Activity data | Community/public integration |
| HackerRank | Activity data | Integration dependent |

The main server-side activity logic lives in:

```text
src/lib/activity.functions.ts
```

TanStack Query is used for client-side caching and request state management.

---

## Error Handling

External APIs are not assumed to be permanently available.

The UI handles failures through:

1. Loading states and skeletons
2. Cached data where available
3. Graceful fallback states
4. `Unavailable` when live statistics cannot be retrieved

The portfolio avoids displaying fabricated or misleading statistics when an API request fails.

---

## Security

Sensitive credentials are stored using environment variables.

The `.env` file is excluded through `.gitignore`.

Before publishing changes, secrets can be checked with:

```bash
git grep -n -E "ghp_|github_pat_|SUPABASE_SERVICE_ROLE|PRIVATE_KEY"
```

Never commit:

- GitHub personal access tokens
- Supabase service-role keys
- Private API keys
- `.env` files

---

## Updating the Portfolio

The normal development workflow is:

```text
Edit locally
    ↓
Test with bun run dev
    ↓
Verify production build with bun run build
    ↓
git add
    ↓
git commit
    ↓
git push
    ↓
Deployment updates
```

For most content updates, modify the files inside `src/data/` rather than changing component logic.

---

## Contact

**Vivek Patne**

Computer Science & Engineering (Data Science)
RNS Institute of Technology, Bengaluru
Graduating 2028

- Email: vivekpatnem@gmail.com
- LinkedIn: linkedin.com/in/vivekpatnem
- GitHub: github.com/vivekmpatne
- LeetCode: leetcode.com/u/vivekpatnem
- Codeforces: codeforces.com/profile/vivekpatnem

---

## License

MIT © Vivek Patne
