import { generateId, todayISO } from "@/utils/helpers.js";

export const STORAGE_KEY = "life_planner";
export const STORAGE_VERSION = 1;

export function normalizePlan(data = {}) {
  return {
    id: String(data.id || generateId()),
    title: data.title || "Untitled Plan",
    description: data.description || "",
    lifeAreaId: data.lifeAreaId ? String(data.lifeAreaId) : "health",
    state: data.state || "active",
    period: {
      startDate: data.period?.startDate || todayISO(),
      endDate: data.period?.endDate || null,
    },
    objectives: Array.isArray(data.objectives)
      ? data.objectives.map((obj) => ({
          id: String(obj.id || generateId()),
          title: obj.title || "Untitled Objective",
          type: obj.type ? String(obj.type) : "boolean", // "boolean" | "numeric" | "milestone"
          targetValue: Number(obj.targetValue) || 1,
          currentValue: Number(obj.currentValue) || 0,
          unit: obj.unit ? String(obj.unit) : "step",
          completed: Boolean(obj.completed),
        }))
      : [],
    createdAt: data.createdAt || todayISO(),
    updatedAt: data.updatedAt || todayISO(),
  };
}

export function normalizeLog(data = {}) {
  return {
    id: String(data.id || generateId()),
    title: data.title || "Untitled Log",
    description: data.description || "",
    date: data.date || todayISO(),
    planId: data.planId ? String(data.planId) : null,
    energy: Number(data.energy) || 3,
    mood: data.mood || "stable",
    metrics: data.metrics || {},
    createdAt: data.createdAt || todayISO(),
    updatedAt: data.updatedAt || todayISO(),
  };
}

export function normalizeTemplate(data = {}) {
  return {
    id: String(data.id || generateId()),
    title: data.title || "Untitled Template",
    description: data.description || "",
    lifeAreaId: data.lifeAreaId ? String(data.lifeAreaId) : "health",
    baseline: data.baseline || "",
    optimal: data.optimal || "",
    isFavorite: Boolean(data.isFavorite),
    usageCount: Number(data.usageCount) || 0,
    createdAt: data.createdAt || todayISO(),
    updatedAt: data.updatedAt || todayISO(),
  };
}

export function saveToStorage(data) {
  try {
    const payload = {
      version: STORAGE_VERSION,
      templates: data.templates || [],
      plans: data.plans || [],
      logs: data.logs || [],
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error("Failed to save data structure:", error);
  }
}

export function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw);

    return {
      version: STORAGE_VERSION,
      templates: (data.templates || []).map(normalizeTemplate),
      plans: (data.plans || []).map(normalizePlan),
      logs: (data.logs || []).map(normalizeLog),
    };
  } catch (error) {
    console.error("Failed to load data structure:", error);
    return null;
  }
}
