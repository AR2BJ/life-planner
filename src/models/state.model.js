import { loadFromStorage, saveToStorage } from "./storage.model.js";

import { eventBus } from "@/services/event-bus.service.js";

export const state = {
  plans: [],
  tags: [],
  lastDeletedPlan: null,
  activeTab: "active",
  currentView: "plans",
  selectedTag: "all",
  currentPriority: "low",
  currentStatus: "todo",
  dateFilter: "all",
  sortBy: "priority",
  searchQuery: "",
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
      state.tags = saved.tags || [];
    } else {
      state.plans = [];
      state.tags = [];
    }

    this._rawCache = localStorage.getItem("plan_manager") || "";

    if (notify) {
      this.dispatchStateEvents();
    }
  },

  dispatchStateEvents() {
    eventBus.emit("store:plans:changed", state.plans);
    eventBus.emit("store:tags:changed", state.tags);
    eventBus.emit("store:changed", { plans: state.plans, tags: state.tags });
  },

  setupReactiveEngine() {
    window.addEventListener("storage", (event) => {
      if (event.key === "plan_manager") {
        this.reloadFromStorage(true);
      }
    });

    setInterval(() => {
      const currentRaw = localStorage.getItem("plan_manager") || "";
      if (currentRaw !== this._rawCache) {
        this._rawCache = currentRaw;
        this.reloadFromStorage(true);
      }
    }, 300);
  },

  getPlans() {
    return state.plans;
  },

  getTags() {
    return state.tags;
  },

  getFilteredPlans() {
    let list = this.getPlans();

    if (state.activeTab === "active") {
      list = list.filter((plan) => !plan.archived && plan.status !== "done");
    } else if (state.activeTab === "completed") {
      list = list.filter((plan) => !plan.archived && plan.status === "done");
    } else if (state.activeTab === "archived") {
      list = list.filter((plan) => plan.archived);
    }

    if (state.selectedTag && state.selectedTag !== "all") {
      list = list.filter((plan) => plan.tags.includes(state.selectedTag));
    }

    if (state.activeTab === "active" && state.currentStatus !== "todo") {
      list = list.filter((plan) => plan.status === state.currentStatus);
    }

    if (state.currentPriority && state.currentPriority !== "low") {
      list = list.filter((plan) => plan.priority === state.currentPriority);
    }

    if (state.dateFilter && state.dateFilter !== "all") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayStr = today.toISOString().split("T")[0];

      list = list.filter((plan) => {
        if (state.dateFilter === "no_date") return !plan.dueDate;
        if (!plan.dueDate) return false;

        const planDate = new Date(plan.dueDate + "T00:00:00");

        if (state.dateFilter === "today") return plan.dueDate === todayStr;
        if (state.dateFilter === "overdue")
          return planDate < today && plan.status !== "done";
        if (state.dateFilter === "this_week") {
          const nextWeek = new Date(today);
          nextWeek.setDate(today.getDate() + 7);
          return planDate >= today && planDate <= nextWeek;
        }

        return true;
      });
    }

    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase().trim();
      list = list.filter((plan) => {
        const title = (plan.title || "").toLowerCase();
        const description = (plan.description || "").toLowerCase();

        const tagsMatch = plan.tags?.some((tagId) => {
          const tagObj = state.tags.find((t) => t.id === tagId);
          return tagObj ? tagObj.name.toLowerCase().includes(query) : false;
        });

        return (
          title.includes(query) || description.includes(query) || tagsMatch
        );
      });
    }

    return this.sortPlans(list, state.sortBy);
  },

  sortPlans(plans, sortBy) {
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    const statusWeight = { blocked: 4, in_progress: 3, todo: 2, done: 1 };

    return [...plans].sort((a, b) => {
      if (sortBy === "priority")
        return (
          (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0)
        );
      if (sortBy === "status")
        return (statusWeight[b.status] || 0) - (statusWeight[a.status] || 0);
      if (sortBy === "dueDate") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  },

  setDateFilter(filter) {
    state.dateFilter = filter;
  },

  setSelectedTag(tag) {
    state.selectedTag = tag;
  },

  setPriority(priority) {
    state.currentPriority = priority;
  },

  setStatus(status) {
    state.currentStatus = status;
  },

  setSortBy(sortBy) {
    state.sortBy = sortBy;
  },

  setTab(tab) {
    state.activeTab = tab;
  },

  setView(view) {
    state.currentView = view;
  },

  setSearchQuery(query) {
    state.searchQuery = query;
  },

  save(plans = state.plans, tags = state.tags) {
    state.plans = plans;
    state.tags = tags;

    saveToStorage({ plans: state.plans, tags: state.tags });

    this._rawCache = localStorage.getItem("plan_manager") || "";
    this.dispatchStateEvents();
  },
};
