import { generateId, todayISO } from "@/utils/helpers.js";

export const STORAGE_KEY = "life_planner";
export const STORAGE_VERSION = 1;

function normalizeGoal(goal) {
  return {
    id: String(goal.id || generateId()),
    title: goal.title || "Untitled Goal",
    description: goal.description || "",
    status: goal.status || "todo",
    priority: goal.priority || "low",
    category: goal.category || "general",
    timeframe: goal.timeframe || "yearly",
    targetValue: Number(goal.targetValue) || 100,
    currentValue: Number(goal.currentValue) || 0,
    unit: goal.unit || "%",
    startDate: goal.startDate || todayISO(),
    endDate: goal.endDate || null,
    createdAt: goal.createdAt || todayISO(),
    updatedAt: goal.updatedAt || todayISO(),
    completedAt: goal.completedAt || null,
    archived: Boolean(goal.archived),
    milestones: Array.isArray(goal.milestones)
      ? goal.milestones.map((m) => ({
          id: String(m.id || generateId()),
          title: m.title || "",
          completed: Boolean(m.completed),
          createdAt: m.createdAt || todayISO(),
        }))
      : [],
  };
}

function normalizeDailyLog(log) {
  return {
    id: String(log.id || generateId()),
    title: log.title || "Daily Log Entry",
    description: log.description || log.content || "",
    category: log.category || "journal",
    mood: log.mood || "good",
    date: log.date || todayISO(),
    linkedGoalTitle: log.linkedGoalTitle || null,
    createdAt: log.createdAt || todayISO(),
    updatedAt: log.updatedAt || todayISO(),
  };
}

function normalizeTemplate(template) {
  return {
    id: String(template.id || generateId()),
    title: template.title || "Untitled Template",
    description: template.description || "",
    category: template.category || "workflow",
    structure: Array.isArray(template.structure) ? template.structure : [],
    isFavorite: Boolean(template.isFavorite),
    createdAt: template.createdAt || todayISO(),
    updatedAt: template.updatedAt || todayISO(),
  };
}

function migrateData(data) {
  const goals = Array.isArray(data.goals)
    ? data.goals
    : Array.isArray(data.plans)
      ? data.plans
      : [];
  const dailyLogs = Array.isArray(data.dailyLogs) ? data.dailyLogs : [];
  const templates = Array.isArray(data.templates) ? data.templates : [];

  return {
    version: STORAGE_VERSION,
    goals: goals.map(normalizeGoal),
    dailyLogs: dailyLogs.map(normalizeDailyLog),
    templates: templates.map(normalizeTemplate),
  };
}

export function saveToStorage(data) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        goals: data.goals || [],
        dailyLogs: data.dailyLogs || [],
        templates: data.templates || [],
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
