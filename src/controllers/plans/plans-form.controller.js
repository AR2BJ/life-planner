import {
  ENERGY_LEVEL_OPTIONS,
  LIFE_AREAS,
  MOOD_OPTIONS,
  PLAN_STATES,
} from "@/utils/constants/options-value.constants.js";
import { generateId, todayISO } from "@/utils/helpers.js";

import { AutocompleteComponent } from "@/components/ui/autocomplete.component.js";
import { DatePickerComponent } from "@/components/ui/date-picker.component.js";
import { GlobalLoaderService } from "@/services/loader.service.js";
import { NotificationService } from "@/services/notification.service.js";
import { StateManager } from "@/models/state.model.js";

let pendingDeleteId = null;
let pendingEditId = null;

// References for Create Form
let createPlanLifeAreaAutocomplete = null;
let createPlanStateAutocomplete = null;
let createPlanStartDatePicker = null;
let createPlanEndDatePicker = null;

let createLogDatePicker = null;
let createLogEnergyAutocomplete = null;
let createLogMoodAutocomplete = null;
let createLogPlanLinkAutocomplete = null;

let createTemplateLifeAreaAutocomplete = null;

// References for Edit Form
let editPlanLifeAreaAutocomplete = null;
let editPlanStateAutocomplete = null;
let editPlanStartDatePicker = null;
let editPlanEndDatePicker = null;

let editLogDatePicker = null;
let editLogEnergyAutocomplete = null;
let editLogMoodAutocomplete = null;
let editLogPlanLinkAutocomplete = null;

let editTemplateLifeAreaAutocomplete = null;

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
    this.bindAccordionEvents();
  },

  refreshUI() {
    this.setupCreateAutocompletes();
    this.updateAddButtonText();
    this.toggleFormTabFields();
  },

  updateAddButtonText() {
    const activeTab = StateManager.getActiveTab() || "plans";
    const btnTextSpan = document.getElementById("add-plan-btn-text");
    const toggleTitleSpan = document.getElementById("form-toggle-title");

    if (!btnTextSpan) return;

    if (activeTab === "plans") {
      btnTextSpan.textContent = "Add Plan";
      if (toggleTitleSpan) toggleTitleSpan.textContent = "Create New Plan";
    } else if (activeTab === "logs") {
      btnTextSpan.textContent = "Add Daily Log";
      if (toggleTitleSpan) toggleTitleSpan.textContent = "Create New Log";
    } else if (activeTab === "templates") {
      btnTextSpan.textContent = "Add Template";
      if (toggleTitleSpan) toggleTitleSpan.textContent = "Create New Template";
    }
  },

  toggleFormTabFields() {
    const activeTab = StateManager.getActiveTab() || "plans";
    const tabFields = document.querySelectorAll(".plan-tab-fields");

    tabFields.forEach((fieldGroup) => {
      const fieldTab = fieldGroup.getAttribute("data-tab-fields");
      if (fieldTab === activeTab) {
        fieldGroup.classList.remove("hidden");
        fieldGroup.classList.add("flex");
      } else {
        fieldGroup.classList.add("hidden");
        fieldGroup.classList.remove("flex");
      }
    });

    this.updateAddButtonText();
  },

  bindAccordionEvents() {
    const btnToggleForm = document.getElementById("btn-toggle-plan-form");
    const formContainer = document.getElementById("plan-form-container");
    const chevronContainer = document.getElementById("form-chevron");

    if (!btnToggleForm || !formContainer) return;

    btnToggleForm.addEventListener("click", () => {
      const isHidden = formContainer.classList.contains("hidden");

      formContainer.classList.toggle("hidden", !isHidden);
      formContainer.classList.toggle("flex", isHidden);

      if (chevronContainer) {
        chevronContainer.classList.toggle("rotate-180", isHidden);
      }
    });
  },

  setupCreateAutocompletes() {
    // --- PLANS FIELDS ---
    const planLifeAreaContainer = document.getElementById(
      "create-plan-lifearea-autocomplete",
    );
    if (planLifeAreaContainer) {
      if (createPlanLifeAreaAutocomplete)
        createPlanLifeAreaAutocomplete.destroy();
      createPlanLifeAreaAutocomplete = new AutocompleteComponent(
        planLifeAreaContainer,
        LIFE_AREAS,
        {
          label: "Life Area",
          itemTitle: "name",
          itemValue: "id",
          itemIcon: "icon",
          defaultValue: "health",
          placeholder: "Select life area...",
        },
      );
      createPlanLifeAreaAutocomplete.setValue("health");
    }

    const planStateContainer = document.getElementById(
      "create-plan-state-autocomplete",
    );
    if (planStateContainer) {
      if (createPlanStateAutocomplete) createPlanStateAutocomplete.destroy();
      createPlanStateAutocomplete = new AutocompleteComponent(
        planStateContainer,
        PLAN_STATES,
        {
          label: "Status",
          itemTitle: "name",
          itemValue: "id",
          itemIcon: "icon",
          defaultValue: "active",
          placeholder: "Select state...",
        },
      );
      createPlanStateAutocomplete.setValue("active");
    }

    const planStartDateContainer = document.getElementById(
      "create-plan-startdate-container",
    );
    if (planStartDateContainer) {
      createPlanStartDatePicker = new DatePickerComponent({
        id: "create-plan-startdate",
        value: todayISO(),
        label: "Start Date",
        placeholder: "Select start date...",
        background: "surface-2",
      });
      planStartDateContainer.innerHTML = createPlanStartDatePicker.render();
      createPlanStartDatePicker.bindEvents();
    }

    const planEndDateContainer = document.getElementById(
      "create-plan-enddate-container",
    );
    if (planEndDateContainer) {
      createPlanEndDatePicker = new DatePickerComponent({
        id: "create-plan-enddate",
        value: "",
        label: "End Date (Optional)",
        placeholder: "Select end date...",
        background: "surface-2",
      });
      planEndDateContainer.innerHTML = createPlanEndDatePicker.render();
      createPlanEndDatePicker.bindEvents();
    }

    // --- LOGS FIELDS ---
    const logDatePickerContainer = document.getElementById(
      "create-log-datepicker-container",
    );
    if (logDatePickerContainer) {
      createLogDatePicker = new DatePickerComponent({
        id: "create-log-datepicker",
        value: todayISO(),
        label: "Date",
        placeholder: "Select log date...",
        background: "surface-2",
      });
      logDatePickerContainer.innerHTML = createLogDatePicker.render();
      createLogDatePicker.bindEvents();
    }

    const logEnergyContainer = document.getElementById(
      "create-log-energy-autocomplete",
    );
    if (logEnergyContainer) {
      if (createLogEnergyAutocomplete) createLogEnergyAutocomplete.destroy();
      createLogEnergyAutocomplete = new AutocompleteComponent(
        logEnergyContainer,
        ENERGY_LEVEL_OPTIONS,
        {
          label: "Energy Level",
          itemTitle: "label",
          itemValue: "value",
          itemIcon: "icon",
          defaultValue: 3,
          placeholder: "Select energy level...",
        },
      );
      createLogEnergyAutocomplete.setValue(3);
    }

    const logMoodContainer = document.getElementById(
      "create-log-mood-autocomplete",
    );
    if (logMoodContainer) {
      if (createLogMoodAutocomplete) createLogMoodAutocomplete.destroy();
      createLogMoodAutocomplete = new AutocompleteComponent(
        logMoodContainer,
        MOOD_OPTIONS,
        {
          label: "Mood",
          itemTitle: "label",
          itemValue: "value",
          itemIcon: "icon",
          defaultValue: "neutral",
          placeholder: "Select mood...",
        },
      );
      createLogMoodAutocomplete.setValue("neutral");
    }

    const logPlanLinkContainer = document.getElementById(
      "create-log-plan-link-autocomplete",
    );
    if (logPlanLinkContainer) {
      if (createLogPlanLinkAutocomplete)
        createLogPlanLinkAutocomplete.destroy();
      const plans = StateManager.getPlans() || [];
      const planOptions = plans.map((p) => ({
        id: p.id,
        title: p.title,
        icon: "fa-regular fa-bullseye text-brand/80",
      }));

      createLogPlanLinkAutocomplete = new AutocompleteComponent(
        logPlanLinkContainer,
        planOptions,
        {
          label: "Link to Plan (Optional)",
          itemTitle: "title",
          itemValue: "id",
          itemIcon: "icon",
          placeholder: "Select plan to link...",
        },
      );
    }

    // --- TEMPLATES FIELDS ---
    const templateLifeAreaContainer = document.getElementById(
      "create-template-lifearea-autocomplete",
    );
    if (templateLifeAreaContainer) {
      if (createTemplateLifeAreaAutocomplete)
        createTemplateLifeAreaAutocomplete.destroy();
      createTemplateLifeAreaAutocomplete = new AutocompleteComponent(
        templateLifeAreaContainer,
        LIFE_AREAS,
        {
          label: "Life Area",
          itemTitle: "name",
          itemValue: "id",
          itemIcon: "icon",
          defaultValue: "health",
          placeholder: "Select life area...",
        },
      );
      createTemplateLifeAreaAutocomplete.setValue("health");
    }
  },

  populateEditModal(itemId) {
    if (editPlanLifeAreaAutocomplete) editPlanLifeAreaAutocomplete.destroy();
    if (editPlanStateAutocomplete) editPlanStateAutocomplete.destroy();
    if (editLogEnergyAutocomplete) editLogEnergyAutocomplete.destroy();
    if (editLogMoodAutocomplete) editLogMoodAutocomplete.destroy();
    if (editLogPlanLinkAutocomplete) editLogPlanLinkAutocomplete.destroy();
    if (editTemplateLifeAreaAutocomplete)
      editTemplateLifeAreaAutocomplete.destroy();

    const activeTab = StateManager.getActiveTab() || "plans";
    const stateData = StateManager.getState();

    let currentItem = null;
    if (activeTab === "plans") {
      currentItem = (stateData.plans || []).find(
        (p) => String(p.id) === String(itemId),
      );
    } else if (activeTab === "logs") {
      currentItem = (stateData.logs || []).find(
        (l) => String(l.id) === String(itemId),
      );
    } else if (activeTab === "templates") {
      currentItem = (stateData.templates || []).find(
        (t) => String(t.id) === String(itemId),
      );
    }

    if (!currentItem) return;

    const editModal = document.getElementById("edit-modal");
    if (editModal) {
      document.querySelectorAll(".edit-tab-field").forEach((el) => {
        const fieldTab = el.getAttribute("data-tab");
        el.classList.toggle("hidden", fieldTab !== activeTab);
      });
    }

    const titleInput = document.getElementById("edit-item-title");
    const descInput = document.getElementById("edit-item-desc");

    if (titleInput) titleInput.value = currentItem.title || "";
    if (descInput)
      descInput.value = currentItem.description || currentItem.notes || "";

    if (activeTab === "plans") {
      const editPlanLifeAreaContainer = document.getElementById(
        "edit-plan-lifearea-autocomplete",
      );
      if (editPlanLifeAreaContainer) {
        editPlanLifeAreaAutocomplete = new AutocompleteComponent(
          editPlanLifeAreaContainer,
          LIFE_AREAS,
          {
            label: "Life Area",
            itemTitle: "name",
            itemValue: "id",
            itemIcon: "icon",
            containerClass: "bg-surface!",
          },
        );
        editPlanLifeAreaAutocomplete.setValue(
          currentItem.lifeAreaId || "health",
        );
      }

      const editPlanStateContainer = document.getElementById(
        "edit-plan-state-autocomplete",
      );
      if (editPlanStateContainer) {
        editPlanStateAutocomplete = new AutocompleteComponent(
          editPlanStateContainer,
          PLAN_STATES,
          {
            label: "Status",
            itemTitle: "name",
            itemValue: "id",
            itemIcon: "icon",
            containerClass: "bg-surface!",
          },
        );
        editPlanStateAutocomplete.setValue(currentItem.state || "active");
      }

      const editStartDateContainer = document.getElementById(
        "edit-plan-startdate-container",
      );
      if (editStartDateContainer) {
        editPlanStartDatePicker = new DatePickerComponent({
          id: "edit-plan-startdate",
          value: currentItem.period?.startDate || todayISO(),
          label: "Start Date",
          background: "surface",
        });
        editStartDateContainer.innerHTML = editPlanStartDatePicker.render();
        editPlanStartDatePicker.bindEvents();
      }

      const editEndDateContainer = document.getElementById(
        "edit-plan-enddate-container",
      );
      if (editEndDateContainer) {
        editPlanEndDatePicker = new DatePickerComponent({
          id: "edit-plan-enddate",
          value: currentItem.period?.endDate || "",
          label: "End Date (Optional)",
          background: "surface",
        });
        editEndDateContainer.innerHTML = editPlanEndDatePicker.render();
        editPlanEndDatePicker.bindEvents();
      }
    } else if (activeTab === "logs") {
      const editLogDatePickerContainer = document.getElementById(
        "edit-log-datepicker-container",
      );
      if (editLogDatePickerContainer) {
        editLogDatePicker = new DatePickerComponent({
          id: "edit-log-datepicker",
          value: currentItem.date || todayISO(),
          label: "Date",
          background: "surface",
        });
        editLogDatePickerContainer.innerHTML = editLogDatePicker.render();
        editLogDatePicker.bindEvents();
      }

      const editLogEnergyContainer = document.getElementById(
        "edit-log-energy-autocomplete",
      );
      if (editLogEnergyContainer) {
        editLogEnergyAutocomplete = new AutocompleteComponent(
          editLogEnergyContainer,
          ENERGY_LEVEL_OPTIONS,
          {
            label: "Energy Level",
            itemTitle: "label",
            itemValue: "value",
            itemIcon: "icon",
            containerClass: "bg-surface!",
          },
        );
        editLogEnergyAutocomplete.setValue(currentItem.energy || 3);
      }

      const editLogMoodContainer = document.getElementById(
        "edit-log-mood-autocomplete",
      );
      if (editLogMoodContainer) {
        editLogMoodAutocomplete = new AutocompleteComponent(
          editLogMoodContainer,
          MOOD_OPTIONS,
          {
            label: "Mood",
            itemTitle: "label",
            itemValue: "value",
            itemIcon: "icon",
            containerClass: "bg-surface!",
          },
        );
        editLogMoodAutocomplete.setValue(currentItem.mood || "neutral");
      }

      const editLogPlanLinkContainer = document.getElementById(
        "edit-log-plan-link-autocomplete",
      );
      if (editLogPlanLinkContainer) {
        const plans = StateManager.getPlans() || [];
        const planOptions = plans.map((p) => ({
          id: p.id,
          title: p.title,
          icon: "fa-regular fa-bullseye text-brand/80",
        }));

        editLogPlanLinkAutocomplete = new AutocompleteComponent(
          editLogPlanLinkContainer,
          planOptions,
          {
            label: "Link to Plan (Optional)",
            itemTitle: "title",
            itemValue: "id",
            itemIcon: "icon",
            containerClass: "bg-surface!",
          },
        );
        if (currentItem.planId) {
          editLogPlanLinkAutocomplete.setValue(currentItem.planId);
        }
      }
    } else if (activeTab === "templates") {
      const editTemplateLifeAreaContainer = document.getElementById(
        "edit-template-lifearea-autocomplete",
      );
      if (editTemplateLifeAreaContainer) {
        editTemplateLifeAreaAutocomplete = new AutocompleteComponent(
          editTemplateLifeAreaContainer,
          LIFE_AREAS,
          {
            label: "Life Area",
            itemTitle: "name",
            itemValue: "id",
            itemIcon: "icon",
            containerClass: "bg-surface!",
          },
        );
        editTemplateLifeAreaAutocomplete.setValue(
          currentItem.lifeAreaId || "health",
        );
      }

      const baselineInput = document.getElementById("edit-template-baseline");
      const optimalInput = document.getElementById("edit-template-optimal");
      const favCheckbox = document.getElementById("edit-template-favorite");

      if (baselineInput) baselineInput.value = currentItem.baseline || "";
      if (optimalInput) optimalInput.value = currentItem.optimal || "";
      if (favCheckbox) favCheckbox.checked = Boolean(currentItem.isFavorite);
    }
  },

  bindFormEvents() {
    this.updateAddButtonText();
    this.toggleFormTabFields();

    const titleInput = document.getElementById("create-plan-title");
    const addBtn = document.getElementById("add-plan-btn");

    const handleCreateItem = () => {
      const activeTab = StateManager.getActiveTab() || "plans";
      const title = titleInput?.value.trim();

      if (activeTab !== "logs" && !title) {
        NotificationService.show({
          type: "error",
          message: "Title cannot be empty",
          icon: "fa-triangle-exclamation",
          duration: 5000,
        });
        return;
      }

      GlobalLoaderService.show(`Creating item...`);

      setTimeout(() => {
        try {
          const currentStateData = StateManager.getState();

          if (activeTab === "plans") {
            const description =
              document.getElementById("create-plan-desc")?.value.trim() || "";
            const lifeAreaId = createPlanLifeAreaAutocomplete
              ? createPlanLifeAreaAutocomplete.getValue()
              : "health";
            const state = createPlanStateAutocomplete
              ? createPlanStateAutocomplete.getValue()
              : "active";
            const startDate = createPlanStartDatePicker
              ? createPlanStartDatePicker.value
              : todayISO();
            const endDate = createPlanEndDatePicker
              ? createPlanEndDatePicker.value
              : null;

            const newPlan = {
              id: generateId(),
              title,
              description,
              lifeAreaId,
              state,
              period: { startDate, endDate },
              objectives: [],
              createdAt: todayISO(),
              updatedAt: todayISO(),
            };

            StateManager.save({
              plans: [newPlan, ...(currentStateData.plans || [])],
            });
          } else if (activeTab === "logs") {
            const date = createLogDatePicker
              ? createLogDatePicker.value
              : todayISO();
            const energy = createLogEnergyAutocomplete
              ? Number(createLogEnergyAutocomplete.getValue())
              : 3;
            const mood = createLogMoodAutocomplete
              ? createLogMoodAutocomplete.getValue()
              : "neutral";
            const notes =
              document.getElementById("create-log-notes")?.value.trim() || "";

            let planId = null;
            if (createLogPlanLinkAutocomplete) {
              const selectedItems =
                createLogPlanLinkAutocomplete.getSelectedItems();
              if (selectedItems && selectedItems.length > 0) {
                planId = selectedItems[0].id || selectedItems[0].value;
              }
            }

            const newLog = {
              id: generateId(),
              date,
              planId,
              energy,
              mood,
              metrics: {},
              notes,
              createdAt: todayISO(),
              updatedAt: todayISO(),
            };

            StateManager.save({
              logs: [newLog, ...(currentStateData.logs || [])],
            });
          } else if (activeTab === "templates") {
            const description =
              document.getElementById("create-template-desc")?.value.trim() ||
              "";
            const baseline =
              document
                .getElementById("create-template-baseline")
                ?.value.trim() || "";
            const optimal =
              document
                .getElementById("create-template-optimal")
                ?.value.trim() || "";
            const lifeAreaId = createTemplateLifeAreaAutocomplete
              ? createTemplateLifeAreaAutocomplete.getValue()
              : "health";
            const isFavorite =
              document.getElementById("create-template-favorite")?.checked ||
              false;

            const newTemplate = {
              id: generateId(),
              title,
              description,
              lifeAreaId,
              baseline,
              optimal,
              isFavorite,
              usageCount: 0,
              createdAt: todayISO(),
              updatedAt: todayISO(),
            };

            StateManager.save({
              templates: [newTemplate, ...(currentStateData.templates || [])],
            });
          }

          this.resetForms();

          if (
            this.mainController &&
            typeof this.mainController.refreshUI === "function"
          ) {
            this.mainController.refreshUI();
          }

          NotificationService.show({
            type: "success",
            message: `Item created successfully!`,
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

  resetForms() {
    const inputsToClear = [
      "create-plan-title",
      "create-plan-desc",
      "create-log-notes",
      "create-template-desc",
      "create-template-baseline",
      "create-template-optimal",
    ];
    inputsToClear.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });

    const favCheckbox = document.getElementById("create-template-favorite");
    if (favCheckbox) favCheckbox.checked = false;

    // RESET AUTOCOMPLETES
    if (createPlanLifeAreaAutocomplete)
      createPlanLifeAreaAutocomplete.setValue("health");
    if (createPlanStateAutocomplete)
      createPlanStateAutocomplete.setValue("active");
    if (createLogEnergyAutocomplete) createLogEnergyAutocomplete.setValue(3);
    if (createLogMoodAutocomplete) createLogMoodAutocomplete.setValue("neutral");
    if (createLogPlanLinkAutocomplete)
      createLogPlanLinkAutocomplete.setValue(null);
    if (createTemplateLifeAreaAutocomplete)
      createTemplateLifeAreaAutocomplete.setValue("health");

    // RESET DATE PICKERS
    if (createPlanStartDatePicker) createPlanStartDatePicker.value = todayISO();
    if (createPlanEndDatePicker) createPlanEndDatePicker.value = "";
    if (createLogDatePicker) createLogDatePicker.value = todayISO();
  },

  executeDelete() {
    const id = pendingDeleteId;
    if (!id) return;

    const activeTab = StateManager.getActiveTab() || "plans";
    const stateData = StateManager.getState();

    let list = [];
    if (activeTab === "plans") list = stateData.plans || [];
    else if (activeTab === "logs") list = stateData.logs || [];
    else if (activeTab === "templates") list = stateData.templates || [];

    const itemToDelete = list.find((item) => String(item.id) === String(id));

    if (itemToDelete) {
      GlobalLoaderService.show(`Deleting item...`);
      setTimeout(() => {
        try {
          const updatedList = list.filter(
            (item) => String(item.id) !== String(id),
          );

          if (activeTab === "plans") StateManager.save({ plans: updatedList });
          else if (activeTab === "logs")
            StateManager.save({ logs: updatedList });
          else if (activeTab === "templates")
            StateManager.save({ templates: updatedList });

          if (this.mainController?.toggleModal)
            this.mainController.toggleModal("delete-modal", false);
          pendingDeleteId = null;

          if (this.mainController?.refreshUI) this.mainController.refreshUI();

          NotificationService.show({
            type: "error",
            message: `Item deleted successfully`,
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

    if (!pendingEditId) return;

    const newTitle = titleInput?.value.trim() || "";
    const activeTab = StateManager.getActiveTab() || "plans";

    if (activeTab !== "logs" && !newTitle) {
      NotificationService.show({
        type: "error",
        message: "Title cannot be empty",
        icon: "fa-triangle-exclamation",
        duration: 5000,
      });
      return;
    }

    GlobalLoaderService.show("Updating record...");

    setTimeout(() => {
      try {
        const stateData = StateManager.getState();

        if (activeTab === "plans") {
          const plans = (stateData.plans || []).map((p) => {
            if (String(p.id) === String(pendingEditId)) {
              return {
                ...p,
                title: newTitle,
                description: descInput?.value.trim() || "",
                lifeAreaId: editPlanLifeAreaAutocomplete
                  ? editPlanLifeAreaAutocomplete.getValue()
                  : p.lifeAreaId,
                state: editPlanStateAutocomplete
                  ? editPlanStateAutocomplete.getValue()
                  : p.state,
                period: {
                  startDate: editPlanStartDatePicker
                    ? editPlanStartDatePicker.value
                    : p.period?.startDate,
                  endDate: editPlanEndDatePicker
                    ? editPlanEndDatePicker.value
                    : p.period?.endDate,
                },
                updatedAt: todayISO(),
              };
            }
            return p;
          });
          StateManager.save({ plans });
        } else if (activeTab === "logs") {
          const logs = (stateData.logs || []).map((l) => {
            if (String(l.id) === String(pendingEditId)) {
              let planId = l.planId;
              if (editLogPlanLinkAutocomplete) {
                const selectedItems =
                  editLogPlanLinkAutocomplete.getSelectedItems();
                if (selectedItems && selectedItems.length > 0) {
                  planId = selectedItems[0].id || selectedItems[0].value;
                }
              }

              return {
                ...l,
                date: editLogDatePicker ? editLogDatePicker.value : l.date,
                energy: editLogEnergyAutocomplete
                  ? Number(editLogEnergyAutocomplete.getValue())
                  : l.energy,
                mood: editLogMoodAutocomplete
                  ? editLogMoodAutocomplete.getValue()
                  : l.mood,
                planId,
                notes: descInput?.value.trim() || "",
                updatedAt: todayISO(),
              };
            }
            return l;
          });
          StateManager.save({ logs });
        } else if (activeTab === "templates") {
          const templates = (stateData.templates || []).map((t) => {
            if (String(t.id) === String(pendingEditId)) {
              return {
                ...t,
                title: newTitle,
                description: descInput?.value.trim() || "",
                lifeAreaId: editTemplateLifeAreaAutocomplete
                  ? editTemplateLifeAreaAutocomplete.getValue()
                  : t.lifeAreaId,
                baseline:
                  document
                    .getElementById("edit-template-baseline")
                    ?.value.trim() || "",
                optimal:
                  document
                    .getElementById("edit-template-optimal")
                    ?.value.trim() || "",
                isFavorite:
                  document.getElementById("edit-template-favorite")?.checked ||
                  false,
                updatedAt: todayISO(),
              };
            }
            return t;
          });
          StateManager.save({ templates });
        }

        if (this.mainController?.toggleModal) {
          this.mainController.toggleModal("edit-modal", false);
        }

        pendingEditId = null;

        if (this.mainController?.refreshUI) {
          this.mainController.refreshUI();
        }

        NotificationService.show({
          type: "success",
          message: `Record updated successfully!`,
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
