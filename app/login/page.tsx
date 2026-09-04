"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin";
  const configError = searchParams.get("error") === "config";

  const [mode, setMode] = useState<"password" | "magic">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(configError ? "Supabase environment variables are missing." : "");
  const [busy, setBusy] = useState(false);

  const configured = hasSupabaseConfig();

  async function onPassword(e: FormEvent) {
    e.preventDefault();
    if (!configured) return;
    setBusy(true);
    setError("");
    setMessage("");
    const supabase = createClient();
    const { error: signError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (signError) {
      setError(signError.message);
      return;
    }
    router.replace(next);
    router.refresh();
  }

  async function onMagic(e: FormEvent) {
    e.preventDefault();
    if (!configured) return;
    setBusy(true);
    setError("");
    setMessage("");
    const supabase = createClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
    setBusy(false);
    if (otpError) {
      setError(otpError.message);
      return;
    }
    setMessage("Magic link sent. Check your email to enter the admin portal.");
  }

  async function onSignUp(e: FormEvent) {
    e.preventDefault();
    if (!configured) return;
    setBusy(true);
    setError("");
    setMessage("");
    const supabase = createClient();
    const { error: signError } = await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (signError) {
      setError(signError.message);
      return;
    }
    setMessage("Account created. Confirm your email if required, then sign in. The first user can claim admin on /admin.");
  }

  return (
    <main className="min-h-screen bg-[#0d0d0d] text-[#F4F1EA] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#141414] p-8 space-y-6">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 block mb-1">
            [ SECURE ACCESS ]
          </span>
          <h1 className="text-2xl font-serif font-bold uppercase">Admin Login</h1>
          <p className="text-xs text-neutral-400 mt-2 font-mono">
            The Safe House — authenticated staff only.
          </p>
        </div>

        <div className="flex gap-2 text-[10px] font-mono uppercase">
          <button
            type="button"
            onClick={() => setMode("password")}
            className={`px-3 py-1.5 rounded-full border ${mode === "password" ? "bg-white text-black" : "border-white/20"}`}
          >
            Email / Password
          </button>
          <button
            type="button"
            onClick={() => setMode("magic")}
            className={`px-3 py-1.5 rounded-full border ${mode === "magic" ? "bg-white text-black" : "border-white/20"}`}
          >
            Magic Link
          </button>
        </div>

        <form onSubmit={mode === "password" ? onPassword : onMagic} className="space-y-3 text-xs">
          <div>
            <label className="opacity-70 block mb-1 font-mono">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 bg-black/40 border border-white/20 text-white"
              placeholder="admin@thesafehouse.rw"
            />
          </div>
          {mode === "password" && (
            <div>
              <label className="opacity-70 block mb-1 font-mono">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 bg-black/40 border border-white/20 text-white"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={busy || !configured}
            className="w-full py-3 bg-purple-600 text-white font-bold uppercase tracking-wider rounded-full hover:bg-purple-500 disabled:opacity-50"
          >
            {busy ? "Working…" : mode === "password" ? "Sign in" : "Send magic link"}
          </button>
          {mode === "password" && (
            <button
              type="button"
              disabled={busy || !configured}
              onClick={onSignUp}
              className="w-full py-3 border border-white/20 font-bold uppercase tracking-wider rounded-full hover:bg-white/10 disabled:opacity-50"
            >
              Create admin account
            </button>
          )}
        </form>

        {error && <p className="text-xs font-mono text-red-400">{error}</p>}
        {message && <p className="text-xs font-mono text-purple-300">{message}</p>}

        <a href="/" className="block text-center text-[11px] font-mono opacity-60 hover:opacity-100">
          ← Back to storefront
        </a>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#0d0d0d]" />}>
      <LoginForm />
    </Suspense>
  );
}
