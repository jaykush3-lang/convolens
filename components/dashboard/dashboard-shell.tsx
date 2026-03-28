"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AudioLines,
  ChevronRight,
  FileAudio,
  FileText,
  LoaderCircle,
  LogOut,
  Sparkles,
  Trash2,
  UploadCloud
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { AUDIO_ACCEPT, SAMPLE_CONVERSATION } from "@/lib/constants";
import { exportAnalysisPdf } from "@/lib/pdf";
import { HistoryItem, AnalysisResult } from "@/lib/types";
import { cn, formatDate, clampText } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";

type TabKey = "text" | "audio" | "history";

async function parseJson<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error || "Something went wrong.");
  }

  return payload as T;
}

export function DashboardShell({ userEmail }: { userEmail: string }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<TabKey>("text");
  const [conversationText, setConversationText] = useState("");
  const [transcriptText, setTranscriptText] = useState("");
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [dragging, setDragging] = useState(false);

  const historyQuery = useQuery({
    queryKey: ["history"],
    queryFn: async () => {
      const response = await fetch("/api/history", { cache: "no-store" });
      return parseJson<HistoryItem[]>(response);
    }
  });

  const analyzeMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      return parseJson<AnalysisResult>(response);
    },
    onSuccess: (payload) => {
      setResult(payload);
      queryClient.invalidateQueries({ queryKey: ["history"] });
      setActiveTab("text");
    }
  });

  const transcribeMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData
      });

      return parseJson<{ transcript: string }>(response);
    },
    onSuccess: async ({ transcript }) => {
      setTranscriptText(transcript);
      await analyzeMutation.mutateAsync(transcript);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/history/${id}`, { method: "DELETE" });
      return parseJson<{ ok: boolean }>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
    }
  });

  const actionError = analyzeMutation.error?.message || transcribeMutation.error?.message || deleteMutation.error?.message;
  const overallTone = useMemo(
    () => result?.emotion_tags?.[0] || result?.speakers?.[0]?.tone || "Neutral",
    [result]
  );

  const handleAnalyzeText = async () => {
    const text = activeTab === "audio" ? transcriptText : conversationText;
    await analyzeMutation.mutateAsync(text);
  };

  const handleSignOut = async () => {
    const supabase = createBrowserSupabaseClient();

    if (supabase) {
      await supabase.auth.signOut();
    }

    window.location.href = "/login";
  };

  const handleFile = async (file?: File) => {
    if (!file) {
      return;
    }

    setSelectedFileName(file.name);
    setActiveTab("audio");
    await transcribeMutation.mutateAsync(file);
  };

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-[28px] border border-black/5 bg-panel/95 p-5 shadow-glow dark:border-white/10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-sm font-medium uppercase tracking-[0.22em] text-accent">ConvoLens workspace</div>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">Conversation analysis dashboard</h1>
              <p className="mt-2 text-sm text-ink/70 dark:text-ink/70">Signed in as {userEmail}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ThemeToggle />
              {result ? (
                <button
                  type="button"
                  onClick={() => exportAnalysisPdf(result)}
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white"
                >
                  <Sparkles className="h-4 w-4" />
                  Export PDF
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-semibold dark:border-white/10"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <div className="space-y-5 rounded-[28px] border border-black/5 bg-panel/95 p-5 dark:border-white/10">
            <div className="flex rounded-full bg-panelStrong p-1 dark:bg-white/5">
              {([
                ["text", "Text/Chat"],
                ["audio", "Voice/Audio"],
                ["history", "History"]
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={cn(
                    "flex-1 rounded-full px-3 py-2 text-sm font-semibold transition",
                    activeTab === key ? "bg-accent text-white" : "text-ink/65"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {activeTab === "text" ? (
              <div className="space-y-4">
                <div className="rounded-2xl bg-accentSoft px-4 py-3 text-sm text-accent dark:bg-accentSoft/35">
                  Free mode is enabled. Text analysis will use a local rule-based engine when paid AI credits are unavailable.
                </div>
                <textarea
                  value={conversationText}
                  onChange={(event) => setConversationText(event.target.value)}
                  placeholder="Paste a conversation, meeting transcript, or customer chat here..."
                  className="min-h-[400px] w-full rounded-[28px] border border-black/10 bg-white/70 p-4 text-sm outline-none transition focus:border-accent dark:border-white/10 dark:bg-white/5"
                />
                <div className="flex items-center justify-between text-sm text-ink/60">
                  <span>{conversationText.length} characters</span>
                  <button
                    type="button"
                    onClick={() => setConversationText(SAMPLE_CONVERSATION)}
                    className="font-semibold text-accent"
                  >
                    Load Sample
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleAnalyzeText}
                  disabled={!conversationText.trim() || analyzeMutation.isPending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {analyzeMutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                  Analyze
                </button>
              </div>
            ) : null}

            {activeTab === "audio" ? (
              <div className="space-y-4">
                <div className="rounded-2xl bg-panelStrong px-4 py-3 text-sm text-ink/70 dark:bg-white/5 dark:text-ink/70">
                  Free mode tip: automatic audio transcription needs a paid provider. You can still paste a transcript manually below and analyze it for free.
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={async (event) => {
                    event.preventDefault();
                    setDragging(false);
                    await handleFile(event.dataTransfer.files?.[0]);
                  }}
                  className={cn(
                    "flex min-h-[220px] w-full flex-col items-center justify-center gap-4 rounded-[28px] border border-dashed px-6 text-center transition",
                    dragging ? "border-accent bg-accentSoft/70" : "border-black/10 bg-white/50 dark:border-white/10 dark:bg-white/5"
                  )}
                >
                  <div className="rounded-full bg-accentSoft p-4 text-accent dark:bg-accentSoft/40">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-base font-semibold">Drag and drop audio here</div>
                    <div className="mt-1 text-sm text-ink/65">Supports mp3, wav, m4a, ogg, and webm</div>
                  </div>
                  <span className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold dark:border-white/10">Choose file</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={AUDIO_ACCEPT}
                  className="hidden"
                  onChange={async (event) => {
                    await handleFile(event.target.files?.[0] ?? undefined);
                  }}
                />
                {selectedFileName ? <p className="text-sm text-ink/65">Selected file: {selectedFileName}</p> : null}
                <textarea
                  value={transcriptText}
                  onChange={(event) => setTranscriptText(event.target.value)}
                  placeholder="Transcript will appear here, or paste one manually to analyze."
                  className="min-h-[220px] w-full rounded-[28px] border border-black/10 bg-white/70 p-4 text-sm outline-none transition focus:border-accent dark:border-white/10 dark:bg-white/5"
                />
                <button
                  type="button"
                  onClick={handleAnalyzeText}
                  disabled={!transcriptText.trim() || analyzeMutation.isPending || transcribeMutation.isPending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {transcribeMutation.isPending || analyzeMutation.isPending ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileAudio className="h-4 w-4" />
                  )}
                  {transcribeMutation.isPending ? "Transcribing audio" : "Analyze transcript"}
                </button>
              </div>
            ) : null}

            {activeTab === "history" ? (
              <div className="space-y-3">
                {historyQuery.isLoading ? (
                  <div className="flex items-center gap-2 rounded-2xl border border-black/10 px-4 py-5 text-sm dark:border-white/10">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Loading saved analyses...
                  </div>
                ) : null}
                {historyQuery.data?.length ? (
                  historyQuery.data.map((item) => (
                    <div key={item.id} className="rounded-3xl border border-black/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs uppercase tracking-[0.2em] text-accent">{item.conversation_type}</div>
                          <h3 className="mt-2 font-semibold">{clampText(item.preview_text, 96)}</h3>
                          <p className="mt-2 text-xs text-ink/55">{formatDate(item.created_at)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteMutation.mutate(item.id)}
                          className="rounded-full p-2 text-ink/55 transition hover:bg-black/5 hover:text-red-600 dark:hover:bg-white/5"
                          aria-label="Delete analysis"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-sm">
                        <span className="rounded-full bg-accentSoft px-3 py-1 font-medium text-accent dark:bg-accentSoft/40">
                          {item.sentiment_label} {item.sentiment_score}/100
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setResult(item.result);
                            setActiveTab("text");
                          }}
                          className="inline-flex items-center gap-2 font-semibold text-accent"
                        >
                          Reload
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : historyQuery.isLoading ? null : (
                  <div className="rounded-3xl border border-dashed border-black/10 p-6 text-sm text-ink/60 dark:border-white/10">
                    No saved analyses yet.
                  </div>
                )}
              </div>
            ) : null}

            {actionError ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-200">{actionError}</p> : null}
          </div>

          <section className="rounded-[28px] border border-black/5 bg-panel/95 p-5 dark:border-white/10">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key={result.summary}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                      ["Sentiment Score", `${result.sentiment_score}/100`],
                      ["Tone", overallTone],
                      ["Action Items", String(result.action_items.length)],
                      ["Conversation Type", result.conversation_type]
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-3xl bg-panelStrong p-4 dark:bg-white/5">
                        <div className="text-xs uppercase tracking-[0.2em] text-accent">{label}</div>
                        <div className="mt-3 text-2xl font-semibold">{value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {result.emotion_tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-accentSoft px-3 py-1 text-sm font-medium text-accent dark:bg-accentSoft/40">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <section className="rounded-[28px] border border-black/5 bg-white/60 p-5 dark:border-white/10 dark:bg-white/5">
                    <h2 className="text-xl font-semibold">Summary</h2>
                    <p className="mt-3 text-sm leading-7 text-ink/75 dark:text-ink/70">{result.summary}</p>
                  </section>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <InfoList title="Positives" items={result.positives} accent="good" />
                    <InfoList title="Negatives" items={result.negatives} accent="warn" />
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <PillSection title="Topics" items={result.key_topics} />
                    <PillSection title="Action Items" items={result.action_items} />
                  </div>

                  <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Speaker Breakdown</h2>
                    <div className="grid gap-4 lg:grid-cols-2">
                      {result.speakers.map((speaker, index) => (
                        <div key={`${speaker.name}-${index}`} className="rounded-[28px] border border-black/5 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5">
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-lg font-semibold text-white">
                              {speaker.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold">{speaker.name}</div>
                              <div className="text-sm text-ink/65">{speaker.tone} tone</div>
                            </div>
                          </div>
                          <div className="mt-4 text-sm text-ink/70">{speaker.message_count} messages</div>
                          <p className="mt-3 text-sm leading-6 text-ink/75 dark:text-ink/70">{speaker.key_contribution}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Notable Quotes</h2>
                    <div className="grid gap-4 lg:grid-cols-3">
                      {result.notable_quotes.map((quote, index) => (
                        <blockquote key={`${quote}-${index}`} className="rounded-[28px] border border-black/5 bg-white/70 p-5 text-sm italic leading-7 dark:border-white/10 dark:bg-white/5">
                          â€œ{quote}â€
                        </blockquote>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-[28px] border border-black/5 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5">
                    <h2 className="text-xl font-semibold">Next Steps</h2>
                    <p className="mt-3 text-sm leading-7 text-ink/75 dark:text-ink/70">{result.next_steps}</p>
                  </section>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex min-h-[540px] flex-col items-center justify-center rounded-[28px] border border-dashed border-black/10 bg-white/40 px-8 text-center dark:border-white/10 dark:bg-white/5"
                >
                  <div className="rounded-full bg-accentSoft p-4 text-accent dark:bg-accentSoft/40">
                    <AudioLines className="h-8 w-8" />
                  </div>
                  <h2 className="mt-5 text-2xl font-semibold">Run your first analysis</h2>
                  <p className="mt-3 max-w-lg text-sm leading-7 text-ink/65 dark:text-ink/70">
                    Paste a conversation, upload audio, or reload one from history to see sentiment, speaker insights, action items, and a PDF-ready report.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </section>
      </div>
    </main>
  );
}

function InfoList({ title, items, accent }: { title: string; items: string[]; accent: "good" | "warn" }) {
  return (
    <section className="rounded-[28px] border border-black/5 bg-white/60 p-5 dark:border-white/10 dark:bg-white/5">
      <h2 className="text-xl font-semibold">{title}</h2>
      <ul className="mt-4 space-y-3 text-sm leading-7 text-ink/75 dark:text-ink/70">
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className="flex gap-3">
            <span className={cn("mt-2 h-2.5 w-2.5 rounded-full", accent === "good" ? "bg-emerald-500" : "bg-amber-500")} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PillSection({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-[28px] border border-black/5 bg-white/60 p-5 dark:border-white/10 dark:bg-white/5">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item, index) => (
          <span key={`${item}-${index}`} className="rounded-full border border-accent/15 bg-accentSoft px-3 py-2 text-sm font-medium text-accent dark:border-accent/25 dark:bg-accentSoft/40">
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

