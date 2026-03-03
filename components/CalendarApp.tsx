"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";

const locales = { "en-US": enUS };
const DnDCalendar = withDragAndDrop<CalEvent>(Calendar);
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

type DbEvent = {
  id: string;
  user_id: string;
  title: string;
  start_time: string; // ISO
  end_time: string;   // ISO
  color?: string | null;
};

type CalEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string | null;
};

const EVENT_COLORS = [
  { id: "red", name: "Red", hex: "#dc2626" },
  { id: "orange", name: "Orange", hex: "#ea580c" },
  { id: "amber", name: "Amber", hex: "#d97706" },
  { id: "green", name: "Green", hex: "#16a34a" },
  { id: "teal", name: "Teal", hex: "#0d9488" },
  { id: "blue", name: "Blue", hex: "#2563eb" },
  { id: "indigo", name: "Indigo", hex: "#4f46e5" },
  { id: "purple", name: "Purple", hex: "#7c3aed" },
  { id: "pink", name: "Pink", hex: "#db2777" },
  { id: "slate", name: "Slate", hex: "#475569" },
] as const;

const DEFAULT_COLOR = "blue";

export default function CalendarApp({
  date,
  view,
  onNavigate,
  onView,
}: {
  date: Date;
  view: "day" | "week" | "month" | "agenda";
  onNavigate: (d: Date) => void;
  onView: (v: any) => void;
}) {
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftStart, setDraftStart] = useState<Date | null>(null);
  const [draftEnd, setDraftEnd] = useState<Date | null>(null);
  const [draftColor, setDraftColor] = useState<string>(DEFAULT_COLOR);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Load session + subscribe to auth changes
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUserId(data.session?.user.id ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    async function fetchEvents() {
      const { data: userData } = await supabase.auth.getUser();

      const uid = userData.user?.id;
      if (!uid) {
        setEvents([]);
        return;
      }

      const { data, error } = await supabase
        .from("events")
        .select("id,title,start_time,end_time,color")
        .eq("user_id", uid)
        .order("start_time", { ascending: true });

      if (error) {
        console.error(error);
        return;
      }

      setEvents(
        (data ?? []).map((e: any) => ({
          id: e.id,
          title: e.title,
          start: new Date(e.start_time),
          end: new Date(e.end_time),
          color: e.color ?? null,
        }))
      );
    }

    fetchEvents();
  }, []);

  async function addEvent(title: string, start: Date, end: Date, color?: string) {
    if (!userId) {
      alert("Please sign in first.");
      return;
    }

    const { data, error } = await supabase
      .from("events")
      .insert([
        {
          user_id: userId,
          title,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          color: color ?? DEFAULT_COLOR,
        },
      ])
      .select("id,user_id,title,start_time,end_time,color")
      .single();

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    const e = data as DbEvent;
    setEvents((prev) => [
      ...prev,
      {
        id: e.id,
        title: e.title,
        start: new Date(e.start_time),
        end: new Date(e.end_time),
        color: e.color ?? null,
      },
    ]);
  }

  async function deleteEvent(eventId: string) {
    if (!userId) return;

    const { error } = await supabase.from("events").delete().eq("id", eventId);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  }

  function onSelectSlot(slotInfo: { start: Date; end: Date }) {
    setEditingId(null);
    setDraftTitle("");
    setDraftStart(slotInfo.start);
    setDraftEnd(slotInfo.end);
    setDraftColor(DEFAULT_COLOR);
    setShowModal(true);
  }

  function onSelectEvent(event: { id: string; title: string; start: Date; end: Date; color?: string | null }) {
    setEditingId(event.id);
    setDraftTitle(event.title);
    setDraftStart(event.start);
    setDraftEnd(event.end);
    setDraftColor((event as any).color ?? DEFAULT_COLOR);
    setShowModal(true);
  }

  async function saveDraft() {
    if (!draftTitle || !draftStart || !draftEnd) return;

    if (editingId) {
      const { error } = await supabase
        .from("events")
        .update({
          title: draftTitle,
          start_time: draftStart.toISOString(),
          end_time: draftEnd.toISOString(),
          color: draftColor,
        })
        .eq("id", editingId);

      if (error) {
        alert(error.message);
        return;
      }

      setEvents((prev) =>
        prev.map((e) =>
          e.id === editingId
            ? { ...e, title: draftTitle, start: draftStart, end: draftEnd, color: draftColor }
            : e
        )
      );
      closeModal();
      return;
    }

    await addEvent(draftTitle, draftStart, draftEnd, draftColor);
    closeModal();
  }

  function closeModal() {
    setShowModal(false);
    setEditingId(null);
  }

  const canUseCalendar = !!userId;

  return (
    <div className="w-full">
      {!canUseCalendar && (
        <div className="mb-3 text-sm text-zinc-800 dark:text-zinc-300">
          Sign in to create/save events. (You can still view the empty calendar.)
        </div>
      )}

      <div className="mb-3 flex items-center justify-end">
        <button
          className="px-3 py-2 rounded bg-zinc-100 text-zinc-900"
          onClick={() => {
            const now = new Date();
            const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);
            setEditingId(null);
            setDraftTitle("");
            setDraftStart(now);
            setDraftEnd(inOneHour);
            setDraftColor(DEFAULT_COLOR);
            setShowModal(true);
          }}
        >
          New Event
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="w-full max-w-md rounded-xl bg-white border border-zinc-200 p-4 dark:bg-zinc-950 dark:border-zinc-800">
            <div className="text-lg font-semibold mb-3 text-zinc-900 dark:text-zinc-100">
              {editingId ? "Edit Event" : "New Event"}
            </div>

            <label className="text-sm text-zinc-700 dark:text-zinc-300">Title</label>
            <input
              className="mt-1 w-full px-3 py-2 rounded bg-white text-zinc-900 border border-zinc-300 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              placeholder="e.g. Study session"
              autoFocus
            />

            <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
              {draftStart?.toLocaleString()} → {draftEnd?.toLocaleString()}
            </div>

            <label className="mt-3 block text-sm text-zinc-700 dark:text-zinc-300">Color</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {EVENT_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setDraftColor(c.id)}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 transition-shadow ${
                    draftColor === c.id
                      ? "border-zinc-900 dark:border-white ring-2 ring-offset-2 ring-zinc-500 dark:ring-zinc-400"
                      : "border-transparent hover:ring-2 hover:ring-offset-2 hover:ring-zinc-300 dark:hover:ring-zinc-600"
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                >
                  {draftColor === c.id && (
                    <svg className="w-5 h-5 text-white drop-shadow-[0_0_1px_rgba(0,0,0,0.8)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              {editingId && (
                <button
                  className="px-3 py-2 rounded border border-zinc-300 text-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                  onClick={async () => {
                    await deleteEvent(editingId);
                    closeModal();
                  }}
                >
                  Delete
                </button>
              )}
              <button
                className="px-3 py-2 rounded border border-zinc-300 text-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="px-3 py-2 rounded bg-zinc-800 text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
                onClick={saveDraft}
                disabled={!draftTitle}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="h-[calc(100vh-70px)] w-full">
        <DnDCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          date={date}
          view={view}
          onNavigate={onNavigate}
          onView={onView}
          defaultView="day"
          step={60}
          timeslots={1}
          selectable
          onSelectSlot={onSelectSlot}
          onSelectEvent={onSelectEvent}
          resizable
          dayPropGetter={(date) => {
            const today = new Date();
            const isToday =
              date.getFullYear() === today.getFullYear() &&
              date.getMonth() === today.getMonth() &&
              date.getDate() === today.getDate();

            return isToday
              ? {
                  className: "bg-zinc-50 dark:bg-zinc-900/40",
                }
              : {};
          }}
          eventPropGetter={(event: any) => {
            const hex =
              EVENT_COLORS.find((c) => c.id === (event.color || DEFAULT_COLOR))?.hex ??
              EVENT_COLORS[0].hex;

            return {
              style: {
                backgroundColor: hex,
                border: "none",
                borderRadius: "10px",
                color: "white",
                padding: "2px 6px",
              },
            };
          }}
          onEventDrop={async ({ event, start, end }: any) => {
            const { error } = await supabase
              .from("events")
              .update({ start_time: start.toISOString(), end_time: end.toISOString() })
              .eq("id", event.id);

            if (error) return alert(error.message);

            setEvents((prev) =>
              prev.map((e) => (e.id === event.id ? { ...e, start, end } : e))
            );
          }}
          onEventResize={async ({ event, start, end }: any) => {
            const { error } = await supabase
              .from("events")
              .update({ start_time: start.toISOString(), end_time: end.toISOString() })
              .eq("id", event.id);

            if (error) return alert(error.message);

            setEvents((prev) =>
              prev.map((e) => (e.id === event.id ? { ...e, start, end } : e))
            );
          }}
        />
      </div>
    </div>
  );
}