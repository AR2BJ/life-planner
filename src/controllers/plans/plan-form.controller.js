import {
  generateId,
  mapTagIdsToObjects,
  processTagPipeline,
  todayISO,
} from "@/utils/helpers";

import { AutocompleteComponent } from "@/components/ui/autocomplete.component";
import { ComboboxComponent } from "@/components/ui/combobox.component";
import { DatePickerComponent } from "@/components/ui/date-picker.component";
import { GlobalLoaderService } from "@/services/loader.service";
import { NotificationService } from "@/services/notification.service.js";
import { PlanService } from "@/services/plan.service.js";
import { StateManager } from "@/models/state.model.js";

let pendingDeleteId = null;
let pendingEditId = null;

// Combobox instances
let createPlanCombobox = null;
let editPlanCombobox = null;

// DatePicker instances
let createDatePicker = null;
let editDatePicker = null;

// Autocomplete instances (Create Form)
let createPriorityAutocomplete = null;
let createStatusAutocomplete = null;

// Autocomplete instances (Edit Form)
let editPriorityAutocomplete = null;
let editStatusAutocomplete = null;

let currentModalSubplans = [];

const PRIORITY_OPTIONS = [
  {
    title: "Low Priority",
    value: "low",
    icon: "fa-solid fa-flag text-lime-400",
  },
  {
    title: "Medium Priority",
    value: "medium",
    icon: "fa-solid fa-flag text-amber-400",
  },
  {
    title: "High Priority",
    value: "high",
    icon: "fa-solid fa-flag text-red-400",
  },
];

const STATUS_OPTIONS = [
  {
    title: "To Do",
    value: "todo",
    icon: "fa-regular fa-square text-sky-400",
  },
  {
    title: "In Progress",
    value: "in_progress",
    icon: "fa-regular fa-arrow-progress text-orange-400",
  },
  {
    title: "Done",
    value: "done",
    icon: "fa-regular fa-square-check text-emerald-400",
  },
  {
    title: "Blocked",
    value: "blocked",
    icon: "fa-regular fa-ban text-pink-400",
  },
];

export function setPendingDeleteId(id) {
  pendingDeleteId = id;
}

export function setPendingEditId(id) {
  pendingEditId = id;
  if (id) {
    PlanFormController.populateEditModal(id);
  }
}

export const PlanFormController = {
  init(mainController) {
    this.mainController = mainController;

    const existingGlobalTags = StateManager.getTags() || [];

    const createTagsContainer = document.getElementById("plan-tags-container");
    if (createTagsContainer) {
      createPlanCombobox = new ComboboxComponent(
        createTagsContainer,
        existingGlobalTags,
        {
          label: "Tags",
          placeholder: "Type and select tags...",
          iconClass: "fa-regular fa-tag text-brand/80",
          itemTitle: "name",
          itemValue: "id",
          multiple: true,
          chips: true,
        },
      );
    }

    this.setupDatePicker("create");
    this.setupCreateAutocompletes();
    this.bindFormEvents();
    this.bindSubplanEvents();
    this.bindAccordionEvents();
  },

  refreshUI() {
    if (createPlanCombobox) {
      const updatedGlobalTags = StateManager.getTags() || [];
      createPlanCombobox.setItems(updatedGlobalTags);
      editPlanCombobox?.setItems(updatedGlobalTags);
    }
  },

  setupCreateAutocompletes() {
    const priorityWrapper = document.getElementById("create-priority-wrapper");
    const statusWrapper = document.getElementById("create-status-wrapper");

    if (priorityWrapper) {
      createPriorityAutocomplete = new AutocompleteComponent(
        priorityWrapper,
        PRIORITY_OPTIONS,
        {
          label: "Priority Level",
          placeholder: "Select Priority...",
          itemTitle: "title",
          itemValue: "value",
          itemIcon: "icon",
        },
      );

      createPriorityAutocomplete.setValue("low");
    }

    if (statusWrapper) {
      createStatusAutocomplete = new AutocompleteComponent(
        statusWrapper,
        STATUS_OPTIONS,
        {
          label: "Plan Status",
          placeholder: "Select Status...",
          itemTitle: "title",
          itemValue: "value",
          itemIcon: "icon",
        },
      );
      // Set default value
      createStatusAutocomplete.setValue("todo");
    }
  },

  populateEditModal(planId) {
    if (editPlanCombobox) {
      editPlanCombobox.destroy();
      editPlanCombobox = null;
    }
    if (editPriorityAutocomplete) {
      editPriorityAutocomplete.destroy();
      editPriorityAutocomplete = null;
    }
    if (editStatusAutocomplete) {
      editStatusAutocomplete.destroy();
      editStatusAutocomplete = null;
    }

    this.resetAccordionToFirstItem();

    const plans = StateManager.getPlans();
    const plan = plans.find((t) => t.id === planId);

    if (!plan) return;

    const titleInput = document.getElementById("edit-plan-title");
    const descInput = document.getElementById("edit-plan-desc");

    if (titleInput) titleInput.value = plan.title || "";
    if (descInput) descInput.value = plan.description || "";

    const priorityWrapper = document.getElementById("edit-priority-wrapper");
    const statusWrapper = document.getElementById("edit-status-wrapper");

    if (priorityWrapper) {
      editPriorityAutocomplete = new AutocompleteComponent(
        priorityWrapper,
        PRIORITY_OPTIONS,
        {
          label: "Priority Level",
          placeholder: "Select Priority...",
          itemTitle: "title",
          itemValue: "value",
          itemIcon: "icon",
        },
      );
      if (plan.priority) {
        editPriorityAutocomplete.setValue(plan.priority);
      }
    }

    if (statusWrapper) {
      editStatusAutocomplete = new AutocompleteComponent(
        statusWrapper,
        STATUS_OPTIONS,
        {
          label: "Plan Status",
          placeholder: "Select Status...",
          itemTitle: "title",
          itemValue: "value",
          itemIcon: "icon",
        },
      );
      if (plan.status) {
        editStatusAutocomplete.setValue(plan.status);
      }
    }

    const globalTags = StateManager.getTags() || [];

    const editTagsContainer = document.getElementById(
      "edit-plan-tags-container",
    );
    if (editTagsContainer) {
      editPlanCombobox = new ComboboxComponent(editTagsContainer, globalTags, {
        label: "Tags",
        placeholder: "Type and select tags...",
        iconClass: "fa-regular fa-tag text-brand/80",
        itemTitle: "name",
        itemValue: "id",
        multiple: true,
        chips: true,
      });

      if (Array.isArray(plan.tags)) {
        const selectedTagObjects = mapTagIdsToObjects(plan.tags, globalTags);
        selectedTagObjects.forEach((tagObj) => {
          editPlanCombobox.selectItem(tagObj);
        });
      }
    }

    this.setupDatePicker("edit", plan.dueDate || "");

    currentModalSubplans = (
      plan.subplans ? JSON.parse(JSON.stringify(plan.subplans)) : []
    ).map((subplan) => ({
      ...subplan,
      isEditing: false,
    }));
    this.renderModalSubplans();
  },

  renderModalSubplans() {
    const container = document.getElementById("edit-subplans-list");
    const badge = document.getElementById("subplan-progress-badge");

    if (!container) return;

    const total = currentModalSubplans.length;
    const completedCount = currentModalSubplans.filter(
      (s) => s.completed,
    ).length;

    if (badge) {
      badge.textContent = `${completedCount}/${total} Done`;
    }

    if (total === 0) {
      container.innerHTML = `
        <div
          class="w-full h-full min-h-55 sm:min-h-50 lg:min-h-45 overflow-y-auto scrollbar-thumb-surface-2 scrollbar-thin bg-surface rounded-2xl border border-dashed border-border/70 p-4 text-center flex flex-col justify-center items-center"
        >
          <div class="h-full flex flex-col justify-center items-center">
            <div class="text-3xl">
              <i class="fa-regular fa-list-check text-brand/80"></i>
            </div>
            <p class="mt-3 text-secondary max-w-sm mx-auto text-sm">
              No subplans defined yet.
            </p>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div
        class="w-full h-full max-h-55 sm:max-h-50 lg:max-h-48 overflow-y-auto scrollbar-thumb-surface-2 scrollbar-thin bg-surface rounded-2xl border border-border/60 p-2.5 flex flex-col justify-start gap-2.5"
      >
        ${currentModalSubplans
          .map(
            (subplan) => `
              <div
                data-subplan-id="${subplan.id}"
                class="subplan-item flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-surface-2 p-1 shadow-sm transition"
              >
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <input
                    type="text"
                    data-action="edit-text"
                    data-tooltip-title="${subplan.title}"
                    value="${(subplan.title ?? "").replace(/"/g, "&quot;")}"
                    class="subplan-title-input flex sm:hidden truncate text-sm text-color mx-3 bg-transparent outline-none w-full border-b min-h-7 py-1 cursor-pointer ${
                      subplan.isEditing
                        ? "border-brand/50"
                        : "border-transparent"
                    } ${subplan.completed ? "line-through text-muted" : ""}"
                    ${subplan.isEditing ? "" : "readonly"}
                  />
                  <input
                    type="text"
                    data-action="edit-text"
                    value="${(subplan.title ?? "").replace(/"/g, "&quot;")}"
                    class="subplan-title-input hidden sm:flex text-sm text-color mx-3 bg-transparent outline-none w-full border-b min-h-7 py-1 ${
                      subplan.isEditing
                        ? "border-brand/50"
                        : "border-transparent"
                    } ${subplan.completed ? "line-through text-muted" : ""}"
                    ${subplan.isEditing ? "" : "readonly"}
                  />
                </div>

                <div class="flex items-center gap-1 shrink-0">
                  <button
                    data-action="edit"
                    class="edit-btn flex h-8 w-8 sm:w-10 sm:h-10 items-center justify-center rounded-lg sm:rounded-xl border border-border bg-surface hover:bg-brand/10 hover:cursor-pointer transition"
                    title="${
                      subplan.isEditing ? "Save changes" : "Edit subplan"
                    }"
                  >
                    <i
                      class="fa-regular ${
                        subplan.isEditing
                          ? "fa-floppy-disk"
                          : "fa-pen-to-square"
                      } text-blue-500/80 text-base"
                    ></i>
                  </button>

                  <button
                    data-action="delete"
                    class="delete-btn flex h-8 w-8 sm:w-10 sm:h-10 items-center justify-center rounded-lg sm:rounded-xl border border-border bg-surface hover:bg-red-600/10 hover:cursor-pointer transition"
                  >
                    <i
                      class="fa-regular fa-trash-can text-red-500/80 text-base"
                    ></i>
                  </button>
                </div>
              </div>
            `,
          )
          .join("")}
      </div>
    `;
  },

  bindSubplanEvents() {
    const addSubplanBtn = document.getElementById("add-subplan-btn");
    const newSubplanInput = document.getElementById("new-subplan-input");
    const container = document.getElementById("edit-subplans-list");

    const handleAddSubplan = () => {
      if (!newSubplanInput) return;
      const title = newSubplanInput.value.trim();
      if (!title) return;

      currentModalSubplans.push({
        id: generateId(),
        title,
        completed: false,
      });

      newSubplanInput.value = "";
      this.renderModalSubplans();
    };

    addSubplanBtn?.addEventListener("click", handleAddSubplan);
    newSubplanInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddSubplan();
      }
    });

    container?.addEventListener("click", (e) => {
      const target = e.target.closest("[data-action]");
      if (!target) return;

      const subplanCard = target.closest("[data-subplan-id]");
      if (!subplanCard) return;

      const subplanId = subplanCard.dataset.subplanId;
      const action = target.dataset.action;

      if (action === "delete") {
        const index = currentModalSubplans.findIndex((s) => s.id === subplanId);
        if (index === -1) return;

        const removedSubplan = currentModalSubplans[index];

        currentModalSubplans.splice(index, 1);
        this.renderModalSubplans();

        NotificationService.show({
          type: "error",
          message: `Subplan "${removedSubplan.title}" deleted`,
          duration: 5000,
          undoAction: () => {
            GlobalLoaderService.show("Re-instating deleted record...");
            setTimeout(() => {
              try {
                currentModalSubplans.splice(index, 0, removedSubplan);
                this.renderModalSubplans();
              } finally {
                GlobalLoaderService.hide();
              }
            }, 30);
          },
        });
      } else if (action === "edit") {
        const subplan = currentModalSubplans.find((s) => s.id === subplanId);
        if (subplan) {
          subplan.isEditing = !subplan.isEditing;
          this.renderModalSubplans();

          if (subplan.isEditing) {
            requestAnimationFrame(() => {
              const input = container?.querySelector(
                `[data-subplan-id="${subplanId}"] .subplan-title-input`,
              );
              input?.focus();
              input?.select();
            });
          }
        }
      } else if (action === "toggle") {
        const subplan = currentModalSubplans.find((s) => s.id === subplanId);
        if (subplan) {
          subplan.completed = !subplan.completed;
          this.renderModalSubplans();
        }
      }
    });

    container?.addEventListener("input", (e) => {
      if (e.target.dataset.action === "edit-text") {
        const subplanCard = e.target.closest("[data-subplan-id]");
        if (!subplanCard) return;

        const subplanId = subplanCard.dataset.subplanId;
        const subplan = currentModalSubplans.find((s) => s.id === subplanId);
        if (subplan) {
          subplan.title = e.target.value;
        }
      }
    });
  },

  bindFormEvents() {
    const titleInput = document.getElementById("plan-title-input");
    const descInput = document.getElementById("plan-desc-input");
    const addBtn = document.getElementById("add-plan-btn");

    const handleAddPlan = () => {
      const title = titleInput?.value.trim();
      const description = descInput?.value.trim() || "";

      const priority = createPriorityAutocomplete
        ? createPriorityAutocomplete.getValue()
        : "low";
      const status = createStatusAutocomplete
        ? createStatusAutocomplete.getValue()
        : "todo";
      const dueDate = createDatePicker ? createDatePicker.value : null;

      const rawComboboxItems = createPlanCombobox
        ? createPlanCombobox.getSelectedItems()
        : [];
      const currentGlobalTags = StateManager.getTags() || [];

      const { assignedTagIds, updatedGlobalTags } = processTagPipeline(
        rawComboboxItems,
        currentGlobalTags,
      );

      if (!title) {
        NotificationService.show({
          type: "error",
          message: "Plan title cannot be empty",
          icon: "fa-triangle-exclamation",
          duration: 5000,
        });
        return;
      }

      GlobalLoaderService.show(`Creating plan "${title}"...`);

      setTimeout(() => {
        try {
          const currentPlans = StateManager.getPlans();

          const newPlanPayload = {
            id: generateId(),
            title,
            description,
            dueDate,
            priority,
            status,
            tags: assignedTagIds,
            subplans: [],
            archived: false,
            createdAt: todayISO(),
          };

          const updatedPlans = PlanService
            ? PlanService.createPlan(currentPlans, newPlanPayload)
            : [newPlanPayload, ...currentPlans];

          StateManager.save(updatedPlans, updatedGlobalTags);

          if (titleInput) titleInput.value = "";
          if (descInput) descInput.value = "";

          createPriorityAutocomplete?.setValue("low");
          createStatusAutocomplete?.setValue("todo");
          createPlanCombobox?.clear();
          createDatePicker?.reset();

          this.mainController.refreshUI();

          NotificationService.show({
            type: "success",
            message: `Plan "${title}" created successfully!`,
            icon: "fa-check",
            duration: 5000,
          });
        } catch (error) {
          NotificationService.show({
            type: "error",
            message: error.message || "Failed to create plan",
            icon: "fa-triangle-exclamation",
            duration: 5000,
          });
        } finally {
          GlobalLoaderService.hide();
        }
      }, 30);
    };

    addBtn?.addEventListener("click", handleAddPlan);

    titleInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleAddPlan();
      }
    });

    document.addEventListener("keydown", (e) => {
      const deleteModal = document.getElementById("delete-modal");
      const editModal = document.getElementById("edit-modal");

      const deleteOpen =
        deleteModal && !deleteModal.classList.contains("hidden");
      const editOpen = editModal && !editModal.classList.contains("hidden");

      if (!deleteOpen && !editOpen) return;

      if (e.key === "Escape") {
        if (deleteOpen) this.mainController.toggleModal("delete-modal", false);
        if (editOpen) this.mainController.toggleModal("edit-modal", false);
      }

      if (e.key === "Enter" && e.ctrlKey) {
        if (deleteOpen) this.executeDelete();
        if (editOpen) this.executeEdit();
      }
    });

    const addClick = (id, cb) =>
      document.getElementById(id)?.addEventListener("click", cb);

    // Modal Delete Actions
    addClick("confirm-delete-btn", () => this.executeDelete());
    addClick("confirm-delete", () => this.executeDelete());
    addClick("cancel-delete-btn", () =>
      this.mainController.toggleModal("delete-modal", false),
    );
    addClick("cancel-delete", () =>
      this.mainController.toggleModal("delete-modal", false),
    );

    // Modal Edit Actions
    addClick("confirm-edit", () => this.executeEdit());
    addClick("cancel-edit", () =>
      this.mainController.toggleModal("edit-modal", false),
    );

    // Modal Mobile Edit Actions
    addClick("confirm-edit-mobile", () => this.executeEdit());
    addClick("cancel-edit-mobile", () =>
      this.mainController.toggleModal("edit-modal", false),
    );
    addClick("cancel-edit-modal", () =>
      this.mainController.toggleModal("edit-modal", false),
    );
  },

  bindAccordionEvents() {
    const accordionGroup = document.getElementById("edit-accordion-group");
    if (!accordionGroup) return;

    accordionGroup.addEventListener("click", (e) => {
      const header = e.target.closest(".accordion-header");
      if (!header) return;

      const currentItem = header.closest(".accordion-item");
      const currentContent = currentItem.querySelector(".accordion-content");

      if (!currentContent.classList.contains("hidden")) return;

      const allItems = accordionGroup.querySelectorAll(".accordion-item");
      const currentIndex = Array.from(allItems).indexOf(currentItem);

      allItems.forEach((item, index) => {
        const content = item.querySelector(".accordion-content");
        const icon = item.querySelector(".accordion-icon");
        const itemHeader = item.querySelector(".accordion-header");

        if (index === currentIndex) {
          content.classList.remove("hidden");

          if (index === 2) {
            content.classList.add("flex");
          } else {
            content.classList.remove("flex");
          }
        } else {
          content.classList.add("hidden");
          content.classList.remove("flex");
        }

        itemHeader?.classList.toggle("border-b", index === currentIndex);
        icon?.classList.toggle("fa-chevron-up", index === currentIndex);
        icon?.classList.toggle("fa-chevron-down", index !== currentIndex);
      });
    });
  },

  resetAccordionToFirstItem() {
    const accordionGroup = document.getElementById("edit-accordion-group");
    if (!accordionGroup) return;

    const items = accordionGroup.querySelectorAll(".accordion-item");
    items.forEach((item, index) => {
      const header = item.querySelector(".accordion-header");
      const content = item.querySelector(".accordion-content");
      const icon = item.querySelector(".accordion-icon");

      if (index === 0) {
        content.classList.remove("hidden");
        header.classList.add("border-b");
        if (icon) {
          icon.classList.remove("fa-chevron-down");
          icon.classList.add("fa-chevron-up");
        }
      } else {
        content.classList.add("hidden");
        header.classList.remove("border-b");
        if (icon) {
          icon.classList.remove("fa-chevron-up");
          icon.classList.add("fa-chevron-down");
        }
      }
    });
  },

  executeDelete() {
    const id = pendingDeleteId;
    if (!id) return;

    const currentPlans = StateManager.getPlans();
    const planToDelete = currentPlans.find((h) => h.id === id);

    if (planToDelete) {
      const capturedPlan = { ...planToDelete };

      GlobalLoaderService.show(
        `Purging "${capturedPlan.title}" from database layers...`,
      );

      setTimeout(() => {
        try {
          const updated = PlanService.deletePlan(currentPlans, id);
          StateManager.save(updated);
          this.mainController.toggleModal("delete-modal", false);
          pendingDeleteId = null;
          this.mainController.refreshUI();

          NotificationService.show({
            type: "error",
            message: `Deleted "${capturedPlan.title}"`,
            duration: 5000,
            undoAction: () => {
              GlobalLoaderService.show("Re-instating deleted record...");
              setTimeout(() => {
                try {
                  const latestPlans = StateManager.getPlans();
                  StateManager.save([capturedPlan, ...latestPlans]);
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
  },

  executeEdit() {
    const titleInput = document.getElementById("edit-plan-title");
    const descInput = document.getElementById("edit-plan-desc");

    if (!pendingEditId || !titleInput) return;

    const newTitle = titleInput.value.trim();
    if (!newTitle) {
      NotificationService.show({
        type: "error",
        message: "Plan title cannot be empty",
        icon: "fa-triangle-exclamation",
        duration: 5000,
      });
      return;
    }

    const updatedDueDate = editDatePicker ? editDatePicker.value : null;
    const updatedPriority = editPriorityAutocomplete
      ? editPriorityAutocomplete.getValue()
      : "low";
    const updatedStatus = editStatusAutocomplete
      ? editStatusAutocomplete.getValue()
      : "todo";

    const rawComboboxItems = editPlanCombobox
      ? editPlanCombobox.getSelectedItems()
      : [];
    const currentGlobalTags = StateManager.getTags() || [];

    const { assignedTagIds, updatedGlobalTags } = processTagPipeline(
      rawComboboxItems,
      currentGlobalTags,
    );

    GlobalLoaderService.show("Updating plan record...");

    setTimeout(() => {
      try {
        const currentPlans = StateManager.getPlans();

        const updatedPlanData = {
          title: newTitle,
          description: descInput?.value.trim() || "",
          dueDate: updatedDueDate,
          priority: updatedPriority,
          status: updatedStatus,
          tags: assignedTagIds,
          subplans: currentModalSubplans,
        };

        const updated = PlanService.editPlan
          ? PlanService.editPlan(currentPlans, pendingEditId, updatedPlanData)
          : currentPlans.map((plan) =>
              plan.id === pendingEditId
                ? { ...plan, ...updatedPlanData }
                : plan,
            );

        StateManager.save(updated, updatedGlobalTags);
        this.mainController.toggleModal("edit-modal", false);

        // Clean up instances
        if (editPlanCombobox) {
          editPlanCombobox.destroy();
          editPlanCombobox = null;
        }
        if (editPriorityAutocomplete) {
          editPriorityAutocomplete.destroy();
          editPriorityAutocomplete = null;
        }
        if (editStatusAutocomplete) {
          editStatusAutocomplete.destroy();
          editStatusAutocomplete = null;
        }
        if (editDatePicker) {
          editDatePicker = null;
        }

        pendingEditId = null;
        currentModalSubplans = [];

        this.mainController.refreshUI();
        this.refreshUI();

        NotificationService.show({
          type: "success",
          message: `Plan "${newTitle}" updated successfully!`,
          icon: "fa-check",
          duration: 5000,
        });
      } catch (error) {
        NotificationService.show({
          type: "error",
          message: error.message || "Failed to update plan",
          icon: "fa-triangle-exclamation",
          duration: 5000,
        });
      } finally {
        GlobalLoaderService.hide();
      }
    }, 30);
  },

  setupDatePicker(action, initialValue = "") {
    if (action === "create") {
      const container = document.getElementById("create-datepicker-container");
      if (!container) return;

      createDatePicker = new DatePickerComponent({
        id: "plan-duedate-input",
        label: "Due Date",
        value: initialValue,
        placeholder: "YYYY-MM-DD",
      });

      container.innerHTML = createDatePicker.render();
      createDatePicker.bindEvents();
    } else {
      const container = document.getElementById("edit-datepicker-container");
      if (!container) return;

      editDatePicker = new DatePickerComponent({
        id: "edit-plan-duedate",
        label: "Due Date",
        value: initialValue,
        placeholder: "YYYY-MM-DD",
        background: "surface",
      });

      container.innerHTML = editDatePicker.render();
      editDatePicker.bindEvents();
    }
  },
};
