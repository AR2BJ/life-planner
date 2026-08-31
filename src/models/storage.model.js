import { formatDate } from "@/utils/helpers.js";

export const STORAGE_KEY = "plan_manager";
export const STORAGE_VERSION = 1;

function normalizeTag(tag) {
  if (typeof tag === "string") {
    return { id: crypto.randomUUID(), name: tag.trim() };
  }
  return {
    id: String(tag.id || crypto.randomUUID()),
    name: String(tag.name || tag.title || "").trim(),
  };
}

function normalizePlan(plan) {
  return {
    id: String(plan.id || crypto.randomUUID()),
    title: plan.title || "Untitled Plan",
    description: plan.description || "",
    status: plan.status || "todo",
    priority: plan.priority || "low",
    dueDate: plan.dueDate || null,
    createdAt: plan.createdAt || formatDate(new Date()),
    updatedAt: plan.updatedAt || formatDate(new Date()) || null,
    completedAt: plan.completedAt || null,
    estimatedMinutes: Number(plan.estimatedMinutes) || 0,
    archived: Boolean(plan.archived),
    tags: Array.isArray(plan.tags)
      ? plan.tags.map((t) => (typeof t === "object" ? t.id : String(t)))
      : [],
    subplans: Array.isArray(plan.subplans)
      ? plan.subplans.map((st) => ({
          id: String(st.id || crypto.randomUUID()),
          title: st.title || "",
          completed: Boolean(st.completed),
          createdAt: st.createdAt || plan.createdAt || formatDate(new Date()),
          updatedAt:
            st.updatedAt || plan.createdAt || formatDate(new Date()) || null,
        }))
      : [],
  };
}

function migrateData(data) {
  const plans = Array.isArray(data.plans) ? data.plans : [];
  const tags = Array.isArray(data.tags) ? data.tags : [];

  return {
    version: STORAGE_VERSION,
    tags: tags.map(normalizeTag),
    plans: plans.map(normalizePlan),
  };
}

export function saveToStorage(data) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        tags: data.tags || [],
        plans: data.plans || [],
      }),
    );
  } catch (error) {
    console.error("Failed to save data to localStorage:", error);
  }
}

export function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw);
    return migrateData(data);
  } catch (error) {
    console.error("Failed to load data from localStorage:", error);
    return null;
  }
}
