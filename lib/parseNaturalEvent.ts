/**
 * Parse natural language event input.
 * Examples: "dentist Friday at 2pm for 1 hour", "Meeting tomorrow at 10am for 30 min"
 * Falls back to regex if OpenAI is not configured.
 */

export type ParsedEvent = {
  title: string;
  start: Date;
  end: Date;
};

const DAY_NAMES =
  "sunday|monday|tuesday|wednesday|thursday|friday|saturday";
const DAY_REG = new RegExp(
  `\\b(next\\s+)?(${DAY_NAMES})\\b`,
  "gi"
);
const TIME_REG =
  /(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?|(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i;
const DURATION_REG =
  /(?:for|duration)\s*(\d+)\s*(hour|hr|h|minute|min|m)s?|(\d+)\s*(?:hour|hr|h|minute|min|m)s?/i;

function getDayOffset(dayName: string, next: boolean, ref: Date): number {
  const today = ref.getDay();
  const target = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].indexOf(
    dayName.toLowerCase()
  );
  let offset = (target - today + 7) % 7;
  if (next) offset += 7;
  return offset;
}

function parseTime(
  match: RegExpMatchArray,
  ref: Date
): { hours: number; minutes: number } {
  const parts = match;
  let h = parseInt(parts[1] || parts[4] || "0", 10);
  const m = parseInt(parts[2] || parts[5] || "0", 10) || 0;
  const ampm = (parts[3] || parts[6] || "").toLowerCase();
  if (ampm === "pm" && h < 12) h += 12;
  if (ampm === "am" && h === 12) h = 0;
  if (!ampm && h <= 12) {
    // assume am if small
  }
  return { hours: h, minutes: m };
}

function parseDurationMinutes(match: RegExpMatchArray): number {
  const num = parseInt(match[1] || match[3] || "1", 10);
  const unit = (match[2] || match[4] || "hour").toLowerCase();
  if (unit.startsWith("h")) return num * 60;
  return num;
}

/**
 * Regex-based parser. Uses ref date for "today", "tomorrow", and weekday names.
 */
export function parseNaturalLanguage(
  input: string,
  ref: Date = new Date()
): ParsedEvent | null {
  const raw = input.trim();
  if (!raw.length) return null;

  let title = raw;
  let dayOffset = 0;
  let hours = ref.getHours();
  let minutes = ref.getMinutes();
  let durationMinutes = 60;

  // Tomorrow
  const tomorrowMatch = raw.match(/\btomorrow\b/i);
  if (tomorrowMatch) {
    dayOffset = 1;
    title = title.replace(/\btomorrow\b/gi, "").trim();
  }

  // Today
  const todayMatch = raw.match(/\btoday\b/i);
  if (todayMatch) {
    dayOffset = 0;
    title = title.replace(/\btoday\b/gi, "").trim();
  }

  // Weekday: "Friday" or "next Friday"
  const dayMatch = raw.match(DAY_REG);
  if (dayMatch) {
    const next = /next\s+/i.test(dayMatch[0]);
    const dayName = dayMatch[0].replace(/next\s+/gi, "").trim();
    dayOffset = getDayOffset(dayName, next, ref);
    title = title.replace(DAY_REG, "").replace(/\s+/g, " ").trim();
  }

  // Time: "at 2pm" or "2:30pm" or "14:00"
  const timeMatch = raw.match(TIME_REG);
  if (timeMatch) {
    const t = parseTime(timeMatch, ref);
    hours = t.hours;
    minutes = t.minutes;
    title = title.replace(TIME_REG, "").replace(/\s+/g, " ").trim();
  }

  // Duration: "for 1 hour" or "30 min"
  const durMatch = raw.match(DURATION_REG);
  if (durMatch) {
    durationMinutes = parseDurationMinutes(durMatch);
    title = title.replace(DURATION_REG, "").replace(/\s+/g, " ").trim();
  }

  // Clean title: trim "at", "for", extra commas
  title = title.replace(/\b(at|for)\b/gi, "").replace(/,+/g, " ").trim();
  if (!title.length) title = "Untitled";

  const start = new Date(ref);
  start.setDate(start.getDate() + dayOffset);
  start.setHours(hours, minutes, 0, 0);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

  return { title, start, end };
}

/**
 * Optional: call OpenAI to parse. Set NEXT_PUBLIC_OPENAI_API_KEY to enable.
 * Returns same shape; falls back to regex on error or missing key.
 */
export async function parseWithAI(
  input: string,
  ref: Date = new Date()
): Promise<ParsedEvent | null> {
  const key =
    typeof process !== "undefined"
      ? (process.env.NEXT_PUBLIC_OPENAI_API_KEY as string)
      : "";
  if (!key?.trim()) return parseNaturalLanguage(input, ref);

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You parse event descriptions into JSON. Today's date is ${ref.toISOString().slice(0, 10)}. Respond with only a JSON object: { "title": string, "start": ISO datetime string, "end": ISO datetime string }. Use the user's timezone for times.`,
          },
          { role: "user", content: input },
        ],
        max_tokens: 200,
      }),
    });
    if (!res.ok) return parseNaturalLanguage(input, ref);
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) return parseNaturalLanguage(input, ref);
    const parsed = JSON.parse(text.replace(/^```\w*\n?|\n?```$/g, ""));
    return {
      title: parsed.title || "Untitled",
      start: new Date(parsed.start),
      end: new Date(parsed.end),
    };
  } catch {
    return parseNaturalLanguage(input, ref);
  }
}
