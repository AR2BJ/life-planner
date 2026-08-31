// src/services/plan.service.js
import { generateId, openSubplansState, todayISO } from "@/utils/helpers.js";

function sanitizeTagIds(tags) {
  if (!Array.isArray(tags)) return [];
  return tags
    .map((tag) => {
      if (typeof tag === "object" && tag !== null) {
        return String(tag.id || tag.value || "");
      }
      return String(tag || "").trim();
    })
    .filter(Boolean);
}

export const PlanService = {
  validatePlanLimits(plans, targetDate, newPriority, excludePlanId = null) {
    if (!targetDate) return;

    const LIMITS = { high: 6, medium: 8, low: 10, total: 24 };

    const sameDatePlans = plans.filter((plan) => {
      if (plan.archived) return false;
      if (excludePlanId && plan.id === excludePlanId) return false;

      const planDate = plan.dueDate || plan.createdAt;
      return planDate === targetDate;
    });

    if (sameDatePlans.length >= LIMITS.total) {
      throw new Error(
        `Daily capacity reached! Maximum total plans allowed for ${targetDate} is ${LIMITS.total}`,
      );
    }

    const countByPriority = sameDatePlans.reduce(
      (acc, plan) => {
        const p = plan.priority || "low";
        acc[p] = (acc[p] || 0) + 1;
        return acc;
      },
      { high: 0, medium: 0, low: 0 },
    );

    const targetPriority = newPriority || "low";
    const currentCount = countByPriority[targetPriority] || 0;
    const maxAllowed = LIMITS[targetPriority] || LIMITS.low;

    if (currentCount >= maxAllowed) {
      throw new Error(
        `Priority capacity exceeded! You can only set up to ${maxAllowed} ${targetPriority.toUpperCase()} priority plans for ${targetDate}`,
      );
    }
  },

  createPlan(currentPlans, planData) {
    const rawTitle = typeof planData === "string" ? planData : planData.title;
    const cleanedTitle = (rawTitle || "").trim().replace(/\s+/g, " ");

    if (!cleanedTitle || cleanedTitle.length < 2 || cleanedTitle.length > 120) {
      throw new Error("Plan title must be between 2 and 120 characters");
    }

    const alreadyExists = currentPlans.some(
      (plan) =>
        plan.title.toLowerCase() === cleanedTitle.toLowerCase() &&
        !plan.archived,
    );
    if (alreadyExists) {
      throw new Error("An active plan with this title already exists");
    }

    const planDate = planData.dueDate || todayISO();
    const planPriority = planData.priority || "low";

    this.validatePlanLimits(currentPlans, planDate, planPriority);

    const parsedTagIds = sanitizeTagIds(planData.tags);
    const initialStatus = planData.status || "todo";
    const isDone = initialStatus === "done";

    let subplans = Array.isArray(planData.subplans) ? planData.subplans : [];
    if (isDone && subplans.length > 0) {
      subplans = subplans.map((st) => ({
        ...st,
        completed: true,
        createdAt: todayISO(),
      }));
    }

    const newPlan = {
      id: generateId(),
      title: cleanedTitle,
      description: (planData.description || "").trim(),
      status: initialStatus,
      priority: planPriority,
      dueDate: planData.dueDate || null,
      createdAt: todayISO(),
      updatedAt: null,
      completedAt: isDone ? todayISO() : null,
      archived: false,
      tags: parsedTagIds,
      subplans: subplans,
    };

    return [newPlan, ...currentPlans];
  },

  toggleSubplan(currentPlans, planId, subplanId) {
    const today = todayISO();

    return currentPlans.map((plan) => {
      if (plan.id !== planId) return plan;

      const previousSubplans = plan.subplans || [];
      const updatedSubplans = previousSubplans.map((st) => {
        if (st.id !== subplanId) return st;
        return { ...st, completed: !st.completed, updatedAt: todayISO() };
      });

      const hasSubplans = updatedSubplans.length > 0;
      const allCompleted =
        hasSubplans && updatedSubplans.every((st) => st.completed);

      let newStatus = plan.status;
      if (hasSubplans) {
        if (allCompleted) {
          newStatus = "done";
        } else if (plan.status === "done" && !allCompleted) {
          newStatus = "todo";
        }
      }

      if (!allCompleted) {
        const memoryMap = new Map();
        updatedSubplans.forEach((st) => memoryMap.set(st.id, st.completed));
        openSubplansState.subplansMemory.set(planId, memoryMap);
      }

      return {
        ...plan,
        status: newStatus,
        completedAt: newStatus === "done" ? plan.completedAt || today : null,
        subplans: updatedSubplans,
        updatedAt: today,
      };
    });
  },

  updatePlanStatus(currentPlans, id, newStatus) {
    const validStatuses = ["todo", "in_progress", "done", "blocked"];
    if (!validStatuses.includes(newStatus)) {
      throw new Error("Invalid plan status");
    }

    const today = todayISO();

    return currentPlans.map((plan) => {
      if (plan.id !== id || plan.archived) return plan;
      if (plan.status === newStatus) return plan;

      const isGoingToDone = newStatus === "done";
      let updatedSubplans = plan.subplans || [];

      if (isGoingToDone) {
        const memoryMap = new Map();
        updatedSubplans.forEach((st) => memoryMap.set(st.id, st.completed));
        openSubplansState.subplansMemory.set(plan.id, memoryMap);

        updatedSubplans = updatedSubplans.map((st) => ({
          ...st,
          completed: true,
          updatedAt: todayISO(),
        }));
      } else if (plan.status === "done") {
        const savedMemory = openSubplansState.subplansMemory.get(plan.id);
        if (savedMemory) {
          updatedSubplans = updatedSubplans.map((st) => ({
            ...st,
            completed: savedMemory.has(st.id) ? savedMemory.get(st.id) : false,
            updatedAt: todayISO(),
          }));
        } else {
          updatedSubplans = updatedSubplans.map((st) => ({
            ...st,
            completed: false,
            updatedAt: todayISO(),
          }));
        }
      }

      return {
        ...plan,
        status: newStatus,
        completedAt: isGoingToDone ? today : null,
        updatedAt: today,
        subplans: updatedSubplans,
      };
    });
  },

  togglePlan(currentPlans, id) {
    const plan = currentPlans.find((t) => t.id === id);
    if (!plan) return currentPlans;

    const isCompleted = plan.status === "done";
    const newStatus = isCompleted ? "todo" : "done";

    return this.updatePlanStatus(currentPlans, id, newStatus);
  },

  editPlan(currentPlans, id, updatedFields) {
    const plan = currentPlans.find((t) => t.id === id);
    if (!plan) throw new Error("Plan not found");

    let cleanedTitle = plan.title;
    if (updatedFields.title) {
      cleanedTitle = updatedFields.title.trim().replace(/\s+/g, " ");
      if (cleanedTitle.length < 2 || cleanedTitle.length > 120) {
        throw new Error("Plan title must be between 2 and 120 characters");
      }
    }

    const targetDate =
      updatedFields.dueDate !== undefined
        ? updatedFields.dueDate
        : plan.dueDate;
    const finalDate = targetDate || plan.createdAt;
    const targetPriority = updatedFields.priority || plan.priority;

    this.validatePlanLimits(currentPlans, finalDate, targetPriority, id);

    const parsedTagIds =
      updatedFields.tags !== undefined
        ? sanitizeTagIds(updatedFields.tags)
        : plan.tags;

    const alreadyExists = currentPlans.some(
      (t) =>
        t.id !== id && t.title.toLowerCase() === cleanedTitle.toLowerCase(),
    );
    if (alreadyExists) {
      throw new Error("Plan already exists");
    }

    if (
      updatedFields.status !== undefined &&
      updatedFields.status !== plan.status
    ) {
      const plansWithStatus = this.updatePlanStatus(
        currentPlans,
        id,
        updatedFields.status,
      );
      return plansWithStatus.map((t) => {
        if (t.id !== id) return t;
        return {
          ...t,
          ...updatedFields,
          title: cleanedTitle,
          tags: parsedTagIds,
        };
      });
    }

    return currentPlans.map((t) => {
      if (t.id !== id) return t;

      const updatedSubplans = updatedFields.subplans || t.subplans || [];

      return {
        ...t,
        ...updatedFields,
        title: cleanedTitle,
        tags: parsedTagIds,
        subplans: updatedSubplans,
        updatedAt: todayISO(),
      };
    });
  },

  addSubplan(currentPlans, planId, subplanTitle) {
    const cleaned = subplanTitle.trim();
    if (!cleaned) throw new Error("Subplan title cannot be empty");

    return currentPlans.map((plan) => {
      if (plan.id !== planId) return plan;

      const newSubplan = {
        id: generateId(),
        title: cleaned,
        completed: false,
        createdAt: todayISO(),
        updatedAt: null,
      };

      const updatedSubplans = [...(plan.subplans || []), newSubplan];
      const isDone = plan.status === "done";
      const newStatus = isDone ? "todo" : plan.status;

      return {
        ...plan,
        status: newStatus,
        completedAt: newStatus === "done" ? plan.completedAt : null,
        subplans: updatedSubplans,
      };
    });
  },

  deleteSubplan(currentPlans, planId, subplanId) {
    return currentPlans.map((plan) => {
      if (plan.id !== planId) return plan;

      const updatedSubplans = (plan.subplans || []).filter(
        (st) => st.id !== subplanId,
      );

      return {
        ...plan,
        subplans: updatedSubplans,
        updatedAt: todayISO(),
      };
    });
  },

  deletePlan(currentPlans, id) {
    return currentPlans.filter((plan) => plan.id !== id);
  },

  archivePlan(currentPlans, id) {
    return currentPlans.map((plan) =>
      plan.id === id ? { ...plan, archived: true } : plan,
    );
  },

  restorePlan(currentPlans, id) {
    const plan = currentPlans.find((t) => t.id === id);
    if (plan) {
      const planDate = plan.dueDate || plan.createdAt;
      this.validatePlanLimits(currentPlans, planDate, plan.priority, id);
    }

    return currentPlans.map((plan) =>
      plan.id === id ? { ...plan, archived: false } : plan,
    );
  },
};
