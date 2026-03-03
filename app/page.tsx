"use client";

import { useState } from "react";
import CalendarApp from "@/components/CalendarApp";
import TopBar from "@/components/TopBar";
import SideBar from "@/components/SideBar";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<"day" | "week" | "month" | "agenda">("day");

  return (
    <main className="min-h-screen flex bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Left sidebar */}
      <aside className="hidden md:flex w-72 border-r border-zinc-200 dark:border-zinc-800 p-3">
        <SideBar
          selectedDate={selectedDate}
          onSelectDate={(d) => d && setSelectedDate(d)}
          onGoToday={() => setSelectedDate(new Date())}
        />
      </aside>

      {/* Main area */}
      <section className="flex-1 flex flex-col">
        <TopBar
          selectedDate={selectedDate}
          view={view}
          setView={setView}
          onPrev={() => setSelectedDate(addDays(selectedDate, view, -1))}
          onNext={() => setSelectedDate(addDays(selectedDate, view, +1))}
          onToday={() => setSelectedDate(new Date())}
        />

        <div className="flex-1 p-3">
          <CalendarApp
            date={selectedDate}
            view={view}
            onNavigate={setSelectedDate}
            onView={setView}
          />
        </div>
      </section>
    </main>
  );
}

function addDays(date: Date, view: string, dir: number) {
  const d = new Date(date);
  if (view === "month") {
    d.setMonth(d.getMonth() + dir);
    return d;
  }
  if (view === "week") {
    d.setDate(d.getDate() + 7 * dir);
    return d;
  }
  // day/agenda
  d.setDate(d.getDate() + dir);
  return d;
}
