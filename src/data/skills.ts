// ============================================================
// SKILLS DATA — Single source of truth for the Skills section.
//
// Rules (audited pass):
//   • No skill appears in more than one category.
//   • Only technologies actually used in the codebase / real work.
//   • Order within Languages follows the user's canonical list.
//
// To add a new skill: drop the string into the right category.
// To add a new category: add a new key — the Skills component renders
// every key automatically, no component changes needed.
// ============================================================
export const skills: Record<string, string[]> = {
  Languages: ["C", "C++", "JavaScript", "Python", "Java", "SQL"],

  // JavaScript lives in Languages; not repeated here.
  Frontend: [
    "HTML5",
    "CSS3",
    "React.js",
    "Redux",
    "React Router",
    "Tailwind CSS",
  ],

  "Backend & Database": [
    "Node.js",
    "Express.js",
    "REST APIs",
    "JWT Auth",
    "MongoDB",
    "Mongoose",
    "Redis",
  ],

  // Redis lives under Backend & Database; not repeated here.
  "Tools & Technologies": [
    "Git",
    "GitHub",
    "Linux",
    "VS Code",
    "Postman",
    "Docker",
    "Kubernetes",
    "Vercel",
    "Railway",
  ],

  Concepts: [
    "Data Structures & Algorithms",
    "System Design Basics",
    "MVC/Services Architecture",
  ],
};
