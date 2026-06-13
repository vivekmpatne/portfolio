// ============================================================
// PROJECTS DATA — Most important file to edit over time.
// To add a new project: append a new object below with the same shape.
// No component code changes needed.
// ============================================================
export type ProjectStatus = "live" | "in-progress" | "planned";

export interface Project {
  title: string;
  description: string;
  techStack: string[];
  githubUrl: string | null;
  liveUrl: string | null;
  status: ProjectStatus;
  featured: boolean;
}

export const projects: Project[] = [
  {
    title: "DSA Tracker",
    description:
      "Full-stack MERN consistency tracker with a 7-day target system — built for disciplined DSA prep from Tier-3 to SDE. Includes smart daily targets, rolling 14-day average ETA calculations, and progress analytics.",
    techStack: ["React.js", "Node.js", "Express.js", "MongoDB", "JWT", "Vercel", "Render"],
    // TODO: confirm exact repo URL
    githubUrl: "https://github.com/vivekpatnem/dsa-tracker",
    liveUrl: "https://tier3torise.vercel.app",
    status: "live",
    featured: true,
  },
  {
    title: "ChefKart",
    description:
      // TODO: Add real description after project is complete
      "Full-stack food delivery platform with role-based dashboards (user, chef, admin) and Razorpay payment integration.",
    techStack: ["React.js", "Node.js", "Express.js", "MongoDB", "Razorpay", "JWT"],
    githubUrl: null, // TODO: add repo link
    liveUrl: null, // TODO: add deployed link
    status: "in-progress",
    featured: true,
  },
  {
    title: "URL Shortener",
    description:
      // TODO: Add real description after project is complete
      "Production-ready URL shortener with analytics dashboard, modular Services/DAO architecture, and MongoDB indexing.",
    techStack: ["React.js", "Express.js", "MongoDB", "Redux", "TanStack Query"],
    githubUrl: null, // TODO: add repo link
    liveUrl: null, // TODO: add deployed link
    status: "in-progress",
    featured: true,
  },
  {
    title: "Samsung SIC Capstone",
    description:
      // TODO: Add real description after Samsung Innovation Campus program (Aug-Sept 2026)
      "IoT system using Raspberry Pi, sensors, and a Node.js + Grafana data pipeline.",
    techStack: ["Python", "Node.js", "Raspberry Pi", "Linux", "Grafana", "MQTT"],
    githubUrl: null,
    liveUrl: null,
    status: "planned",
    featured: false,
  },
];
