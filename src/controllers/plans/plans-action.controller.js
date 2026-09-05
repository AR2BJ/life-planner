import { StateManager, state } from "@/models/state.model.js";
import {
  setPendingDeleteId,
  setPendingEditId,
} from "./plans-form.controller.js";

import { NotificationService } from "@/services/notification.service.js";
import { PlanService } from "@/services/plans.service.js";
import { openMilestonesState } from "@/utils/helpers.js";

export const PlansActionController = {
  init(mainController) {
    this.mainController = mainController;
    this.bindDynamicEvents();
  },

  handleQuickStep(goalId, stepVal) {
    const goals = StateManager.getGoals();
    const targetGoal = goals.find((g) => g.id === goalId);
    if (!targetGoal) return;

    const newCurrent = Math.max(0, targetGoal.currentValue + stepVal);
    const updatedGoals = PlanService.updateGoalProgress(
      goals,
      goalId,
      newCurrent,
    );

    StateManager.setGoals(updatedGoals);
    StateManager.save();
    this.mainController.refreshUI();

    const updatedGoal = updatedGoals.find((g) => g.id === goalId);
    const isCompleted =
      updatedGoal?.status === "completed" || updatedGoal?.status === "done";

    NotificationService.show({
      type: isCompleted ? "success" : "info",
      message: isCompleted
        ? `Goal completed: "${targetGoal.title}"`
        : `Updated progress for "${targetGoal.title}"`,
      icon: isCompleted ? "fa-circle-check" : "fa-chart-line",
      duration: 4000,
    });
  },

  bindDynamicEvents() {
    const listContainer = document.getElementById("plan-list");
    if (!listContainer) return;

    listContainer.addEventListener("click", (e) => {
      const target = e.target;
      const activeTab = StateManager.getPlansTab();

      // ==========================================
      // 1. TOGGLE MILESTONES DROPDOWN (ACCORDION)
      // ==========================================
      const toggleMilestonesBtn = target.closest(".toggle-milestones-btn");
      if (toggleMilestonesBtn) {
        e.stopPropagation();
        const goalId = toggleMilestonesBtn.dataset.goalId;
        if (!goalId) return;

        const container = document.getElementById(
          `milestones-container-${goalId}`,
        );
        const chevron = toggleMilestonesBtn.querySelector(".milestone-chevron");

        if (openMilestonesState.expandedGoalIds.has(goalId)) {
          openMilestonesState.expandedGoalIds.delete(goalId);
          if (container) container.classList.add("hidden");
          if (chevron) chevron.classList.remove("rotate-180");
        } else {
          openMilestonesState.expandedGoalIds.add(goalId);
          if (container) container.classList.remove("hidden");
          if (chevron) chevron.classList.add("rotate-180");
        }
        return;
      }

      // ==========================================
      // 2. TOGGLE INDIVIDUAL MILESTONE CHECKBOX
      // ==========================================
      const milestoneToggle = target.closest(".milestone-toggle");
      if (milestoneToggle) {
        e.stopPropagation();
        const goalId = milestoneToggle.dataset.goalId;
        const milestoneId = milestoneToggle.dataset.milestoneId;

        if (goalId && milestoneId) {
          openMilestonesState.expandedGoalIds.add(goalId);

          const updatedGoals = PlanService.toggleMilestone(
            StateManager.getGoals(),
            goalId,
            milestoneId,
          );

          StateManager.setGoals(updatedGoals);
          StateManager.save();
          this.mainController.refreshUI();
        }
        return;
      }

      // ==========================================
      // 3. GOAL PROGRESS / INCREMENT HANDLER
      // ==========================================
      const progressBtn = target.closest(".progress-btn");
      if (progressBtn) {
        const id = progressBtn.dataset.id;
        const step = Number(progressBtn.dataset.step) || 1;
        const currentGoals = StateManager.getGoals();
        const goal = currentGoals.find((g) => g.id === id);

        if (goal) {
          try {
            const newCurrent = Math.max(0, (goal.currentValue || 0) + step);

            const updated = PlanService.updateGoalProgress(
              currentGoals,
              id,
              newCurrent,
            );
            StateManager.setGoals(updated);
            StateManager.save();
            this.mainController.refreshUI();

            const updatedGoal = updated.find((g) => g.id === id);
            const isCompleted =
              updatedGoal?.status === "completed" ||
              updatedGoal?.status === "done";

            NotificationService.show({
              type: isCompleted ? "success" : "info",
              message: isCompleted
                ? `Goal completed: "${goal.title}"`
                : `Updated progress for "${goal.title}"`,
              icon: isCompleted ? "fa-circle-check" : "fa-chart-line",
              duration: 4000,
            });
          } catch (error) {
            NotificationService.show({
              type: "error",
              message: error.message || "Failed to update goal progress",
            });
          }
        }
        return;
      }

      const stepBtn = target.closest(".quick-step-btn");
      if (stepBtn) {
        e.stopPropagation();
        const goalId = stepBtn.dataset.id;
        const stepVal = Number(stepBtn.dataset.step) || 0;
        this.handleQuickStep(goalId, stepVal);
        return;
      }

      // ==========================================
      // 4. TOGGLE TEMPLATE FAVORITE
      // ==========================================
      const favoriteBtn = target.closest(".favorite-btn");
      if (favoriteBtn) {
        const id = favoriteBtn.dataset.id;
        const currentTemplates = StateManager.getTemplates();
        const template = currentTemplates.find((t) => t.id === id);

        if (template) {
          try {
            const updated = PlanService.toggleTemplateFavorite(
              currentTemplates,
              id,
            );
            StateManager.save();
            this.mainController.refreshUI();

            NotificationService.show({
              type: "info",
              message: template.isFavorite
                ? `Removed "${template.title}" from favorites`
                : `Marked "${template.title}" as favorite`,
              duration: 3000,
            });
          } catch (error) {
            NotificationService.show({
              type: "error",
              message: error.message || "Failed to toggle favorite",
            });
          }
        }
        return;
      }

      // ==========================================
      // 5. EDIT MODAL TRIGGER
      // ==========================================
      const editBtn = target.closest(".edit-btn");
      if (editBtn) {
        const id = editBtn.dataset.id;
        setPendingEditId(id);
        this.mainController.toggleModal("edit-modal", true);
        return;
      }

      // ==========================================
      // 6. DELETE MODAL TRIGGER
      // ==========================================
      const deleteBtn = target.closest(".delete-btn");
      if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        setPendingDeleteId(id);
        this.mainController.toggleModal("delete-modal", true);
        return;
      }

      // ==========================================
      // 7. DIRECT DELETE ITEM HANDLER
      // ==========================================
      const directDeleteBtn = target.closest(".direct-delete-btn");
      if (directDeleteBtn) {
        const id = directDeleteBtn.dataset.id;

        if (activeTab === "goals") {
          const currentGoals = StateManager.getGoals();
          const targetGoal = currentGoals.find((g) => g.id === id);

          if (targetGoal) {
            const updated = PlanService.deleteGoal(currentGoals, id);
            StateManager.save(updated, state.dailyLogs, state.templates);
            this.mainController.refreshUI();

            NotificationService.show({
              type: "info",
              message: `Deleted goal: "${targetGoal.title}"`,
              duration: 5000,
            });
          }
        } else if (activeTab === "daily") {
          const currentLogs = StateManager.getDailyLogs();
          const targetLog = currentLogs.find((l) => l.id === id);

          if (targetLog) {
            const updated = PlanService.deleteDailyLog(currentLogs, id);
            StateManager.save(state.goals, updated, state.templates);
            this.mainController.refreshUI();

            NotificationService.show({
              type: "info",
              message: "Daily log deleted",
              duration: 5000,
            });
          }
        } else if (activeTab === "templates") {
          const currentTemplates = StateManager.getTemplates();
          const targetTemplate = currentTemplates.find((t) => t.id === id);

          if (targetTemplate) {
            const updated = PlanService.deleteTemplate(currentTemplates, id);
            StateManager.save(state.goals, state.dailyLogs, updated);
            this.mainController.refreshUI();

            NotificationService.show({
              type: "info",
              message: `Deleted template: "${targetTemplate.title}"`,
              duration: 5000,
            });
          }
        }
        return;
      }
    });
  },
};
