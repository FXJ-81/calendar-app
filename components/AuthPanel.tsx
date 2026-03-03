"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthPanel() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

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
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert("Signed up. Check your email if confirmation is enabled.");
  }

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) alert(error.message);
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
            className="px-3 py-2 rounded bg-zinc-900 text-zinc-100 border border-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
            onClick={signIn}
          >
            Sign in
          </button>
          <button
            className="px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700"
            onClick={signUp}
          >
            Sign up
          </button>
        </>
      )}
    </div>
  );
}