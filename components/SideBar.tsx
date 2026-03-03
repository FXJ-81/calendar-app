"use client";

import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import "./SideBarDayPicker.css";

export default function SideBar({
  selectedDate,
  onSelectDate,
  onGoToday,
}: {
  selectedDate: Date;
  onSelectDate: (d: Date | undefined) => void;
  onGoToday: () => void;
}) {
  return (
    <div className="w-full">
      <button
        className="w-full mb-3 px-3 py-2 rounded bg-zinc-900 text-zinc-100 border border-zinc-700
                   dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-200"
        onClick={onGoToday}
      >
        Today
      </button>

      <div className="sidebar-rdp rounded-xl border border-zinc-200 dark:border-zinc-800 p-2 bg-white dark:bg-zinc-950">
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={onSelectDate}
          showOutsideDays
        />
      </div>
    </div>
  );
}

