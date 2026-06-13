import { useState, type FormEvent } from "react";
import { Mail, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { profile } from "@/data/profile";
import { SectionHeader } from "./SectionHeader";
import { SocialIcons } from "./SocialIcons";

export function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Portfolio contact from ${form.name}`);
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`);
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
  };

  return (
    <section id="contact" className="mx-auto max-w-6xl px-6 py-20">
      <SectionHeader title="Get in touch" />
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <p className="text-lg text-muted-foreground">
            Always open to interesting conversations, internship opportunities,
            and collaborations. The fastest way to reach me is via email.
          </p>
          <div className="mt-6 space-y-3 text-sm">
            <a
              href={`mailto:${profile.email}`}
              className="flex items-center gap-3 text-foreground hover:underline"
            >
              <Mail className="h-4 w-4 text-muted-foreground" />
              {profile.email}
            </a>
            <div className="flex items-center gap-3 text-foreground">
              <Phone className="h-4 w-4 text-muted-foreground" />
              {profile.phone}
            </div>
          </div>
          <div className="mt-6">
            <SocialIcons />
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-border bg-card p-6">
          <Input
            required
            placeholder="Your name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            required
            type="email"
            placeholder="Your email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Textarea
            required
            rows={5}
            placeholder="Message"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
          <Button type="submit" className="w-full">
            <Send className="mr-1 h-4 w-4" /> Send via Email
          </Button>
        </form>
      </div>
    </section>
  );
}
