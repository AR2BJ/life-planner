import {
  STORAGE_KEY,
  loadFromStorage,
  saveToStorage,
} from "./storage.model.js";

import { LIFE_AREAS } from "@/utils/constants/options-value.constants.js";
import { eventBus } from "@/services/event-bus.service.js";

export const state = {
  plans: [],
  logs: [],
  templates: [],
  activeTab: "plans", // "plans" | "logs" | "templates"
  currentView: "plans",
  plansUI: {
    selectedLifeArea: "all",
    currentState: "all", // "all" | "active" | "paused" | "completed"
    searchQuery: "",
    sortBy: "date_desc",
  },
  logsUI: {
    selectedLifeArea: "all",
    dateFilter: "all",
    searchQuery: "",
    sortBy: "date_desc",
  },
  templatesUI: {
    selectedLifeArea: "all",
    searchQuery: "",
    sortBy: "favorites", // "favorites" | "title" | "date_desc"
  },
  lastDeletedItem: null,
};

export const StateManager = {
  _rawCache: "",

  init() {
    this.reloadFromStorage(false);
    this.setupReactiveEngine();
    return state;
  },

  reloadFromStorage(notify = true) {
    const saved = loadFromStorage();
    if (saved) {
      state.plans = saved.plans || [];
      state.logs = saved.logs || [];
      state.templates = saved.templates || [];
    } else {
      state.plans = [];
      state.logs = [];
      state.templates = [];
    }

    this._rawCache = localStorage.getItem(STORAGE_KEY) || "";

    if (notify) {
      this.dispatchStateEvents();
    }
  },

  dispatchStateEvents() {
    eventBus.emit("store:plans:changed", state.plans);
    eventBus.emit("store:logs:changed", state.logs);
    eventBus.emit("store:templates:changed", state.templates);
    eventBus.emit("store:changed", state);
  },

  setupReactiveEngine() {
    window.addEventListener("storage", (event) => {
      if (event.key === STORAGE_KEY) {
        this.reloadFromStorage(true);
      }
    });

    setInterval(() => {
      const currentRaw = localStorage.getItem(STORAGE_KEY) || "";
      if (currentRaw !== this._rawCache) {
        this._rawCache = currentRaw;
        this.reloadFromStorage(true);
      }
    }, 300);
  },

  // --- GETTERS ---
  getState() {
    return state;
  },

  getActiveTab() {
    return state.activeTab;
  },

  getPlans() {
    return state.plans;
  },

  getLogs() {
    return state.logs;
  },

  getTemplates() {
    return state.templates;
  },

  getLifeAreas() {
    return LIFE_AREAS || [];
  },

  getActiveUIState() {
    const key = `${state.activeTab}UI`;
    return state[key] || {};
  },

  getFilteredDataForActiveTab() {
    const tab = state.activeTab;
    const ui = this.getActiveUIState();

    let list = [];
    if (tab === "plans") list = [...state.plans];
    else if (tab === "logs") list = [...state.logs];
    else if (tab === "templates") list = [...state.templates];

    if (!Array.isArray(list)) return [];

    if (ui.selectedLifeArea && ui.selectedLifeArea !== "all") {
      list = list.filter((item) => {
        if (tab === "logs") {
          if (!item.planId) return false;
          const linkedPlan = state.plans.find(
            (p) => String(p.id) === String(item.planId),
          );
          return (
            linkedPlan &&
            String(linkedPlan.lifeAreaId) === String(ui.selectedLifeArea)
          );
        }
        return String(item.lifeAreaId) === String(ui.selectedLifeArea);
      });
    }

    if (tab === "plans" && ui.currentState && ui.currentState !== "all") {
      list = list.filter((p) => p.state === ui.currentState);
    }

    if (ui.searchQuery && ui.searchQuery.trim() !== "") {
      const query = ui.searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          (item.title || "").toLowerCase().includes(query) ||
          (item.description || "").toLowerCase().includes(query) ||
          (item.notes || "").toLowerCase().includes(query),
      );
    }

    return this.sortItems(list, ui.sortBy);
  },

  sortItems(items, sortBy) {
    return [...items].sort((a, b) => {
      if (sortBy === "title") {
        return (a.title || "").localeCompare(b.title || "");
      }
      if (sortBy === "favorites") {
        return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0);
      }
      if (sortBy === "date_asc") {
        return (
          new Date(a.date || a.createdAt || 0) -
          new Date(b.date || b.createdAt || 0)
        );
      }
      return (
        new Date(b.date || b.createdAt || 0) -
        new Date(a.date || a.createdAt || 0)
      );
    });
  },

  // --- SETTERS & UI CONTROL ---
  setView(view) {
    state.currentView = view;
    eventBus.emit("store:changed", state);
  },

  setTab(tab) {
    if (["plans", "logs", "templates"].includes(tab)) {
      state.activeTab = tab;
      eventBus.emit("store:changed", state);
    }
  },

  setLifeAreaFilter(lifeAreaId) {
    const ui = this.getActiveUIState();
    ui.selectedLifeArea = lifeAreaId;
    this.notifyActiveTabChanged();
  },

  setSortBy(sortBy) {
    const ui = this.getActiveUIState();
    ui.sortBy = sortBy;
    this.notifyActiveTabChanged();
  },

  setSearchQuery(query) {
    const ui = this.getActiveUIState();
    ui.searchQuery = query;
    this.notifyActiveTabChanged();
  },

  notifyActiveTabChanged() {
    const currentTab = state.activeTab;
    eventBus.emit(`store:${currentTab}:changed`, state[currentTab]);
    eventBus.emit("store:changed", state);
  },

  // --- PERSISTENCE ---
  save(data = {}) {
    Object.assign(state, data);

    saveToStorage({
      plans: state.plans,
      logs: state.logs,
      templates: state.templates,
    });

    this._rawCache = localStorage.getItem(STORAGE_KEY) || "";
    this.dispatchStateEvents();
  },
};
