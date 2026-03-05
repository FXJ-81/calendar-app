"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

type CalEvent = { id: string; title: string; start: Date; end: Date; color?: string | null };

export default function FocusModeView({
  events,
  onClose,
}: {
  events: CalEvent[];
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const sorted = [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 bg-white dark:bg-zinc-950 flex flex-col"
    >
      <div className="border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Today — Focus
        </h1>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
        >
          Exit Focus
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {sorted.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400 text-center py-12">
            No events today.
          </p>
        ) : (
          <ul className="space-y-3 max-w-xl mx-auto">
            {sorted.map((ev, i) => (
              <motion.li
                key={ev.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50"
              >
                <span className="text-zinc-500 dark:text-zinc-400 text-sm shrink-0 w-20">
                  {new Date(ev.start).toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100 flex-1">
                  {ev.title}
                </span>
                <span className="text-zinc-500 dark:text-zinc-400 text-sm shrink-0">
                  {new Date(ev.end).toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}
