"use client";

import SettingsMenu from "@/components/SettingsMenu";

export default function TopBar({
  selectedDate,
  view,
  setView,
  onPrev,
  onNext,
  onToday,
  onOpenSidebar,
  focusMode,
  onFocusModeToggle,
}: {
  selectedDate: Date;
  view: "day" | "week" | "month" | "agenda";
  setView: (v: "day" | "week" | "month" | "agenda") => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onOpenSidebar?: () => void;
  focusMode?: boolean;
  onFocusModeToggle?: () => void;
}) {
  const dayNum = selectedDate.getDate();
  const weekday = selectedDate.toLocaleDateString(undefined, { weekday: "short" });
  const title = selectedDate.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const titleShort = selectedDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur pt-[env(safe-area-inset-top)]">
      <div className="px-2 sm:px-3 py-2 flex flex-wrap items-center justify-between gap-2">
        {/* Left: menu (mobile) + date + nav */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {onOpenSidebar && (
            <button
              type="button"
              onClick={onOpenSidebar}
              className="md:hidden p-2 -ml-1 rounded-lg touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center border border-zinc-200 dark:border-zinc-800"
              aria-label="Open calendar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-full border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center">
              <div className="text-[9px] sm:text-[10px] uppercase opacity-70 leading-none">{weekday}</div>
              <div className="text-sm sm:text-base font-semibold leading-none">{dayNum}</div>
            </div>
            <div className="truncate font-semibold text-sm sm:text-base">
              <span className="sm:hidden">{titleShort}</span>
              <span className="hidden sm:inline">{title}</span>
            </div>
          </div>
          <button
            type="button"
            className="shrink-0 px-3 py-2 rounded border border-zinc-200 dark:border-zinc-800 touch-manipulation min-h-[44px]"
            onClick={onToday}
          >
            Today
          </button>
          <button
            type="button"
            className="shrink-0 p-2 rounded border border-zinc-200 dark:border-zinc-800 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={onPrev}
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            type="button"
            className="shrink-0 p-2 rounded border border-zinc-200 dark:border-zinc-800 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={onNext}
            aria-label="Next"
          >
            ›
          </button>
        </div>

        {/* Right: focus mode + view picker + settings */}
        <div className="flex items-center gap-2 shrink-0">
          {onFocusModeToggle && (
            <button
              type="button"
              onClick={onFocusModeToggle}
              className={`px-3 py-2 rounded border touch-manipulation min-h-[44px] text-sm ${
                focusMode
                  ? "bg-zinc-800 text-white border-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              Focus
            </button>
          )}
          <select
            className="px-3 py-2 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 touch-manipulation min-h-[44px] text-base"
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

