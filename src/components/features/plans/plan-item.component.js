import {
  DAILY_LOG_CATEGORIES,
  GOAL_CATEGORIES,
  GOAL_UNIT_OPTIONS,
  TEMPLATE_CATEGORIES,
  TIMEFRAME_OPTIONS,
} from "@/utils/constants/options-value.constants";
import { formatNumberWithCommas, openMilestonesState } from "@/utils/helpers";

export const PlansItemComponent = {
  // Combine all categories directly from source of truth
  _categoryRegistry: [
    ...GOAL_CATEGORIES,
    ...DAILY_LOG_CATEGORIES,
    ...TEMPLATE_CATEGORIES,
  ],

  _timeframeRegistry: TIMEFRAME_OPTIONS,

  _getCategoryBadgeHtml(categoryInput) {
    const rawCategory =
      typeof categoryInput === "object"
        ? categoryInput?.id || categoryInput?.name || ""
        : categoryInput || "general";

    const normalizedInput = String(rawCategory)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    const matched = this._categoryRegistry.find(
      (cat) =>
        cat.id.toLowerCase().replace(/[^a-z0-9]/g, "") === normalizedInput ||
        cat.name.toLowerCase().replace(/[^a-z0-9]/g, "") === normalizedInput,
    );

    const categoryData = matched || {
      name: rawCategory || "General",
      icon: "fa-regular fa-folder text-amber-500/80",
      class: "bg-surface text-secondary border-border/60",
    };

    // Extract solid icon class and make it regular for uniform badges
    const iconClass = categoryData.icon.replace("fa-solid", "fa-regular");

    return `
      <span
        class="inline-flex items-center gap-1 rounded-md border ${categoryData.class} px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
      >
        <i class="${iconClass} text-[9px]"></i>
        <span>${categoryData.name}</span>
      </span>
    `;
  },

  _getTimeframeBadgeHtml(timeframeInput) {
    const rawTimeframe =
      typeof timeframeInput === "object"
        ? timeframeInput?.id || timeframeInput?.name || ""
        : timeframeInput || "yearly";

    const normalizedInput = String(rawTimeframe)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    const matched = this._timeframeRegistry.find(
      (tf) =>
        tf.id.toLowerCase().replace(/[^a-z0-9]/g, "") === normalizedInput ||
        tf.name.toLowerCase().replace(/[^a-z0-9]/g, "") === normalizedInput,
    );

    const tfData = matched || {
      name: rawTimeframe || "Yearly",
      icon: "fa-regular fa-calendar text-violet-500/80",
      class: "bg-surface text-secondary border-border/60",
    };

    const iconClass = tfData.icon.replace("fa-solid", "fa-regular");

    return `
      <span
        class="inline-flex items-center gap-1 rounded-md border ${tfData.class} px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
      >
        <i class="${iconClass} text-[9px]"></i>
        <span>${tfData.name}</span>
      </span>
    `;
  },

  _getUnitIconClass(unitKey) {
    const matched = GOAL_UNIT_OPTIONS.find(
      (u) =>
        u.id === unitKey ||
        u.name.toLowerCase().includes(String(unitKey).toLowerCase()),
    );
    if (!matched) return "fa-regular fa-chart-line text-amber-500/80";

    return matched.icon
      .replace("fa-solid", "fa-regular")
      .replace(/text-[a-z0-9\/-]+/, "text-amber-500/80");
  },

  _calculateStepAmount(unit, targetValue) {
    const target = Number(targetValue) || 100;
    switch (unit) {
      case "%":
      case "percentage":
        return 5;
      case "hrs":
        return Math.max(1, Math.round(target * 0.05));
      case "km":
        return Math.max(1, Math.round(target * 0.05));
      case "books":
      case "count":
      case "sessions":
        return 1;
      case "money":
        return Math.max(10, Math.round(target * 0.05));
      default:
        return Math.max(1, Math.round(target * 0.05));
    }
  },

  _renderActionButtons(id) {
    return `
      <div
        class="absolute top-3 right-3 md:static flex self-start md:top-auto md:right-auto z-20 shrink-0"
      >
        <div class="hidden md:flex items-center gap-2">
          <button
            data-id="${id}"
            class="edit-btn w-9 h-9 rounded-lg bg-surface-2 hover:bg-blue-600/10 border border-border flex items-center justify-center cursor-pointer transition"
          >
            <i
              class="fa-regular fa-pen-to-square text-blue-500/80 text-base"
            ></i>
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

  render(item) {
    const itemType =
      item.type ||
      (item.mood !== undefined
        ? "log"
        : item.structure !== undefined
          ? "template"
          : "goal");
    if (itemType === "log") return this.renderDailyLog(item);
    if (itemType === "template") return this.renderTemplate(item);
    return this.renderGoal(item);
  },

  renderGoal(plan) {
    const priorityKey = (plan.priority || "low").toLowerCase();
    const priorityStyles = {
      low: "border-lime-500/20 bg-lime-500/10 text-lime-500/80",
      medium: "border-amber-500/20 bg-amber-500/10 text-amber-500/80",
      high: "border-red-500/20 bg-red-500/10 text-red-500/80",
    };
    const priorityClass = priorityStyles[priorityKey] || priorityStyles.low;

    const target = Number(plan.targetValue) || 100;
    const current = Number(plan.currentValue) || 0;
    const isCompleted = plan.status === "done";
    const isInProgress = plan.status === "in_progress";

    const isExpanded = openMilestonesState.expandedGoalIds.has(plan.id);

    const isPercentUnit = plan.unit === "%" || plan.unit === "percentage";
    const progressPercent = isPercentUnit
      ? Math.min(100, Math.max(0, current))
      : Math.min(100, Math.max(0, Math.round((current / (target || 1)) * 100)));

    const statusKey = (plan.status || "todo").toLowerCase();
    const statusIcon = {
      todo: "fa-regular fa-square text-sky-400",
      in_progress: "fa-regular fa-arrow-progress text-brand",
      done: "fa-regular fa-square-check text-emerald-400",
    };
    const statusIconClass = statusIcon[statusKey] || statusIcon.todo;

    const progressColor =
      progressPercent === 100
        ? "bg-emerald-500/80"
        : progressPercent <= 65 && progressPercent >= 35
          ? "bg-brand/80"
          : progressPercent <= 35 && progressPercent > 0
            ? "bg-red-500/80"
            : progressPercent === 0
              ? "bg-slate-500/80"
              : "bg-sky-500/80";

    const percentColor =
      progressPercent === 100
        ? "text-emerald-500/80"
        : progressPercent <= 65 && progressPercent >= 35
          ? "text-brand/80"
          : progressPercent <= 35 && progressPercent > 0
            ? "text-red-500/80"
            : progressPercent === 0
              ? "text-slate-500/80"
              : "text-sky-500/80";

    const categoryBadgeHtml = this._getCategoryBadgeHtml(plan.category);
    const timeframeBadgeHtml = this._getTimeframeBadgeHtml(plan.timeframe);
    const unitIconClass = this._getUnitIconClass(plan.unit);
    const milestones = Array.isArray(plan.milestones) ? plan.milestones : [];
    const completedMilestones = milestones.filter((m) => m.completed).length;

    const milestonesPercentage =
      milestones.length > 0
        ? Math.round((completedMilestones / milestones.length) * 100)
        : 0;

    const milestonesProgressColor =
      milestonesPercentage === 100
        ? "bg-emerald-500/80"
        : milestonesPercentage <= 65 && milestonesPercentage >= 35
          ? "bg-amber-500/80"
          : milestonesPercentage <= 35 && milestonesPercentage > 0
            ? "bg-red-500/80"
            : milestonesPercentage === 0
              ? "bg-slate-500/80"
              : "bg-brand/80";

    const milestonesPercentColor =
      milestonesPercentage === 100
        ? "text-emerald-500/80"
        : milestonesPercentage <= 65 && milestonesPercentage >= 35
          ? "text-amber-500/80"
          : milestonesPercentage <= 35 && milestonesPercentage > 0
            ? "text-red-500/80"
            : milestonesPercentage === 0
              ? "text-slate-500/80"
              : "text-brand/80";

    const unitSymbol = plan.unit === "money" ? "$" : plan.unit || "%";
    const stepAmount = this._calculateStepAmount(plan.unit, target);

    return `
      <div
        data-id="${plan.id}"
        class="plan-item group relative flex flex-col gap-4 p-4 rounded-xl bg-surface-2/40 hover:bg-surface-2/60 transition-all border border-border/40 ${
          isCompleted ? "opacity-80" : ""
        }"
      >
        <div
          class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"
        >
          <div class="flex items-start gap-3 min-w-0 flex-1">
            <div class="flex flex-col min-w-0 w-full gap-1.5 pe-12 md:pe-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span
                  class="inline-flex items-center gap-1 rounded-md border ${
                    isCompleted
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500/80"
                      : isInProgress
                        ? "border-brand/20 bg-brand/10 text-brand/80"
                        : "border-sky-500/20 bg-sky-500/10 text-sky-500/80"
                  } px-2 py-0.5 text-[10px] uppercase font-semibold"
                >
                  <i class="${statusIconClass} text-[9px]"></i>
                  ${plan.status.replace("_", " ")}
                </span>
                ${categoryBadgeHtml} ${timeframeBadgeHtml}
                ${
                  plan.priority
                    ? `<span
                        class="inline-flex items-center gap-1 rounded-md border ${priorityClass} px-2 py-0.5 text-[10px] uppercase font-semibold"
                        ><i class="fa-regular fa-flag text-[9px]"></i>
                        ${plan.priority}</span
                      >`
                    : ""
                }
              </div>

              <h2 class="text-base font-bold mt-1 text-color">${plan.title}</h2>

              ${
                plan.description
                  ? `<p class="text-xs text-secondary/90 leading-relaxed">${plan.description}</p>`
                  : ""
              }

              <div class="flex flex-col gap-1.5 mt-2 text-[11px] text-muted">
                <div
                  class="flex flex-col sm:flex-row sm:items-center gap-2 text-secondary/80 mt-0.5"
                >
                  ${
                    plan.startDate
                      ? `<span class="flex items-center gap-1.5"><i class="fa-regular fa-calendar-check text-emerald-500/80"></i> Start Date: <strong class="text-color">${plan.startDate}</strong></span>`
                      : ""
                  }
                  ${
                    plan.endDate
                      ? `<span class="flex items-center gap-1.5 sm:ms-2"><i class="fa-regular fa-calendar-xmark text-red-500/80"></i> End Date: <strong class="text-color">${plan.endDate}</strong></span>`
                      : ""
                  }
                </div>
              </div>
            </div>
          </div>

          ${this._renderActionButtons(plan.id)}
        </div>

        <div class="mt-1 border-t border-border/40 pt-3">
          <div
            class="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div class="flex items-center gap-2">
              <i class="${unitIconClass}"></i>
              <span class="text-xs font-bold text-secondary">
                Progress: ${formatNumberWithCommas(current)} /
                ${formatNumberWithCommas(target)} ${unitSymbol}
              </span>
            </div>

            <div class="flex items-center gap-2">
              <button
                data-id="${plan.id}"
                data-step="-${stepAmount}"
                title="Decrease by ${stepAmount} ${unitSymbol}"
                class="quick-step-btn h-7 w-7 rounded-lg bg-surface border border-border flex items-center justify-center text-xs font-bold text-secondary hover:text-color hover:bg-surface-2 cursor-pointer transition shadow-xs ${
                  progressPercent === 0
                    ? "opacity-50 select-none pointer-events-none"
                    : ""
                }"
              >
                <i class="fa-regular fa-minus"></i>
              </button>

              <div
                class="w-24 sm:w-32 h-2 rounded-full bg-surface-2 overflow-hidden"
              >
                <div
                  class="h-full ${progressColor} transition-all duration-300"
                  style="width: ${progressPercent}%"
                ></div>
              </div>

              <button
                data-id="${plan.id}"
                data-step="+${stepAmount}"
                title="Increase by ${stepAmount} ${unitSymbol}"
                class="quick-step-btn h-7 w-7 rounded-lg bg-surface border border-border flex items-center justify-center text-xs font-bold text-secondary hover:text-color hover:bg-surface-2 cursor-pointer transition shadow-xs ${
                  progressPercent === target
                    ? "opacity-50 select-none pointer-events-none"
                    : ""
                }"
              >
                <i class="fa-regular fa-plus"></i>
              </button>

              <span class="text-xs font-bold ${percentColor} min-w-9 text-end">
                ${progressPercent}%
              </span>
            </div>
          </div>
        </div>

        ${
          milestones.length > 0
            ? `
                <div class="border-t border-border/60 pt-2">
                  <button
                    type="button"
                    data-goal-id="${plan.id}"
                    class="toggle-milestones-btn w-full flex flex-wrap sm:flex-nowrap items-center justify-between gap-5 p-2 rounded-md hover:bg-surface-3/40 transition cursor-pointer group/milestone-hdr text-left"
                  >
                    <div
                      class="w-full sm:w-fit flex justify-center xs:justify-start items-center gap-2"
                    >
                      <i class="fa-regular fa-list-check text-brand/80"></i>
                      <span
                        class="text-[11px] sm:text-xs font-bold text-secondary group-hover/milestone-hdr:text-color transition"
                      >
                        Milestones
                        (${completedMilestones}/${milestones.length})
                      </span>
                    </div>

                    <div class="w-full sm:w-fit flex items-center gap-3">
                      <div
                        class="w-full sm:w-32 h-1.5 rounded-full bg-surface-2 overflow-hidden"
                      >
                        <div
                          class="h-full ${milestonesProgressColor} transition-all duration-300"
                          style="width: ${milestonesPercentage}%"
                        ></div>
                      </div>

                      <span
                        class="text-[11px] font-bold ${milestonesPercentColor}"
                        >${milestonesPercentage}%</span
                      >

                      <div
                        class="milestone-chevron w-5 h-5 rounded-md flex items-center justify-center text-secondary group-hover/milestone-hdr:text-color transition-transform duration-300 ${
                          isExpanded ? "rotate-180" : ""
                        }"
                      >
                        <i class="fa-regular fa-chevron-down text-xs"></i>
                      </div>
                    </div>
                  </button>

                  <div
                    id="milestones-container-${plan.id}"
                    class="milestones-dropdown-body ${
                      isExpanded ? "" : "hidden"
                    } animate-slide-down space-y-1.5 pt-2 ps-1 pe-1"
                  >
                    ${milestones
                      .map(
                        (m) => `
                          <div
                            class="flex items-center justify-between gap-1 group/m rounded-lg p-2 hover:bg-surface-2/60 border border-transparent hover:border-border/50 transition cursor-pointer"
                          >
                            <div
                              class="relative flex flex-row justify-start items-center gap-2 shrink-0 min-w-0 flex-1"
                            >
                              <button
                                type="button"
                                data-goal-id="${plan.id}"
                                data-milestone-id="${m.id}"
                                class="milestone-toggle w-6 h-6 shrink-0 rounded-md border-2 flex items-center justify-center transition peer hover:cursor-pointer ${
                                  m.completed
                                    ? "bg-brand/80 border-brand/80 text-(--color-btn-primary-text) shadow-lg shadow-brand/20"
                                    : "border-border text-secondary hover:border-brand/80 hover:text-brand/80"
                                }"
                              >
                                <i
                                  class="fa-regular ${
                                    m.completed
                                      ? "fa-check text-xs md:text-sm font-bold"
                                      : "fa-square text-[10px]"
                                  }"
                                ></i>
                              </button>

                              <span
                                data-goal-id="${plan.id}"
                                data-milestone-id="${m.id}"
                                class="milestone-toggle text-sm text-color truncate ${
                                  m.completed ? "line-through opacity-50" : ""
                                }"
                              >
                                ${m.title}
                              </span>
                            </div>
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
    const categoryBadgeHtml = this._getCategoryBadgeHtml(log.category);

    const moodIcons = {
      great: {
        icon: "fa-face-smile-beam",
        label: "Great",
        color: "text-emerald-500/80 border-emerald-500/20 bg-emerald-500/10",
      },
      good: {
        icon: "fa-face-smile",
        label: "Good",
        color: "text-cyan-500/80 border-cyan-500/20 bg-cyan-500/10",
      },
      neutral: {
        icon: "fa-face-meh",
        label: "Neutral",
        color: "text-amber-500/80 border-amber-500/20 bg-amber-500/10",
      },
      bad: {
        icon: "fa-face-frown",
        label: "Bad",
        color: "text-red-500/80 border-red-500/20 bg-red-500/10",
      },
    };
    const moodInfo = moodIcons[log.mood] || moodIcons.good;

    const linkedGoalTitle = log.linkedGoal?.title || "";

    return `
      <div
        data-id="${log.id}"
        class="daily-log-item group relative flex flex-col gap-3 p-3 md:p-4 rounded-xl bg-surface-2/40 hover:bg-surface-2/60 transition-all"
      >
        <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div class="flex flex-col min-w-0 w-full gap-1.5 pe-12">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] uppercase font-semibold tracking-wider ${moodInfo.color}">
                <i class="fa-regular ${moodInfo.icon}"></i> ${moodInfo.label}
              </span>
              
              ${categoryBadgeHtml}

              <span class="inline-flex items-center gap-1 rounded-md border border-secondary/30 bg-secondary/10 px-2 py-0.5 text-[10px] font-medium text-secondary/80">
                <i class="fa-regular fa-calendar"></i> ${log.date || log.createdAt}
              </span>

              ${
                linkedGoalTitle
                  ? `<span class="inline-flex items-center gap-1 rounded-md border border-brand/20 bg-brand/10 px-2 py-0.5 text-[10px] font-medium text-brand/80">
                      <i class="fa-regular fa-bullseye"></i> Goal: ${linkedGoalTitle}
                    </span>`
                  : ""
              }
            </div>

            <h3 class="text-sm lg:text-base font-bold mt-1 text-color tracking-tight leading-snug wrap-break-word">
              ${log.title}
            </h3>

            ${
              log.description
                ? `<p class="text-xs lg:text-sm text-secondary/90 leading-relaxed wrap-break-word">
                    ${log.description}
                  </p>`
                : ""
            }
          </div>

          ${this._renderActionButtons(log.id)}
        </div>
      </div>
    `;
  },

  renderTemplate(template) {
    const categoryBadgeHtml = this._getCategoryBadgeHtml(template.category);
    const steps = Array.isArray(template.structure) ? template.structure : [];

    return `
      <div
        data-id="${template.id}"
        class="template-item group relative flex flex-col justify-between gap-4 p-3 md:p-4 rounded-xl bg-surface-2/40 hover:bg-surface-2/60 transition-all border border-dashed border-border/80"
      >
        <div class="flex flex-col gap-2">
          <div
            class="flex flex-col gap-2 md:flex-row md:items-start md:justify-between"
          >
            <div class="flex items-center gap-1.5 flex-wrap pe-12">
              <span
                class="inline-flex items-center gap-1 rounded-md border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[10px] uppercase font-semibold tracking-wider text-violet-500/80"
              >
                <i class="fa-regular fa-cubes"></i> Template
              </span>

              ${categoryBadgeHtml}

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

          <h3
            class="text-sm lg:text-base font-bold text-color tracking-tight mt-1 wrap-break-word"
          >
            ${template.title}
          </h3>

          <p class="text-xs text-secondary/90 leading-relaxed wrap-break-word">
            ${template.description || "No description provided."}
          </p>

          ${
            steps.length > 0
              ? `
              <div class="mt-2 flex flex-col gap-1.5 bg-surface/50 p-2.5 rounded-lg border border-border/40">
                <span class="text-[10px] font-semibold uppercase tracking-wider text-muted">
                  Workflow Steps (${steps.length})
                </span>
                <ul class="flex flex-col gap-1 pl-1">
                  ${steps
                    .map(
                      (step) => `
                    <li class="text-xs text-secondary/90 flex items-center gap-2">
                      <i class="fa-regular fa-circle-dot text-[9px] text-brand/70 shrink-0"></i>
                      <span class="truncate">${step}</span>
                    </li>
                  `,
                    )
                    .join("")}
                </ul>
              </div>
            `
              : ""
          }
        </div>

        <div
          class="pt-3 border-t border-border/50 flex items-center justify-between"
        >
          <span class="text-[11px] text-muted">
            <i class="fa-regular fa-layer-group me-1"></i>Preset Framework
          </span>
          <button
            data-id="${template.id}"
            class="use-template-btn inline-flex items-center gap-1.5 bg-brand/80 hover:bg-brand/90 text-(--color-btn-primary-text) text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-md shadow-brand/20 cursor-pointer"
          >
            <i class="fa-regular fa-rocket"></i> Use Template
          </button>
        </div>
      </div>
    `;
  },
};
