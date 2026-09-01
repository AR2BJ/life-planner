import { generateId, todayISO } from "@/utils/helpers.js";

export const PlanService = {
  createGoal(currentGoals, goalData) {
    const rawTitle = typeof goalData === "string" ? goalData : goalData.title;
    const cleanedTitle = (rawTitle || "").trim().replace(/\s+/g, " ");

    if (!cleanedTitle || cleanedTitle.length < 2 || cleanedTitle.length > 120) {
      throw new Error("Goal title must be between 2 and 120 characters");
    }

    const alreadyExists = currentGoals.some(
      (g) => g.title.toLowerCase() === cleanedTitle.toLowerCase(),
    );
    if (alreadyExists) {
      throw new Error("A goal with this title already exists");
    }

    const newGoal = {
      id: generateId(),
      title: cleanedTitle,
      description: (goalData.description || "").trim(),
      category: goalData.category || "personal",
      timeframe: goalData.timeframe || "monthly", // yearly | monthly | weekly
      targetValue: Number(goalData.targetValue) || 1,
      currentValue: Number(goalData.currentValue) || 0,
      unit: goalData.unit || "times",
      status: "in_progress", // in_progress | completed | paused
      startDate: goalData.startDate || todayISO(),
      endDate: goalData.endDate || null,
      createdAt: todayISO(),
      updatedAt: todayISO(),
    };

    return [newGoal, ...currentGoals];
  },

  updateGoalProgress(currentGoals, goalId, incrementValue) {
    return currentGoals.map((goal) => {
      if (goal.id !== goalId) return goal;

      const newValue = Math.max(0, goal.currentValue + incrementValue);
      const isCompleted = newValue >= goal.targetValue;

      return {
        ...goal,
        currentValue: newValue,
        status: isCompleted ? "completed" : "in_progress",
        updatedAt: todayISO(),
      };
    });
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

  calculateGoalProgressPercentage(goal) {
    if (!goal || !goal.targetValue || goal.targetValue <= 0) return 0;
    const percentage = (goal.currentValue / goal.targetValue) * 100;
    return Math.min(100, Math.round(percentage));
  },

  createDailyLog(currentLogs, logData) {
    const rawContent = typeof logData === "string" ? logData : logData.content;
    const cleanedContent = (rawContent || "").trim();

    if (!cleanedContent) {
      throw new Error("Daily log content cannot be empty");
    }

    const logDate = logData.date || todayISO();
    const alreadyExists = currentLogs.some((log) => log.date === logDate);
    if (alreadyExists) {
      throw new Error("A daily log entry already exists for this date");
    }

    const newLog = {
      id: generateId(),
      date: logDate,
      content: cleanedContent,
      mood: logData.mood || "neutral",
      category: logData.category || "reflection",
      highlights: Array.isArray(logData.highlights) ? logData.highlights : [],
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
        content: updatedFields.content
          ? updatedFields.content.trim()
          : l.content,
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

    const alreadyExists = currentTemplates.some(
      (t) => t.title.toLowerCase() === cleanedTitle.toLowerCase(),
    );
    if (alreadyExists) {
      throw new Error("A template with this title already exists");
    }

    const newTemplate = {
      id: generateId(),
      title: cleanedTitle,
      description: (templateData.description || "").trim(),
      category: templateData.category || "routine",
      structure: templateData.structure || [], // Sub-items, checkpoints, or fields
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

  toggleTemplateFavorite(currentTemplates, templateId) {
    return currentTemplates.map((t) => {
      if (t.id !== templateId) return t;
      return {
        ...t,
        isFavorite: !t.isFavorite,
        updatedAt: todayISO(),
      };
    });
  },
};
