import {
  setPendingDeleteId,
  setPendingEditId,
} from "./plan-form.controller.js";

import { GlobalLoaderService } from "@/services/loader.service.js";
import { NotificationService } from "@/services/notification.service.js";
import { PlanService } from "@/services/plan.service.js";
import { SettingsArchiveController } from "../settings/settings-archive.controller.js";
import { StateManager } from "@/models/state.model.js";
import { openSubplansState } from "@/utils/helpers.js";

export const PlanActionController = {
  init(mainController) {
    this.mainController = mainController;
    this.bindDynamicEvents();
  },

  bindDynamicEvents() {
    const listContainer = document.getElementById("plan-list");
    if (!listContainer) return;

    listContainer.addEventListener("click", (e) => {
      const target = e.target;

      const toggleBtn = target.closest(".toggle-btn");
      if (toggleBtn) {
        const id = toggleBtn.dataset.id;
        const currentPlans = StateManager.getPlans();
        const plan = currentPlans.find((t) => t.id === id);

        if (plan) {
          GlobalLoaderService.show(`Updating state for "${plan.title}"...`);

          setTimeout(() => {
            try {
              const updated = PlanService.togglePlan(currentPlans, id);
              StateManager.save(updated);
              this.mainController.refreshUI();

              const updatedPlan = updated.find((t) => t.id === id);
              const isNowCompleted = updatedPlan?.status === "done";

              NotificationService.show({
                type: isNowCompleted ? "success" : "info",
                message: isNowCompleted
                  ? `Plan completed: "${plan.title}"`
                  : `Reopened plan: "${plan.title}"`,
                icon: isNowCompleted ? "fa-circle-check" : "fa-circle",
                iconColor: isNowCompleted
                  ? "text-emerald-500/80"
                  : "text-brand/80",
                duration: 5000,
              });
            } catch (error) {
              NotificationService.show({
                type: "error",
                message: error.message || "Failed to update plan",
              });
            } finally {
              GlobalLoaderService.hide();
            }
          }, 30);
        }
        return;
      }

      const statusBtn = target.closest(".status-change-btn");
      if (statusBtn) {
        const id = statusBtn.dataset.id;
        const newStatus = statusBtn.dataset.status;
        const currentPlans = StateManager.getPlans();
        const plan = currentPlans.find((t) => t.id === id);

        if (plan) {
          try {
            const updated = PlanService.updatePlanStatus(
              currentPlans,
              id,
              newStatus,
            );
            StateManager.save(updated);
            this.mainController.refreshUI();

            NotificationService.show({
              type: "success",
              message: `Status updated to "${newStatus.replace("_", " ")}"`,
              duration: 5000,
            });
          } catch (error) {
            NotificationService.show({
              type: "error",
              message: error.message,
            });
          }
        }
        return;
      }

      const subplanBtn = target.closest(".subplan-toggle");
      if (subplanBtn) {
        const planId = subplanBtn.dataset.planId;
        const subplanId = subplanBtn.dataset.subplanId;
        const currentPlans = StateManager.getPlans();

        try {
          const updated = PlanService.toggleSubplan(
            currentPlans,
            planId,
            subplanId,
          );

          const updatedPlan = updated.find((t) => t.id === planId);

          if (updatedPlan && updatedPlan.status === "done") {
            openSubplansState.expandedPlanIds.delete(planId);
          }

          StateManager.save(updated);
          this.mainController.refreshUI();
        } catch (error) {
          console.error("Failed to toggle subplan:", error);
        }
        return;
      }

      const subplanDeleteBtn = target.closest(".subplan-delete-btn");
      if (subplanDeleteBtn) {
        const planId = subplanDeleteBtn.dataset.planId;
        const subplanId = subplanDeleteBtn.dataset.subplanId;
        const currentPlans = StateManager.getPlans();

        try {
          const updated = PlanService.deleteSubplan(
            currentPlans,
            planId,
            subplanId,
          );
          StateManager.save(updated);
          this.mainController.refreshUI();
        } catch (error) {
          console.error("Failed to delete subplan:", error);
        }
        return;
      }

      const editBtn = target.closest(".edit-btn");
      if (editBtn) {
        const id = editBtn.dataset.id;
        setPendingEditId(id);
        this.mainController.toggleModal("edit-modal", true);
        return;
      }

      const deleteBtn = target.closest(".delete-btn");
      if (deleteBtn) {
        setPendingDeleteId(deleteBtn.dataset.id);
        this.mainController.toggleModal("delete-modal", true);
        return;
      }

      const archiveBtn = target.closest(".archive-btn");
      if (archiveBtn) {
        const id = archiveBtn.dataset.id;
        const currentPlans = StateManager.getPlans();
        const targetPlan = currentPlans.find((t) => t.id === id);

        if (targetPlan) {
          GlobalLoaderService.show(`Archiving "${targetPlan.title}"...`);

          setTimeout(() => {
            try {
              const updated = PlanService.archivePlan(currentPlans, id);
              StateManager.save(updated);
              this.mainController.refreshUI();

              NotificationService.show({
                type: "info",
                message: `Archived: "${targetPlan.title}"`,
                duration: 5000,
                undoAction: () => {
                  GlobalLoaderService.show("Rolling back archive operation...");
                  setTimeout(() => {
                    try {
                      const rollbackPlans = StateManager.getPlans();
                      const restored = PlanService.restorePlan(
                        rollbackPlans,
                        id,
                      );
                      StateManager.save(restored);
                      this.mainController.refreshUI();
                    } finally {
                      GlobalLoaderService.hide();
                    }
                  }, 30);
                },
              });
            } finally {
              GlobalLoaderService.hide();
            }
          }, 30);
        }
        return;
      }

      const restoreBtn = target.closest(".restore-btn");
      if (restoreBtn) {
        const id = restoreBtn.dataset.id;
        const currentPlans = StateManager.getPlans();
        const targetPlan = currentPlans.find((t) => t.id === id);

        if (targetPlan) {
          GlobalLoaderService.show(`Restoring "${targetPlan.title}"...`);

          setTimeout(() => {
            try {
              const updated = PlanService.restorePlan(currentPlans, id);
              StateManager.save(updated);

              StateManager.init();
              if (SettingsArchiveController.runAutoArchivePipeline) {
                SettingsArchiveController.runAutoArchivePipeline();
              }

              this.mainController.refreshUI();

              NotificationService.show({
                type: "info",
                message: `Restored: "${targetPlan.title}"`,
                duration: 5000,
                undoAction: () => {
                  GlobalLoaderService.show("Re-archiving plan...");
                  setTimeout(() => {
                    try {
                      const rollbackPlans = StateManager.getPlans();
                      const archived = PlanService.archivePlan(
                        rollbackPlans,
                        id,
                      );
                      StateManager.save(archived);
                      this.mainController.refreshUI();
                    } finally {
                      GlobalLoaderService.hide();
                    }
                  }, 30);
                },
              });
            } finally {
              GlobalLoaderService.hide();
            }
          }, 30);
        }
        return;
      }
    });
  },
};
