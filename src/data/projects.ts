// ============================================================
// PROJECTS DATA — Single source of truth for the Projects section.
//
// To add a new project: append a new object below with the same shape.
//   • Drop the screenshot into /public/projects/ and reference it via `image`.
//   • Set githubUrl / liveUrl to null if not applicable — the button hides
//     automatically (no fake "#" links).
//   • `featured: true` pins it to the top; order within the array is preserved.
//
// Zero component changes are needed to add more projects — just push here.
// ============================================================
export type ProjectStatus = "live" | "in-progress" | "planned";

export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl: string | null;
  liveUrl: string | null;
  status: ProjectStatus;
  featured: boolean;
  image?: string | null;
}

export const projects: Project[] = [
  {
    id: "dsa-tracker",
    title: "DSA Tracker",
    description:
      "Full-stack MERN consistency tracker with a 7-day target system — built for disciplined DSA prep from Tier-3 to SDE. Includes smart daily targets, rolling 14-day average ETA calculations, and progress analytics.",
    techStack: ["React", "Node.js", "Express", "MongoDB", "JWT", "Vercel"],
    githubUrl: "https://github.com/vivekmpatne/dsa-tracker",
    liveUrl: "https://tier3torise.vercel.app",
    status: "live",
    featured: true,
    image: "/projects/dsa-tracker.png",
  },
  {
    id: "chefkart",
    title: "ChefKart",
    description:
      "Full-stack food delivery platform with role-based dashboards (user, chef, admin) and Razorpay payment integration.",
    techStack: ["React", "Node.js", "Express", "MongoDB", "Razorpay", "JWT"],
    githubUrl: null,
    liveUrl: null,
    status: "in-progress",
    featured: true,
    image: null,
  },
  {
    id: "samsung-sic",
    title: "Samsung SIC Capstone",
    description:
      "IoT system using Raspberry Pi, sensors, and a Node.js + Grafana data pipeline.",
    techStack: ["Python", "Node.js", "Raspberry Pi", "Linux", "Grafana", "MQTT"],
    githubUrl: null,
    liveUrl: null,
    status: "planned",
    featured: false,
    image: null,
  },
  // ────────────────────────────────────────────────────────────
  // 👇 FUTURE PROJECTS — append new objects here (IoT, MERN, etc.).
  //    No changes needed in Projects.tsx or ProjectCard.tsx.
  // ────────────────────────────────────────────────────────────
];
