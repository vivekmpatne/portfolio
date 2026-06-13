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
  // TODO: Add new entries (internships, achievements, certifications) here once completed.
];
