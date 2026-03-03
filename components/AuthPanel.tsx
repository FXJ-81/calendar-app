"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthPanel() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // initial session
    supabase.auth.getSession().then(({ data }) => {
      setSessionEmail(data.session?.user.email ?? null);
    });

    // listen for changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionEmail(session?.user.email ?? null);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signUp() {
    setLoading(true);
    setAuthError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setAuthError(error.message);
      return;
    }
    setAuthError(null);
  }

  async function signIn() {
    setLoading(true);
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setAuthError(error.message);
      return;
    }
    setAuthError(null);
  }

  async function signOut() {
    setAuthError(null);
    const { error } = await supabase.auth.signOut();
    if (error) setAuthError(error.message);
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {sessionEmail ? (
        <>
          <div className="text-sm text-zinc-800 dark:text-zinc-300">
            Signed in as {sessionEmail}
          </div>
          <button
            className="px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700"
            onClick={signOut}
          >
            Sign out
          </button>
        </>
      ) : (
        <>
          <input
            className="px-3 py-2 rounded bg-white text-zinc-900 border border-zinc-300 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="px-3 py-2 rounded bg-white text-zinc-900 border border-zinc-300 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700"
            placeholder="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="px-3 py-2 rounded bg-zinc-900 text-zinc-100 border border-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 disabled:opacity-50"
            onClick={signIn}
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <button
            className="px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 disabled:opacity-50"
            onClick={signUp}
            disabled={loading}
          >
            {loading ? "…" : "Sign up"}
          </button>
          {authError && (
            <div className="w-full rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
              {authError}
            </div>
          )}
        </>
      )}
    </div>
  );
}