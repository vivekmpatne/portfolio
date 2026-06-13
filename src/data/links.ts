// ============================================================
// LINKS DATA — All external profile URLs. Edit freely.
// ============================================================
export const links = {
  // Social
  github: "https://github.com/vivekpatnem",
  linkedin: "https://www.linkedin.com/in/vivekpatnem/",
  x: "https://x.com/vm_patne",
  instagram: "https://instagram.com/vm_patne",
  youtube: "https://youtube.com/channel/UCj_nF9Esi_2ZexaPOTCqGYQ",
  discord: "__v1v3k", // username only

  // Coding profiles
  leetcode: "https://leetcode.com/u/vivekpatnem",
  codeforces: "https://codeforces.com/profile/vivekpatnem",
  codechef: "https://www.codechef.com/users/viv9ekpatnem",
  gfg: "https://www.geeksforgeeks.org/user/vivekpcom8",
  hackerrank: "https://www.hackerrank.com/profile/vivekpatnem",
  atcoder: "https://atcoder.jp/users/vivekpatnem",

  // TODO: replace once portfolio repo is created on GitHub
  portfolioRepo: "https://github.com/vivekpatnem/portfolio",
};

export const socialLinks = [
  { name: "GitHub", url: links.github, icon: "Github" },
  { name: "LinkedIn", url: links.linkedin, icon: "Linkedin" },
  { name: "X / Twitter", url: links.x, icon: "Twitter" },
  { name: "Instagram", url: links.instagram, icon: "Instagram" },
  { name: "YouTube", url: links.youtube, icon: "Youtube" },
] as const;

export const codingProfiles = [
  { name: "LeetCode", url: links.leetcode },
  { name: "Codeforces", url: links.codeforces },
  { name: "CodeChef", url: links.codechef },
  { name: "GeeksforGeeks", url: links.gfg },
  { name: "HackerRank", url: links.hackerrank },
  { name: "AtCoder", url: links.atcoder },
] as const;
