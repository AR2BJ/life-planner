import { state } from "@/models/state.model";

export const PlansItemComponent = {
  /**
   * مپ جامع تمام دسته‌بندی‌ها با آیکون و استایل اختصاصی
   */
  _categoryRegistry: [
    // GOAL CATEGORIES
    {
      id: "general",
      name: "General",
      icon: "fa-regular fa-folder",
      class: "bg-amber-500/10 text-amber-500/80 border-amber-500/20",
    },
    {
      id: "health",
      name: "Health & Fitness",
      icon: "fa-regular fa-heart-pulse",
      class: "bg-emerald-500/10 text-emerald-500/80 border-emerald-500/20",
    },
    {
      id: "career",
      name: "Career & Work",
      icon: "fa-regular fa-briefcase",
      class: "bg-cyan-500/10 text-cyan-500/80 border-cyan-500/20",
    },
    {
      id: "personal",
      name: "Personal Development",
      icon: "fa-regular fa-user",
      class: "bg-lime-500/10 text-lime-500/80 border-lime-500/20",
    },
    {
      id: "finance",
      name: "Finance & Wealth",
      icon: "fa-regular fa-wallet",
      class: "bg-violet-500/10 text-violet-500/80 border-violet-500/20",
    },
    {
      id: "education",
      name: "Education & Learning",
      icon: "fa-regular fa-graduation-cap",
      class: "bg-pink-500/10 text-pink-500/80 border-pink-500/20",
    },
    {
      id: "lifestyle",
      name: "Lifestyle & Social",
      icon: "fa-regular fa-masks-theater",
      class: "bg-red-500/10 text-red-500/80 border-red-500/20",
    },

    // DAILY LOG CATEGORIES
    {
      id: "journal",
      name: "Journal Entry",
      icon: "fa-regular fa-book-user",
      class: "bg-amber-500/10 text-amber-500/80 border-amber-500/20",
    },
    {
      id: "reflection",
      name: "Daily Reflection",
      icon: "fa-regular fa-brain",
      class: "bg-emerald-500/10 text-emerald-500/80 border-emerald-500/20",
    },
    {
      id: "activity_log",
      name: "Activity Log",
      icon: "fa-regular fa-list-check",
      class: "bg-cyan-500/10 text-cyan-500/80 border-cyan-500/20",
    },
    {
      id: "mood",
      name: "Mood & Energy",
      icon: "fa-regular fa-face-smile",
      class: "bg-lime-500/10 text-lime-500/80 border-lime-500/20",
    },
    {
      id: "gratitude",
      name: "Gratitude & Wins",
      icon: "fa-regular fa-sun",
      class: "bg-violet-500/10 text-violet-500/80 border-violet-500/20",
    },
    {
      id: "notes",
      name: "Quick Notes",
      icon: "fa-regular fa-note-sticky",
      class: "bg-pink-500/10 text-pink-500/80 border-pink-500/20",
    },
    {
      id: "review",
      name: "Nightly Review",
      icon: "fa-regular fa-moon",
      class: "bg-red-500/10 text-red-500/80 border-red-500/20",
    },

    // TEMPLATE CATEGORIES
    {
      id: "workflow",
      name: "Workflows",
      icon: "fa-regular fa-diagram-project",
      class: "bg-amber-500/10 text-amber-500/80 border-amber-500/20",
    },
    {
      id: "routine",
      name: "Daily Routines",
      icon: "fa-regular fa-repeat",
      class: "bg-emerald-500/10 text-emerald-500/80 border-emerald-500/20",
    },
    {
      id: "planning",
      name: "Planning Frameworks",
      icon: "fa-regular fa-sliders",
      class: "bg-cyan-500/10 text-cyan-500/80 border-cyan-500/20",
    },
    {
      id: "project_structure",
      name: "Project Structure",
      icon: "fa-regular fa-sitemap",
      class: "bg-lime-500/10 text-lime-500/80 border-lime-500/20",
    },
    {
      id: "review_checklist",
      name: "Review Checklists",
      icon: "fa-regular fa-clipboard-check",
      class: "bg-violet-500/10 text-violet-500/80 border-violet-500/20",
    },
    {
      id: "event_blueprint",
      name: "Event Blueprints",
      icon: "fa-regular fa-calendar-plus",
      class: "bg-pink-500/10 text-pink-500/80 border-pink-500/20",
    },
    {
      id: "meeting_agenda",
      name: "Meeting Agendas",
      icon: "fa-regular fa-comments",
      class: "bg-red-500/10 text-red-500/80 border-red-500/20",
    },
  ],

  /**
   * تولید متد یکپارچه برای نمایش بج (Badge) دسته‌بندی
   */
  _getCategoryBadgeHtml(categoryInput) {
    const rawCategory =
      typeof categoryInput === "object"
        ? categoryInput?.name || categoryInput?.id || ""
        : categoryInput || "General";

    const normalizedInput = String(rawCategory)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    const matched = this._categoryRegistry.find(
      (cat) =>
        cat.id.toLowerCase().replace(/[^a-z0-9]/g, "") === normalizedInput ||
        cat.name.toLowerCase().replace(/[^a-z0-9]/g, "") === normalizedInput,
    );

    const categoryData = matched || {
      name: rawCategory,
      icon: "fa-solid fa-folder",
      class: "bg-surface text-secondary border-border/60",
    };

    return `
      <span class="inline-flex items-center gap-1 rounded-md border ${categoryData.class} px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
        <i class="${categoryData.icon} text-[9px]"></i>
        <span>${categoryData.name}</span>
      </span>
    `;
  },

  render(item) {
    const itemType =
      item.type ||
      (item.mood !== undefined || item.date !== undefined
        ? "log"
        : item.structure !== undefined || item.isFavorite !== undefined
          ? "template"
          : "goal");

    switch (itemType) {
      case "log":
        return this.renderDailyLog(item);
      case "template":
        return this.renderTemplate(item);
      case "goal":
      default:
        return this.renderGoal(item);
    }
  },

  renderGoal(plan) {
    const isCompleted = plan.status === "done";

    // Dynamic Progress Calculation
    const target = Number(plan.targetValue) || 100;
    const current = Number(plan.currentValue) || 0;
    const progressPercent = Math.min(
      100,
      Math.max(0, Math.round((current / target) * 100)),
    );

    // Color logic for Progress Bar
    const progressColor =
      progressPercent === 100
        ? "bg-emerald-500/80"
        : progressPercent <= 65 && progressPercent >= 35
          ? "bg-amber-500/80"
          : progressPercent < 35 && progressPercent > 0
            ? "bg-red-500/80"
            : progressPercent === 0
              ? "bg-slate-500/80"
              : "bg-brand/80";

    const percentTextColor =
      progressPercent === 100
        ? "text-emerald-500/80"
        : progressPercent <= 65 && progressPercent >= 35
          ? "text-amber-500/80"
          : progressPercent < 35 && progressPercent > 0
            ? "text-red-500/80"
            : progressPercent === 0
              ? "text-slate-500/80"
              : "text-brand/80";

    // Status Badges Styles
    const statusStyles = {
      todo: "border-sky-500/20 bg-sky-500/10 text-sky-500/80",
      in_progress: "border-orange-500/20 bg-orange-500/10 text-orange-500/80",
      done: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500/80",
      blocked: "border-pink-500/20 bg-pink-500/10 text-pink-500/80",
    };
    const statusClass = statusStyles[plan.status] || statusStyles.todo;

    const checkTooltip = isCompleted ? "Mark as Pending" : "Mark as Done";
    const categoryBadgeHtml = this._getCategoryBadgeHtml(plan.category);

    return `
      <div
        data-id="${plan.id}"
        class="plan-item group relative flex flex-col gap-4 p-3 md:p-4 rounded-xl bg-surface-2/40 hover:bg-surface-2/60 transition-all"
      >
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div class="flex flex-wrap sm:flex-nowrap justify-start items-start gap-3 min-w-0 flex-1">
            
            <!-- Checkbox Button -->
            <div class="relative shrink-0">
              <button
                data-id="${plan.id}"
                class="toggle-btn w-9 h-9 shrink-0 rounded-lg border-2 flex items-center justify-center transition peer hover:cursor-pointer ${
                  isCompleted
                    ? "bg-brand/80 border-brand/80 text-(--color-btn-primary-text) shadow-lg shadow-brand/20"
                    : "border-border text-secondary hover:border-brand/80 hover:text-brand/80"
                }"
              >
                <i
                  class="fa-regular ${
                    isCompleted
                      ? "fa-check text-sm md:text-base font-bold"
                      : "fa-square text-sm"
                  }"
                ></i>
              </button>
              <div
                class="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded bg-surface-2 text-xs text-color opacity-0 cursor-default peer-hover:opacity-100 transition z-10 whitespace-nowrap pointer-events-none border border-border/60"
              >
                ${checkTooltip}
              </div>
            </div>

            <!-- Content Area -->
            <div class="flex flex-col min-w-0 w-full gap-1.5 pe-12">
              <div class="flex items-center gap-2 flex-wrap">
                <!-- Status Badge -->
                <span class="inline-flex items-center rounded-md border ${statusClass} px-2 py-0.5 text-[10px] uppercase font-semibold tracking-wider">
                  ${(plan.status || "todo").replace("_", " ")}
                </span>

                <!-- Standardized Category Badge -->
                ${categoryBadgeHtml}

                <!-- Timeframe Badge -->
                ${
                  plan.timeframe
                    ? `<span class="inline-flex items-center gap-1 rounded-md border border-secondary/30 bg-secondary/10 px-2 py-0.5 text-[10px] font-medium text-secondary/80">
                        <i class="fa-regular fa-calendar-days"></i> ${plan.timeframe}
                      </span>`
                    : ""
                }
              </div>

              <h2
                class="text-sm lg:text-base font-bold mt-1 text-color tracking-tight leading-snug wrap-break-word ${
                  isCompleted ? "line-through opacity-60" : ""
                }"
              >
                ${plan.title}
              </h2>

              ${
                plan.description
                  ? `<p class="text-xs lg:text-sm text-secondary/90 leading-relaxed wrap-break-word">
                      ${plan.description}
                    </p>`
                  : ""
              }

              <div class="flex items-center gap-3 mt-1.5 text-[11px] lg:text-xs text-muted">
                <span><i class="fa-regular fa-clock me-1"></i>Created ${plan.createdAt || "N/A"}</span>
                ${
                  plan.completedAt
                    ? `<span class="text-emerald-500/80"><i class="fa-regular fa-circle-check me-1"></i>Completed ${plan.completedAt}</span>`
                    : ""
                }
              </div>
            </div>
          </div>

          <!-- Desktop & Mobile Action Bar -->
          <div class="absolute top-3 right-3 md:static flex self-start md:top-auto md:right-auto z-20 shrink-0">
            <!-- Desktop Action Bar -->
            <div class="hidden md:flex items-center gap-2">
              <div class="relative">
                <button
                  data-id="${plan.id}"
                  class="edit-btn w-9 h-9 rounded-lg bg-surface-2 hover:bg-blue-600/10 border border-border flex items-center justify-center hover:cursor-pointer peer transition"
                >
                  <i class="fa-regular fa-pen-to-square text-blue-500/80 text-base"></i>
                </button>
                <div class="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded bg-surface-2 text-xs text-color opacity-0 cursor-default peer-hover:opacity-100 transition z-10 whitespace-nowrap pointer-events-none border border-border/60">
                  Edit
                </div>
              </div>

              <div class="relative">
                <button
                  data-id="${plan.id}"
                  class="delete-btn w-9 h-9 rounded-lg bg-surface-2 hover:bg-red-600/10 border border-border flex items-center justify-center hover:cursor-pointer peer transition"
                >
                  <i class="fa-regular fa-trash-can text-red-500/80 text-base"></i>
                </button>
                <div class="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded bg-surface-2 text-xs text-color opacity-0 cursor-default peer-hover:opacity-100 transition z-10 whitespace-nowrap pointer-events-none border border-border/60">
                  Delete
                </div>
              </div>
            </div>

            <!-- Mobile Dropdown -->
            <div class="flex md:hidden relative dropdown-container">
              <button
                data-id="${plan.id}"
                class="dropdown-toggle-btn h-9 w-9 rounded-lg border border-border text-secondary hover:text-color hover:bg-surface flex items-center justify-center transition shadow-sm cursor-pointer"
              >
                <i class="fa-regular fa-ellipsis-vertical text-lg"></i>
              </button>

              <div
                data-id="${plan.id}"
                class="dropdown-menu absolute right-0 mt-1.5 w-45 rounded-xl border border-border bg-surface p-1 shadow-xl hidden z-30 flex-col gap-0.5"
              >
                <button
                  data-id="${plan.id}"
                  class="edit-btn flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium border-0 bg-transparent text-secondary hover:text-color hover:bg-surface-2 transition cursor-pointer"
                >
                  <i class="fa-regular fa-pen-to-square text-xs text-blue-500/80"></i>
                  <span>Edit Goal</span>
                </button>

                <div class="my-0.5 border-t border-border/40"></div>

                <button
                  data-id="${plan.id}"
                  class="delete-btn flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium border-0 bg-transparent text-red-500/80 hover:bg-red-500/5 transition cursor-pointer"
                >
                  <i class="fa-regular fa-trash-can text-xs"></i>
                  <span>Delete Permanently</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Progress Section -->
        <div class="mt-2 border-t border-border/60 pt-3">
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <i class="fa-regular fa-chart-line text-brand/80"></i>
              <span class="text-[11px] sm:text-xs font-bold text-secondary">
                Progress Target (${current} / ${target} ${plan.unit || "%"})
              </span>
            </div>

            <div class="flex items-center gap-3">
              <div class="w-28 sm:w-36 h-1.5 rounded-full bg-surface-2 overflow-hidden">
                <div
                  class="h-full ${progressColor} transition-all duration-300"
                  style="width: ${progressPercent}%"
                ></div>
              </div>
              <span class="text-[11px] font-bold ${percentTextColor}">${progressPercent}%</span>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderDailyLog(log) {
    const categoryBadgeHtml = this._getCategoryBadgeHtml(log.category);

    const moodIcons = {
      great: {
        icon: "fa-face-grin-stars",
        color: "text-emerald-500/80 border-emerald-500/20 bg-emerald-500/10",
      },
      good: {
        icon: "fa-face-smile",
        color: "text-sky-500/80 border-sky-500/20 bg-sky-500/10",
      },
      neutral: {
        icon: "fa-face-meh",
        color: "text-amber-500/80 border-amber-500/20 bg-amber-500/10",
      },
      bad: {
        icon: "fa-face-frown",
        color: "text-red-500/80 border-red-500/20 bg-red-500/10",
      },
    };
    const moodInfo = moodIcons[log.mood] || moodIcons.good;

    return `
      <div data-id="${log.id}" class="daily-log-item group relative flex flex-col gap-3 p-3 md:p-4 rounded-xl bg-surface-2/40 hover:bg-surface-2/60 transition-all">
        <div class="flex items-center justify-between gap-3 border-b border-border/50 pb-2.5">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] uppercase font-semibold tracking-wider ${moodInfo.color}">
              <i class="fa-regular ${moodInfo.icon}"></i> ${log.mood || "Log"}
            </span>
            
            <!-- Standardized Category Badge -->
            ${categoryBadgeHtml}

            <span class="inline-flex items-center gap-1 rounded-md border border-secondary/30 bg-secondary/10 px-2 py-0.5 text-[10px] font-medium text-secondary/80">
              <i class="fa-regular fa-calendar"></i> ${log.date || log.createdAt}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button data-id="${log.id}" class="edit-btn w-8 h-8 rounded-lg bg-surface-2 hover:bg-blue-600/10 border border-border flex items-center justify-center transition cursor-pointer">
              <i class="fa-regular fa-pen-to-square text-blue-500/80 text-sm"></i>
            </button>
            <button data-id="${log.id}" class="delete-btn w-8 h-8 rounded-lg bg-surface-2 hover:bg-red-600/10 border border-border flex items-center justify-center transition cursor-pointer">
              <i class="fa-regular fa-trash-can text-red-500/80 text-sm"></i>
            </button>
          </div>
        </div>

        <h3 class="text-sm lg:text-base font-bold text-color tracking-tight">${log.title}</h3>
        ${log.description ? `<p class="text-xs lg:text-sm text-secondary/90 leading-relaxed">${log.description}</p>` : ""}
      </div>
    `;
  },

  renderTemplate(template) {
    const categoryBadgeHtml = this._getCategoryBadgeHtml(template.category);

    return `
      <div data-id="${template.id}" class="template-item group relative flex flex-col justify-between gap-3 p-3 md:p-4 rounded-xl bg-surface-2/40 hover:bg-surface-2/60 transition-all border border-dashed border-border/80">
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="inline-flex items-center gap-1 rounded-md border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 text-[10px] uppercase font-semibold tracking-wider text-purple-400">
                <i class="fa-regular fa-cubes"></i> Template
              </span>

              <!-- Standardized Category Badge -->
              ${categoryBadgeHtml}
            </div>

            <div class="flex items-center gap-1.5">
              <button data-id="${template.id}" class="edit-btn w-8 h-8 rounded-lg bg-surface-2 hover:bg-blue-600/10 border border-border flex items-center justify-center transition cursor-pointer">
                <i class="fa-regular fa-pen-to-square text-blue-500/80 text-sm"></i>
              </button>
              <button data-id="${template.id}" class="delete-btn w-8 h-8 rounded-lg bg-surface-2 hover:bg-red-600/10 border border-border flex items-center justify-center transition cursor-pointer">
                <i class="fa-regular fa-trash-can text-red-500/80 text-sm"></i>
              </button>
            </div>
          </div>

          <h3 class="text-sm lg:text-base font-bold text-color tracking-tight mt-1">${template.title}</h3>
          <p class="text-xs text-secondary/90 leading-relaxed line-clamp-2">${template.description || "No description provided."}</p>
        </div>

        <div class="pt-2 border-t border-border/50 flex items-center justify-between">
          <span class="text-[11px] text-muted"><i class="fa-regular fa-layer-group me-1"></i>Preset Template</span>
          <button data-id="${template.id}" class="use-template-btn inline-flex items-center gap-1.5 bg-brand hover:bg-brand/90 text-(--color-btn-primary-text) text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-md shadow-brand/20 cursor-pointer">
            <i class="fa-regular fa-rocket"></i> Use
          </button>
        </div>
      </div>
    `;
  },
};
