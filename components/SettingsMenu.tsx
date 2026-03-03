"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function GearIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="2.5" />
      <circle cx="12" cy="12" r="7" />
      <line x1="19" y1="12" x2="21" y2="12" />
      <line x1="5" y1="12" x2="3" y2="12" />
      <line x1="12" y1="5" x2="12" y2="3" />
      <line x1="12" y1="19" x2="12" y2="21" />
      <line x1="16.95" y1="16.95" x2="18.36" y2="18.36" />
      <line x1="7.05" y1="7.05" x2="5.64" y2="5.64" />
      <line x1="16.95" y1="7.05" x2="18.36" y2="5.64" />
      <line x1="7.05" y1="16.95" x2="5.64" y2="18.36" />
    </svg>
  );
}

export default function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  // auth state
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // email modal state
  const [emailOpen, setEmailOpen] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserEmail(session?.user.email ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  // close menu on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!open) return;
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
        setEmailOpen(false);
      }
    }
    if (typeof window !== "undefined") {
      window.addEventListener("mousedown", onDown);
      return () => window.removeEventListener("mousedown", onDown);
    }
  }, [open]);

  const currentTheme = useMemo(() => {
    if (typeof document === "undefined") return "light";
    const root = document.documentElement;
    return root.classList.contains("dark") ? "dark" : "light";
  }, [open]);

  function setTheme(next: "dark" | "light") {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(next);
    localStorage.setItem("theme", next);
  }

  async function signInGoogle() {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) setAuthError(error.message);
  }

  async function signInEmail() {
    setLoading(true);
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setAuthError(error.message);
      return;
    }
    setEmailOpen(false);
    setOpen(false);
  }

  async function signUpEmail() {
    setLoading(true);
    setAuthError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setAuthError(error.message);
      return;
    }
    setAuthError(null);
    setEmailOpen(false);
    setOpen(false);
  }

  return (
    <div className="relative" ref={boxRef}>
      <button
        onClick={() => {
          setOpen((v) => !v);
          if (open) setEmailOpen(false);
        }}
        className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800
                   flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-900"
        title="Settings"
      >
        <GearIcon />
      </button>

      {open && (
        <>
          {/* MAIN MENU */}
          <div className="absolute right-0 mt-2 w-72 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-lg p-2 z-50">
            {/* THEME */}
            <div className="px-2 py-2 text-xs uppercase opacity-70">Theme</div>
            <button
              className="w-full text-left px-2 py-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900"
              onClick={() => setTheme("light")}
            >
              {currentTheme === "light" ? "✓ " : ""}Light mode
            </button>
            <button
              className="w-full text-left px-2 py-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900"
              onClick={() => setTheme("dark")}
            >
              {currentTheme === "dark" ? "✓ " : ""}Dark mode
            </button>

            <div className="my-2 border-t border-zinc-200 dark:border-zinc-800" />

            {/* ACCOUNT */}
            <div className="px-2 py-2 text-xs uppercase opacity-70">Account</div>

            {userEmail ? (
              <>
                <div className="px-2 py-2 text-sm break-all">{userEmail}</div>
                <button
                  className="w-full text-left px-2 py-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setOpen(false);
                    setEmailOpen(false);
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button
                  className="w-full text-left px-2 py-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  onClick={signInGoogle}
                >
                  Sign in with Google
                </button>

                <button
                  className="w-full text-left px-2 py-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  onClick={() => {
                    setEmailOpen(true);
                    setMode("signin");
                    setAuthError(null);
                  }}
                >
                  Email
                </button>
              </>
            )}
          </div>

          {/* EMAIL POPUP (SECOND PANEL) */}
          {emailOpen && !userEmail && (
            <div className="absolute right-0 mt-2 translate-x-[-300px] w-80 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-lg p-3 z-50">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Email</div>
                <button
                  className="px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  onClick={() => setEmailOpen(false)}
                >
                  ✕
                </button>
              </div>

              <div className="mt-3 flex gap-2 text-sm">
                <button
                  className={`px-3 py-1 rounded border ${
                    mode === "signin" ? "border-zinc-400 dark:border-zinc-600" : "border-transparent"
                  }`}
                  onClick={() => { setMode("signin"); setAuthError(null); }}
                >
                  Sign in
                </button>
                <button
                  className={`px-3 py-1 rounded border ${
                    mode === "signup" ? "border-zinc-400 dark:border-zinc-600" : "border-transparent"
                  }`}
                  onClick={() => { setMode("signup"); setAuthError(null); }}
                >
                  Sign up
                </button>
              </div>

              <input
                className="w-full mt-3 px-3 py-2 rounded bg-white text-zinc-900 border border-zinc-300
                           dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700"
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className="w-full mt-2 px-3 py-2 rounded bg-white text-zinc-900 border border-zinc-300
                           dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700"
                placeholder="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {authError && (
                <div className="mt-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
                  {authError}
                </div>
              )}

              {mode === "signin" ? (
                <button
                  className="w-full mt-3 px-3 py-2 rounded bg-zinc-900 text-zinc-100
                             dark:bg-zinc-100 dark:text-zinc-900 disabled:opacity-50"
                  onClick={signInEmail}
                  disabled={loading}
                >
                  {loading ? "Signing in…" : "Sign in"}
                </button>
              ) : (
                <button
                  className="w-full mt-3 px-3 py-2 rounded bg-zinc-900 text-zinc-100
                             dark:bg-zinc-100 dark:text-zinc-900 disabled:opacity-50"
                  onClick={signUpEmail}
                  disabled={loading}
                >
                  {loading ? "Signing up…" : "Sign up"}
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
