import { useEffect, useState } from "react";
import { profile } from "@/data/profile";

/**
 * Returns true if profile.resumeUrl exists (HEAD 200). While probing returns null.
 * Used to hide the Resume button when /public/resume.pdf is missing.
 */
export function useResumeAvailable(): boolean | null {
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    const url = profile.resumeUrl;
    if (!url) {
      setAvailable(false);
      return;
    }
    fetch(url, { method: "HEAD" })
      .then((r) => {
        if (cancelled) return;
        const ct = r.headers.get("content-type") ?? "";
        // Some hosts return 200 with index.html for missing files — reject non-pdf.
        setAvailable(r.ok && !ct.includes("text/html"));
      })
      .catch(() => !cancelled && setAvailable(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return available;
}
