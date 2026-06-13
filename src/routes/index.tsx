import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/portfolio/Nav";
import { Hero } from "@/components/portfolio/Hero";
import { About } from "@/components/portfolio/About";
import { Consistency } from "@/components/portfolio/Consistency";
import { Achievements } from "@/components/portfolio/Achievements";
import { Skills } from "@/components/portfolio/Skills";
import { Projects } from "@/components/portfolio/Projects";
import { Experience } from "@/components/portfolio/Experience";
import { Contact } from "@/components/portfolio/Contact";
import { Footer } from "@/components/portfolio/Footer";
import { BackToTop } from "@/components/portfolio/BackToTop";
import { profile } from "@/data/profile";

const SITE_URL = "https://vivek-patne-portfolio.lovable.app";
const TITLE = "Vivek Patne — Aspiring SDE-1 Portfolio";
const DESCRIPTION =
  "CSE-DS student at RNSIT Bengaluru. Live GitHub, LeetCode & Codeforces stats, featured full-stack projects, and contact.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: `${SITE_URL}/` },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: profile.name,
          jobTitle: "Software Engineering Student",
          description: profile.bio,
          url: `${SITE_URL}/`,
          email: `mailto:${profile.email}`,
          address: {
            "@type": "PostalAddress",
            addressLocality: "Bengaluru",
            addressCountry: "IN",
          },
          alumniOf: {
            "@type": "CollegeOrUniversity",
            name: "RNS Institute of Technology, Bengaluru",
          },
          sameAs: [
            profile.codingProfiles.github.url,
            profile.codingProfiles.linkedin.url,
            profile.codingProfiles.leetcode.url,
            profile.codingProfiles.codeforces.url,
            profile.codingProfiles.codechef.url,
            profile.codingProfiles.gfg.url,
            profile.codingProfiles.hackerrank.url,
            profile.codingProfiles.atcoder.url,
          ],
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <Nav />
      <main>
        <Hero />
        <About />
        <Consistency />
        <Achievements />
        <Skills />
        <Projects />
        <Experience />
        <Contact />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
