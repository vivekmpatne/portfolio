import { useState, type FormEvent } from "react";
import { Copy, Mail, Send, Loader2 } from "lucide-react";
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

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      await sendContactEmail({ data: form });
      toast.success("Message sent. Thanks for reaching out.");
      setForm({ name: "", email: "", message: "" });
    } catch (error) {
      console.error(error);
      toast.error("Message could not be sent. Please try again or email me directly.");
    } finally {
      setSending(false);
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      toast.success("Email copied");
    } catch {
      toast.error("Copy failed. Please select the email address.");
    }
  };

  return (
    <section id="contact" className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
      <SectionHeader eyebrow="Start a conversation" title="Have a good problem?" subtitle="Tell me about your team, product, or the technical challenge you are working through." />
      <div className="grid gap-8 lg:grid-cols-[.86fr_1.14fr] lg:gap-16">
        <div className="flex flex-col items-start gap-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">Direct email</p>
            <button type="button" onClick={copyEmail} className="mt-3 inline-flex min-h-12 max-w-full items-center gap-3 rounded-full border border-border bg-card px-4 text-sm text-foreground transition-colors hover:border-primary/40 sm:px-5">
              <Mail className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate">{profile.email}</span>
              <Copy className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </button>
          </div>
          <SocialIcons />
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">A note about your team, product, or technical challenge is a great place to start.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3 rounded-[1.75rem] border border-border bg-card p-5 sm:p-7">
          <div className="mb-5">
            <p className="font-mono text-[10px] uppercase tracking-[.18em] text-primary">Send a message</p>
            <p className="mt-2 text-sm text-muted-foreground">The form delivers directly to Vivek.</p>
          </div>
          <Input required placeholder="Your name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <Input required type="email" placeholder="Your email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <Textarea required rows={5} placeholder="What would you like to discuss?" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} />
          <Button type="submit" className="min-h-12 w-full rounded-full bg-accent-gradient font-semibold text-primary-foreground hover:opacity-90" disabled={sending}>
            {sending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending</> : <><Send className="mr-2 h-4 w-4" />Send message</>}
          </Button>
        </form>
      </div>
    </section>
  );
}
