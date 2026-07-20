// ============================================================
// PROFILE DATA — Single source of truth for all profile info,
// stats, and coding platform usernames/URLs.
// ============================================================
import avatarAsset from "@/assets/vivek-patne.jpeg.asset.json";

export const profile = {
  name: "Vivek Patne",
  tagline: "CSE-DS Student | Aspiring SDE-1 | Building in Public",
  bio: "Computer Science & Engineering (Data Science), RNS Institute of Technology, Bengaluru — Expected 2028 graduate. Focused on Data Structures & Algorithms, Full-Stack Development, and building real-world software products.",
  location: "Bengaluru, India",
  avatar: avatarAsset.url,
  email: "vivekpatnem@gmail.com",
  phone: "+91 7676287523",
  // Fallback values — shown when live APIs fail
  stats: {
    leetcodeRating: 1491,
    codeforcesRating: 956,
    problemsSolved: 334,
    leetcodeEasy: 0,
    leetcodeMedium: 0,
    leetcodeHard: 0,
    linkedinConnections: 4000,
    githubRepos: 20,
    githubFollowers: 10,
    githubFollowing: 15,
    codeforcesRank: "newbie",
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
  resumeUrl: "/resume.pdf",
};
