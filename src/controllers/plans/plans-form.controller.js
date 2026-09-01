import {
  DAILY_LOG_CATEGORIES,
  GOAL_CATEGORIES,
  GOAL_UNIT_OPTIONS,
  TEMPLATE_CATEGORIES,
  TIMEFRAME_OPTIONS,
} from "@/utils/constants/options-value.constants";
import { StateManager, state } from "@/models/state.model.js";
import {
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
let createGoalUnitAutocomplete = null;
let createDailyCategoryAutocomplete = null;
let createTemplateCategoryAutocomplete = null;
let createDailyDatePicker = null;

let editGoalCategoryAutocomplete = null;
let editGoalTimeframeAutocomplete = null;
let editDailyCategoryAutocomplete = null;
let editTemplateCategoryAutocomplete = null;
let editDailyDatePicker = null;

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
  },

  refreshUI() {
    this.setupCreateAutocompletes();
    this.bindTargetInputValidation();
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
          duration: 5000,
        });
      }

      e.target.value = numValue.toLocaleString("en-US");
    });
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

    const dailyLogCategoryOptions = DAILY_LOG_CATEGORIES.map((cat) => ({
      value: cat.id,
      label: cat.name,
      icon: cat.icon,
    }));

    const templateCategoryOptions = TEMPLATE_CATEGORIES.map((cat) => ({
      value: cat.id,
      label: cat.name,
      icon: cat.icon,
    }));

    const createGoalCategoryContainer = document.getElementById(
      "create-goal-category-autocomplete",
    );
    if (createGoalCategoryContainer) {
      if (createGoalCategoryAutocomplete)
        createGoalCategoryAutocomplete.destroy();
      createGoalCategoryAutocomplete = new AutocompleteComponent(
        createGoalCategoryContainer,
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

    const createGoalTimeframeContainer = document.getElementById(
      "create-goal-timeframe-autocomplete",
    );
    if (createGoalTimeframeContainer) {
      if (createGoalTimeframeAutocomplete)
        createGoalTimeframeAutocomplete.destroy();
      createGoalTimeframeAutocomplete = new AutocompleteComponent(
        createGoalTimeframeContainer,
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

    const createGoalUnitContainer = document.getElementById(
      "create-goal-unit-autocomplete",
    );
    if (createGoalUnitContainer) {
      if (createGoalUnitAutocomplete) createGoalUnitAutocomplete.destroy();
      createGoalUnitAutocomplete = new AutocompleteComponent(
        createGoalUnitContainer,
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
              targetInput.value = config.defaultValue.toLocaleString("en-US");
            }
          },
        },
      );
      createGoalUnitAutocomplete.setValue("%");
    }

    const createDailyCategoryContainer = document.getElementById(
      "create-daily-category-autocomplete",
    );
    if (createDailyCategoryContainer) {
      if (createDailyCategoryAutocomplete)
        createDailyCategoryAutocomplete.destroy();
      createDailyCategoryAutocomplete = new AutocompleteComponent(
        createDailyCategoryContainer,
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

    const createDailyDatePickerContainer = document.getElementById(
      "create-daily-datepicker-container",
    );
    if (createDailyDatePickerContainer) {
      const initialDate = todayISO();
      createDailyDatePicker = new DatePickerComponent({
        id: "create-daily-datepicker",
        value: initialDate,
        label: "Date",
        placeholder: "Select date...",
        background: "surface-2",
      });

      createDailyDatePickerContainer.innerHTML = createDailyDatePicker.render();
      createDailyDatePicker.bindEvents();
    }

    const createTemplateCategoryContainer = document.getElementById(
      "create-template-category-autocomplete",
    );
    if (createTemplateCategoryContainer) {
      if (createTemplateCategoryAutocomplete)
        createTemplateCategoryAutocomplete.destroy();
      createTemplateCategoryAutocomplete = new AutocompleteComponent(
        createTemplateCategoryContainer,
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

  bindFormEvents() {
    this.bindTargetInputValidation();
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
            const targetRaw = document
              .getElementById("create-goal-target")
              ?.value.trim();
            const category = createGoalCategoryAutocomplete
              ? createGoalCategoryAutocomplete.getValue()
              : "general";
            const timeframe = createGoalTimeframeAutocomplete
              ? createGoalTimeframeAutocomplete.getValue()
              : "yearly";
            const unit = createGoalUnitAutocomplete
              ? createGoalUnitAutocomplete.getValue()
              : "%";
            const targetValue = parseFormattedNumber(targetRaw) || 100;

            const newGoal = {
              title,
              description,
              category,
              timeframe,
              currentValue: 0,
              targetValue,
              unit,
              status: "todo",
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
            const date = createDailyDatePicker
              ? createDailyDatePicker.value
              : todayISO();

            const newLog = {
              title,
              description,
              date,
              category,
              mood: "good",
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

            const newTemplate = {
              title,
              description,
              category,
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
            date: editDailyDatePicker
              ? editDailyDatePicker.getValue()
              : todayISO(),
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
