"use client";

import { useState, useEffect } from "react";
import CalendarApp from "@/components/CalendarApp";
import TopBar from "@/components/TopBar";
import SideBar from "@/components/SideBar";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<"day" | "week" | "month" | "agenda">("day");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close mobile sidebar when resizing to desktop
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const close = () => setSidebarOpen(false);
    mq.addEventListener("change", close);
    return () => mq.removeEventListener("change", close);
  }, []);

  return (
    <main className="min-h-screen flex bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Left sidebar — desktop */}
      <aside className="hidden md:flex w-72 border-r border-zinc-200 dark:border-zinc-800 p-3">
        <SideBar
          selectedDate={selectedDate}
          onSelectDate={(d) => d && setSelectedDate(d)}
          onGoToday={() => setSelectedDate(new Date())}
        />
      </aside>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className="fixed top-0 left-0 bottom-0 w-[min(280px,85vw)] border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 z-50 md:hidden overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold">Calendar</span>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-2 -m-2 rounded-lg touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close calendar"
              >
                ✕
              </button>
            </div>
            <SideBar
              selectedDate={selectedDate}
              onSelectDate={(d) => {
                if (d) setSelectedDate(d);
                setSidebarOpen(false);
              }}
              onGoToday={() => setSelectedDate(new Date())}
            />
          </aside>
        </>
      )}

      {/* Main area */}
      <section className="flex-1 flex flex-col min-w-0">
        <TopBar
          selectedDate={selectedDate}
          view={view}
          setView={setView}
          onPrev={() => setSelectedDate(addDays(selectedDate, view, -1))}
          onNext={() => setSelectedDate(addDays(selectedDate, view, +1))}
          onToday={() => setSelectedDate(new Date())}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <div className="flex-1 p-2 sm:p-3 min-h-0">
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
