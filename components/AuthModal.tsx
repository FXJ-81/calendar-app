"use client";

import { useEffect, useRef } from "react";

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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Reset scroll when opening so content isn't stuck scrolled
  useEffect(() => {
    if (open && scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [open]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 min-h-screen min-h-dvh">
      {/* Backdrop — behind the centering wrapper so it never affects flex */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 dark:bg-[#171717]/80 backdrop-blur-sm"
        aria-label="Close"
      />

      {/* Centering wrapper — full size, only contains the panel */}
      <div className="absolute inset-0 grid place-items-center p-4 min-h-full">
        <div
          className="relative w-full max-w-md flex flex-col rounded-xl border border-zinc-200 bg-white dark:border-zinc-700/80 dark:bg-[#202124] shadow-2xl max-h-[85dvh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Header — fixed, no scroll */}
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-5 py-4 bg-white dark:border-zinc-700/80 dark:bg-[#202124]">
          <h2 id="auth-modal-title" className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            {mode === "signup" ? "Create account" : "Sign in"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-700/80 dark:hover:text-zinc-100 min-h-[40px] min-w-[40px] flex items-center justify-center touch-manipulation transition-colors"
            aria-label="Close modal"
          >
            <span className="text-xl leading-none">×</span>
          </button>
        </div>

        {/* Body — scrollable, full height */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-5 py-4 min-h-0"
          style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
        >
          {/* Tab toggle — Google style: muted blue when selected */}
          <div className="flex gap-2 mb-5">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 h-10 rounded-lg border text-sm font-medium touch-manipulation transition-colors ${
                mode === "signin"
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500/60 dark:bg-blue-500/20 dark:text-blue-300"
                  : "border-zinc-300 bg-transparent text-zinc-600 hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-600 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-300"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 h-10 rounded-lg border text-sm font-medium touch-manipulation transition-colors ${
                mode === "signup"
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500/60 dark:bg-blue-500/20 dark:text-blue-300"
                  : "border-zinc-300 bg-transparent text-zinc-600 hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-600 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-300"
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
            className="space-y-4"
          >
            <div>
              <label htmlFor="auth-email" className="sr-only">
                Email
              </label>
              <input
                id="auth-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Email"
                className="w-full h-11 rounded-lg border border-zinc-300 bg-white px-4 text-zinc-900 placeholder:text-zinc-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 dark:border-zinc-600 dark:bg-[#292929] dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500/60 transition-colors"
                autoComplete="email"
              />
              <div className="mt-1.5 flex justify-end">
                <button
                  type="button"
                  className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 underline underline-offset-2"
                  onClick={() => {}}
                >
                  Forgot email?
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="auth-password" className="sr-only">
                Password
              </label>
              <input
                id="auth-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Password"
                className="w-full h-11 rounded-lg border border-zinc-300 bg-white px-4 text-zinc-900 placeholder:text-zinc-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 dark:border-zinc-600 dark:bg-[#292929] dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500/60 transition-colors"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
              <div className="mt-1.5 flex justify-end">
                <button
                  type="button"
                  className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 underline underline-offset-2"
                  onClick={() => {}}
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <div>
                <label htmlFor="auth-confirm" className="sr-only">
                  Confirm password
                </label>
                <input
                  id="auth-confirm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type="password"
                  placeholder="Confirm password"
                  className="w-full h-11 rounded-lg border border-zinc-300 bg-white px-4 text-zinc-900 placeholder:text-zinc-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 dark:border-zinc-600 dark:bg-[#292929] dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500/60 transition-colors"
                  autoComplete="new-password"
                />
              </div>
            )}

            {authError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-full bg-zinc-900 text-white font-medium hover:bg-zinc-800 disabled:opacity-50 touch-manipulation transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-white dark:bg-[#292929] dark:border dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-700 dark:focus:ring-offset-zinc-900"
            >
              {loading
                ? "Loading..."
                : mode === "signup"
                  ? "Create account"
                  : "Sign in"}
            </button>
          </form>

          {/* Bottom safe area / spacing */}
          <div className="h-6 sm:h-4" />
        </div>
      </div>
      </div>
    </div>
  );
}
