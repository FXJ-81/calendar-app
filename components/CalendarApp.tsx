"use client";

import { useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, Views, type Event as RBCEvent } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { format } from "date-fns/format";
import { parse } from "date-fns/parse";
import { startOfWeek } from "date-fns/startOfWeek";
import { getDay } from "date-fns/getDay";
import { enUS } from "date-fns/locale/en-US";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 0 }),
  getDay,
  locales,
});

type CalEvent = RBCEvent & {
  id: string;
  title: string;
  start: Date;
  end: Date;
};

function toInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function CalendarApp() {
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const now = new Date();
  const [title, setTitle] = useState("");
  const [startStr, setStartStr] = useState(toInputValue(now));
  const [endStr, setEndStr] = useState(toInputValue(new Date(now.getTime() + 60 * 60 * 1000)));

  const defaultDate = useMemo(() => new Date(), []);

  function openModal() {
    const n = new Date();
    setTitle("");
    setStartStr(toInputValue(n));
    setEndStr(toInputValue(new Date(n.getTime() + 60 * 60 * 1000)));
    setIsOpen(true);
  }

  function saveEvent() {
    const start = new Date(startStr);
    const end = new Date(endStr);

    if (!title.trim()) return alert("Title is required.");
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return alert("Invalid date/time.");
    if (end <= start) return alert("End time must be after start time.");

    const newEvent: CalEvent = {
      id: crypto.randomUUID(),
      title: title.trim(),
      start,
      end,
      allDay: false,
    };

    setEvents((prev) => [...prev, newEvent]);
    setIsOpen(false);
  }

  function onSelectEvent(ev: CalEvent) {
    if (!confirm(`Delete "${ev.title}"?`)) return;
    setEvents((prev) => prev.filter((e) => e.id !== ev.id));
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
  <div className="w-full">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Simple Calendar</h1>
            <p className="text-sm text-zinc-400">Add tasks with start/end time. Click an event to delete.</p>
          </div>

          <button
            onClick={openModal}
            className="rounded-xl bg-zinc-100 text-zinc-900 px-4 py-2 font-medium hover:opacity-90"
          >
            New Event
          </button>
        </div>

        <div className="rounded-2xl bg-zinc-900 p-3 shadow">
          <div className="h-[75vh] rounded-xl bg-white text-black p-2">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              defaultView={Views.MONTH}
              views={[Views.MONTH, Views.WEEK, Views.DAY]}
              defaultDate={defaultDate}
              onSelectEvent={(event: CalEvent) => onSelectEvent(event)}
              popup
            />
          </div>
        </div>

        {isOpen && (
          <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4"
            onClick={() => {
              setTitle("");
              setStartStr(toInputValue(new Date()));
              setEndStr(toInputValue(new Date(Date.now() + 60 * 60 * 1000)));
              setIsOpen(false);
            }}
          >
            <div
              className="w-full max-w-md rounded-2xl bg-zinc-900 p-5 shadow-xl border border-zinc-800"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold mb-4">New Event</h2>

              <label className="block text-sm text-zinc-300 mb-1">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 mb-4"
                placeholder="e.g., Study, Gym, Meeting"
              />

              <label className="block text-sm text-zinc-300 mb-1">Start</label>
              <input
                type="datetime-local"
                value={startStr}
                onChange={(e) => setStartStr(e.target.value)}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 mb-4"
              />

              <label className="block text-sm text-zinc-300 mb-1">End</label>
              <input
                type="datetime-local"
                value={endStr}
                onChange={(e) => setEndStr(e.target.value)}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 mb-5"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setTitle("");
                    setStartStr(toInputValue(new Date()));
                    setEndStr(toInputValue(new Date(Date.now() + 60 * 60 * 1000)));
                    setIsOpen(false);
                  }}
                  className="rounded-xl border border-zinc-700 px-4 py-2 hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEvent}
                  className="rounded-xl bg-zinc-100 text-zinc-900 px-4 py-2 font-medium hover:opacity-90"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}