"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { Brand } from "@/components/ui/brand";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function LoginPage() {
  const router = useRouter();

  const [redirectTo, setRedirectTo] = useState("/app");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const next = new URLSearchParams(window.location.search).get("next");
    if (next) {
      setRedirectTo(next);
    }
  }, []);

  const handleEmailAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      setLoading(false);
      setError("Supabase environment variables are missing. Add them to .env.local to enable auth.");
      return;
    }

    const action =
      mode === "signin"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });

    const { error: authError } = await action;
    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    if (mode === "signup") {
      setMessage("Account created. Check your email if confirmation is enabled, then sign in.");
      return;
    }

    router.push(redirectTo);
    router.refresh();
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      setLoading(false);
      setError("Supabase environment variables are missing. Add them to .env.local to enable auth.");
      return;
    }

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`
      }
    });

    if (oauthError) {
      setLoading(false);
      setError(oauthError.message);
    }
  };

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-ink/75 hover:text-ink">
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
            <Brand compact />
          </div>
          <ThemeToggle />
        </div>

        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-accent/20 bg-accentSoft px-4 py-2 text-sm font-medium text-accent">
              Secure workspace access
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Sign in to ConvoLens</h1>
              <p className="max-w-xl text-base leading-7 text-ink/75 dark:text-ink/70">
                Save analysis history, upload audio safely, and bring every transcript back when you need it.
              </p>
            </div>
          </div>

          <div className="rounded-[32px] border border-black/5 bg-panel p-6 shadow-glow dark:border-white/10">
            <div className="mb-6 flex rounded-full bg-panelStrong p-1 dark:bg-white/5">
              <button
                type="button"
                onClick={() => setMode("signin")}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${mode === "signin" ? "bg-accent text-white" : "text-ink/70"}`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${mode === "signup" ? "bg-accent text-white" : "text-ink/70"}`}
              >
                Create account
              </button>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <label className="block space-y-2 text-sm font-medium">
                <span>Email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 outline-none transition focus:border-accent dark:border-white/10 dark:bg-white/5"
                  placeholder="you@company.com"
                />
              </label>
              <label className="block space-y-2 text-sm font-medium">
                <span>Password</span>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 outline-none transition focus:border-accent dark:border-white/10 dark:bg-white/5"
                  placeholder="Minimum 6 characters"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                {mode === "signin" ? "Sign in with email" : "Create account"}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-ink/40">
              <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
              or
              <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleAuth}
              className="inline-flex w-full items-center justify-center rounded-2xl border border-black/10 px-4 py-3 font-semibold transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/10 dark:hover:bg-white/5"
            >
              Continue with Google
            </button>

            {message ? <p className="mt-4 text-sm text-accent">{message}</p> : null}
            {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
          </div>
        </section>
      </div>
    </main>
  );
}
