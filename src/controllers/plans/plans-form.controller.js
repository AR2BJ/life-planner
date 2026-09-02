import {
  DAILY_LOG_CATEGORIES,
  DAILY_MOOD_OPTIONS,
  GOAL_CATEGORIES,
  GOAL_PRIORITY_OPTIONS,
  GOAL_UNIT_OPTIONS,
  TEMPLATE_CATEGORIES,
  TIMEFRAME_OPTIONS,
} from "@/utils/constants/options-value.constants";
import { StateManager, state } from "@/models/state.model.js";
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

let pendingDeleteId = null;
let pendingEditId = null;

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

  bindDynamicListEvents() {
    const addMilestoneBtn = document.getElementById("btn-add-milestone-input");
    if (addMilestoneBtn) {
      addMilestoneBtn.onclick = () => {
        const container = document.getElementById(
          "create-goal-milestones-list",
        );
        if (!container) return;
        const itemDiv = document.createElement("div");
        itemDiv.className = "flex items-center gap-2 milestone-item";
        itemDiv.innerHTML = `
          <input
            type="text"
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
      };
    }

    const addStepBtn = document.getElementById("btn-add-template-step");
    if (addStepBtn) {
      addStepBtn.onclick = () => {
        const container = document.getElementById("create-template-steps-list");
        if (!container) return;
        const itemDiv = document.createElement("div");
        itemDiv.className = "flex items-center gap-2 template-step-item";
        itemDiv.innerHTML = `
          <input
            type="text"
            placeholder="Enter step instruction or task..."
            class="h-9 flex-1 rounded-lg border border-border bg-surface px-3 text-xs text-color focus:border-brand/80 focus:outline-none"
          />
          <button
            type="button"
            class="btn-remove-step h-9 w-9 flex items-center justify-center rounded-lg border border-border bg-surface text-secondary hover:text-red-500 transition cursor-pointer"
          >
            <i class="fa-regular fa-trash-can text-xs"></i>
          </button>
        `;
        itemDiv.querySelector(".btn-remove-step").onclick = () =>
          itemDiv.remove();
        container.appendChild(itemDiv);
      };
    }
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
        value: g.title,
        label: g.title,
        icon: "fa-regular fa-bullseye text-brand/80",
      }));

      createDailyGoalLinkAutocomplete = new AutocompleteComponent(
        goalLinkContainer,
        goalLinkOptions,
        {
          label: "Link to Goal (Optional)",
          itemTitle: "label",
          itemValue: "value",
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
    if (activeTab === "goals") {
      currentItem = StateManager.getGoals().find((g) => g.id === itemId);
    } else if (activeTab === "daily") {
      currentItem = StateManager.getDailyLogs().find((l) => l.id === itemId);
    } else if (activeTab === "templates") {
      currentItem = StateManager.getTemplates().find((t) => t.id === itemId);
    }

    if (!currentItem) return;

    const titleInput = document.getElementById("edit-item-title");
    const descInput = document.getElementById("edit-item-desc");

    if (titleInput) titleInput.value = currentItem.title || "";
    if (descInput) descInput.value = currentItem.description || "";

    const editGoalWrapper = document.getElementById("edit-goal-fields-wrapper");
    const editDailyWrapper = document.getElementById(
      "edit-daily-fields-wrapper",
    );
    const editTemplateWrapper = document.getElementById(
      "edit-template-fields-wrapper",
    );

    if (editGoalWrapper)
      editGoalWrapper.classList.toggle("hidden", activeTab !== "goals");
    if (editDailyWrapper)
      editDailyWrapper.classList.toggle("hidden", activeTab !== "daily");
    if (editTemplateWrapper)
      editTemplateWrapper.classList.toggle("hidden", activeTab !== "templates");

    if (activeTab === "goals") {
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
          },
        );
        editGoalCategoryAutocomplete.setValue(
          currentItem.category || "general",
        );
      }

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
          },
        );
        editGoalTimeframeAutocomplete.setValue(
          currentItem.timeframe || "yearly",
        );
      }
    } else if (activeTab === "daily") {
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
          },
        );
        editDailyCategoryAutocomplete.setValue(
          currentItem.category || "journal",
        );
      }

      const editDailyDatePickerContainer = document.getElementById(
        "edit-daily-datepicker-container",
      );
      if (editDailyDatePickerContainer) {
        editDailyDatePicker = new DatePickerComponent({
          id: "edit-daily-datepicker",
          value: currentItem.date || todayISO(),
          label: "Date",
          background: "surface-2",
        });
        editDailyDatePickerContainer.innerHTML = editDailyDatePicker.render();
        editDailyDatePicker.bindEvents();
      }
    } else if (activeTab === "templates") {
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
          },
        );
        editTemplateCategoryAutocomplete.setValue(
          currentItem.category || "workflow",
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
              "#create-goal-milestones-list .milestone-item input",
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

            const updatedGoals = PlanService.createGoal(
              StateManager.getGoals(),
              newGoal,
            );
            StateManager.setGoals(updatedGoals);
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
            const linkedGoalTitle = createDailyGoalLinkAutocomplete
              ? createDailyGoalLinkAutocomplete.getValue()
              : null;

            const newLog = {
              title,
              description,
              date,
              category,
              mood,
              linkedGoalTitle,
            };

            const updatedLogs = PlanService.createDailyLog(
              StateManager.getDailyLogs(),
              newLog,
            );
            StateManager.setDailyLogs(updatedLogs);
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

            const updatedTemplates = PlanService.createTemplate(
              StateManager.getTemplates(),
              newTemplate,
            );
            StateManager.setTemplates(updatedTemplates);
          }

          StateManager.save();

          if (titleInput) titleInput.value = "";
          if (descInput) descInput.value = "";
          const targetInput = document.getElementById("create-goal-target");
          if (targetInput) targetInput.value = "100";
          const currentInput = document.getElementById("create-goal-current");
          if (currentInput) currentInput.value = "0";

          const milestonesList = document.getElementById(
            "create-goal-milestones-list",
          );
          if (milestonesList) milestonesList.innerHTML = "";

          const stepsList = document.getElementById(
            "create-template-steps-list",
          );
          if (stepsList) stepsList.innerHTML = "";

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

    titleInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleCreateItem();
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
    addClick("confirm-edit-mobile", () => this.executeEdit());
    addClick("cancel-edit-mobile", () =>
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
      const capturedItem = { ...itemToDelete };
      GlobalLoaderService.show(`Purging "${capturedItem.title}" from store...`);

      setTimeout(() => {
        try {
          if (activeTab === "goals") {
            StateManager.setGoals(PlanService.deleteGoal(currentItems, id));
          } else if (activeTab === "daily") {
            StateManager.setDailyLogs(
              PlanService.deleteDailyLog(currentItems, id),
            );
          } else if (activeTab === "templates") {
            StateManager.setTemplates(
              PlanService.deleteTemplate(currentItems, id),
            );
          }

          StateManager.save();
          if (this.mainController?.toggleModal) {
            this.mainController.toggleModal("delete-modal", false);
          }
          pendingDeleteId = null;

          if (this.mainController?.refreshUI) {
            this.mainController.refreshUI();
          }

          NotificationService.show({
            type: "error",
            message: `Deleted "${capturedItem.title}"`,
            duration: 5000,
            undoAction: () => {
              GlobalLoaderService.show("Re-instating deleted record...");
              setTimeout(() => {
                try {
                  if (activeTab === "goals") {
                    const latestGoals = StateManager.getGoals();
                    StateManager.save(
                      [capturedItem, ...latestGoals],
                      state.dailyLogs,
                      state.templates,
                    );
                  } else if (activeTab === "daily") {
                    const latestDailyLogs = StateManager.getDailyLogs();
                    StateManager.save(
                      state.goals,
                      [capturedItem, ...latestDailyLogs],
                      state.templates,
                    );
                  } else if (activeTab === "templates") {
                    const latestTemplates = StateManager.getTemplates();
                    StateManager.save(state.goals, state.dailyLogs, [
                      capturedItem,
                      ...latestTemplates,
                    ]);
                  }
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
          const updatedFields = {
            title: newTitle,
            description: descInput?.value.trim() || "",
            category: editGoalCategoryAutocomplete
              ? editGoalCategoryAutocomplete.getValue()
              : "general",
            timeframe: editGoalTimeframeAutocomplete
              ? editGoalTimeframeAutocomplete.getValue()
              : "yearly",
          };

          StateManager.setGoals(
            PlanService.editGoal(
              StateManager.getGoals(),
              pendingEditId,
              updatedFields,
            ),
          );
        } else if (activeTab === "daily") {
          const updatedFields = {
            title: newTitle,
            description: descInput?.value.trim() || "",
            category: editDailyCategoryAutocomplete
              ? editDailyCategoryAutocomplete.getValue()
              : "journal",
            date: editDailyDatePicker ? editDailyDatePicker.value : todayISO(),
          };

          StateManager.setDailyLogs(
            PlanService.editDailyLog(
              StateManager.getDailyLogs(),
              pendingEditId,
              updatedFields,
            ),
          );
        } else if (activeTab === "templates") {
          const updatedFields = {
            title: newTitle,
            description: descInput?.value.trim() || "",
            category: editTemplateCategoryAutocomplete
              ? editTemplateCategoryAutocomplete.getValue()
              : "workflow",
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
          this.mainController.toggleModal("edit-plan-modal", false);
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
