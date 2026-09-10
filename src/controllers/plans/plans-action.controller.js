import {
  setPendingDeleteId,
  setPendingEditId,
} from "./plans-form.controller.js";

import { NotificationService } from "@/services/notification.service.js";
import { PlanService } from "@/services/plans.service.js";
import { StateManager } from "@/models/state.model.js";
import { openObjectivesState } from "@/utils/helpers.js";

export const PlansActionController = {
  init(mainController) {
    this.mainController = mainController;
    this.bindDynamicEvents();
  },

  handleToggleObjective(planId, objectiveId) {
    const plans = StateManager.getPlans() || [];
    const targetPlan = plans.find((p) => String(p.id) === String(planId));
    if (!targetPlan) return;

    const updatedPlans = PlanService.toggleObjective(
      plans,
      planId,
      objectiveId,
    );

    StateManager.save({ plans: updatedPlans });
    this.mainController.refreshUI();

    NotificationService.show({
      type: "info",
      message: `Objective updated for "${targetPlan.title}"`,
      icon: "fa-list-check",
      duration: 3000,
    });
  },

  handleObjectiveProgressChange(planId, objectiveId, newValue) {
    const plans = StateManager.getPlans() || [];
    const targetPlan = plans.find((p) => String(p.id) === String(planId));
    if (!targetPlan) return;

    const updatedPlans = PlanService.updateObjectiveProgress(
      plans,
      planId,
      objectiveId,
      newValue,
    );

    StateManager.save({ plans: updatedPlans });
    this.mainController.refreshUI();
  },

  handleToggleTemplateFavorite(templateId) {
    const templates = StateManager.getTemplates() || [];
    const targetTemplate = templates.find(
      (t) => String(t.id) === String(templateId),
    );
    if (!targetTemplate) return;

    const updatedTemplates = PlanService.editTemplate(templates, templateId, {
      isFavorite: !targetTemplate.isFavorite,
    });

    StateManager.save({ templates: updatedTemplates });
    this.mainController.refreshUI();

    NotificationService.show({
      type: "info",
      message: !targetTemplate.isFavorite
        ? `Marked "${targetTemplate.title}" as favorite`
        : `Removed "${targetTemplate.title}" from favorites`,
      icon: "fa-star",
      duration: 3000,
    });
  },

  bindDynamicEvents() {
    const listContainer = document.getElementById("plan-list");
    if (!listContainer) return;

    listContainer.addEventListener("change", (e) => {
      const target = e.target;
      if (target.classList.contains("objective-progress-input")) {
        const planId = target.dataset.planId;
        const objectiveId = target.dataset.objectiveId;
        if (planId && objectiveId) {
          openObjectivesState.expandedPlanIds.add(planId);
          this.handleObjectiveProgressChange(planId, objectiveId, target.value);
        }
      }
    });

    listContainer.addEventListener("click", (e) => {
      const target = e.target;
      const activeTab = StateManager.getActiveTab() || "plans";

      // A. TOGGLE OBJECTIVES ACCORDION
      const toggleObjectivesBtn = target.closest(".toggle-objectives-btn");
      if (toggleObjectivesBtn) {
        e.stopPropagation();
        const planId = toggleObjectivesBtn.dataset.planId;
        if (!planId) return;

        const container = document.getElementById(
          `objectives-container-${planId}`,
        );
        const chevron = toggleObjectivesBtn.querySelector(".objective-chevron");

        if (openObjectivesState.expandedPlanIds.has(planId)) {
          openObjectivesState.expandedPlanIds.delete(planId);
          if (container) container.classList.add("hidden");
          if (chevron) chevron.classList.remove("rotate-180");
        } else {
          openObjectivesState.expandedPlanIds.add(planId);
          if (container) container.classList.remove("hidden");
          if (chevron) chevron.classList.add("rotate-180");
        }
        return;
      }

      // B. TOGGLE LOG METRICS DROPDOWN
      const toggleMetricsBtn = target.closest(".toggle-metrics-btn");
      if (toggleMetricsBtn) {
        e.stopPropagation();
        const logId = toggleMetricsBtn.dataset.logId;
        if (!logId) return;

        const container = document.getElementById(`metrics-dropdown-${logId}`);
        const icon = toggleMetricsBtn.querySelector(".fa-chevron-down");
        const label = toggleMetricsBtn.querySelector(".btn-label");

        if (container) {
          const isHidden = container.classList.contains("hidden");

          if (isHidden) {
            container.classList.replace("hidden", "grid");
          } else {
            container.classList.replace("grid", "hidden");
          }

          if (icon) {
            icon.classList.toggle("rotate-180", !isHidden);
          }

          if (label) {
            const hiddenCount = container.children.length;
            label.textContent = isHidden
              ? `Show ${hiddenCount} more metrics...`
              : "Collapse metrics";
          }
        }
        return;
      }

      // C. TOGGLE INDIVIDUAL OBJECTIVE
      const objectiveToggle = target.closest(".objective-toggle");
      if (objectiveToggle) {
        e.stopPropagation();
        const planId = objectiveToggle.dataset.planId;
        const objectiveId = objectiveToggle.dataset.objectiveId;

        if (planId && objectiveId) {
          openObjectivesState.expandedPlanIds.add(planId);
          this.handleToggleObjective(planId, objectiveId);
        }
        return;
      }

      // D. TOGGLE TEMPLATE FAVORITE
      const favoriteBtn = target.closest(".favorite-btn");
      if (favoriteBtn) {
        e.stopPropagation();
        const id = favoriteBtn.dataset.id;
        if (id) {
          this.handleToggleTemplateFavorite(id);
        }
        return;
      }

      // E. EDIT MODAL TRIGGER
      const editBtn = target.closest(".edit-btn");
      if (editBtn) {
        if (
          editBtn.dataset.action === "edit-objective" ||
          editBtn.dataset.action === "edit-metric"
        ) {
          return;
        }

        e.stopPropagation();
        const id = editBtn.dataset.id;
        if (!id) return;

        setPendingEditId(id);
        this.mainController.toggleModal("edit-modal", true);
        return;
      }

      // F. DELETE MODAL TRIGGER
      const deleteBtn = target.closest(".delete-btn");
      if (deleteBtn) {
        if (
          deleteBtn.dataset.action === "delete-objective" ||
          deleteBtn.dataset.action === "delete-metric"
        ) {
          return;
        }

        e.stopPropagation();
        const id = deleteBtn.dataset.id;
        if (!id) return;

        setPendingDeleteId(id);
        this.mainController.toggleModal("delete-modal", true);
        return;
      }

      // G. DIRECT DELETE ITEM HANDLER
      const directDeleteBtn = target.closest(".direct-delete-btn");
      if (directDeleteBtn) {
        e.stopPropagation();
        const id = directDeleteBtn.dataset.id;
        if (!id) return;

        const currentState = StateManager.getState();

        if (activeTab === "plans") {
          const plans = PlanService.deletePlan(currentState.plans || [], id);
          StateManager.save({ plans });
        } else if (activeTab === "logs") {
          const logs = PlanService.deleteLog(currentState.logs || [], id);
          StateManager.save({ logs });
        } else if (activeTab === "templates") {
          const templates = PlanService.deleteTemplate(
            currentState.templates || [],
            id,
          );
          StateManager.save({ templates });
        }

        this.mainController.refreshUI();

        NotificationService.show({
          type: "info",
          message: "Item deleted successfully",
          icon: "fa-trash-can",
          duration: 4000,
        });
      }
    });
  },
};
