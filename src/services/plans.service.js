import { generateId, todayISO } from "@/utils/helpers.js";

export const PlanService = {
  createGoal(currentGoals, goalData) {
    const rawTitle = typeof goalData === "string" ? goalData : goalData.title;
    const cleanedTitle = (rawTitle || "").trim().replace(/\s+/g, " ");

    if (!cleanedTitle || cleanedTitle.length < 2 || cleanedTitle.length > 120) {
      throw new Error("Goal title must be between 2 and 120 characters");
    }

    const newGoal = {
      id: generateId(),
      title: cleanedTitle,
      description: (goalData.description || "").trim(),
      category: goalData.category || "general",
      timeframe: goalData.timeframe || "yearly",
      targetValue: Number(goalData.targetValue) || 100,
      currentValue: Number(goalData.currentValue) || 0,
      unit: goalData.unit || "%",
      status: goalData.status || "todo",
      archived: Boolean(goalData.archived),
      startDate: goalData.startDate || todayISO(),
      endDate: goalData.endDate || null,
      createdAt: todayISO(),
      updatedAt: todayISO(),
      milestones: [],
    };

    return [newGoal, ...currentGoals];
  },

  editGoal(currentGoals, goalId, updatedFields) {
    const goal = currentGoals.find((g) => g.id === goalId);
    if (!goal) throw new Error("Goal not found");

    let cleanedTitle = goal.title;
    if (updatedFields.title) {
      cleanedTitle = updatedFields.title.trim().replace(/\s+/g, " ");
      if (cleanedTitle.length < 2 || cleanedTitle.length > 120) {
        throw new Error("Goal title must be between 2 and 120 characters");
      }
    }

    return currentGoals.map((g) => {
      if (g.id !== goalId) return g;
      return {
        ...g,
        ...updatedFields,
        title: cleanedTitle,
        updatedAt: todayISO(),
      };
    });
  },

  deleteGoal(currentGoals, goalId) {
    return currentGoals.filter((g) => g.id !== goalId);
  },

  createDailyLog(currentLogs, logData) {
    const rawTitle = typeof logData === "string" ? logData : logData.title;
    const cleanedTitle = (rawTitle || "").trim();

    if (!cleanedTitle) {
      throw new Error("Daily log title cannot be empty");
    }

    const newLog = {
      id: generateId(),
      title: cleanedTitle,
      description: (logData.description || logData.content || "").trim(),
      date: logData.date || todayISO(),
      mood: logData.mood || "good",
      category: logData.category || "journal",
      linkedGoalTitle: logData.linkedGoalTitle || null,
      createdAt: todayISO(),
      updatedAt: todayISO(),
    };

    return [newLog, ...currentLogs];
  },

  editDailyLog(currentLogs, logId, updatedFields) {
    const log = currentLogs.find((l) => l.id === logId);
    if (!log) throw new Error("Daily log entry not found");

    return currentLogs.map((l) => {
      if (l.id !== logId) return l;
      return {
        ...l,
        ...updatedFields,
        title: updatedFields.title ? updatedFields.title.trim() : l.title,
        description:
          updatedFields.description !== undefined
            ? updatedFields.description.trim()
            : l.description,
        updatedAt: todayISO(),
      };
    });
  },

  deleteDailyLog(currentLogs, logId) {
    return currentLogs.filter((l) => l.id !== logId);
  },

  createTemplate(currentTemplates, templateData) {
    const rawTitle =
      typeof templateData === "string" ? templateData : templateData.title;
    const cleanedTitle = (rawTitle || "").trim().replace(/\s+/g, " ");

    if (!cleanedTitle || cleanedTitle.length < 2 || cleanedTitle.length > 100) {
      throw new Error("Template title must be between 2 and 100 characters");
    }

    const newTemplate = {
      id: generateId(),
      title: cleanedTitle,
      description: (templateData.description || "").trim(),
      category: templateData.category || "workflow",
      structure: templateData.structure || [],
      isFavorite: Boolean(templateData.isFavorite),
      createdAt: todayISO(),
      updatedAt: todayISO(),
    };

    return [newTemplate, ...currentTemplates];
  },

  editTemplate(currentTemplates, templateId, updatedFields) {
    const template = currentTemplates.find((t) => t.id === templateId);
    if (!template) throw new Error("Template not found");

    let cleanedTitle = template.title;
    if (updatedFields.title) {
      cleanedTitle = updatedFields.title.trim().replace(/\s+/g, " ");
      if (cleanedTitle.length < 2 || cleanedTitle.length > 100) {
        throw new Error("Template title must be between 2 and 100 characters");
      }
    }

    return currentTemplates.map((t) => {
      if (t.id !== templateId) return t;
      return {
        ...t,
        ...updatedFields,
        title: cleanedTitle,
        updatedAt: todayISO(),
      };
    });
  },

  deleteTemplate(currentTemplates, templateId) {
    return currentTemplates.filter((t) => t.id !== templateId);
  },
};
