// ============================================================
// EXPERIENCE / EDUCATION DATA — Vertical timeline entries.
// type can be "education" | "experience" | "achievement"
// ============================================================
export type TimelineType = "education" | "experience" | "achievement";

export interface TimelineEntry {
  type: TimelineType;
  title: string;
  organization: string;
  duration: string;
  details: string;
}

export const timeline: TimelineEntry[] = [
  {
    type: "education",
    title: "B.E. Computer Science & Engineering (Data Science)",
    organization: "RNS Institute of Technology (RNSIT), Bengaluru",
    duration: "Sept 2024 — May 2028",
    details:
      "CGPA: 8.48 / 10.0 | Relevant Coursework: DSA, DBMS, OS, Computer Networks",
  },

  // ────────────────────────────────────────────────────────────
  // 👇 FUTURE ENTRIES — add real experiences here once completed.
  //    Keep newest-first for chronological display.
  //    Never add entries before they actually start / complete.
  // ────────────────────────────────────────────────────────────
  //
  // 1) Samsung SIC (Solve for India Challenge / Innovation Campus)
  //    Add AFTER the program is completed. Template:
  // {
  //   type: "experience",
  //   title: "Samsung Innovation Campus — Trainee",
  //   organization: "Samsung R&D Institute, India",
  //   duration: "Month YYYY — Month YYYY",
  //   details: "Track: <AI/IoT/etc.> | Key outcomes: <what you built/learned>",
  // },
  //
  // 2) ITJOBXS Internship
  //    Add ONCE the internship officially starts. Template:
  // {
  //   type: "experience",
  //   title: "<Role> Intern",
  //   organization: "ITJOBXS",
  //   duration: "Month YYYY — Present",
  //   details: "Stack: <tech> | Working on: <what you're building>",
  // },
];
