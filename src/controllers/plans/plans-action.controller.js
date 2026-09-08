import {
  setPendingDeleteId,
  setPendingEditId,
} from "./plans-form.controller.js";

import { NotificationService } from "@/services/notification.service.js";
import { StateManager } from "@/models/state.model.js";
import { openObjectivesState } from "@/utils/helpers.js";

export const PlansActionController = {
  init(mainController) {
    this.mainController = mainController;
    this.bindDynamicEvents();
    this.bindEditAccordionEvents();
  },

  handleToggleObjective(planId, objectiveId) {
    const plans = StateManager.getPlans() || [];
    const targetPlan = plans.find((p) => String(p.id) === String(planId));
    if (!targetPlan) return;

    const updatedObjectives = (targetPlan.objectives || []).map((obj) => {
      if (String(obj.id) === String(objectiveId)) {
        return { ...obj, completed: !obj.completed };
      }
      return obj;
    });

    const updatedPlans = plans.map((p) => {
      if (String(p.id) === String(planId)) {
        return {
          ...p,
          objectives: updatedObjectives,
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });

    StateManager.save({ plans: updatedPlans });
    this.mainController.refreshUI();

    NotificationService.show({
      type: "info",
      message: `Objective updated for "${targetPlan.title}"`,
      icon: "fa-list-check",
      duration: 3000,
    });
  },

  handleToggleTemplateFavorite(templateId) {
    const templates = StateManager.getTemplates() || [];
    const targetTemplate = templates.find(
      (t) => String(t.id) === String(templateId),
    );
    if (!targetTemplate) return;

    const updatedTemplates = templates.map((t) => {
      if (String(t.id) === String(templateId)) {
        return {
          ...t,
          isFavorite: !t.isFavorite,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
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

  bindEditAccordionEvents() {
    const accordionGroup = document.getElementById("edit-accordion-group");
    if (!accordionGroup) return;

    accordionGroup.addEventListener("click", (e) => {
      const headerBtn = e.target.closest(".accordion-header");
      if (!headerBtn) return;

      e.preventDefault();

      const clickedItem = headerBtn.closest(".accordion-item");
      if (!clickedItem) return;

      const allAccordionItems =
        accordionGroup.querySelectorAll(".accordion-item");

      allAccordionItems.forEach((item) => {
        const content = item.querySelector(".accordion-content");
        const icon = item.querySelector(".accordion-icon");

        if (item === clickedItem) {
          const isCurrentlyHidden = content.classList.contains("hidden");

          if (isCurrentlyHidden) {
            content.classList.remove("hidden");
            content.classList.add("flex");
            if (icon) icon.classList.add("rotate-180");
          } else {
            content.classList.add("hidden");
            content.classList.remove("flex");
            if (icon) icon.classList.remove("rotate-180");
          }
        } else {
          if (content) {
            content.classList.add("hidden");
            content.classList.remove("flex");
          }
          if (icon) icon.classList.remove("rotate-180");
        }
      });
    });
  },

  bindDynamicEvents() {
    const listContainer = document.getElementById("plan-list");
    if (!listContainer) return;

    listContainer.addEventListener("click", (e) => {
      const target = e.target;
      const activeTab = StateManager.getActiveTab() || "plans";

      // ==========================================
      // 1. TOGGLE MILESTONES/OBJECTIVES ACCORDION
      // ==========================================
      const toggleMilestonesBtn = target.closest(".toggle-milestones-btn");
      if (toggleMilestonesBtn) {
        e.stopPropagation();
        const planId =
          toggleMilestonesBtn.dataset.goalId ||
          toggleMilestonesBtn.dataset.planId;
        if (!planId) return;

        const container = document.getElementById(
          `milestones-container-${planId}`,
        );
        const chevron = toggleMilestonesBtn.querySelector(".milestone-chevron");

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

      // ==========================================
      // 2. TOGGLE INDIVIDUAL OBJECTIVE/MILESTONE
      // ==========================================
      const milestoneToggle = target.closest(".milestone-toggle");
      if (milestoneToggle) {
        e.stopPropagation();
        const planId =
          milestoneToggle.dataset.goalId || milestoneToggle.dataset.planId;
        const objectiveId =
          milestoneToggle.dataset.milestoneId ||
          milestoneToggle.dataset.objectiveId;

        if (planId && objectiveId) {
          openObjectivesState.expandedPlanIds.add(planId);
          this.handleToggleObjective(planId, objectiveId);
        }
        return;
      }

      // ==========================================
      // 3. TOGGLE TEMPLATE FAVORITE
      // ==========================================
      const favoriteBtn = target.closest(".favorite-btn");
      if (favoriteBtn) {
        e.stopPropagation();
        const id = favoriteBtn.dataset.id;
        if (id) {
          this.handleToggleTemplateFavorite(id);
        }
        return;
      }

      // ==========================================
      // 4. EDIT MODAL TRIGGER
      // ==========================================
      const editBtn = target.closest(".edit-btn");
      if (editBtn) {
        e.stopPropagation();
        const id = editBtn.dataset.id;
        setPendingEditId(id);
        this.mainController.toggleModal("edit-modal", true);
        return;
      }

      // ==========================================
      // 5. DELETE MODAL TRIGGER
      // ==========================================
      const deleteBtn = target.closest(".delete-btn");
      if (deleteBtn) {
        e.stopPropagation();
        const id = deleteBtn.dataset.id;
        setPendingDeleteId(id);
        this.mainController.toggleModal("delete-modal", true);
        return;
      }

      // ==========================================
      // 6. DIRECT DELETE ITEM HANDLER
      // ==========================================
      const directDeleteBtn = target.closest(".direct-delete-btn");
      if (directDeleteBtn) {
        e.stopPropagation();
        const id = directDeleteBtn.dataset.id;
        if (!id) return;

        const currentState = StateManager.getState();

        if (activeTab === "plans") {
          const plans = (currentState.plans || []).filter(
            (p) => String(p.id) !== String(id),
          );
          StateManager.save({ plans });
        } else if (activeTab === "logs") {
          const logs = (currentState.logs || []).filter(
            (l) => String(l.id) !== String(id),
          );
          StateManager.save({ logs });
        } else if (activeTab === "templates") {
          const templates = (currentState.templates || []).filter(
            (t) => String(t.id) !== String(id),
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
