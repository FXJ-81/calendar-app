"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AuthModal from "@/components/AuthModal";

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
  const [confirmPassword, setConfirmPassword] = useState("");
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
    if (password !== confirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }
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

  function handleAuthSubmit() {
    if (mode === "signin") signInEmail();
    else signUpEmail();
  }

  return (
    <div className="relative" ref={boxRef}>
      <button
        onClick={() => {
          setOpen((v) => !v);
          if (open) setEmailOpen(false);
        }}
        className="w-10 h-10 min-h-[44px] min-w-[44px] rounded-full border border-zinc-200 dark:border-zinc-800
                   flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-900 touch-manipulation"
        title="Settings"
      >
        <GearIcon />
      </button>

      {!emailOpen && open && (
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
                    setOpen(false);
                    setMode("signin");
                    setAuthError(null);
                  }}
                >
                  Email
                </button>
              </>
            )}
          </div>

        </>
      )}

      <AuthModal
        open={emailOpen && !userEmail}
        onClose={() => {
          setEmailOpen(false);
          setAuthError(null);
          setConfirmPassword("");
        }}
        mode={mode}
        setMode={setMode}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        authError={authError}
        loading={loading}
        onSubmit={handleAuthSubmit}
      />
    </div>
  );
}
