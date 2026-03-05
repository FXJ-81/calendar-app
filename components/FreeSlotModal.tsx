"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { FreeSlot } from "@/lib/calendarUtils";
import { format } from "date-fns";

export default function FreeSlotModal({
  open,
  onClose,
  slots,
  durationMinutes,
  onDurationChange,
  onSelectSlot,
}: {
  open: boolean;
  onClose: () => void;
  slots: FreeSlot[];
  durationMinutes: 30 | 60 | 90;
  onDurationChange: (d: 30 | 60 | 90) => void;
  onSelectSlot: (start: Date, end: Date) => void;
}) {
  return (
    <AnimatePresence>
      {open && (
      <motion.div
        key="free-slot-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60"
          onClick={onClose}
          aria-hidden="true"
        />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: "tween", duration: 0.2 }}
          className="relative w-full max-w-md max-h-[70vh] overflow-hidden rounded-t-2xl sm:rounded-xl bg-white border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 shadow-xl"
        >
          <div className="sticky top-0 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Find Free Time
            </h2>
            <div className="flex gap-1">
              {([30, 60, 90] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => onDurationChange(m)}
                  className={`px-2.5 py-1.5 rounded text-sm ${
                    durationMinutes === m
                      ? "bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="overflow-y-auto max-h-[calc(70vh-56px)] p-4">
            {slots.length === 0 ? (
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                No free {durationMinutes}-min slots this week.
              </p>
            ) : (
              <ul className="space-y-2">
                {slots.slice(0, 50).map((slot, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectSlot(slot.start, slot.end);
                        onClose();
                      }}
                      className="w-full text-left px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                    >
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {format(slot.start, "EEE, MMM d")}
                      </span>
                      <span className="block text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
                        {format(slot.start, "h:mm a")} – {format(slot.end, "h:mm a")}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {slots.length > 50 && (
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2">
                Showing first 50 of {slots.length} slots.
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}
