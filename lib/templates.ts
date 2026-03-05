const STORAGE_KEY = "veya_templates";

export type EventTemplate = {
  id: string;
  title: string;
  durationMinutes: number;
  color?: string;
};

export function getTemplates(): EventTemplate[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTemplates(templates: EventTemplate[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch {}
}

export function addTemplate(t: Omit<EventTemplate, "id">): EventTemplate {
  const templates = getTemplates();
  const id = "tpl_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
  const newT = { ...t, id };
  saveTemplates([...templates, newT]);
  return newT;
}

export function removeTemplate(id: string): void {
  saveTemplates(getTemplates().filter((t) => t.id !== id));
}
