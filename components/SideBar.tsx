"use client";

import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import "./SideBarDayPicker.css";
import TemplatesPanel from "@/components/TemplatesPanel";
import type { EventTemplate } from "@/lib/templates";

export default function SideBar({
  selectedDate,
  onSelectDate,
  onAddTemplateToDay,
}: {
  selectedDate: Date;
  onSelectDate: (d: Date | undefined) => void;
  onGoToday?: () => void;
  onAddTemplateToDay?: (template: EventTemplate) => void;
}) {
  const [templatesKey, setTemplatesKey] = useState(0);

  useEffect(() => {
    const handler = () => setTemplatesKey((k) => k + 1);
    window.addEventListener("veya-templates-updated", handler);
    return () => window.removeEventListener("veya-templates-updated", handler);
  }, []);

  return (
    <div className="w-full flex flex-col min-h-0">
      <div
        className="w-full mb-3 min-h-[3rem] flex items-center justify-center rounded bg-zinc-900 text-zinc-100 border border-zinc-700
                   dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-200 text-center font-medium italic text-[2rem] leading-none shrink-0"
      >
        VEYA
      </div>

      <div className="sidebar-rdp rounded-xl border border-zinc-200 dark:border-zinc-800 p-2 bg-white dark:bg-zinc-950 shrink-0">
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={onSelectDate}
          showOutsideDays
        />
      </div>

      {onAddTemplateToDay && (
        <div key={templatesKey} className="flex-1 min-h-0 overflow-auto">
          <TemplatesPanel
            selectedDate={selectedDate}
            onAddToDay={onAddTemplateToDay}
          />
        </div>
      )}
    </div>
  );
}

