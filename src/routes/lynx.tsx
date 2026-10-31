import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { ArrowRight, Check, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import logo from "@/assets/anoneurx-logo.png";

export const Route = createFileRoute("/lynx")({
  head: () => ({
    meta: [
      { title: "LYNX Feedback — Anoneurx Open Source" },
      {
        name: "description",
        content: "Help shape LYNX, the privacy-focused search engine. Report bugs, request features and rate search quality.",
      },
      { property: "og:title", content: "LYNX Feedback — Anoneurx Open Source" },
      {
        property: "og:description",
        content: "Help shape LYNX, the privacy-focused search engine. No tracking, ever.",
      },
    ],
  }),
  component: LynxFeedback,
});

const CATEGORIES = [
  { id: "bug", label: "Bug report" },
  { id: "feature", label: "Feature idea" },
  { id: "search_quality", label: "Search quality" },
  { id: "privacy", label: "Privacy" },
  { id: "other", label: "Other" },
] as const;

const schema = z.object({
  category: z.enum(["bug", "feature", "search_quality", "privacy", "other"]),
  rating: z.number({ message: "Please select a star rating" }).int().min(1).max(5),
  message: z.string().trim().min(1, "Please write your feedback").max(4000),
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email").max(255)]),
});

const NAV = [
  ["Home", "https://anoneurx.com/en-us/"],
  ["Projects", "https://anoneurx.com/en-us/opensource/projects"],
  ["Community", "https://anoneurx.com/en-us/opensource/community"],
  ["Contact", "https://anoneurx.com/en-us/opensource/contact"],
];

function LynxFeedback() {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]["id"]>("bug");
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse({ category, rating: rating ?? undefined, message, email });
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Please check the form");
    setSending(true);
    const { error } = await supabase.from("feedback").insert({
      project: "lynx",
      category: parsed.data.category,
      rating: parsed.data.rating,
      message: parsed.data.message,
      email: parsed.data.email || null,
    });
    setSending(false);
    if (error) return setError("Couldn't send your feedback. Please try again.");
    setDone(true);
  }

  return (
    <div className="bg-scene min-h-screen text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <a href="https://anoneurx.com/en-us/" aria-label="Anoneurx">
          <img src={logo} alt="Anoneurx" className="h-10 w-10 object-contain" />
        </a>
        <nav className="hidden gap-8 text-sm font-medium md:flex">
          {NAV.map(([l, h]) => (
            <a key={l} href={h} className="text-foreground/80 transition-colors hover:text-foreground">{l}</a>
          ))}
        </nav>
        <span className="text-sm font-semibold">Feedback</span>
      </header>

      <main className="mx-auto grid max-w-6xl gap-12 px-6 pb-24 pt-12 lg:grid-cols-[1fr_1.1fr] lg:pt-20">
        <section>
          <span className="inline-block rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium">
            Anoneurx Open Source · LYNX
          </span>
          <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            Shape LYNX,<br />
            <span className="text-gradient">out loud.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
            LYNX is an independent, privacy-focused search engine — no query logs, explainable ranking.
            Tell us what's broken, what's missing, and what you love.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
            {["No tracking — feedback is anonymous by default", "Email is optional, only for follow-ups", "Read by the LYNX maintainers"].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <Check className="h-4 w-4 text-primary" /> {t}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-glow backdrop-blur-xl md:p-8">
          {done ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20">
                <Check className="h-7 w-7 text-primary" />
              </div>
              <h2 className="mt-6 text-2xl font-semibold">Thank you.</h2>
              <p className="mt-2 text-muted-foreground">Your feedback is on its way to the LYNX team.</p>
              <button
                onClick={() => { setDone(false); setMessage(""); setRating(null); }}
                className="mt-8 rounded-full border border-border bg-secondary px-6 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
              >
                Send more feedback
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-6">
              <div>
                <label className="text-sm font-medium">What's it about?</label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => setCategory(c.id)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm transition-colors",
                        category === c.id
                          ? "border-primary bg-primary/20 text-foreground"
                          : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">How's your experience?</label>
                <div className="mt-3 flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button type="button" key={n} aria-label={`${n} stars`} onClick={() => setRating(rating === n ? null : n)}>
                      <Star className={cn("h-7 w-7 transition-colors", rating && n <= rating ? "fill-glow-gold text-glow-gold" : "text-muted-foreground")} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="msg" className="text-sm font-medium">Your feedback</label>
                <textarea
                  id="msg"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={4000}
                  rows={6}
                  placeholder="Describe the issue or idea. For search quality, include the query you tried."
                  className="mt-3 w-full resize-none rounded-2xl border border-input bg-background/60 px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring"
                />
              </div>

              <div>
                <label htmlFor="email" className="text-sm font-medium">Email <span className="text-muted-foreground">(optional)</span></label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-3 w-full rounded-full border border-input bg-background/60 px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring"
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <button
                type="submit"
                disabled={sending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {sending ? "Sending…" : "Send feedback"} <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
