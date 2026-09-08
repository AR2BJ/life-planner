import {
  ENERGY_LEVEL_OPTIONS,
  LIFE_AREAS,
  MOOD_OPTIONS,
  PLAN_STATES,
} from "@/utils/constants/options-value.constants.js";

import { StateManager } from "@/models/state.model.js";

export const PlansItemComponent = {
  // --- HELPERS ---
  _getLifeAreaBadgeHtml(lifeAreaId) {
    const matched = LIFE_AREAS.find(
      (area) => String(area.id) === String(lifeAreaId),
    );
    const areaData = matched || {
      name: lifeAreaId || "General",
      icon: "fa-regular fa-folder text-secondary",
      class: "bg-surface text-secondary border-border/60",
    };

    const iconClass = areaData.icon.replace("fa-solid", "fa-regular");

    return `
      <span class="inline-flex items-center gap-1 rounded-md border ${areaData.class} px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
        <i class="${iconClass} text-[9px]"></i>
        <span>${areaData.name}</span>
      </span>
    `;
  },

  _getStateBadgeHtml(stateKey) {
    const matched = PLAN_STATES.find((s) => s.id === stateKey);
    const stateData = matched || {
      name: stateKey || "active",
      icon: "fa-regular fa-circle text-secondary",
      class: "bg-surface text-secondary border-border/60",
    };

    const iconClass = stateData.icon.replace("fa-solid", "fa-regular");

    return `
      <span class="inline-flex items-center gap-1 rounded-md border ${stateData.class} px-2 py-0.5 text-[10px] uppercase font-semibold">
        <i class="${iconClass} text-[9px]"></i>
        <span>${stateData.name}</span>
      </span>
    `;
  },

  _getMoodBadgeHtml(moodValue) {
    const matched = MOOD_OPTIONS.find(
      (m) => String(m.value) === String(moodValue),
    );
    const moodData = matched || {
      label: moodValue || "Neutral",
      icon: "fa-regular fa-face-meh text-secondary",
      class: "bg-surface text-secondary border-border/60",
    };

    const iconClass = moodData.icon.replace("fa-solid", "fa-regular");

    return `
      <span class="inline-flex items-center gap-1 rounded-md border ${moodData.class} px-2 py-0.5 text-[10px] uppercase font-semibold">
        <i class="${iconClass} text-[9px]"></i>
        <span>${moodData.label}</span>
      </span>
    `;
  },

  _getEnergyBadgeHtml(energyValue) {
    const matched = ENERGY_LEVEL_OPTIONS.find(
      (e) => Number(e.value) === Number(energyValue),
    );
    const energyData = matched || {
      label: `Energy: ${energyValue}/5`,
      icon: "fa-regular fa-bolt text-secondary",
      class: "bg-surface text-secondary border-border/60",
    };

    const iconClass = energyData.icon.replace("fa-solid", "fa-regular");

    return `
      <span class="inline-flex items-center gap-1 rounded-md border ${energyData.class} px-2 py-0.5 text-[10px] uppercase font-semibold">
        <i class="${iconClass} text-[9px]"></i>
        <span>${energyData.label}</span>
      </span>
    `;
  },

  _renderActionButtons(id) {
    return `
      <div class="absolute top-3 right-3 md:static flex self-start md:top-auto md:right-auto z-20 shrink-0">
        <div class="hidden md:flex items-center gap-2">
          <button
            data-id="${id}"
            class="edit-btn w-9 h-9 rounded-lg bg-surface-2 hover:bg-blue-600/10 border border-border flex items-center justify-center cursor-pointer transition"
          >
            <i class="fa-regular fa-pen-to-square text-blue-500/80 text-base"></i>
          </button>
          <button
            data-id="${id}"
            class="delete-btn w-9 h-9 rounded-lg bg-surface-2 hover:bg-red-600/10 border border-border flex items-center justify-center cursor-pointer transition"
          >
            <i class="fa-regular fa-trash-can text-red-500/80 text-base"></i>
          </button>
        </div>
      </div>
    `;
  },

  // --- MAIN RENDER ROUTER ---
  render(item) {
    if (item.energy !== undefined || item.mood !== undefined) {
      return this.renderDailyLog(item);
    }
    if (item.baseline !== undefined || item.optimal !== undefined) {
      return this.renderTemplate(item);
    }
    return this.renderGoal(item);
  },

  renderGoal(plan) {
    const lifeAreaBadge = this._getLifeAreaBadgeHtml(plan.lifeAreaId);
    const stateBadge = this._getStateBadgeHtml(plan.state);

    const objectives = Array.isArray(plan.objectives) ? plan.objectives : [];
    const completedObjectives = objectives.filter(
      (obj) => obj.completed,
    ).length;
    const totalObjectives = objectives.length;
    const progressPercent =
      totalObjectives > 0
        ? Math.round((completedObjectives / totalObjectives) * 100)
        : 0;

    const startDate = plan.period?.startDate || "";
    const endDate = plan.period?.endDate || "";

    return `
      <div
        data-id="${plan.id}"
        class="plan-item group relative flex flex-col gap-4 p-4 rounded-xl bg-surface-2/40 hover:bg-surface-2/60 transition-all border border-border/40"
      >
        <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div class="flex items-start gap-3 min-w-0 flex-1">
            <div class="flex flex-col min-w-0 w-full gap-1.5 pe-12 md:pe-0">
              <div class="flex items-center gap-2 flex-wrap">
                ${stateBadge}
                ${lifeAreaBadge}
              </div>

              <h2 class="text-base font-bold mt-1 text-color">${plan.title}</h2>

              ${
                plan.description
                  ? `<p class="text-xs text-secondary/90 leading-relaxed">${plan.description}</p>`
                  : ""
              }

              <div class="flex flex-col gap-1.5 mt-2 text-[11px] text-muted">
                <div class="flex flex-col sm:flex-row sm:items-center gap-2 text-secondary/80 mt-0.5">
                  ${
                    startDate
                      ? `<span class="flex items-center gap-1.5"><i class="fa-regular fa-calendar-check text-emerald-500/80"></i> Start: <strong class="text-color">${startDate}</strong></span>`
                      : ""
                  }
                  ${
                    endDate
                      ? `<span class="flex items-center gap-1.5 sm:ms-2"><i class="fa-regular fa-calendar-xmark text-red-500/80"></i> End: <strong class="text-color">${endDate}</strong></span>`
                      : ""
                  }
                </div>
              </div>
            </div>
          </div>

          ${this._renderActionButtons(plan.id)}
        </div>

        <!-- Objectives Progress & List -->
        ${
          totalObjectives > 0
            ? `
                <div class="mt-1 border-t border-border/40 pt-3 flex flex-col gap-2">
                  <div class="flex items-center justify-between text-xs font-bold text-secondary">
                    <span>Objectives (${completedObjectives}/${totalObjectives})</span>
                    <span class="text-brand/80">${progressPercent}%</span>
                  </div>

                  <div class="w-full h-1.5 rounded-full bg-surface-2 overflow-hidden">
                    <div
                      class="h-full bg-brand/80 transition-all duration-300"
                      style="width: ${progressPercent}%"
                    ></div>
                  </div>

                  <div class="space-y-1.5 pt-2">
                    ${objectives
                      .map(
                        (obj) => `
                          <div class="flex items-center gap-2 rounded-lg p-1.5 hover:bg-surface-2/60 border border-transparent hover:border-border/50 transition">
                            <button
                              type="button"
                              data-plan-id="${plan.id}"
                              data-objective-id="${obj.id}"
                              class="objective-toggle w-5 h-5 shrink-0 rounded border flex items-center justify-center transition cursor-pointer ${
                                obj.completed
                                  ? "bg-brand/80 border-brand/80 text-white"
                                  : "border-border text-secondary hover:border-brand/80"
                              }"
                            >
                              <i class="fa-regular ${obj.completed ? "fa-check text-xs" : "fa-square text-[10px]"}"></i>
                            </button>
                            <span class="text-xs text-color ${obj.completed ? "line-through opacity-50" : ""}">${obj.title}</span>
                          </div>
                        `,
                      )
                      .join("")}
                  </div>
                </div>
              `
            : ""
        }
      </div>
    `;
  },

  renderDailyLog(log) {
    const moodBadge = this._getMoodBadgeHtml(log.mood);
    const energyBadge = this._getEnergyBadgeHtml(log.energy);

    // FETCH LINKED PLAN & LIFE AREA
    let linkedPlanBadgeHtml = "";
    let lifeAreaBadgeHtml = "";

    if (log.planId) {
      const plans = StateManager.getPlans() || [];
      const linkedPlan = plans.find((p) => String(p.id) === String(log.planId));

      if (linkedPlan) {
        linkedPlanBadgeHtml = `
          <span class="inline-flex items-center gap-1 rounded-md border border-brand/30 bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand/90">
            <i class="fa-regular fa-bullseye text-[9px]"></i>
            <span>${linkedPlan.title}</span>
          </span>
        `;

        if (linkedPlan.lifeAreaId) {
          lifeAreaBadgeHtml = this._getLifeAreaBadgeHtml(linkedPlan.lifeAreaId);
        }
      }
    }

    return `
      <div
        data-id="${log.id}"
        class="daily-log-item group relative flex flex-col gap-3 p-3 md:p-4 rounded-xl bg-surface-2/40 hover:bg-surface-2/60 transition-all border border-border/40"
      >
        <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div class="flex flex-col min-w-0 w-full gap-1.5 pe-12">
            <div class="flex items-center gap-2 flex-wrap">
              ${moodBadge}
              ${energyBadge}

              <span class="inline-flex items-center gap-1 rounded-md border border-secondary/30 bg-secondary/10 px-2 py-0.5 text-[10px] font-medium text-secondary/80">
                <i class="fa-regular fa-calendar"></i> ${log.date || log.createdAt}
              </span>

              ${linkedPlanBadgeHtml}
              ${lifeAreaBadgeHtml}
            </div>

            ${
              log.notes
                ? `<p class="text-xs lg:text-sm text-secondary/90 leading-relaxed wrap-break-word mt-2">${log.notes}</p>`
                : ""
            }
          </div>

          ${this._renderActionButtons(log.id)}
        </div>
      </div>
    `;
  },

  renderTemplate(template) {
    const lifeAreaBadge = this._getLifeAreaBadgeHtml(template.lifeAreaId);

    return `
      <div
        data-id="${template.id}"
        class="template-item group relative flex flex-col justify-between gap-4 p-3 md:p-4 rounded-xl bg-surface-2/40 hover:bg-surface-2/60 transition-all border border-dashed border-border/80"
      >
        <div class="flex flex-col gap-2">
          <div class="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div class="flex items-center gap-1.5 flex-wrap pe-12">
              <span class="inline-flex items-center gap-1 rounded-md border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[10px] uppercase font-semibold tracking-wider text-violet-500/80">
                <i class="fa-regular fa-cubes"></i> Template
              </span>

              ${lifeAreaBadge}

              ${
                template.isFavorite
                  ? `<span class="inline-flex items-center gap-1 rounded-md border border-yellow-500/20 bg-yellow-500/10 px-2 py-0.5 text-[10px] font-semibold text-yellow-500/80">
                      <i class="fa-regular fa-star"></i> Favorite
                    </span>`
                  : ""
              }
            </div>

            ${this._renderActionButtons(template.id)}
          </div>

          <h3 class="text-sm lg:text-base font-bold text-color tracking-tight mt-1 wrap-break-word">
            ${template.title}
          </h3>

          <p class="text-xs text-secondary/90 leading-relaxed wrap-break-word">
            ${template.description || "No description provided."}
          </p>

          <div class="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            ${
              template.baseline
                ? `<div class="bg-surface/50 p-2 rounded-lg border border-border/40">
                    <span class="text-[10px] font-semibold uppercase text-muted block">Baseline</span>
                    <span class="text-secondary">${template.baseline}</span>
                  </div>`
                : ""
            }
            ${
              template.optimal
                ? `<div class="bg-surface/50 p-2 rounded-lg border border-border/40">
                    <span class="text-[10px] font-semibold uppercase text-muted block">Optimal</span>
                    <span class="text-secondary">${template.optimal}</span>
                  </div>`
                : ""
            }
          </div>
        </div>

        <div class="pt-3 border-t border-border/50 flex items-center justify-between">
          <span class="text-[11px] text-muted">
            <i class="fa-regular fa-chart-line me-1"></i>Used: ${template.usageCount || 0} times
          </span>
          <button
            data-id="${template.id}"
            class="use-template-btn inline-flex items-center gap-1.5 bg-brand/80 hover:bg-brand/90 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-md cursor-pointer"
          >
            <i class="fa-regular fa-rocket"></i> Use Template
          </button>
        </div>
      </div>
    `;
  },
};
