"use client";

import { useEffect } from "react";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
  mode: "signin" | "signup";
  setMode: (m: "signin" | "signup") => void;
  email: string;
  setEmail: (s: string) => void;
  password: string;
  setPassword: (s: string) => void;
  confirmPassword: string;
  setConfirmPassword: (s: string) => void;
  authError: string | null;
  loading: boolean;
  onSubmit: () => void;
};

export default function AuthModal({
  open,
  onClose,
  mode,
  setMode,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  authError,
  loading,
  onSubmit,
}: AuthModalProps) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
        aria-label="Close"
      />

      <div className="absolute inset-0 flex items-start justify-center pt-[20vh] sm:items-center sm:pt-0 p-4">
        <div
          className="
            relative w-full max-w-md
            rounded-2xl border border-white/10 bg-[#0b0b0b] shadow-2xl
            max-h-[85dvh] overflow-hidden
          "
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div className="text-white text-lg font-semibold">
              {mode === "signup" ? "Create account" : "Sign in"}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-white/70 hover:text-white text-xl leading-none p-2 -m-2 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>

          <div className="px-5 py-4 overflow-y-auto">
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setMode("signin")}
                className={`flex-1 h-10 rounded-lg border touch-manipulation ${
                  mode === "signin"
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-white border-white/15"
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`flex-1 h-10 rounded-lg border touch-manipulation ${
                  mode === "signup"
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-white border-white/15"
                }`}
              >
                Sign up
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit?.();
              }}
              className="space-y-3"
            >
              <div>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Email"
                  className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-white placeholder:text-white/40 outline-none focus:border-white/25"
                  autoComplete="email"
                />
                <div className="mt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      // No recovery flow; user can use Google or try sign-in email
                    }}
                    className="text-xs text-white/70 hover:text-white underline underline-offset-2"
                  >
                    Forgot email?
                  </button>
                </div>
              </div>

              <div>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="Password"
                  className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-white placeholder:text-white/40 outline-none focus:border-white/25"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                />
                <div className="mt-1 flex justify-end">
                  <button
                    type="button"
                    className="text-xs text-white/70 hover:text-white underline underline-offset-2"
                    onClick={() => {}}
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              {mode === "signup" && (
                <div>
                  <input
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type="password"
                    placeholder="Confirm password"
                    className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-white placeholder:text-white/40 outline-none focus:border-white/25"
                    autoComplete="new-password"
                  />
                </div>
              )}

              {authError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-white text-black font-semibold disabled:opacity-60 touch-manipulation"
              >
                {loading
                  ? "Loading..."
                  : mode === "signup"
                    ? "Create account"
                    : "Sign in"}
              </button>
            </form>

            <div className="h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
