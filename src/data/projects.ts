// ============================================================
// PROJECTS DATA — Most important file to edit over time.
// To add a new project: append a new object below with the same shape.
// Drop screenshots into /public/projects/ and reference them via `image`.
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
  image?: string | null;
}

export const projects: Project[] = [
  {
    title: "DSA Tracker",
    description:
      "Full-stack MERN consistency tracker with a 7-day target system — built for disciplined DSA prep from Tier-3 to SDE. Includes smart daily targets, rolling 14-day average ETA calculations, and progress analytics.",
    techStack: ["React", "Node.js", "Express", "MongoDB", "JWT", "Vercel"],
    githubUrl: null,
    liveUrl: "https://tier3torise.vercel.app",
    status: "live",
    featured: true,
    image: "/projects/dsa-tracker.png",
  },
  {
    title: "ChefKart",
    description:
      "Full-stack food delivery platform with role-based dashboards (user, chef, admin) and Razorpay payment integration.",
    techStack: ["React", "Node.js", "Express", "MongoDB", "Razorpay", "JWT"],
    githubUrl: null,
    liveUrl: null,
    status: "in-progress",
    featured: true,
    image: "/projects/chefkart.png",
  },
  {
    title: "URL Shortener",
    description:
      "Production-ready URL shortener with analytics dashboard, modular Services/DAO architecture, and MongoDB indexing.",
    techStack: ["React", "Express", "MongoDB", "Redux", "TanStack Query"],
    githubUrl: null,
    liveUrl: null,
    status: "in-progress",
    featured: false,
    image: "/projects/url-shortener.png",
  },
  {
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
];
