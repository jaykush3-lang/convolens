import Link from "next/link";
import { ArrowRight, AudioLines, FileText, Quote, Sparkles } from "lucide-react";
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

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-16">
        <header className="flex items-center justify-between rounded-full border border-black/5 bg-white/70 px-5 py-3 backdrop-blur dark:border-white/10 dark:bg-white/5">
          <Link href="/" className="font-display text-xl font-semibold tracking-tight">
            ConvoLens
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/app"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Open app
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accentSoft px-4 py-2 text-sm font-medium text-accent dark:border-accent/30 dark:bg-accentSoft/40">
              AI-powered conversation intelligence
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">
                Understand every conversation instantly
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-ink/75 dark:text-ink/70">
                ConvoLens turns raw chats and audio into summaries, sentiment, action items, speaker insights, and exportable reports built for teams that move fast.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-base font-semibold text-white shadow-glow transition hover:translate-y-[-1px]"
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
          </div>

          <div className="relative rounded-[32px] border border-black/5 bg-panel p-6 shadow-glow dark:border-white/10">
            <div className="absolute inset-0 -z-10 rounded-[32px] bg-grid bg-[size:36px_36px] opacity-30" />
            <div className="space-y-5">
              <div className="rounded-3xl bg-panelStrong p-5 dark:bg-white/5">
                <div className="text-sm font-medium uppercase tracking-[0.25em] text-accent">Live output</div>
                <div className="mt-3 text-2xl font-semibold">Meeting detected as Productive Planning</div>
                <p className="mt-2 text-sm leading-6 text-ink/70 dark:text-ink/70">
                  Sentiment 82, strong alignment around onboarding friction, four clear action items, and shared ownership across product and support.
                </p>
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

