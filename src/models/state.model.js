import {
  DAILY_LOG_CATEGORIES,
  GOAL_CATEGORIES,
  TEMPLATE_CATEGORIES,
} from "@/utils/constants/options-value.constants.js";
import {
  STORAGE_KEY,
  loadFromStorage,
  saveToStorage,
} from "./storage.model.js";

import { eventBus } from "@/services/event-bus.service.js";

export const state = {
  // Domain Data
  goals: [],
  dailyLogs: [],
  templates: [],

  // Navigation State
  activeTab: "goals",
  currentView: "plans",

  // Sub-UI States per domain
  goalsUI: {
    selectedCategory: "all",
    currentPriority: "all",
    currentStatus: "all",
    dateFilter: "all",
    sortBy: "priority",
    searchQuery: "",
  },
  dailyLogsUI: {
    selectedCategory: "all",
    searchQuery: "",
  },
  templatesUI: {
    selectedCategory: "all",
    searchQuery: "",
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
      state.goals = saved.goals || [];
      state.dailyLogs = saved.dailyLogs || [];
      state.templates = saved.templates || [];
    } else {
      state.goals = [];
      state.dailyLogs = [];
      state.templates = [];
    }

    this._rawCache = localStorage.getItem(STORAGE_KEY) || "";

    if (notify) {
      this.dispatchStateEvents();
    }
  },

  dispatchStateEvents() {
    eventBus.emit("store:goals:changed", state.goals);
    eventBus.emit("store:daily:changed", state.dailyLogs);
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

  // Dynamic Category Getters
  getCategoriesForTab(tab = state.activeTab) {
    if (tab === "goals") return GOAL_CATEGORIES;
    if (tab === "daily") return DAILY_LOG_CATEGORIES;
    if (tab === "templates") return TEMPLATE_CATEGORIES;
    return [];
  },

  // Getters
  getPlansTab() {
    return state.activeTab;
  },

  getGoals() {
    return state.goals;
  },

  getDailyLogs() {
    return state.dailyLogs;
  },

  getTemplates() {
    return state.templates;
  },

  getPlans(tab = state.activeTab) {
    if (tab === "goals") return state.goals;
    if (tab === "daily") return state.dailyLogs;
    if (tab === "templates") return state.templates;
    return [...state.goals, ...state.dailyLogs, ...state.templates];
  },

  getFilteredPlans() {
    const tab = state.activeTab;

    if (tab === "goals") {
      let list = [...state.goals];
      const ui = state.goalsUI;

      if (ui.activeTab === "active") {
        list = list.filter((g) => !g.archived && g.status !== "done");
      } else if (ui.activeTab === "completed") {
        list = list.filter((g) => !g.archived && g.status === "done");
      } else if (ui.activeTab === "archived") {
        list = list.filter((g) => g.archived);
      }

      if (ui.selectedCategory && ui.selectedCategory !== "all") {
        list = list.filter((g) => g.category === ui.selectedCategory);
      }

      if (ui.currentStatus && ui.currentStatus !== "all") {
        list = list.filter((g) => g.status === ui.currentStatus);
      }

      if (ui.currentPriority && ui.currentPriority !== "all") {
        list = list.filter((g) => g.priority === ui.currentPriority);
      }

      if (ui.dateFilter && ui.dateFilter !== "all") {
        const todayStr = new Date().toISOString().split("T")[0];
        list = list.filter((g) => {
          if (!g.dueDate) return ui.dateFilter === "no_date";
          const dueStr = g.dueDate.split("T")[0];
          if (ui.dateFilter === "today") return dueStr === todayStr;
          if (ui.dateFilter === "overdue")
            return dueStr < todayStr && g.status !== "done";
          return true;
        });
      }

      if (ui.searchQuery) {
        const query = ui.searchQuery.toLowerCase().trim();
        list = list.filter((g) => {
          const title = (g.title || "").toLowerCase();
          const description = (g.description || "").toLowerCase();
          return title.includes(query) || description.includes(query);
        });
      }

      return this.sortGoals(list, ui.sortBy);
    } else if (tab === "daily") {
      let list = [...state.dailyLogs];
      const ui = state.dailyLogsUI;

      if (ui.selectedCategory && ui.selectedCategory !== "all") {
        list = list.filter((l) => l.category === ui.selectedCategory);
      }

      if (ui.searchQuery) {
        const query = ui.searchQuery.toLowerCase().trim();
        list = list.filter((l) => {
          const title = (l.title || "").toLowerCase();
          const content = (l.content || "").toLowerCase();
          return title.includes(query) || content.includes(query);
        });
      }

      return list;
    } else if (tab === "templates") {
      let list = [...state.templates];
      const ui = state.templatesUI;

      if (ui.selectedCategory && ui.selectedCategory !== "all") {
        list = list.filter((t) => t.category === ui.selectedCategory);
      }

      if (ui.searchQuery) {
        const query = ui.searchQuery.toLowerCase().trim();
        list = list.filter((t) => {
          const title = (t.title || "").toLowerCase();
          const description = (t.description || "").toLowerCase();
          return title.includes(query) || description.includes(query);
        });
      }

      return list;
    }

    return [];
  },

  sortGoals(goals, sortBy) {
    const priorityWeight = { high: 3, medium: 2, low: 1 };

    return [...goals].sort((a, b) => {
      if (sortBy === "priority")
        return (
          (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0)
        );
      if (sortBy === "dueDate") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  },

  // Setters & State Modifiers

  setGoals(goals) {
    state.goals = goals;
    eventBus.emit("store:goals:changed", state.goals);
  },

  setDailyLogs(dailyLogs) {
    state.dailyLogs = dailyLogs;
    eventBus.emit("store:daily:changed", state.dailyLogs);
  },

  setTemplates(templates) {
    state.templates = templates;
    eventBus.emit("store:templates:changed", state.templates);
  },

  setTab(tab) {
    state.activeTab = tab;
  },

  setSortBy(sortBy) {
    state.goalsUI.sortBy = sortBy;
  },

  setDateFilter(filter) {
    state.goalsUI.dateFilter = filter;
  },

  setSearchQuery(query) {
    const tab = state.activeTab;
    if (tab === "goals") state.goalsUI.searchQuery = query;
    else if (tab === "daily") state.dailyLogsUI.searchQuery = query;
    else if (tab === "templates") state.templatesUI.searchQuery = query;
  },

  setSelectedCategory(category, tab) {
    if (tab === "goals") state.goalsUI.selectedCategory = category;
    else if (tab === "daily") state.dailyLogsUI.selectedCategory = category;
    else if (tab === "templates") state.templatesUI.selectedCategory = category;
  },

  setView(view) {
    state.currentView = view;
  },

  save(
    goals = state.goals,
    dailyLogs = state.dailyLogs,
    templates = state.templates,
  ) {
    state.goals = goals;
    state.dailyLogs = dailyLogs;
    state.templates = templates;

    saveToStorage({
      goals: state.goals,
      dailyLogs: state.dailyLogs,
      templates: state.templates,
    });

    this._rawCache = localStorage.getItem(STORAGE_KEY) || "";
    this.dispatchStateEvents();
  },
};
