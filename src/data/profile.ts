// ============================================================
// PROFILE DATA — Edit your personal info here.
// ============================================================
import avatarAsset from "@/assets/vivek-patne.jpeg.asset.json";

export const profile = {
  name: "Vivek Patne",
  tagline: "CSE-DS Student | Aspiring SDE-1 | Building in Public",
  bio: "3rd-year Computer Science & Engineering (Data Science) student at RNS Institute of Technology, Bengaluru. Focused on Data Structures & Algorithms, Full-Stack Development, and building real-world software products.",
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
  // Things the user is open to (Contact section)
  openTo: [
    "Software Engineering Internships",
    "SDE-1 Opportunities",
    "Full Stack Development Roles",
    "Open Source Collaboration",
  ],
  // Handles used by live-stats APIs
  handles: {
    leetcode: "vivekpatnem",
    codeforces: "vivekpatnem",
    github: "vivekpatnem",
  },
  // TODO: drop your resume PDF in /public as resume.pdf
  resumeUrl: "/resume.pdf",
};
