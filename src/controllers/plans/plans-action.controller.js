import {
  setPendingDeleteId,
  setPendingEditId,
} from "./plans-form.controller.js";

import { NotificationService } from "@/services/notification.service.js";
import { PlanService } from "@/services/plans.service.js";
import { StateManager } from "@/models/state.model.js";

export const PlansActionController = {
  init(mainController) {
    this.mainController = mainController;
    this.bindDynamicEvents();
  },

  bindDynamicEvents() {
    const listContainer = document.getElementById("plan-list");
    if (!listContainer) return;

    listContainer.addEventListener("click", (e) => {
      const target = e.target;
      const activeTab = StateManager.getPlansTab(); // 'goals' | 'daily' | 'templates'

      // ==========================================
      // 1. GOAL PROGRESS / INCREMENT HANDLER
      // ==========================================
      const progressBtn = target.closest(".progress-btn");
      if (progressBtn) {
        const id = progressBtn.dataset.id;
        const step = Number(progressBtn.dataset.step) || 1;
        const currentGoals = StateManager.getGoals();
        const goal = currentGoals.find((g) => g.id === id);

        if (goal) {
          try {
            const updated = PlanService.updateGoalProgress(
              currentGoals,
              id,
              step,
            );
            StateManager.save();
            this.mainController.refreshUI();

            const updatedGoal = updated.find((g) => g.id === id);
            const isCompleted = updatedGoal?.status === "completed";

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

      // ==========================================
      // 2. TOGGLE TEMPLATE FAVORITE
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
      // 3. EDIT MODAL TRIGGER
      // ==========================================
      const editBtn = target.closest(".edit-btn");
      if (editBtn) {
        const id = editBtn.dataset.id;
        setPendingEditId(id);
        this.mainController.toggleModal("edit-modal", true);
        return;
      }

      // ==========================================
      // 4. DELETE MODAL TRIGGER
      // ==========================================
      const deleteBtn = target.closest(".delete-btn");
      if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        setPendingDeleteId(id);
        this.mainController.toggleModal("delete-modal", true);
        return;
      }

      // ==========================================
      // 5. DIRECT DELETE ITEM HANDLER (WITH UNDO)
      // ==========================================
      const directDeleteBtn = target.closest(".direct-delete-btn");
      if (directDeleteBtn) {
        const id = directDeleteBtn.dataset.id;

        if (activeTab === "goals") {
          const currentGoals = StateManager.getGoals();
          const targetGoal = currentGoals.find((g) => g.id === id);

          if (targetGoal) {
            const updated = PlanService.deleteGoal(currentGoals, id);
            StateManager.save();
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
            StateManager.save();
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
            StateManager.save();
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
