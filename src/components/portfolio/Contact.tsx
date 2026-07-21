import { useState, type FormEvent } from "react";
import { Mail, Phone, MapPin, Send, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { profile } from "@/data/profile";
import { SectionHeader } from "./SectionHeader";
import { SocialIcons } from "./SocialIcons";
import { sendContactEmail } from "@/lib/contact.functions";

export function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      await sendContactEmail({ data: form });
      toast.success("Message sent! I'll get back to you soon.");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message. Please try again or email me directly.");
    } finally {
      setSending(false);
    }
  };

  const contactItems = [
    { icon: Mail, label: "Email", value: profile.email, href: `mailto:${profile.email}` },
    { icon: Phone, label: "Phone", value: profile.phone, href: `tel:${profile.phone.replace(/\s/g, "")}` },
    { icon: MapPin, label: "Location", value: profile.location, href: null },
  ];

  return (
    <section id="contact" className="mx-auto max-w-6xl px-6 py-20">
      <SectionHeader title="Let's Build Something Great Together" />
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <p className="text-lg text-muted-foreground">
            Always open to interesting conversations, internship opportunities,
            and collaborations. The fastest way to reach me is via email.
          </p>

          <div className="space-y-2">
            {contactItems.map((item) => {
              const Icon = item.icon;
              const inner = (
                <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-card-hover">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                    <Icon className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                      {item.label}
                    </div>
                    <div className="truncate text-sm font-medium text-foreground">
                      {item.value}
                    </div>
                  </div>
                </div>
              );
              return item.href ? (
                <a key={item.label} href={item.href} className="block">
                  {inner}
                </a>
              ) : (
                <div key={item.label}>{inner}</div>
              );
            })}
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="mb-3 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Open To
            </div>
            <ul className="space-y-2">
              {profile.openTo.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <SocialIcons />
        </div>

        <form
          onSubmit={onSubmit}
          className="h-fit space-y-3 rounded-2xl border border-border bg-card p-6 shadow-card"
        >
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
            rows={6}
            placeholder="Message"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
          <Button type="submit" className="w-full" disabled={sending}>
            {sending ? (
              <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Sending...</>
            ) : (
              <><Send className="mr-1 h-4 w-4" /> Send Message</>
            )}
          </Button>
        </form>
      </div>
    </section>
  );
}
