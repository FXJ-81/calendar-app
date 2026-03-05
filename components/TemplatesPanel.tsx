"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getTemplates, removeTemplate, type EventTemplate } from "@/lib/templates";

const EVENT_COLORS = [
  { id: "blue", name: "Blue", hex: "#2563eb" },
  { id: "green", name: "Green", hex: "#16a34a" },
  { id: "amber", name: "Amber", hex: "#d97706" },
  { id: "red", name: "Red", hex: "#dc2626" },
  { id: "purple", name: "Purple", hex: "#7c3aed" },
  { id: "slate", name: "Slate", hex: "#475569" },
] as const;

export default function TemplatesPanel({
  selectedDate,
  onAddToDay,
}: {
  selectedDate: Date;
  onAddToDay: (template: EventTemplate) => void;
}) {
  const [templates, setTemplates] = useState<EventTemplate[]>([]);

  useEffect(() => {
    setTemplates(getTemplates());
  }, []);

  const handleRemove = (id: string) => {
    removeTemplate(id);
    setTemplates(getTemplates());
  };

  const handleAddToDay = (t: EventTemplate) => {
    onAddToDay(t);
  };

  return (
    <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
        Templates
      </h3>
      {templates.length === 0 ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Save an event as a template from the event modal to add it here.
        </p>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence>
            {templates.map((t) => (
              <motion.li
                key={t.id}
                layout
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="flex items-center gap-2 group"
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0 border border-zinc-300 dark:border-zinc-600"
                  style={{
                    backgroundColor:
                      EVENT_COLORS.find((c) => c.id === t.color)?.hex ?? "#2563eb",
                  }}
                />
                <span className="flex-1 min-w-0 truncate text-sm text-zinc-800 dark:text-zinc-200">
                  {t.title}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
                  {t.durationMinutes}m
                </span>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleAddToDay(t)}
                    className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 text-xs"
                    title={`Add to ${selectedDate.toLocaleDateString()}`}
                  >
                    + Day
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(t.id)}
                    className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-zinc-500 dark:text-zinc-400 text-xs"
                    title="Remove template"
                  >
                    ✕
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}

export { type EventTemplate };
