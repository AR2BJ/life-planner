import { STORAGE_KEY, loadFromStorage } from "@/models/storage.model.js";

import { PlanService } from "@/services/plan.service.js";
import { eventBus } from "./event-bus.service.js";

class StoreService {
  constructor() {
    this.cacheKey = STORAGE_KEY;
    this.lastRaw = "";
    this.initCache();
    this.listenToStorage();
  }

  initCache() {
    this.lastRaw = localStorage.getItem(this.cacheKey) || "";
  }

  listenToStorage() {
    window.addEventListener("storage", (e) => {
      if (e.key === this.cacheKey) {
        this.lastRaw = e.newValue || "";
        this.notifyChanges();
      }
    });

    setInterval(() => {
      const currentRaw = localStorage.getItem(this.cacheKey) || "";
      if (currentRaw !== this.lastRaw) {
        this.lastRaw = currentRaw;
        this.notifyChanges();
      }
    }, 300);
  }

  notifyChanges() {
    const updatedData = loadFromStorage();
    if (updatedData) {
      updatedData.plans = PlanService.enforceSubplanRules(updatedData.plans);

      eventBus.emit("store:plans:changed", updatedData.plans);
      eventBus.emit("store:tags:changed", updatedData.tags);
      eventBus.emit("store:changed", updatedData);
    }
  }
}

export const store = new StoreService();
