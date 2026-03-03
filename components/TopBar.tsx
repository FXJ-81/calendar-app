"use client";

import SettingsMenu from "@/components/SettingsMenu";

export default function TopBar({
  selectedDate,
  view,
  setView,
  onPrev,
  onNext,
  onToday,
}: {
  selectedDate: Date;
  view: "day" | "week" | "month" | "agenda";
  setView: (v: "day" | "week" | "month" | "agenda") => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}) {
  const dayNum = selectedDate.getDate();
  const weekday = selectedDate.toLocaleDateString(undefined, { weekday: "short" });
  const title = selectedDate.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white/85 dark:bg-zinc-950/85 backdrop-blur">
      <div className="px-3 py-2 flex items-center justify-between gap-3">
        {/* Left: date circle + title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-11 h-11 rounded-full border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center">
              <div className="text-[10px] uppercase opacity-70 leading-none">{weekday}</div>
              <div className="text-base font-semibold leading-none">{dayNum}</div>
            </div>

            <div className="truncate font-semibold">{title}</div>
          </div>

          <button
            className="ml-2 px-3 py-2 rounded border border-zinc-200 dark:border-zinc-800"
            onClick={onToday}
          >
            Today
          </button>

          <button
            className="px-3 py-2 rounded border border-zinc-200 dark:border-zinc-800"
            onClick={onPrev}
          >
            ‹
          </button>
          <button
            className="px-3 py-2 rounded border border-zinc-200 dark:border-zinc-800"
            onClick={onNext}
          >
            ›
          </button>
        </div>

        {/* Right: view picker + settings (theme + account) */}
        <div className="flex items-center gap-2">
          <select
            className="px-3 py-2 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
            value={view}
            onChange={(e) => setView(e.target.value as any)}
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="agenda">Agenda</option>
          </select>

          <SettingsMenu />
        </div>
      </div>
    </header>
  );
}

