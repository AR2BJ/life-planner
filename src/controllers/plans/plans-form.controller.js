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
    this.bindDynamicListEvents();
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

  bindDynamicListEvents() {
    // Create Form Dynamic Lists
    const addMilestoneBtn = document.getElementById("btn-add-milestone-input");
    if (addMilestoneBtn) {
      addMilestoneBtn.onclick = () => {
        const container = document.getElementById(
          "create-goal-milestones-list",
        );
        if (!container) return;
        this._appendMilestoneRow(container, "");
      };
    }

    const addStepBtn = document.getElementById("btn-add-template-step");
    if (addStepBtn) {
      addStepBtn.onclick = () => {
        const container = document.getElementById("create-template-steps-list");
        if (!container) return;
        this._appendStepRow(container, "");
      };
    }

    // Edit Form Dynamic Lists
    const editAddMilestoneBtn = document.getElementById(
      "btn-add-edit-milestone",
    );
    if (editAddMilestoneBtn) {
      editAddMilestoneBtn.onclick = () => {
        const container = document.getElementById("edit-goal-milestones-list");
        if (!container) return;
        this._appendMilestoneRow(container, "");
      };
    }

    const editAddStepBtn = document.getElementById(
      "btn-add-edit-template-step",
    );
    if (editAddStepBtn) {
      editAddStepBtn.onclick = () => {
        const container = document.getElementById("edit-template-steps-list");
        if (!container) return;
        this._appendStepRow(container, "");
      };
    }
  },

  _appendMilestoneRow(container, title = "", completed = false) {
    const itemDiv = document.createElement("div");
    itemDiv.className = "flex items-center gap-2 milestone-item";
    itemDiv.innerHTML = `
      <input
        type="checkbox"
        class="milestone-checkbox rounded text-brand focus:ring-0 cursor-pointer"
        ${completed ? "checked" : ""}
      />
      <input
        type="text"
        value="${title}"
        placeholder="Enter milestone title..."
        class="h-9 flex-1 rounded-lg border border-border bg-surface px-3 text-xs text-color focus:border-brand/80 focus:outline-none"
      />
      <button
        type="button"
        class="btn-remove-milestone h-9 w-9 flex items-center justify-center rounded-lg border border-border bg-surface text-secondary hover:text-red-500 transition cursor-pointer"
      >
        <i class="fa-regular fa-trash-can text-xs"></i>
      </button>
    `;
    itemDiv.querySelector(".btn-remove-milestone").onclick = () =>
      itemDiv.remove();
    container.appendChild(itemDiv);
  },

  _appendStepRow(container, stepText = "") {
    const itemDiv = document.createElement("div");
    itemDiv.className = "flex items-center gap-2 template-step-item";
    itemDiv.innerHTML = `
      <input
        type="text"
        value="${stepText}"
        placeholder="Enter step instruction..."
        class="h-9 flex-1 rounded-lg border border-border bg-surface px-3 text-xs text-color focus:border-brand/80 focus:outline-none"
      />
      <button
        type="button"
        class="btn-remove-step h-9 w-9 flex items-center justify-center rounded-lg border border-border bg-surface text-secondary hover:text-red-500 transition cursor-pointer"
      >
        <i class="fa-regular fa-trash-can text-xs"></i>
      </button>
    `;
    itemDiv.querySelector(".btn-remove-step").onclick = () => itemDiv.remove();
    container.appendChild(itemDiv);
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
    // Destroy previous autocompletes
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

      // Milestones
      const milestonesContainer = document.getElementById(
        "edit-goal-milestones-list",
      );
      if (milestonesContainer) {
        milestonesContainer.innerHTML = "";
        const milestones = Array.isArray(currentItem.milestones)
          ? currentItem.milestones
          : [];
        milestones.forEach((m) =>
          this._appendMilestoneRow(milestonesContainer, m.title, m.completed),
        );
      }
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

      // Template Steps
      const stepsContainer = document.getElementById(
        "edit-template-steps-list",
      );
      if (stepsContainer) {
        stepsContainer.innerHTML = "";
        const steps = Array.isArray(currentItem.structure)
          ? currentItem.structure
          : [];
        steps.forEach((stepText) =>
          this._appendStepRow(stepsContainer, stepText),
        );
      }
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

            const milestoneElements = document.querySelectorAll(
              "#create-goal-milestones-list .milestone-item input[type='text']",
            );
            const milestones = Array.from(milestoneElements)
              .map((inp) => inp.value.trim())
              .filter(Boolean)
              .map((mTitle) => ({
                id: generateId(),
                title: mTitle,
                completed: false,
                createdAt: todayISO(),
              }));

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
              milestones,
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

            const stepElements = document.querySelectorAll(
              "#create-template-steps-list .template-step-item input",
            );
            const structure = Array.from(stepElements)
              .map((inp) => inp.value.trim())
              .filter(Boolean);

            const newTemplate = {
              title,
              description,
              category,
              isFavorite,
              structure,
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

          const milestoneRows = document.querySelectorAll(
            "#edit-goal-milestones-list .milestone-item",
          );
          const milestones = Array.from(milestoneRows)
            .map((row) => ({
              id: generateId(),
              title:
                row.querySelector("input[type='text']")?.value.trim() || "",
              completed:
                row.querySelector("input[type='checkbox']")?.checked || false,
              createdAt: todayISO(),
            }))
            .filter((m) => m.title);

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
          const stepInputs = document.querySelectorAll(
            "#edit-template-steps-list .template-step-item input",
          );
          const structure = Array.from(stepInputs)
            .map((inp) => inp.value.trim())
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
