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
    dateFilter: "all",
    sortBy: "date_desc",
    searchQuery: "",
  },
  templatesUI: {
    selectedCategory: "all",
    dateFilter: "all",
    sortBy: "favorites",
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
        const timeframeKeys = [
          "yearly",
          "monthly",
          "weekly",
          "short_term",
          "medium_term",
          "long_term",
          "lifetime",
        ];

        list = list.filter((g) => {
          if (ui.dateFilter === "completed") {
            return g.status === "done";
          }
          if (timeframeKeys.includes(ui.dateFilter)) {
            return g.timeframe === ui.dateFilter;
          }
          const targetDate = g.endDate || g.startDate;
          if (!targetDate) return ui.dateFilter === "no_date";
          const dueStr = targetDate.split("T")[0];
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

      if (ui.dateFilter && ui.dateFilter !== "all") {
        const now = new Date();
        const todayStr = now.toISOString().split("T")[0];

        list = list.filter((l) => {
          const logDateStr = (l.date || l.createdAt || "").split("T")[0];
          if (!logDateStr) return false;

          if (ui.dateFilter === "today") return logDateStr === todayStr;

          if (ui.dateFilter === "yesterday") {
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            return logDateStr === yesterday.toISOString().split("T")[0];
          }

          if (ui.dateFilter === "this_week") {
            const logDate = new Date(logDateStr);
            const diffTime = Math.abs(now - logDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 7;
          }

          if (ui.dateFilter === "this_month") {
            return logDateStr.substring(0, 7) === todayStr.substring(0, 7);
          }

          if (ui.dateFilter === "this_year") {
            return logDateStr.substring(0, 4) === todayStr.substring(0, 4);
          }

          return true;
        });
      }

      if (ui.searchQuery) {
        const query = ui.searchQuery.toLowerCase().trim();
        list = list.filter((l) => {
          const title = (l.title || "").toLowerCase();
          const description = (l.description || "").toLowerCase();
          return title.includes(query) || description.includes(query);
        });
      }

      return this.sortDailyLogs(list, ui.sortBy);
    } else if (tab === "templates") {
      let list = [...state.templates];
      const ui = state.templatesUI;

      if (ui.selectedCategory && ui.selectedCategory !== "all") {
        list = list.filter((t) => t.category === ui.selectedCategory);
      }

      if (ui.dateFilter === "favorites") {
        list = list.filter((t) => Boolean(t.isFavorite));
      }

      if (ui.searchQuery) {
        const query = ui.searchQuery.toLowerCase().trim();
        list = list.filter((t) => {
          const title = (t.title || "").toLowerCase();
          const description = (t.description || "").toLowerCase();
          return title.includes(query) || description.includes(query);
        });
      }

      return this.sortTemplates(list, ui.sortBy);
    }

    return [];
  },

  sortGoals(goals, sortBy) {
    const priorityWeight = { high: 3, medium: 2, low: 1 };

    return [...goals].sort((a, b) => {
      const aDone = a.status === "done";
      const bDone = b.status === "done";

      // Always push completed goals to the bottom by default
      if (aDone && !bDone) return 1;
      if (!aDone && bDone) return -1;

      if (sortBy === "priority")
        return (
          (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0)
        );

      if (sortBy === "progress_desc" || sortBy === "progress_asc") {
        const progressA =
          a.targetValue > 0 ? a.currentValue / a.targetValue : 0;
        const progressB =
          b.targetValue > 0 ? b.currentValue / b.targetValue : 0;
        return sortBy === "progress_desc"
          ? progressB - progressA
          : progressA - progressB;
      }

      if (sortBy === "dueDate") {
        const dateA = a.endDate || a.startDate;
        const dateB = b.endDate || b.startDate;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return new Date(dateA) - new Date(dateB);
      }

      if (sortBy === "completedAt") {
        const dateA = a.completedAt || "1970-01-01";
        const dateB = b.completedAt || "1970-01-01";
        return new Date(dateB) - new Date(dateA);
      }

      if (sortBy === "title")
        return (a.title || "").localeCompare(b.title || "");
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  },

  sortDailyLogs(logs, sortBy) {
    return [...logs].sort((a, b) => {
      if (sortBy === "date_asc") {
        return (
          new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt)
        );
      }
      if (sortBy === "title") {
        return (a.title || "").localeCompare(b.title || "");
      }
      if (sortBy === "createdAt") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt);
    });
  },

  sortTemplates(templates, sortBy) {
    return [...templates].sort((a, b) => {
      if (sortBy === "favorites") {
        return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0);
      }
      if (sortBy === "title") {
        return (a.title || "").localeCompare(b.title || "");
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  },

  setGoals(goals) {
    state.goals = goals;
    this.save();
  },

  setDailyLogs(dailyLogs) {
    state.dailyLogs = dailyLogs;
    this.save();
  },

  setTemplates(templates) {
    state.templates = templates;
    this.save();
  },

  setTab(tab) {
    state.activeTab = tab;
    eventBus.emit("store:changed", state);
  },

  setSortBy(sortBy) {
    const tab = state.activeTab;
    if (tab === "goals") {
      state.goalsUI.sortBy = sortBy;
      eventBus.emit("store:goals:changed", state.goals);
    } else if (tab === "daily") {
      state.dailyLogsUI.sortBy = sortBy;
      eventBus.emit("store:daily:changed", state.dailyLogs);
    } else if (tab === "templates") {
      state.templatesUI.sortBy = sortBy;
      eventBus.emit("store:templates:changed", state.templates);
    }
  },

  setDateFilter(filter) {
    const tab = state.activeTab;
    if (tab === "goals") {
      state.goalsUI.dateFilter = filter;
      eventBus.emit("store:goals:changed", state.goals);
    } else if (tab === "daily") {
      state.dailyLogsUI.dateFilter = filter;
      eventBus.emit("store:daily:changed", state.dailyLogs);
    } else if (tab === "templates") {
      state.templatesUI.dateFilter = filter;
      eventBus.emit("store:templates:changed", state.templates);
    }
  },

  setStatusFilter(status) {
    state.goalsUI.currentStatus = status;
    eventBus.emit("store:goals:changed", state.goals);
  },

  setPriorityFilter(priority) {
    state.goalsUI.currentPriority = priority;
    eventBus.emit("store:goals:changed", state.goals);
  },

  setSearchQuery(query) {
    const tab = state.activeTab;
    if (tab === "goals") {
      state.goalsUI.searchQuery = query;
      eventBus.emit("store:goals:changed", state.goals);
    } else if (tab === "daily") {
      state.dailyLogsUI.searchQuery = query;
      eventBus.emit("store:daily:changed", state.dailyLogs);
    } else if (tab === "templates") {
      state.templatesUI.searchQuery = query;
      eventBus.emit("store:templates:changed", state.templates);
    }
  },

  setSelectedCategory(category, tab = state.activeTab) {
    if (tab === "goals") {
      state.goalsUI.selectedCategory = category;
      eventBus.emit("store:goals:changed", state.goals);
    } else if (tab === "daily") {
      state.dailyLogsUI.selectedCategory = category;
      eventBus.emit("store:daily:changed", state.dailyLogs);
    } else if (tab === "templates") {
      state.templatesUI.selectedCategory = category;
      eventBus.emit("store:templates:changed", state.templates);
    }
  },

  setView(view) {
    state.currentView = view;
    eventBus.emit("store:changed", state);
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
