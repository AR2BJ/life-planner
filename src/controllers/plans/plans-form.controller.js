import {
  DAILY_LOG_CATEGORIES,
  DAILY_MOOD_OPTIONS,
  GOAL_CATEGORIES,
  GOAL_PRIORITY_OPTIONS,
  GOAL_UNIT_OPTIONS,
  TEMPLATE_CATEGORIES,
  TIMEFRAME_OPTIONS,
} from "@/utils/constants/options-value.constants";
import {
  formatNumberWithCommas,
  generateId,
  getUnitConfig,
  parseFormattedNumber,
  todayISO,
} from "@/utils/helpers.js";

import { AutocompleteComponent } from "@/components/ui/autocomplete.component.js";
import { DatePickerComponent } from "@/components/ui/date-picker.component.js";
import { GlobalLoaderService } from "@/services/loader.service.js";
import { NotificationService } from "@/services/notification.service.js";
import { PlanService } from "@/services/plans.service.js";
import { StateManager } from "@/models/state.model.js";

let pendingDeleteId = null;
let pendingEditId = null;

let currentEditMilestones = [];
let currentEditSteps = [];

// Autocomplete & DatePicker references for Create Form
let createGoalCategoryAutocomplete = null;
let createGoalTimeframeAutocomplete = null;
let createGoalPriorityAutocomplete = null;
let createGoalUnitAutocomplete = null;
let createGoalStartDatePicker = null;
let createGoalEndDatePicker = null;

let createDailyCategoryAutocomplete = null;
let createDailyMoodAutocomplete = null;
let createDailyDatePicker = null;
let createDailyGoalLinkAutocomplete = null;

let createTemplateCategoryAutocomplete = null;

// Autocomplete & DatePicker references for Edit Form
let editGoalCategoryAutocomplete = null;
let editGoalTimeframeAutocomplete = null;
let editGoalPriorityAutocomplete = null;
let editGoalUnitAutocomplete = null;
let editGoalStartDatePicker = null;
let editGoalEndDatePicker = null;

let editDailyCategoryAutocomplete = null;
let editDailyMoodAutocomplete = null;
let editDailyDatePicker = null;
let editDailyGoalLinkAutocomplete = null;

let editTemplateCategoryAutocomplete = null;

export function setPendingDeleteId(id) {
  pendingDeleteId = id;
}

export function setPendingEditId(id) {
  pendingEditId = id;
  if (id) {
    PlansFormController.populateEditModal(id);
  }
}

export const PlansFormController = {
  init(mainController) {
    this.mainController = mainController;
    this.setupCreateAutocompletes();
    this.bindFormEvents();
    this.bindEditItemEvents();
    this.bindAccordionEvents();
  },

  refreshUI() {
    this.setupCreateAutocompletes();
    this.bindTargetInputValidation();
    this.bindCurrentInputValidation();
    this.updateAddButtonText();
  },

  updateAddButtonText() {
    const activeTab = StateManager.getPlansTab
      ? StateManager.getPlansTab()
      : "goals";
    const btnTextSpan = document.getElementById("add-plan-btn-text");
    if (!btnTextSpan) return;

    if (activeTab === "goals") {
      btnTextSpan.textContent = "Add Goal";
    } else if (activeTab === "daily") {
      btnTextSpan.textContent = "Add Daily Log";
    } else if (activeTab === "templates") {
      btnTextSpan.textContent = "Add Template";
    }
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

      const visibleItems = Array.from(
        accordionGroup.querySelectorAll(".accordion-item"),
      ).filter((item) => !item.classList.contains("hidden"));

      const currentIndex = visibleItems.indexOf(currentItem);

      visibleItems.forEach((item, index) => {
        const content = item.querySelector(".accordion-content");
        const icon = item.querySelector(".accordion-icon");
        const itemHeader = item.querySelector(".accordion-header");

        if (index === currentIndex) {
          content.classList.replace("hidden", "flex");
        } else {
          content.classList.replace("flex", "hidden");
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

    const visibleItems = Array.from(
      accordionGroup.querySelectorAll(".accordion-item"),
    ).filter((item) => !item.classList.contains("hidden"));

    visibleItems.forEach((item, index) => {
      const header = item.querySelector(".accordion-header");
      const content = item.querySelector(".accordion-content");
      const icon = item.querySelector(".accordion-icon");

      if (index === 0) {
        content.classList.replace("hidden", "flex");
        header?.classList.add("border-b");
        if (icon) {
          icon.classList.remove("fa-chevron-down");
          icon.classList.add("fa-chevron-up");
        }
      } else {
        content.classList.replace("flex", "hidden");
        header?.classList.remove("border-b");
        if (icon) {
          icon.classList.remove("fa-chevron-up");
          icon.classList.add("fa-chevron-down");
        }
      }
    });
  },

  bindEditItemEvents() {
    // --- Edit Milestones ---
    const addMilestoneBtn = document.getElementById("btn-add-milestone");
    const newMilestoneInput = document.getElementById("new-milestone-input");
    const milestonesContainer = document.getElementById("goal-milestones-list");

    const handleAddMilestone = () => {
      if (!newMilestoneInput) return;
      const title = newMilestoneInput.value.trim();
      if (!title) return;

      currentEditMilestones.push({
        id: generateId(),
        title,
        completed: false,
        isEditing: false,
      });

      newMilestoneInput.value = "";
      this.renderEditMilestones();
    };

    addMilestoneBtn?.addEventListener("click", handleAddMilestone);
    newMilestoneInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddMilestone();
      }
    });

    milestonesContainer?.addEventListener("click", (e) => {
      const target = e.target.closest("[data-action]");
      if (!target) return;

      const card = target.closest("[data-item-id]");
      if (!card) return;

      const itemId = card.dataset.itemId;
      const action = target.dataset.action;

      if (action === "delete") {
        const index = currentEditMilestones.findIndex((m) => m.id === itemId);
        if (index === -1) return;
        const removedItem = currentEditMilestones[index];

        currentEditMilestones.splice(index, 1);
        this.renderEditMilestones();

        NotificationService.show({
          type: "error",
          message: `Milestone "${removedItem.title}" deleted`,
          duration: 4000,
          undoAction: () => {
            currentEditMilestones.splice(index, 0, removedItem);
            this.renderEditMilestones();
          },
        });
      } else if (action === "toggle") {
        const item = currentEditMilestones.find((m) => m.id === itemId);
        if (item) {
          item.completed = !item.completed;
          this.renderEditMilestones();
        }
      } else if (action === "edit") {
        const item = currentEditMilestones.find((m) => m.id === itemId);
        if (item) {
          item.isEditing = !item.isEditing;
          this.renderEditMilestones();

          if (item.isEditing) {
            requestAnimationFrame(() => {
              const input = milestonesContainer?.querySelector(
                `[data-item-id="${itemId}"] .item-title-input`,
              );
              input?.focus();
              input?.select();
            });
          }
        }
      }
    });

    milestonesContainer?.addEventListener("input", (e) => {
      if (e.target.dataset.action === "edit-text") {
        const card = e.target.closest("[data-item-id]");
        if (!card) return;
        const item = currentEditMilestones.find(
          (m) => m.id === card.dataset.itemId,
        );
        if (item) item.title = e.target.value;
      }
    });

    // --- Edit Steps ---
    const addStepBtn = document.getElementById("add-step-btn");
    const newStepInput = document.getElementById("new-step-input");
    const stepsContainer = document.getElementById("template-steps-list");

    const handleAddStep = () => {
      if (!newStepInput) return;
      const title = newStepInput.value.trim();
      if (!title) return;

      currentEditSteps.push({
        id: generateId(),
        title,
        isEditing: false,
      });

      newStepInput.value = "";
      this.renderEditSteps();
    };

    addStepBtn?.addEventListener("click", handleAddStep);
    newStepInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddStep();
      }
    });

    stepsContainer?.addEventListener("click", (e) => {
      const target = e.target.closest("[data-action]");
      if (!target) return;

      const card = target.closest("[data-item-id]");
      if (!card) return;

      const itemId = card.dataset.itemId;
      const action = target.dataset.action;

      if (action === "delete") {
        const index = currentEditSteps.findIndex((s) => s.id === itemId);
        if (index === -1) return;
        const removedItem = currentEditSteps[index];

        currentEditSteps.splice(index, 1);
        this.renderEditSteps();

        NotificationService.show({
          type: "error",
          message: `Step "${removedItem.title}" deleted`,
          duration: 4000,
          undoAction: () => {
            currentEditSteps.splice(index, 0, removedItem);
            this.renderEditSteps();
          },
        });
      } else if (action === "edit") {
        const item = currentEditSteps.find((s) => s.id === itemId);
        if (item) {
          item.isEditing = !item.isEditing;
          this.renderEditSteps();

          if (item.isEditing) {
            requestAnimationFrame(() => {
              const input = stepsContainer?.querySelector(
                `[data-item-id="${itemId}"] .item-title-input`,
              );
              input?.focus();
              input?.select();
            });
          }
        }
      }
    });

    stepsContainer?.addEventListener("input", (e) => {
      if (e.target.dataset.action === "edit-text") {
        const card = e.target.closest("[data-item-id]");
        if (!card) return;
        const item = currentEditSteps.find((s) => s.id === card.dataset.itemId);
        if (item) item.title = e.target.value;
      }
    });
  },

  renderEditMilestones() {
    const container = document.getElementById("goal-milestones-list");
    const badge = document.getElementById("milestone-progress-badge");

    const total = currentEditMilestones.length;
    const completedCount = currentEditMilestones.filter(
      (item) => item.completed,
    ).length;

    if (badge) {
      badge.textContent = `${completedCount}/${total} Completed`;
    }

    if (!container) return;

    container.innerHTML = this._generateListMarkup(
      currentEditMilestones,
      "No milestones defined yet.",
      "fa-calendar-heart",
    );
  },

  renderEditSteps() {
    const container = document.getElementById("template-steps-list");
    if (!container) return;
    container.innerHTML = this._generateListMarkup(
      currentEditSteps,
      "No steps defined yet.",
      "fa-stairs",
    );
  },

  _generateListMarkup(items, emptyMessage, icon) {
    if (!items || items.length === 0) {
      return `
        <div
          class="w-full h-full min-h-55 sm:min-h-50 lg:min-h-45 overflow-y-auto scrollbar-thumb-surface-2 scrollbar-thin bg-surface rounded-2xl border border-dashed border-border/70 p-4 text-center flex flex-col justify-center items-center"
        >
          <div class="h-full flex flex-col justify-center items-center">
            <div class="text-3xl">
              <i class="fa-regular ${icon} text-brand/80"></i>
            </div>
            <p class="mt-3 text-secondary max-w-sm mx-auto text-sm">
              ${emptyMessage}
            </p>
          </div>
        </div>
      `;
    }

    return `
      <div class="w-full max-h-55 sm:max-h-50 lg:max-h-48 overflow-y-auto scrollbar-thumb-surface-2 scrollbar-thin bg-surface rounded-2xl border border-border/60 p-2 flex flex-col gap-2">
        ${items
          .map(
            (item) => `
              <div
                data-item-id="${item.id}"
                class="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-surface-2 p-1 shadow-sm transition"
              >
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <input
                    type="text"
                    data-action="edit-text"
                    value="${(item.title ?? "").replace(/"/g, "&quot;")}"
                    class="item-title-input text-xs lg:text-sm text-color mx-2 bg-transparent outline-none w-full border-b min-h-7 py-1 ${
                      item.isEditing ? "border-brand/50" : "border-transparent"
                    }"
                    ${item.isEditing ? "" : "readonly"}
                  />
                </div>

                <div class="flex items-center gap-1 shrink-0">
                  <button
                    data-action="edit"
                    type="button"
                    class="edit-btn flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface hover:bg-brand/10 hover:cursor-pointer transition"
                    title="${item.isEditing ? "Save changes" : "Edit item"}"
                  >
                    <i class="fa-regular ${
                      item.isEditing ? "fa-floppy-disk" : "fa-pen-to-square"
                    } text-blue-500/80 text-xs lg:text-sm"></i>
                  </button>

                  <button
                    data-action="delete"
                    type="button"
                    class="delete-btn flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface hover:bg-red-600/10 hover:cursor-pointer transition"
                    title="Delete item"
                  >
                    <i class="fa-regular fa-trash-can text-red-500/80 text-xs lg:text-sm"></i>
                  </button>
                </div>
              </div>
            `,
          )
          .join("")}
      </div>
    `;
  },

  setupCreateAutocompletes() {
    const goalCategoryOptions = GOAL_CATEGORIES.map((cat) => ({
      value: cat.id,
      label: cat.name,
      icon: cat.icon,
    }));
    const unitOptions = GOAL_UNIT_OPTIONS.map((u) => ({
      value: u.id,
      label: u.name,
      icon: u.icon,
    }));
    const timeframeOptions = TIMEFRAME_OPTIONS.map((tf) => ({
      value: tf.id,
      label: tf.name,
      icon: tf.icon,
    }));
    const priorityOptions = GOAL_PRIORITY_OPTIONS.map((p) => ({
      value: p.id,
      label: p.name,
      icon: p.icon,
    }));
    const dailyLogCategoryOptions = DAILY_LOG_CATEGORIES.map((cat) => ({
      value: cat.id,
      label: cat.name,
      icon: cat.icon,
    }));
    const moodOptions = DAILY_MOOD_OPTIONS.map((m) => ({
      value: m.id,
      label: m.name,
      icon: m.icon,
    }));
    const templateCategoryOptions = TEMPLATE_CATEGORIES.map((cat) => ({
      value: cat.id,
      label: cat.name,
      icon: cat.icon,
    }));

    const goalCatContainer = document.getElementById(
      "create-goal-category-autocomplete",
    );
    if (goalCatContainer) {
      if (createGoalCategoryAutocomplete)
        createGoalCategoryAutocomplete.destroy();
      createGoalCategoryAutocomplete = new AutocompleteComponent(
        goalCatContainer,
        goalCategoryOptions,
        {
          label: "Category",
          itemTitle: "label",
          itemValue: "value",
          itemIcon: "icon",
          defaultValue: "general",
          placeholder: "Select category...",
        },
      );
      createGoalCategoryAutocomplete.setValue("general");
    }

    const timeframeContainer = document.getElementById(
      "create-goal-timeframe-autocomplete",
    );
    if (timeframeContainer) {
      if (createGoalTimeframeAutocomplete)
        createGoalTimeframeAutocomplete.destroy();
      createGoalTimeframeAutocomplete = new AutocompleteComponent(
        timeframeContainer,
        timeframeOptions,
        {
          label: "Timeframe",
          itemTitle: "label",
          itemValue: "value",
          itemIcon: "icon",
          defaultValue: "yearly",
          placeholder: "Select timeframe...",
        },
      );
      createGoalTimeframeAutocomplete.setValue("yearly");
    }

    const priorityContainer = document.getElementById(
      "create-goal-priority-autocomplete",
    );
    if (priorityContainer) {
      if (createGoalPriorityAutocomplete)
        createGoalPriorityAutocomplete.destroy();
      createGoalPriorityAutocomplete = new AutocompleteComponent(
        priorityContainer,
        priorityOptions,
        {
          label: "Priority",
          itemTitle: "label",
          itemValue: "value",
          itemIcon: "icon",
          defaultValue: "medium",
          placeholder: "Select priority...",
        },
      );
      createGoalPriorityAutocomplete.setValue("low");
    }

    const unitContainer = document.getElementById(
      "create-goal-unit-autocomplete",
    );
    if (unitContainer) {
      if (createGoalUnitAutocomplete) createGoalUnitAutocomplete.destroy();
      createGoalUnitAutocomplete = new AutocompleteComponent(
        unitContainer,
        unitOptions,
        {
          label: "Unit",
          itemTitle: "label",
          itemValue: "value",
          itemIcon: "icon",
          defaultValue: "%",
          placeholder: "Select unit...",
          onChange: (selectedUnit) => {
            const targetInput = document.getElementById("create-goal-target");
            if (targetInput) {
              const config = getUnitConfig(selectedUnit);
              targetInput.value = formatNumberWithCommas(config.defaultValue);
            }
          },
        },
      );
      createGoalUnitAutocomplete.setValue("%");
    }

    const startDateContainer = document.getElementById(
      "create-goal-startdate-container",
    );
    if (startDateContainer) {
      createGoalStartDatePicker = new DatePickerComponent({
        id: "create-goal-startdate",
        value: todayISO(),
        label: "Start Date",
        placeholder: "Select start date...",
        background: "surface-2",
      });
      startDateContainer.innerHTML = createGoalStartDatePicker.render();
      createGoalStartDatePicker.bindEvents();
    }

    const endDateContainer = document.getElementById(
      "create-goal-enddate-container",
    );
    if (endDateContainer) {
      createGoalEndDatePicker = new DatePickerComponent({
        id: "create-goal-enddate",
        value: "",
        label: "End Date (Optional)",
        placeholder: "Select end date...",
        background: "surface-2",
      });
      endDateContainer.innerHTML = createGoalEndDatePicker.render();
      createGoalEndDatePicker.bindEvents();
    }

    const dailyCatContainer = document.getElementById(
      "create-daily-category-autocomplete",
    );
    if (dailyCatContainer) {
      if (createDailyCategoryAutocomplete)
        createDailyCategoryAutocomplete.destroy();
      createDailyCategoryAutocomplete = new AutocompleteComponent(
        dailyCatContainer,
        dailyLogCategoryOptions,
        {
          label: "Category",
          itemTitle: "label",
          itemValue: "value",
          itemIcon: "icon",
          defaultValue: "journal",
          placeholder: "Select log category...",
        },
      );
      createDailyCategoryAutocomplete.setValue("journal");
    }

    const moodContainer = document.getElementById(
      "create-daily-mood-autocomplete",
    );
    if (moodContainer) {
      if (createDailyMoodAutocomplete) createDailyMoodAutocomplete.destroy();
      createDailyMoodAutocomplete = new AutocompleteComponent(
        moodContainer,
        moodOptions,
        {
          label: "Mood",
          itemTitle: "label",
          itemValue: "value",
          itemIcon: "icon",
          defaultValue: "good",
          placeholder: "Select mood...",
        },
      );
      createDailyMoodAutocomplete.setValue("good");
    }

    const dailyDatePickerContainer = document.getElementById(
      "create-daily-datepicker-container",
    );
    if (dailyDatePickerContainer) {
      createDailyDatePicker = new DatePickerComponent({
        id: "create-daily-datepicker",
        value: todayISO(),
        label: "Date",
        placeholder: "Select date...",
        background: "surface-2",
      });
      dailyDatePickerContainer.innerHTML = createDailyDatePicker.render();
      createDailyDatePicker.bindEvents();
    }

    const goalLinkContainer = document.getElementById(
      "create-daily-goal-link-autocomplete",
    );
    if (goalLinkContainer) {
      if (createDailyGoalLinkAutocomplete)
        createDailyGoalLinkAutocomplete.destroy();
      const goals = StateManager.getGoals() || [];
      const goalLinkOptions = goals.map((g) => ({
        id: g.id,
        title: g.title,
        icon: "fa-regular fa-bullseye text-brand/80",
      }));

      createDailyGoalLinkAutocomplete = new AutocompleteComponent(
        goalLinkContainer,
        goalLinkOptions,
        {
          label: "Link to Goal (Optional)",
          itemTitle: "title",
          itemValue: "id",
          itemIcon: "icon",
          placeholder: "Select goal to link...",
        },
      );
    }

    const templateCatContainer = document.getElementById(
      "create-template-category-autocomplete",
    );
    if (templateCatContainer) {
      if (createTemplateCategoryAutocomplete)
        createTemplateCategoryAutocomplete.destroy();
      createTemplateCategoryAutocomplete = new AutocompleteComponent(
        templateCatContainer,
        templateCategoryOptions,
        {
          label: "Category",
          itemTitle: "label",
          itemValue: "value",
          itemIcon: "icon",
          defaultValue: "workflow",
          placeholder: "Select template category...",
        },
      );
      createTemplateCategoryAutocomplete.setValue("workflow");
    }
  },

  populateEditModal(itemId) {
    if (editGoalCategoryAutocomplete) editGoalCategoryAutocomplete.destroy();
    if (editGoalTimeframeAutocomplete) editGoalTimeframeAutocomplete.destroy();
    if (editGoalPriorityAutocomplete) editGoalPriorityAutocomplete.destroy();
    if (editGoalUnitAutocomplete) editGoalUnitAutocomplete.destroy();
    if (editDailyCategoryAutocomplete) editDailyCategoryAutocomplete.destroy();
    if (editDailyMoodAutocomplete) editDailyMoodAutocomplete.destroy();
    if (editDailyGoalLinkAutocomplete) editDailyGoalLinkAutocomplete.destroy();
    if (editTemplateCategoryAutocomplete)
      editTemplateCategoryAutocomplete.destroy();

    const activeTab = StateManager.getPlansTab
      ? StateManager.getPlansTab()
      : "goals";

    let currentItem = null;
    if (activeTab === "goals")
      currentItem = StateManager.getGoals().find((g) => g.id === itemId);
    else if (activeTab === "daily")
      currentItem = StateManager.getDailyLogs().find((l) => l.id === itemId);
    else if (activeTab === "templates")
      currentItem = StateManager.getTemplates().find((t) => t.id === itemId);

    if (!currentItem) return;

    // Toggle Tab specific accordion elements
    const editModal = document.getElementById("edit-modal");
    if (editModal) {
      document.querySelectorAll(".edit-tab-field").forEach((el) => {
        const fieldTab = el.getAttribute("data-tab");
        el.classList.toggle("hidden", fieldTab !== activeTab);
        if (fieldTab === activeTab && el.classList.contains("accordion-item")) {
          el.classList.add("flex");
        }
      });
    }

    this.resetAccordionToFirstItem();

    // Populate common basic fields
    const titleInput = document.getElementById("edit-item-title");
    const descInput = document.getElementById("edit-item-desc");

    if (titleInput) titleInput.value = currentItem.title || "";
    if (descInput) descInput.value = currentItem.description || "";

    if (activeTab === "goals") {
      // Goal Category
      const editGoalCategoryContainer = document.getElementById(
        "edit-goal-category-autocomplete",
      );
      if (editGoalCategoryContainer) {
        editGoalCategoryAutocomplete = new AutocompleteComponent(
          editGoalCategoryContainer,
          GOAL_CATEGORIES.map((cat) => ({
            value: cat.id,
            label: cat.name,
            icon: cat.icon,
          })),
          {
            label: "Category",
            itemTitle: "label",
            itemValue: "value",
            itemIcon: "icon",
            containerClass: "bg-surface!",
          },
        );
        editGoalCategoryAutocomplete.setValue(
          currentItem.category || "general",
        );
      }

      // Timeframe
      const editGoalTimeframeContainer = document.getElementById(
        "edit-goal-timeframe-autocomplete",
      );
      if (editGoalTimeframeContainer) {
        editGoalTimeframeAutocomplete = new AutocompleteComponent(
          editGoalTimeframeContainer,
          TIMEFRAME_OPTIONS.map((tf) => ({
            value: tf.id,
            label: tf.name,
            icon: tf.icon,
          })),
          {
            label: "Timeframe",
            itemTitle: "label",
            itemValue: "value",
            itemIcon: "icon",
            containerClass: "bg-surface!",
          },
        );
        editGoalTimeframeAutocomplete.setValue(
          currentItem.timeframe || "yearly",
        );
      }

      // Priority
      const editGoalPriorityContainer = document.getElementById(
        "edit-goal-priority-autocomplete",
      );
      if (editGoalPriorityContainer) {
        editGoalPriorityAutocomplete = new AutocompleteComponent(
          editGoalPriorityContainer,
          GOAL_PRIORITY_OPTIONS.map((p) => ({
            value: p.id,
            label: p.name,
            icon: p.icon,
          })),
          {
            label: "Priority",
            itemTitle: "label",
            itemValue: "value",
            itemIcon: "icon",
            containerClass: "bg-surface!",
          },
        );
        editGoalPriorityAutocomplete.setValue(currentItem.priority || "low");
      }

      // Unit
      const editGoalUnitContainer = document.getElementById(
        "edit-goal-unit-autocomplete",
      );
      if (editGoalUnitContainer) {
        editGoalUnitAutocomplete = new AutocompleteComponent(
          editGoalUnitContainer,
          GOAL_UNIT_OPTIONS.map((u) => ({
            value: u.id,
            label: u.name,
            icon: u.icon,
          })),
          {
            label: "Unit",
            itemTitle: "label",
            itemValue: "value",
            itemIcon: "icon",
            containerClass: "bg-surface!",
          },
        );
        editGoalUnitAutocomplete.setValue(currentItem.unit || "%");
      }

      // Current & Target values
      const currentValInput = document.getElementById("edit-goal-current");
      const targetValInput = document.getElementById("edit-goal-target");
      if (currentValInput)
        currentValInput.value = formatNumberWithCommas(
          currentItem.currentValue || 0,
        );
      if (targetValInput)
        targetValInput.value = formatNumberWithCommas(
          currentItem.targetValue || 100,
        );

      // Start & End Date Pickers
      const startDateContainer = document.getElementById(
        "edit-goal-startdate-container",
      );
      if (startDateContainer) {
        editGoalStartDatePicker = new DatePickerComponent({
          id: "edit-goal-startdate",
          value: currentItem.startDate || todayISO(),
          label: "Start Date",
          background: "surface",
        });
        startDateContainer.innerHTML = editGoalStartDatePicker.render();
        editGoalStartDatePicker.bindEvents();
      }

      const endDateContainer = document.getElementById(
        "edit-goal-enddate-container",
      );
      if (endDateContainer) {
        editGoalEndDatePicker = new DatePickerComponent({
          id: "edit-goal-enddate",
          value: currentItem.endDate || "",
          label: "End Date (Optional)",
          background: "surface",
        });
        endDateContainer.innerHTML = editGoalEndDatePicker.render();
        editGoalEndDatePicker.bindEvents();
      }

      const rawMilestones = Array.isArray(currentItem.milestones)
        ? currentItem.milestones
        : [];
      currentEditMilestones = rawMilestones.map((m) => ({
        id: m.id || generateId(),
        title: typeof m === "string" ? m : m.title || "",
        completed: m.completed || false,
        isEditing: false,
      }));
      this.renderEditMilestones();
    } else if (activeTab === "daily") {
      // Daily Log Category
      const editDailyCategoryContainer = document.getElementById(
        "edit-daily-category-autocomplete",
      );
      if (editDailyCategoryContainer) {
        editDailyCategoryAutocomplete = new AutocompleteComponent(
          editDailyCategoryContainer,
          DAILY_LOG_CATEGORIES.map((cat) => ({
            value: cat.id,
            label: cat.name,
            icon: cat.icon,
          })),
          {
            label: "Category",
            itemTitle: "label",
            itemValue: "value",
            itemIcon: "icon",
            containerClass: "bg-surface!",
          },
        );
        editDailyCategoryAutocomplete.setValue(
          currentItem.category || "journal",
        );
      }

      // Mood
      const editDailyMoodContainer = document.getElementById(
        "edit-daily-mood-autocomplete",
      );
      if (editDailyMoodContainer) {
        editDailyMoodAutocomplete = new AutocompleteComponent(
          editDailyMoodContainer,
          DAILY_MOOD_OPTIONS.map((m) => ({
            value: m.id,
            label: m.name,
            icon: m.icon,
          })),
          {
            label: "Mood",
            itemTitle: "label",
            itemValue: "value",
            itemIcon: "icon",
            containerClass: "bg-surface!",
          },
        );
        editDailyMoodAutocomplete.setValue(currentItem.mood || "good");
      }

      // Date Picker
      const editDailyDatePickerContainer = document.getElementById(
        "edit-daily-datepicker-container",
      );
      if (editDailyDatePickerContainer) {
        editDailyDatePicker = new DatePickerComponent({
          id: "edit-daily-datepicker",
          value: currentItem.date || todayISO(),
          label: "Date",
          background: "surface",
        });
        editDailyDatePickerContainer.innerHTML = editDailyDatePicker.render();
        editDailyDatePicker.bindEvents();
      }

      // Linked Goal Autocomplete
      const editGoalLinkContainer = document.getElementById(
        "edit-daily-goal-link-autocomplete",
      );
      if (editGoalLinkContainer) {
        const goals = StateManager.getGoals() || [];
        const goalLinkOptions = goals.map((g) => ({
          id: g.id,
          title: g.title,
          icon: "fa-regular fa-bullseye text-brand/80",
        }));
        editDailyGoalLinkAutocomplete = new AutocompleteComponent(
          editGoalLinkContainer,
          goalLinkOptions,
          {
            label: "Link to Goal (Optional)",
            itemTitle: "title",
            itemValue: "id",
            itemIcon: "icon",
            containerClass: "bg-surface!",
          },
        );
        if (currentItem.linkedGoal?.id) {
          editDailyGoalLinkAutocomplete.setValue(currentItem.linkedGoal.id);
        }
      }
    } else if (activeTab === "templates") {
      // Template Category
      const editTemplateCategoryContainer = document.getElementById(
        "edit-template-category-autocomplete",
      );
      if (editTemplateCategoryContainer) {
        editTemplateCategoryAutocomplete = new AutocompleteComponent(
          editTemplateCategoryContainer,
          TEMPLATE_CATEGORIES.map((cat) => ({
            value: cat.id,
            label: cat.name,
            icon: cat.icon,
          })),
          {
            label: "Category",
            itemTitle: "label",
            itemValue: "value",
            itemIcon: "icon",
            containerClass: "bg-surface!",
          },
        );
        editTemplateCategoryAutocomplete.setValue(
          currentItem.category || "workflow",
        );
      }

      // Favorite Checkbox
      const favCheckbox = document.getElementById("edit-template-favorite");
      if (favCheckbox) favCheckbox.checked = Boolean(currentItem.isFavorite);

      const rawSteps = Array.isArray(currentItem.structure)
        ? currentItem.structure
        : [];
      currentEditSteps = rawSteps.map((s) => ({
        id: generateId(),
        title: typeof s === "string" ? s : s.title || "",
        isEditing: false,
      }));
      this.renderEditSteps();
    }
  },

  bindTargetInputValidation() {
    const targetInput = document.getElementById("create-goal-target");
    if (!targetInput) return;

    targetInput.addEventListener("input", (e) => {
      let rawValue = e.target.value.replace(/\D/g, "");
      if (!rawValue) {
        e.target.value = "";
        return;
      }

      const selectedUnit = createGoalUnitAutocomplete
        ? createGoalUnitAutocomplete.getValue()
        : "%";
      const config = getUnitConfig(selectedUnit);

      let numValue = parseInt(rawValue, 10);
      if (numValue > config.max) {
        numValue = config.max;
        NotificationService.show({
          type: "warning",
          message: `Target value for "${selectedUnit}" cannot exceed ${config.max.toLocaleString()}`,
          icon: "fa-triangle-exclamation",
          duration: 5000,
        });
      }

      e.target.value = formatNumberWithCommas(numValue);
    });
  },

  bindCurrentInputValidation() {
    const targetInput = document.getElementById("create-goal-target");
    const currentInput = document.getElementById("create-goal-current");
    if (!currentInput || !targetInput) return;

    currentInput.addEventListener("input", (e) => {
      let rawValue = e.target.value.replace(/\D/g, "");
      if (!rawValue) {
        e.target.value = "";
        return;
      }

      let numValue = parseInt(rawValue, 10);
      if (numValue > parseInt(targetInput.value.replaceAll(",", ""), 10)) {
        numValue = parseInt(targetInput.value.replaceAll(",", ""), 10);
        NotificationService.show({
          type: "warning",
          message: "Current value cannot exceed from target value",
          icon: "fa-triangle-exclamation",
          duration: 5000,
        });
      }

      e.target.value = formatNumberWithCommas(numValue);
    });
  },

  bindFormEvents() {
    this.bindTargetInputValidation();
    this.bindCurrentInputValidation();
    this.updateAddButtonText();

    const titleInput = document.getElementById("create-plan-title");
    const descInput = document.getElementById("create-plan-desc");
    const addBtn = document.getElementById("add-plan-btn");

    const handleCreateItem = () => {
      const activeTab = StateManager.getPlansTab
        ? StateManager.getPlansTab()
        : "goals";
      const title = titleInput?.value.trim();
      const description = descInput?.value.trim() || "";

      if (!title) {
        NotificationService.show({
          type: "error",
          message: "Title cannot be empty",
          icon: "fa-triangle-exclamation",
          duration: 5000,
        });
        return;
      }

      GlobalLoaderService.show(`Creating item "${title}"...`);

      setTimeout(() => {
        try {
          if (activeTab === "goals") {
            const currentRaw = document
              .getElementById("create-goal-current")
              ?.value.trim();
            const targetRaw = document
              .getElementById("create-goal-target")
              ?.value.trim();

            const category = createGoalCategoryAutocomplete
              ? createGoalCategoryAutocomplete.getValue()
              : "general";
            const timeframe = createGoalTimeframeAutocomplete
              ? createGoalTimeframeAutocomplete.getValue()
              : "yearly";
            const priority = createGoalPriorityAutocomplete
              ? createGoalPriorityAutocomplete.getValue()
              : "low";
            const unit = createGoalUnitAutocomplete
              ? createGoalUnitAutocomplete.getValue()
              : "%";

            const currentValue = parseFormattedNumber(currentRaw) || 0;
            const targetValue = parseFormattedNumber(targetRaw) || 100;

            const startDate = createGoalStartDatePicker
              ? createGoalStartDatePicker.value
              : todayISO();
            const endDate = createGoalEndDatePicker
              ? createGoalEndDatePicker.value
              : null;

            const newGoal = {
              title,
              description,
              category,
              timeframe,
              priority,
              currentValue,
              targetValue,
              unit,
              startDate,
              endDate,
            };
            StateManager.setGoals(
              PlanService.createGoal(StateManager.getGoals(), newGoal),
            );
          } else if (activeTab === "daily") {
            const category = createDailyCategoryAutocomplete
              ? createDailyCategoryAutocomplete.getValue()
              : "journal";
            const mood = createDailyMoodAutocomplete
              ? createDailyMoodAutocomplete.getValue()
              : "good";
            const date = createDailyDatePicker
              ? createDailyDatePicker.value
              : todayISO();

            let linkedGoal = null;
            if (createDailyGoalLinkAutocomplete) {
              const selectedItems =
                createDailyGoalLinkAutocomplete.getSelectedItems();
              if (selectedItems && selectedItems.length > 0) {
                const item = selectedItems[0];
                linkedGoal = {
                  id: item.id || item.value,
                  title: item.title || item.label,
                };
              }
            }

            const newLog = {
              title,
              description,
              date,
              category,
              mood,
              linkedGoal,
            };
            StateManager.setDailyLogs(
              PlanService.createDailyLog(StateManager.getDailyLogs(), newLog),
            );
          } else if (activeTab === "templates") {
            const category = createTemplateCategoryAutocomplete
              ? createTemplateCategoryAutocomplete.getValue()
              : "workflow";
            const isFavorite =
              document.getElementById("create-template-favorite")?.checked ||
              false;

            const newTemplate = {
              title,
              description,
              category,
              isFavorite,
            };
            StateManager.setTemplates(
              PlanService.createTemplate(
                StateManager.getTemplates(),
                newTemplate,
              ),
            );
          }

          StateManager.save();

          if (titleInput) titleInput.value = "";
          if (descInput) descInput.value = "";

          if (
            this.mainController &&
            typeof this.mainController.refreshUI === "function"
          ) {
            this.mainController.refreshUI();
          }

          NotificationService.show({
            type: "success",
            message: `"${title}" created successfully!`,
            icon: "fa-check",
            duration: 5000,
          });
        } catch (error) {
          NotificationService.show({
            type: "error",
            message: error.message || "Failed to create item",
            icon: "fa-triangle-exclamation",
            duration: 5000,
          });
        } finally {
          GlobalLoaderService.hide();
        }
      }, 30);
    };

    addBtn?.addEventListener("click", handleCreateItem);

    const addClick = (id, cb) =>
      document.getElementById(id)?.addEventListener("click", cb);

    addClick("confirm-delete-btn", () => this.executeDelete());
    addClick("confirm-delete", () => this.executeDelete());
    addClick("cancel-delete-btn", () =>
      this.mainController.toggleModal("delete-modal", false),
    );
    addClick("cancel-delete", () =>
      this.mainController.toggleModal("delete-modal", false),
    );

    addClick("confirm-edit", () => this.executeEdit());
    addClick("cancel-edit", () =>
      this.mainController.toggleModal("edit-modal", false),
    );
    addClick("cancel-edit-modal", () =>
      this.mainController.toggleModal("edit-modal", false),
    );
  },

  executeDelete() {
    const id = pendingDeleteId;
    if (!id) return;

    const activeTab = StateManager.getPlansTab
      ? StateManager.getPlansTab()
      : "goals";
    let currentItems = [];
    if (activeTab === "goals") currentItems = StateManager.getGoals();
    else if (activeTab === "daily") currentItems = StateManager.getDailyLogs();
    else if (activeTab === "templates")
      currentItems = StateManager.getTemplates();

    const itemToDelete = currentItems.find((h) => h.id === id);

    if (itemToDelete) {
      GlobalLoaderService.show(`Purging "${itemToDelete.title}"...`);
      setTimeout(() => {
        try {
          if (activeTab === "goals")
            StateManager.setGoals(PlanService.deleteGoal(currentItems, id));
          else if (activeTab === "daily")
            StateManager.setDailyLogs(
              PlanService.deleteDailyLog(currentItems, id),
            );
          else if (activeTab === "templates")
            StateManager.setTemplates(
              PlanService.deleteTemplate(currentItems, id),
            );

          StateManager.save();
          if (this.mainController?.toggleModal)
            this.mainController.toggleModal("delete-modal", false);
          pendingDeleteId = null;

          if (this.mainController?.refreshUI) this.mainController.refreshUI();

          NotificationService.show({
            type: "error",
            message: `Deleted "${itemToDelete.title}"`,
            duration: 5000,
          });
        } finally {
          GlobalLoaderService.hide();
        }
      }, 30);
    }
  },

  executeEdit() {
    const titleInput = document.getElementById("edit-item-title");
    const descInput = document.getElementById("edit-item-desc");

    if (!pendingEditId || !titleInput) return;

    const newTitle = titleInput.value.trim();
    if (!newTitle) {
      NotificationService.show({
        type: "error",
        message: "Title cannot be empty",
        icon: "fa-triangle-exclamation",
        duration: 5000,
      });
      return;
    }

    const activeTab = StateManager.getPlansTab
      ? StateManager.getPlansTab()
      : "goals";

    GlobalLoaderService.show("Updating record...");

    setTimeout(() => {
      try {
        if (activeTab === "goals") {
          const currentValRaw = document
            .getElementById("edit-goal-current")
            ?.value.trim();
          const targetValRaw = document
            .getElementById("edit-goal-target")
            ?.value.trim();

          const milestones = currentEditMilestones.map((m) => ({
            id: m.id || generateId(),
            title: m.title.trim(),
            completed: m.completed || false,
            createdAt: todayISO(),
          }));

          const updatedFields = {
            title: newTitle,
            description: descInput?.value.trim() || "",
            category: editGoalCategoryAutocomplete
              ? editGoalCategoryAutocomplete.getValue()
              : "general",
            timeframe: editGoalTimeframeAutocomplete
              ? editGoalTimeframeAutocomplete.getValue()
              : "yearly",
            priority: editGoalPriorityAutocomplete
              ? editGoalPriorityAutocomplete.getValue()
              : "low",
            unit: editGoalUnitAutocomplete
              ? editGoalUnitAutocomplete.getValue()
              : "%",
            currentValue: parseFormattedNumber(currentValRaw) || 0,
            targetValue: parseFormattedNumber(targetValRaw) || 100,
            startDate: editGoalStartDatePicker
              ? editGoalStartDatePicker.value
              : todayISO(),
            endDate: editGoalEndDatePicker ? editGoalEndDatePicker.value : null,
            milestones,
          };

          StateManager.setGoals(
            PlanService.editGoal(
              StateManager.getGoals(),
              pendingEditId,
              updatedFields,
            ),
          );
        } else if (activeTab === "daily") {
          let linkedGoal = null;
          if (editDailyGoalLinkAutocomplete) {
            const selectedItems =
              editDailyGoalLinkAutocomplete.getSelectedItems();
            if (selectedItems && selectedItems.length > 0) {
              const item = selectedItems[0];
              linkedGoal = {
                id: item.id || item.value,
                title: item.title || item.label,
              };
            }
          }

          const updatedFields = {
            title: newTitle,
            description: descInput?.value.trim() || "",
            category: editDailyCategoryAutocomplete
              ? editDailyCategoryAutocomplete.getValue()
              : "journal",
            mood: editDailyMoodAutocomplete
              ? editDailyMoodAutocomplete.getValue()
              : "good",
            date: editDailyDatePicker ? editDailyDatePicker.value : todayISO(),
            linkedGoal,
          };

          StateManager.setDailyLogs(
            PlanService.editDailyLog(
              StateManager.getDailyLogs(),
              pendingEditId,
              updatedFields,
            ),
          );
        } else if (activeTab === "templates") {
          const structure = currentEditSteps
            .map((s) => s.title.trim())
            .filter(Boolean);

          const updatedFields = {
            title: newTitle,
            description: descInput?.value.trim() || "",
            category: editTemplateCategoryAutocomplete
              ? editTemplateCategoryAutocomplete.getValue()
              : "workflow",
            isFavorite:
              document.getElementById("edit-template-favorite")?.checked ||
              false,
            structure,
          };

          StateManager.setTemplates(
            PlanService.editTemplate(
              StateManager.getTemplates(),
              pendingEditId,
              updatedFields,
            ),
          );
        }

        StateManager.save();
        if (this.mainController?.toggleModal) {
          this.mainController.toggleModal("edit-modal", false);
        }

        pendingEditId = null;

        if (this.mainController?.refreshUI) {
          this.mainController.refreshUI();
        }

        NotificationService.show({
          type: "success",
          message: `"${newTitle}" updated successfully!`,
          icon: "fa-check",
          duration: 5000,
        });
      } catch (error) {
        NotificationService.show({
          type: "error",
          message: error.message || "Failed to update item",
          icon: "fa-triangle-exclamation",
          duration: 5000,
        });
      } finally {
        GlobalLoaderService.hide();
      }
    }, 30);
  },
};
