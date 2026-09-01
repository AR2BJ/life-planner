import { StateManager, state } from "@/models/state.model.js";

class StoreService {
  constructor() {
    StateManager.init();
  }

  // Getters
  get goals() {
    return StateManager.getGoals();
  }

  get dailyLogs() {
    return StateManager.getDailyLogs();
  }

  get templates() {
    return StateManager.getTemplates();
  }

  get filteredGoals() {
    return StateManager.getFilteredGoals();
  }

  // Setters / Actions
  setGoals(goals) {
    state.goals = goals;
    StateManager.save();
  }

  setDailyLogs(dailyLogs) {
    state.dailyLogs = dailyLogs;
    StateManager.save();
  }

  setTemplates(templates) {
    state.templates = templates;
    StateManager.save();
  }
}

export const store = new StoreService();
