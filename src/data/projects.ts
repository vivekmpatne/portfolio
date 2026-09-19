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
export type ProjectStatus = "live" | "in-progress" | "planned" | "completed";

export interface Project {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  techStack: string[];
  githubUrl: string | null;
  liveUrl: string | null;
  demoVideoUrl?: string | null;
  status: ProjectStatus;
  statusDetail?: string;
  featured: boolean;
  image?: string | null;
}

export const projects: Project[] = [
  {
    id: "intelligent-water-clogging-flood-prevention",
    title: "Intelligent Water Clogging and Flood Prevention Using Real-Time Data",
    subtitle: "SIC IoT Capstone — Samsung Innovation Campus 2026",
    description:
      "IoT-based real-time flood early warning system for Bengaluru urban drains. Monitors drain water level using an HC-SR04 ultrasonic sensor, calculates rate of rise using EMA smoothing, and combines OpenWeatherMap weather data for flood risk prediction. Includes four auto-escalating alert states (Normal, Watch, Alert, and Critical), control-room email alerts, and a citizen reporting dashboard.",
    techStack: [
      "ESP32",
      "MQTT",
      "Node-RED",
      "FlowFuse Dashboard 2.0",
      "OpenWeatherMap API",
      "Python",
      "JavaScript",
    ],
    githubUrl: "https://github.com/vivekmpatne/smart-drain-flood-warning-system",
    liveUrl: null,
    demoVideoUrl:
      "https://drive.google.com/file/d/1zJQG9QPFGXjYabdxMXgRPIjrd-HZ-JN9/view?usp=drive_link",
    status: "completed",
    statusDetail: "Sept 2026",
    featured: true,
    image: "/__l5e/assets-v1/8dbb4596-357c-4ad1-8ec2-57cae5ce2196/smart-drain-dashboard.png",
  },
  {
    id: "chefkart",
    title: "ChefKart",
    description:
      "Full-stack food delivery platform with role-based dashboards (user, chef, admin) and Razorpay payment integration. Full-stack food delivery platform — deploying soon.",
    techStack: ["React", "Node.js", "Express", "MongoDB", "Razorpay", "JWT"],
    githubUrl: null,
    liveUrl: null,
    status: "in-progress",
    featured: true,
    image: null,
  },
  // ────────────────────────────────────────────────────────────
  // 👇 FUTURE PROJECTS — append new objects here (IoT, MERN, etc.).
  //    No changes needed in Projects.tsx or ProjectCard.tsx.
  // ────────────────────────────────────────────────────────────
];
