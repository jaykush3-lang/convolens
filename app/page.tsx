import Link from "next/link";
import { ArrowRight, AudioLines, FileText, Globe2, Quote, Sparkles } from "lucide-react";
import { Brand } from "@/components/ui/brand";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const features = [
  {
    title: "Text analysis",
    description: "Drop in chats, meeting notes, or customer conversations and get crisp structure in seconds.",
    icon: FileText
  },
  {
    title: "Voice analysis",
    description: "Upload audio, transcribe it with Whisper, and immediately turn it into actionable insight.",
    icon: AudioLines
  },
  {
    title: "Speaker breakdown",
    description: "See each participant's tone, message contribution, and strategic role in the discussion.",
    icon: Quote
  },
  {
    title: "Export",
    description: "Package summaries, action items, speakers, and next steps into a polished PDF report.",
    icon: Sparkles
  }
];

const highlights = [
  "English + Hindi/Hinglish analysis",
  "Speaker share and sentiment visuals",
  "History saved securely in Supabase",
  "Free local fallback for text analysis"
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="ambient-orb ambient-orb--teal left-[-2rem] top-20 h-48 w-48" />
      <div className="ambient-orb ambient-orb--gold right-10 top-28 h-56 w-56" />
      <div className="ambient-orb ambient-orb--blue bottom-10 right-1/3 h-64 w-64" />
      <div className="mx-auto flex max-w-7xl flex-col gap-14">
        <header className="fade-rise premium-surface flex flex-wrap items-center justify-between gap-3 rounded-full border border-black/5 bg-white/70 px-5 py-3 backdrop-blur dark:border-white/10 dark:bg-white/5">
          <Brand compact />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/app"
              className="aurora-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95"
            >
              Open app
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="fade-rise-delay space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accentSoft px-4 py-2 text-sm font-medium text-accent dark:border-accent/30 dark:bg-accentSoft/40">
              <Globe2 className="h-4 w-4" />
              AI-powered conversation intelligence
            </div>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                Understand every conversation instantly
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-ink/75 dark:text-ink/70">
                ConvoLens turns raw chats and audio into summaries, sentiment, charts, action items, speaker insights, and exportable reports built for fast-moving teams, founders, and support ops.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {highlights.map((highlight) => (
                <div key={highlight} className="chromatic-card premium-surface rounded-2xl border border-black/5 px-4 py-3 text-sm font-medium dark:border-white/10">
                  {highlight}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/app"
                className="aurora-button inline-flex items-center gap-2 rounded-full px-6 py-3 text-base font-semibold text-white shadow-glow transition hover:translate-y-[-1px]"
              >
                Launch dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center rounded-full border border-black/10 px-6 py-3 text-base font-semibold text-ink transition hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
              >
                Sign in
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-ink/60 dark:text-ink/65">
              <div className="rounded-full border border-black/5 bg-white/60 px-4 py-2 dark:border-white/10 dark:bg-white/5">
                Visual dashboards
              </div>
              <div className="rounded-full border border-black/5 bg-white/60 px-4 py-2 dark:border-white/10 dark:bg-white/5">
                Mobile ready
              </div>
              <div className="rounded-full border border-black/5 bg-white/60 px-4 py-2 dark:border-white/10 dark:bg-white/5">
                Shareable web app
              </div>
            </div>
          </div>

          <div className="fade-rise chromatic-card premium-surface relative overflow-hidden rounded-[32px] border border-black/5 bg-panel p-6 shadow-glow dark:border-white/10">
            <div className="absolute inset-0 -z-10 rounded-[32px] bg-grid bg-[size:36px_36px] opacity-30" />
            <div className="space-y-5">
              <div className="rounded-3xl bg-panelStrong p-5 dark:bg-white/5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium uppercase tracking-[0.25em] text-accent">Live output</div>
                    <div className="mt-3 text-2xl font-semibold">Meeting detected as Productive Planning</div>
                  </div>
                  <div className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white">82/100</div>
                </div>
                <p className="mt-3 text-sm leading-6 text-ink/70 dark:text-ink/70">
                  Sentiment 82, strong alignment around onboarding friction, four clear action items, and shared ownership across product and support.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-[1fr_170px]">
                <div className="rounded-3xl border border-black/5 bg-white/60 p-5 dark:border-white/10 dark:bg-white/5">
                  <div className="text-xs uppercase tracking-[0.22em] text-accent">Speaker Share</div>
                  <div className="mt-4 space-y-3">
                    {[
                      ["Ava", "42%"],
                      ["Leo", "33%"],
                      ["Mina", "25%"]
                    ].map(([name, share]) => (
                      <div key={name} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>{name}</span>
                          <span className="text-ink/55">{share}</span>
                        </div>
                        <div className="h-2 rounded-full bg-black/5 dark:bg-white/10">
                          <div
                            className="h-2 rounded-full bg-[linear-gradient(90deg,rgb(var(--accent)),rgb(var(--accent-tertiary)))]"
                            style={{ width: share }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-3xl border border-black/5 bg-white/60 p-5 dark:border-white/10 dark:bg-white/5">
                  <div className="text-xs uppercase tracking-[0.22em] text-accent">Emotion Tags</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {["Productive", "Agreement", "Resolution"].map((tag) => (
                      <div key={tag} className="rounded-full bg-accentSoft px-3 py-2 text-xs font-semibold text-accent dark:bg-accentSoft/50">
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.title} className="rounded-3xl border border-black/5 bg-white/60 p-5 dark:border-white/10 dark:bg-white/5">
                      <div className="mb-3 inline-flex rounded-2xl bg-accentSoft p-3 text-accent dark:bg-accentSoft/50">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h2 className="text-lg font-semibold">{feature.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-ink/70 dark:text-ink/70">{feature.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

