import { StateManager, state } from "@/models/state.model.js";

class StoreService {
  constructor() {
    StateManager.init();
  }

  // --- GETTERS ---
  get plans() {
    return StateManager.getPlans();
  }

  get logs() {
    return StateManager.getLogs();
  }

  get templates() {
    return StateManager.getTemplates();
  }

  get activeTab() {
    return StateManager.getActiveTab();
  }

  get filteredData() {
    return StateManager.getFilteredDataForActiveTab();
  }

  get lifeAreas() {
    return StateManager.getLifeAreas();
  }

  // --- SETTERS & MUTATIONS ---
  setPlans(plans) {
    state.plans = plans;
    StateManager.save();
  }

  setLogs(logs) {
    state.logs = logs;
    StateManager.save();
  }

  setTemplates(templates) {
    state.templates = templates;
    StateManager.save();
  }

  // --- UI CONTROLS ---
  setTab(tab) {
    StateManager.setTab(tab);
  }

  setLifeAreaFilter(lifeAreaId) {
    StateManager.setLifeAreaFilter(lifeAreaId);
  }

  setSortBy(sortBy) {
    StateManager.setSortBy(sortBy);
  }

  setSearchQuery(query) {
    StateManager.setSearchQuery(query);
  }
}

export const store = new StoreService();
