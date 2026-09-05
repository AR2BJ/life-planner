import {
  calculateGoalProgress,
  generateId,
  openMilestonesState,
  todayISO,
} from "@/utils/helpers.js";

export const PlanService = {
  createGoal(currentGoals, goalData) {
    const rawTitle = typeof goalData === "string" ? goalData : goalData.title;
    const cleanedTitle = (rawTitle || "").trim().replace(/\s+/g, " ");

    if (!cleanedTitle || cleanedTitle.length < 2 || cleanedTitle.length > 120) {
      throw new Error("Goal title must be between 2 and 120 characters");
    }

    const targetValue = Number(goalData.targetValue) || 100;
    const currentValue = Number(goalData.currentValue) || 0;
    const isDone = currentValue >= targetValue && targetValue > 0;
    const isInProgress = currentValue > 0 && !isDone;

    const newGoal = {
      id: generateId(),
      title: cleanedTitle,
      description: (goalData.description || "").trim(),
      category: goalData.category || "general",
      timeframe: goalData.timeframe || "yearly",
      priority: goalData.priority || "low",
      targetValue,
      currentValue,
      unit: goalData.unit || "%",
      status: isDone ? "done" : isInProgress ? "in_progress" : "todo",
      startDate: goalData.startDate || todayISO(),
      endDate: goalData.endDate || null,
      createdAt: todayISO(),
      updatedAt: todayISO(),
      completedAt: isDone ? todayISO() : null,
      milestones: Array.isArray(goalData.milestones) ? goalData.milestones : [],
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

      const targetValue =
        updatedFields.targetValue !== undefined
          ? Number(updatedFields.targetValue)
          : g.targetValue;
      const currentValue =
        updatedFields.currentValue !== undefined
          ? Number(updatedFields.currentValue)
          : g.currentValue;

      const isDone = currentValue >= targetValue && targetValue > 0;
      const isInProgress = currentValue > 0 && !isDone;

      return {
        ...g,
        ...updatedFields,
        title: cleanedTitle,
        targetValue,
        currentValue,
        status: isDone ? "done" : isInProgress ? "in_progress" : "todo",
        completedAt: isDone ? g.completedAt || todayISO() : null,
        updatedAt: todayISO(),
      };
    });
  },

  updateGoalProgress(goals, goalId, newCurrent) {
    return goals.map((goal) => {
      if (goal.id !== goalId) return goal;

      const target = Number(goal.targetValue) || 100;
      const boundedCurrent = Math.min(target, Math.max(0, newCurrent));

      const isPercentageUnit =
        !goal.unit || goal.unit === "%" || goal.unit === "percentage";
      let updatedMilestones = Array.isArray(goal.milestones)
        ? [...goal.milestones]
        : [];

      if (isPercentageUnit && updatedMilestones.length > 0) {
        const progressRatio = boundedCurrent / target;
        const countToComplete = Math.round(
          progressRatio * updatedMilestones.length,
        );
        updatedMilestones = updatedMilestones.map((m, idx) => ({
          ...m,
          completed: idx < countToComplete,
        }));
      }

      const updatedGoalCandidate = {
        ...goal,
        currentValue: boundedCurrent,
        milestones: updatedMilestones,
      };

      const { isCompleted, isInProgress } =
        calculateGoalProgress(updatedGoalCandidate);

      const newStatus = isCompleted
        ? "done"
        : isInProgress
          ? "in_progress"
          : "todo";

      return {
        ...updatedGoalCandidate,
        status: newStatus,
        completedAt:
          newStatus === "done" ? goal.completedAt || todayISO() : null,
        updatedAt: todayISO(),
      };
    });
  },

  toggleMilestone(currentGoals, goalId, milestoneId) {
    return currentGoals.map((g) => {
      if (g.id !== goalId) return g;

      const updatedMilestones = g.milestones.map((m) =>
        m.id === milestoneId ? { ...m, completed: !m.completed } : m,
      );

      const totalMilestones = updatedMilestones.length;
      const completedMilestones = updatedMilestones.filter(
        (m) => m.completed,
      ).length;

      const isPercentageUnit =
        !g.unit || g.unit === "%" || g.unit === "percentage";
      const targetValue = Number(g.targetValue) || 100;

      const newCurrentValue =
        isPercentageUnit && totalMilestones > 0
          ? Math.round((completedMilestones / totalMilestones) * targetValue)
          : g.currentValue;

      const updatedGoalCandidate = {
        ...g,
        currentValue: newCurrentValue,
        milestones: updatedMilestones,
      };

      const { isCompleted, isInProgress } =
        calculateGoalProgress(updatedGoalCandidate);

      const newStatus = isCompleted
        ? "done"
        : isInProgress
          ? "in_progress"
          : "todo";

      return {
        ...updatedGoalCandidate,
        status: newStatus,
        completedAt: newStatus === "done" ? g.completedAt || todayISO() : null,
        updatedAt: todayISO(),
      };
    });
  },

  updateGoalStatus(currentGoals, goalId, newStatus) {
    return currentGoals.map((g) => {
      if (g.id !== goalId) return g;

      let updatedMilestones = g.milestones || [];
      const targetValue = Number(g.targetValue) || 100;
      let newCurrentValue = g.currentValue;

      if (newStatus === "done") {
        openMilestonesState.milestonesMemory.set(goalId, g.milestones);
        updatedMilestones = updatedMilestones.map((m) => ({
          ...m,
          completed: true,
        }));
        newCurrentValue = targetValue;
      } else if (newStatus === "todo") {
        updatedMilestones = updatedMilestones.map((m) => ({
          ...m,
          completed: false,
        }));
        newCurrentValue = 0;
      } else {
        if (openMilestonesState.milestonesMemory.has(goalId)) {
          updatedMilestones = openMilestonesState.milestonesMemory.get(goalId);
          openMilestonesState.milestonesMemory.delete(goalId);
        }
      }

      return {
        ...g,
        currentValue: newCurrentValue,
        status: newStatus,
        milestones: updatedMilestones,
        completedAt: newStatus === "done" ? todayISO() : null,
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

    if (!cleanedTitle) throw new Error("Daily log title cannot be empty");

    const newLog = {
      id: generateId(),
      title: cleanedTitle,
      description: (logData.description || logData.content || "").trim(),
      date: logData.date || todayISO(),
      mood: logData.mood || "good",
      category: logData.category || "journal",
      linkedGoal: logData.linkedGoal || null,
      createdAt: todayISO(),
      updatedAt: todayISO(),
    };

    return [newLog, ...currentLogs];
  },

  editDailyLog(currentLogs, logId, updatedFields) {
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
    return currentTemplates.map((t) => {
      if (t.id !== templateId) return t;
      return {
        ...t,
        ...updatedFields,
        title: updatedFields.title ? updatedFields.title.trim() : t.title,
        updatedAt: todayISO(),
      };
    });
  },

  deleteTemplate(currentTemplates, templateId) {
    return currentTemplates.filter((t) => t.id !== templateId);
  },
};
