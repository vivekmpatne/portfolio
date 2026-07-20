// ============================================================
// PROFILE DATA — Single source of truth for all profile info,
// stats, and coding platform usernames/URLs.
// ============================================================
import avatarAsset from "@/assets/vivek-patne.jpeg.asset.json";

export const profile = {
  name: "Vivek Patne",
  tagline: "CSE-DS Student | Aspiring Software Engineer | Building in Public",
  bio: "Computer Science & Engineering (Data Science), RNS Institute of Technology, Bengaluru — 2028 graduate. Focused on Data Structures & Algorithms, Full-Stack Development, and building real-world software products.",
  location: "Bengaluru, India",
  avatar: avatarAsset.url,
  email: "vivekpatnem@gmail.com",
  phone: "+91 7676287523",
  // Manually-maintained stats.
  //   • linkedinConnections — LinkedIn has no public API; edit here to update the card.
  //   • problemsSolved      — headline DSA count shown in Achievements.
  // Live platform stats (LeetCode / Codeforces / GitHub) come from server
  // functions and show "Unavailable" on failure — they never fall back
  // to hardcoded numbers.
  stats: {
    problemsSolved: 334,
    linkedinConnections: 5000,
  },
  openTo: [
    "Software Engineering Internships",
    "SDE-1 Opportunities",
    "Full Stack Development Roles",
    "Open Source Collaboration",
  ],
  // Legacy handles — kept for backwards compat with LiveStats
  handles: {
    leetcode: "vivekpatnem",
    codeforces: "vivekpatnem",
    github: "vivekmpatne",
  },
  // Unified coding profiles — used by Consistency, LiveStats, and future integrations
  codingProfiles: {
    github:      { username: "vivekmpatne",  url: "https://github.com/vivekmpatne" },

    linkedin:    { username: "vivekpatnem",  url: "https://www.linkedin.com/in/vivekpatnem/" },
    leetcode:    { username: "vivekpatnem",  url: "https://leetcode.com/u/vivekpatnem/" },
    codeforces:  { username: "vivekpatnem",  url: "https://codeforces.com/profile/vivekpatnem" },
    codechef:    { username: "vivekpatnem",  url: "https://www.codechef.com/users/vivekpatnem" },
    gfg:         { username: "vivekpcom8",   url: "https://www.geeksforgeeks.org/user/vivekpcom8" },
    hackerrank:  { username: "vivekpatnem",  url: "https://www.hackerrank.com/profile/vivekpatnem" },
    atcoder:     { username: "vivekpatnem",  url: "https://atcoder.jp/users/vivekpatnem" },
    codolio:     { username: "Viwake",       url: "https://codolio.com/profile/Viwake" },
  },
  // Resume PDF / Google Drive public link. Paste the URL here when ready.
  // Leave null to hide the Resume action everywhere.
  resumeUrl: null as string | null,
};
