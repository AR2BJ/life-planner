import {
  renderAnalyticsCharts,
  updateHeatmapChart,
  updateTabStyles,
} from "@/views/analytics/analytics.renderer.js";

import { DashboardComponent } from "@/components/features/analytics/dashboard.component";
import { StateManager } from "@/models/state.model.js";

let currentHeatmapView = "weekly";

export const AnalyticsController = {
  init() {
    DashboardComponent.initTabSwitcher();
    this.bindStaticEvents();
  },

  bindStaticEvents() {
    const switcher = document.getElementById("chart-view-switcher");
    if (!switcher) return;

    ["view-btn-weekly", "view-btn-monthly", "view-btn-yearly"].forEach((id) => {
      const btn = document.getElementById(id);
      if (!btn) return;

      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);

      const viewType = id.replace("view-btn-", "");
      newBtn.addEventListener("click", () => this.handleTabSwitch(viewType));
    });
  },

  handleTabSwitch(tab) {
    if (tab === currentHeatmapView) return;
    currentHeatmapView = tab;

    updateTabStyles(tab);

    const plans = StateManager.getPlans ? StateManager.getPlans() : [];
    const logs = StateManager.getLogs ? StateManager.getLogs() : [];
    updateHeatmapChart(plans, logs, tab);
  },

  dispatchRender() {
    const plans = StateManager.getPlans ? StateManager.getPlans() : [];
    const logs = StateManager.getLogs ? StateManager.getLogs() : [];
    const templates = StateManager.getTemplates
      ? StateManager.getTemplates()
      : [];

    renderAnalyticsCharts(plans, logs, templates, currentHeatmapView);
  },
};
