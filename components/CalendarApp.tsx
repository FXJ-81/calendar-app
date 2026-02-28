"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// If you're using react-big-calendar:
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";

const locales = { "en-US": enUS };
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
};

type CalEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
};

export default function CalendarApp() {
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftStart, setDraftStart] = useState<Date | null>(null);
  const [draftEnd, setDraftEnd] = useState<Date | null>(null);
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
        .select("id,title,start_time,end_time")
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
        }))
      );
    }

    fetchEvents();
  }, []);

  async function addEvent(title: string, start: Date, end: Date) {
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
        },
      ])
      .select("id,user_id,title,start_time,end_time")
      .single();

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    const e = data as DbEvent;
    setEvents((prev) => [
      ...prev,
      { id: e.id, title: e.title, start: new Date(e.start_time), end: new Date(e.end_time) },
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
    setShowModal(true);
  }

  function onSelectEvent(event: { id: string; title: string; start: Date; end: Date }) {
    setEditingId(event.id);
    setDraftTitle(event.title);
    setDraftStart(event.start);
    setDraftEnd(event.end);
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
        })
        .eq("id", editingId);

      if (error) {
        alert(error.message);
        return;
      }

      setEvents((prev) =>
        prev.map((e) =>
          e.id === editingId
            ? { ...e, title: draftTitle, start: draftStart, end: draftEnd }
            : e
        )
      );
      closeModal();
      return;
    }

    await addEvent(draftTitle, draftStart, draftEnd);
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
        <div className="mb-3 text-sm text-zinc-300">
          Sign in to create/save events. (You can still view the empty calendar.)
        </div>
      )}

      {loading ? (
        <div className="text-sm text-zinc-300">Loading events...</div>
      ) : null}

      <div className="mb-3 flex items-center justify-between">
        <div className="text-lg font-semibold">Calendar</div>

        <button
          className="px-3 py-2 rounded bg-zinc-100 text-zinc-900"
          onClick={() => {
            const now = new Date();
            const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);
            setEditingId(null);
            setDraftTitle("");
            setDraftStart(now);
            setDraftEnd(inOneHour);
            setShowModal(true);
          }}
        >
          New Event
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="w-full max-w-md rounded-xl bg-zinc-950 border border-zinc-800 p-4">
            <div className="text-lg font-semibold mb-3">{editingId ? "Edit Event" : "New Event"}</div>

            <label className="text-sm text-zinc-300">Title</label>
            <input
              className="mt-1 w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              placeholder="e.g. Study session"
              autoFocus
            />

            <div className="mt-3 text-sm text-zinc-300">
              {draftStart?.toLocaleString()} → {draftEnd?.toLocaleString()}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              {editingId && (
                <button
                  className="px-3 py-2 rounded border border-zinc-700 text-zinc-100"
                  onClick={async () => {
                    await deleteEvent(editingId);
                    closeModal();
                  }}
                >
                  Delete
                </button>
              )}
              <button
                className="px-3 py-2 rounded border border-zinc-700"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="px-3 py-2 rounded bg-zinc-100 text-zinc-900 disabled:opacity-50"
                onClick={saveDraft}
                disabled={!draftTitle}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="h-[75vh] w-full">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable
          onSelectSlot={onSelectSlot}
          onSelectEvent={onSelectEvent}
        />
      </div>
    </div>
  );
}