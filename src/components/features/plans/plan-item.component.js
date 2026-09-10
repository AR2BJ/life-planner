import {
  ENERGY_LEVEL_OPTIONS,
  LIFE_AREAS,
  MOOD_OPTIONS,
  PLAN_STATES,
} from "@/utils/constants/options-value.constants.js";

import { StateManager } from "@/models/state.model.js";
import { openObjectivesState } from "@/utils/helpers";

export const PlansItemComponent = {
  // --- HELPERS ---
  _normalizeIconClass(iconString) {
    if (!iconString) return "fa-regular fa-folder";
    return iconString.includes("fa-solid")
      ? iconString.replace("fa-solid", "fa-regular")
      : iconString;
  },

  _getLifeAreaBadgeHtml(lifeAreaId) {
    const matched = LIFE_AREAS.find(
      (area) => String(area.id) === String(lifeAreaId),
    );
    const areaData = matched || {
      name: lifeAreaId || "General",
      icon: "fa-regular fa-folder text-secondary",
      class: "bg-surface text-secondary border-border/60",
    };

    const iconClass = this._normalizeIconClass(areaData.icon);

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

    const iconClass = this._normalizeIconClass(stateData.icon);

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

    const iconClass = this._normalizeIconClass(moodData.icon);

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

    const iconClass = this._normalizeIconClass(energyData.icon);

    return `
      <span class="inline-flex items-center gap-1 rounded-md border ${energyData.class} px-2 py-0.5 text-[10px] uppercase font-semibold">
        <i class="${iconClass} text-[9px]"></i>
        <span>${energyData.label}</span>
      </span>
    `;
  },

  _renderMetricsHtml(metrics) {
    if (!metrics || typeof metrics !== "object") return "";
    const keys = Object.keys(metrics);
    if (keys.length === 0) return "";

    return `
      <div class="mt-2 flex flex-wrap gap-2">
        ${keys
          .map((key) => {
            const item = metrics[key];
            const val = typeof item === "object" ? item.value : item;
            const unit = typeof item === "object" ? item.unit || "" : "";
            return `
              <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface/60 border border-border/50 text-xs">
                <span class="font-medium text-muted uppercase text-[10px]">${key}:</span>
                <span class="font-bold text-color">${val}</span>
                ${unit ? `<span class="text-[10px] text-secondary">${unit}</span>` : ""}
              </div>
            `;
          })
          .join("")}
      </div>
    `;
  },

  _renderActionButtons(id) {
    return `
      <div class="flex items-center gap-1.5 shrink-0 z-20">
        <button
          type="button"
          data-id="${id}"
          class="edit-btn w-8 h-8 md:w-9 md:h-9 rounded-lg bg-surface-2 hover:bg-blue-600/10 border border-border flex items-center justify-center cursor-pointer transition"
          aria-label="Edit item"
        >
          <i class="fa-regular fa-pen-to-square text-blue-500/80 text-sm md:text-base pointer-events-none"></i>
        </button>
        <button
          type="button"
          data-id="${id}"
          class="delete-btn w-8 h-8 md:w-9 md:h-9 rounded-lg bg-surface-2 hover:bg-red-600/10 border border-border flex items-center justify-center cursor-pointer transition"
          aria-label="Delete item"
        >
          <i class="fa-regular fa-trash-can text-red-500/80 text-sm md:text-base pointer-events-none"></i>
        </button>
      </div>
    `;
  },

  _calculateObjectiveProgress(obj) {
    if (obj.completed) return 100;
    const type = obj.type || "boolean";
    if (type === "numeric") {
      const target = Number(obj.targetValue) || 1;
      const current = Number(obj.currentValue) || 0;
      return Math.min(100, Math.max(0, Math.round((current / target) * 100)));
    }
    return obj.completed ? 100 : 0;
  },

  _renderSingleObjectiveControl(planId, obj) {
    const type = obj.type || "boolean";

    if (type === "numeric") {
      return `
        <button
          type="button"
          data-plan-id="${planId}"
          data-objective-id="${obj.id}"
          class="objective-toggle w-6 h-6 shrink-0 rounded-md border-2 flex items-center justify-center transition cursor-pointer ${
            obj.completed
              ? "bg-emerald-500 border-emerald-500 text-(--color-btn-primary-text) shadow-md shadow-emerald-500/20"
              : "border-border text-secondary hover:border-emerald-500/80 hover:text-emerald-500/80"
          }"
        >
          <i
            class="fa-regular ${
              obj.completed
                ? "fa-check text-xs font-bold"
                : "fa-hashtag text-[10px]"
            }"
          ></i>
        </button>
      `;
    }

    if (type === "milestone") {
      return `
      <button
        type="button"
        data-plan-id="${planId}"
        data-objective-id="${obj.id}"
        class="objective-toggle w-6 h-6 shrink-0 rounded-md border-2 flex items-center justify-center transition cursor-pointer ${
          obj.completed
            ? "bg-yellow-500 border-yellow-500 text-(--color-btn-primary-text) shadow-md shadow-yellow-500/20"
            : "border-border text-secondary hover:border-yellow-500/80 hover:text-yellow-500/80"
        }"
      >
        <i class="fa-regular ${obj.completed ? "fa-check text-xs font-bold" : "fa-flag text-[10px]"}"></i>
      </button>
    `;
    }

    return `
    <button
      type="button"
      data-plan-id="${planId}"
      data-objective-id="${obj.id}"
      class="objective-toggle w-6 h-6 shrink-0 rounded-md border-2 flex items-center justify-center transition cursor-pointer ${
        obj.completed
          ? "bg-cyan-500 border-cyan-500 text-(--color-btn-primary-text) shadow-md shadow-cyan-500/20"
          : "border-border text-secondary hover:border-cyan-500/80 hover:text-cyan-500/80"
      }"
    >
      <i class="fa-regular ${obj.completed ? "fa-check text-xs font-bold" : "fa-square text-[10px]"}"></i>
    </button>
  `;
  },

  // --- MAIN RENDER ROUTER ---
  render(item) {
    if (item.energy !== undefined || item.mood !== undefined) {
      return this.renderLog(item);
    }
    if (item.baseline !== undefined || item.optimal !== undefined) {
      return this.renderTemplate(item);
    }
    return this.renderPlan(item);
  },

  renderPlan(plan) {
    const lifeAreaBadge = this._getLifeAreaBadgeHtml(plan.lifeAreaId);
    const stateBadge = this._getStateBadgeHtml(plan.state);

    const objectives = Array.isArray(plan.objectives) ? plan.objectives : [];
    const totalObjectives = objectives.length;
    const hasObjectives = totalObjectives > 0;

    const totalProgressAcc = objectives.reduce((sum, obj) => {
      return sum + this._calculateObjectiveProgress(obj);
    }, 0);

    const progressPercentage =
      totalObjectives > 0 ? Math.round(totalProgressAcc / totalObjectives) : 0;
    const completedObjectives = objectives.filter(
      (obj) => obj.completed || this._calculateObjectiveProgress(obj) === 100,
    ).length;

    const objectiveProgressColor =
      progressPercentage === 100
        ? "bg-emerald-500/80"
        : progressPercentage <= 65 && progressPercentage >= 35
          ? "bg-amber-500/80"
          : progressPercentage <= 35 && progressPercentage > 0
            ? "bg-red-500/80"
            : progressPercentage === 0
              ? "bg-slate-500/80"
              : "bg-brand/80";

    const objectivePercentColor =
      progressPercentage === 100
        ? "text-emerald-500/80"
        : progressPercentage <= 65 && progressPercentage >= 35
          ? "text-amber-500/80"
          : progressPercentage <= 35 && progressPercentage > 0
            ? "text-red-500/80"
            : progressPercentage === 0
              ? "text-slate-500/80"
              : "text-brand/80";

    const isExpanded = openObjectivesState.expandedPlanIds.has(plan.id);

    const startDate = plan.period?.startDate || "";
    const endDate = plan.period?.endDate || "";

    return `
      <div
        data-id="${plan.id}"
        class="plan-item group relative flex flex-col gap-4 p-3 md:p-4 rounded-xl bg-surface-2/40 hover:bg-surface-2/60 transition-all border border-border/40"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex flex-col min-w-0 w-full gap-1.5 pe-12">
            <div class="flex items-center gap-2 flex-wrap">
              ${stateBadge} ${lifeAreaBadge}
            </div>

            <h2 class="text-sm lg:text-base font-bold mt-2 text-color tracking-tight leading-snug wrap-break-word">
              ${plan.title || "Untitled Plan"}
            </h2>

            ${
              plan.description
                ? `<p class="text-xs lg:text-sm text-secondary/90 leading-relaxed wrap-break-word">${plan.description}</p>`
                : ""
            }

            <div class="flex flex-col gap-1.5 mt-2 text-[11px] lg:text-xs text-muted">
              <div
                class="flex flex-col sm:flex-row sm:items-center gap-2 text-secondary/80 mt-0.5"
              >
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

          <div class="absolute top-3 right-3 md:static flex self-start md:top-auto md:right-auto z-20 shrink-0">
            ${this._renderActionButtons(plan.id)}
          </div>
        </div>

        ${
          hasObjectives
            ? `
                <div class="mt-2 border-t border-border/60 pt-2">
                  <button
                    type="button"
                    data-plan-id="${plan.id}"
                    class="toggle-objectives-btn w-full flex flex-wrap sm:flex-nowrap items-center justify-between gap-5 p-2 rounded-md hover:bg-surface-3/40 transition cursor-pointer group/sub-hdr text-left"
                  >
                    <div
                      class="w-full sm:w-fit flex justify-center xs:justify-start items-center gap-2"
                    >
                      <i class="fa-regular fa-bullseye-arrow text-brand/80"></i>
                      <span
                        class="text-[11px] sm:text-xs font-bold text-secondary group-hover/sub-hdr:text-color transition"
                      >
                        Objectives (${completedObjectives}/${totalObjectives})
                      </span>
                    </div>

                    <div class="w-full sm:w-fit flex items-center gap-3">
                      <div
                        class="w-full sm:w-32 h-1.5 rounded-full bg-surface-2 overflow-hidden"
                      >
                        <div
                          class="h-full ${objectiveProgressColor} transition-all duration-300"
                          style="width: ${progressPercentage}%"
                        ></div>
                      </div>

                      <span
                        class="text-[11px] font-bold ${objectivePercentColor}"
                        >${progressPercentage}%</span
                      >

                      <div
                        class="objective-chevron w-5 h-5 rounded-md flex items-center justify-center text-secondary group-hover/sub-hdr:text-color transition-transform duration-300 ${
                          isExpanded ? "rotate-180" : ""
                        }"
                      >
                        <i class="fa-regular fa-chevron-down text-xs"></i>
                      </div>
                    </div>
                  </button>

                  <div
                    id="objectives-container-${plan.id}"
                    class="objectives-dropdown-body ${
                      isExpanded ? "" : "hidden"
                    } animate-slide-down space-y-1.5 pt-2 ps-1 pe-1"
                  >
                    ${objectives
                      .map((obj) => {
                        const objProgress =
                          this._calculateObjectiveProgress(obj);
                        const isDone =
                          obj.completed ||
                          (obj.type === "numeric" && objProgress === 100);
                        const type = obj.type || "boolean";

                        const target = Number(obj.targetValue) || 1;
                        const current = Number(obj.currentValue) || 0;
                        const unit = obj.unit || "";

                        return `
                          <div
                            class="flex items-center justify-between gap-3 group/st rounded-lg p-2 hover:bg-surface-2/60 border border-transparent hover:border-border/40 transition"
                          >
                            <div
                              class="relative flex flex-row items-center gap-2.5 shrink-0 min-w-0 flex-1"
                            >
                              ${this._renderSingleObjectiveControl(
                                plan.id,
                                obj,
                              )}

                              <span
                                data-plan-id="${plan.id}"
                                data-objective-id="${obj.id}"
                                class="objective-toggle text-xs md:text-sm text-color truncate cursor-pointer select-none ${
                                  isDone
                                    ? "line-through opacity-45"
                                    : "font-medium"
                                }"
                              >
                                ${obj.title}
                              </span>
                            </div>

                            <div class="flex items-center gap-2 shrink-0">
                              ${
                                type === "numeric"
                                  ? `
                                    <div class="inline-flex items-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-0.75 overflow-hidden shadow-xs">
                                      <input
                                        type="text"
                                        inputmode="decimal"
                                        id="${plan.id}"
                                        data-plan-id="${plan.id}"
                                        data-objective-id="${obj.id}"
                                        data-target="${target}"
                                        value="${current}"
                                        class="objective-progress-input w-11 h-6 rounded-md bg-surface text-[11px] font-bold text-center text-emerald-400/80 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition"
                                      />
                                      <div class="flex items-center gap-2 px-2 text-[10px] font-semibold text-emerald-400/80">
                                        <span class="opacity-40">of</span>
                                        <div> 
                                          <span>${target}</span>
                                          ${
                                            unit
                                              ? `<span class="text-emerald-500/80 font-bold ml-0.5">${unit}</span>`
                                              : ""
                                          }
                                        </div>
                                      </div>
                                    </div>
                                  `
                                  : ""
                              }

                              ${
                                type === "milestone"
                                  ? `<span class="h-8 text-[11px] uppercase font-bold tracking-wider inline-flex items-center rounded-lg px-2.5 overflow-hidden shadow-xs bg-yellow-500/10 text-yellow-400/80 border border-yellow-500/20">Milestone</span>`
                                  : type === "boolean"
                                    ? `<span class="h-8 text-[11px] uppercase font-bold tracking-wider inline-flex items-center rounded-lg px-2.5 overflow-hidden shadow-xs bg-cyan-500/10 text-cyan-400/80 border border-cyan-500/20">Boolean</span>`
                                    : type === "numeric"
                                      ? `<span class="h-8 text-[11px] uppercase font-bold tracking-wider inline-flex items-center rounded-lg px-2.5 overflow-hidden shadow-xs bg-emerald-500/10 text-emerald-400/80 border border-emerald-500/20">Numeric</span>`
                                      : ""
                              }
                            </div>
                          </div>
                        `;
                      })
                      .join("")}
                  </div>
                </div>
              `
            : ""
        }
      </div>
    `;
  },

  renderLog(log) {
    const moodBadge = this._getMoodBadgeHtml(log.mood);
    const energyBadge = this._getEnergyBadgeHtml(log.energy);
    const metricsHtml = this._renderMetricsHtml(log.metrics);

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
        class="log-item group relative flex flex-col gap-3 p-3 md:p-4 rounded-xl bg-surface-2/40 hover:bg-surface-2/60 transition-all border border-border/40"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex flex-col min-w-0 w-full gap-1.5">
            <div class="flex items-center gap-2 flex-wrap">
              ${moodBadge}
              ${energyBadge}

              <span class="inline-flex items-center gap-1 rounded-md border border-secondary/30 bg-secondary/10 px-2 py-0.5 text-[10px] font-medium text-secondary/80">
                <i class="fa-regular fa-calendar"></i> ${log.date || log.createdAt}
              </span>

              ${linkedPlanBadgeHtml}
              ${lifeAreaBadgeHtml}
            </div>

            <h2 class="text-base font-bold mt-1 text-color wrap-break-word">${log.title || "Untitled Log"}</h2>

            ${
              log.description
                ? `<p class="text-xs text-secondary/90 leading-relaxed wrap-break-word">${log.description}</p>`
                : ""
            }

            ${metricsHtml}
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
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-1.5 flex-wrap">
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
            ${template.title || "Untitled Template"}
          </h3>

          <p class="text-xs text-secondary/90 leading-relaxed wrap-break-word">
            ${template.description || "No description provided."}
          </p>

          <div class="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            ${
              template.baseline
                ? `<div class="bg-surface/50 p-2 rounded-lg border border-border/40">
                    <span class="text-[10px] font-semibold uppercase text-muted block">Baseline</span>
                    <span class="text-secondary wrap-break-words">${template.baseline}</span>
                  </div>`
                : ""
            }
            ${
              template.optimal
                ? `<div class="bg-surface/50 p-2 rounded-lg border border-border/40">
                    <span class="text-[10px] font-semibold uppercase text-muted block">Optimal</span>
                    <span class="text-secondary wrap-break-words">${template.optimal}</span>
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
            type="button"
            data-id="${template.id}"
            class="use-template-btn inline-flex items-center gap-1.5 bg-brand/80 hover:bg-brand/90 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-md cursor-pointer"
          >
            <i class="fa-regular fa-rocket pointer-events-none"></i> Use Template
          </button>
        </div>
      </div>
    `;
  },
};
