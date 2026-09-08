export const EditModalsComponent = {
  renderObjectiveItem(objective) {
    const isCompleted = Boolean(objective.completed);

    return `
      <div
        class="group flex items-center justify-between gap-3 p-2.5 lg:p-3 rounded-xl bg-surface border border-border/80 hover:border-border transition"
      >
        <div class="flex items-center gap-3 min-w-0 flex-1">
          <button
            type="button"
            data-objective-id="${objective.id}"
            class="toggle-objective-btn shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-base transition cursor-pointer ${
              isCompleted ? "text-brand" : "text-secondary hover:text-color"
            }"
          >
            <i
              class="${
                isCompleted
                  ? "fa-solid fa-square-check"
                  : "fa-regular fa-square"
              }"
            ></i>
          </button>

          <span
            class="text-xs lg:text-sm text-color truncate ${
              isCompleted ? "line-through text-secondary" : ""
            }"
          >
            ${objective.title}
          </span>
        </div>

        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
          <button
            type="button"
            data-objective-id="${objective.id}"
            class="edit-objective-btn w-7 h-7 rounded-lg bg-surface-2 hover:bg-brand/10 text-secondary hover:text-brand flex items-center justify-center transition cursor-pointer shrink-0"
          >
            <i class="fa-regular fa-pen text-xs"></i>
          </button>
          <button
            type="button"
            data-objective-id="${objective.id}"
            class="delete-objective-btn w-7 h-7 rounded-lg bg-surface-2 hover:bg-red-600/10 text-secondary hover:text-red-500 flex items-center justify-center transition cursor-pointer shrink-0"
          >
            <i class="fa-regular fa-trash-can text-xs"></i>
          </button>
        </div>
      </div>
    `;
  },

  renderMetricItem(metricKey, metricData) {
    const value =
      typeof metricData === "object" ? metricData.value : metricData;
    const unit = typeof metricData === "object" ? metricData.unit || "" : "";

    return `
      <div
        class="group flex items-center justify-between gap-3 p-2.5 lg:p-3 rounded-xl bg-surface border border-border/80 hover:border-border transition"
      >
        <div class="flex items-center gap-3 min-w-0 flex-1">
          <div class="w-7 h-7 rounded-lg bg-brand/10 text-brand flex items-center justify-center text-xs shrink-0 font-bold">
            <i class="fa-regular fa-chart-simple"></i>
          </div>
          <div class="flex flex-col min-w-0 flex-1">
            <span class="text-xs lg:text-sm text-color font-semibold truncate">
              ${metricKey}
            </span>
            <span class="text-[11px] text-secondary truncate">
              Value: <strong class="text-color">${value}</strong> ${unit}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
          <button
            type="button"
            data-metric-key="${metricKey}"
            data-metric-value="${value}"
            data-metric-unit="${unit}"
            class="edit-metric-btn w-7 h-7 rounded-lg bg-surface-2 hover:bg-brand/10 text-secondary hover:text-brand flex items-center justify-center transition cursor-pointer shrink-0"
          >
            <i class="fa-regular fa-pen text-xs"></i>
          </button>
          <button
            type="button"
            data-metric-key="${metricKey}"
            class="delete-metric-btn w-7 h-7 rounded-lg bg-surface-2 hover:bg-red-600/10 text-secondary hover:text-red-500 flex items-center justify-center transition cursor-pointer shrink-0"
          >
            <i class="fa-regular fa-trash-can text-xs"></i>
          </button>
        </div>
      </div>
    `;
  },

  renderEmptyState(message = "No items added yet.") {
    return `
      <div class="w-full flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-border/70 text-center bg-surface-2/30">
        <p class="text-xs text-secondary font-medium">${message}</p>
      </div>
    `;
  },

  render() {
    return `
      <div
        id="edit-modal"
        class="fixed inset-0 z-50 hidden items-end lg:items-center justify-center p-0 lg:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      >
        <div
          class="bg-surface xs:rounded-t-3xl lg:rounded-2xl p-4 lg:p-6 max-w-3xl w-full h-dvh xs:h-[96.5dvh] sm:h-[95dvh] lg:h-auto lg:max-h-[90vh] shadow-2xl flex flex-col border border-border overflow-hidden"
        >
          <!-- Modal Header -->
          <div
            class="flex items-center justify-between border-b border-border pb-4 shrink-0"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div
                class="w-10 h-10 lg:w-11 lg:h-11 rounded-xl lg:rounded-2xl bg-brand/10 text-brand/80 flex items-center justify-center text-base lg:text-lg shrink-0"
              >
                <i class="fa-regular fa-pen-to-square"></i>
              </div>
              <div class="min-w-0">
                <h3 class="text-sm lg:text-base font-bold text-color truncate">
                  Edit Item Details
                </h3>
                <p
                  class="text-[11px] w-40 xs:w-auto lg:text-xs text-secondary truncate"
                >
                  Update plan properties, tracking metrics, and custom settings.
                </p>
              </div>
            </div>

            <button
              id="cancel-edit-modal"
              type="button"
              class="w-8 h-8 lg:w-9 lg:h-9 rounded-lg lg:rounded-xl bg-surface-2 hover:bg-red-600/10 border border-border text-secondary hover:text-color flex items-center justify-center transition cursor-pointer shrink-0"
            >
              <i class="fa-regular fa-xmark text-sm"></i>
            </button>
          </div>

          <!-- Accordion Group Container -->
          <div
            id="edit-accordion-group"
            class="flex-1 min-h-0 flex flex-col gap-3 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-surface-2 pe-1"
          >
            <!-- SECTION 1: BASIC INFORMATION -->
            <div
              class="accordion-item flex flex-col rounded-2xl border border-border/60 bg-surface-2/60 overflow-hidden shrink-0 transition-all duration-300"
            >
              <button
                type="button"
                class="accordion-header w-full p-3.5 lg:p-4 border-b border-border flex items-center justify-between text-left cursor-pointer hover:bg-surface-2/80 transition"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-9 w-9 lg:h-10 lg:w-10 self-start shrink-0 items-center justify-center rounded-lg lg:rounded-xl bg-brand/10 text-brand/80"
                  >
                    <i
                      class="fa-regular fa-file-lines text-sm lg:text-base"
                    ></i>
                  </div>
                  <div>
                    <h4 class="text-xs lg:text-sm font-semibold text-color">
                      Basic Information
                    </h4>
                    <p class="text-[10px] lg:text-xs leading-4 text-secondary">
                      Title, area, and core strategy settings.
                    </p>
                  </div>
                </div>
                <i
                  class="accordion-icon fa-regular fa-chevron-down text-secondary text-xs lg:text-sm transition-transform duration-200 rotate-180"
                ></i>
              </button>

              <div class="accordion-content p-3.5 lg:p-4 flex flex-col gap-3.5">
                <div
                  id="edit-title-container"
                  class="flex flex-col flex-1 min-w-0"
                >
                  <label
                    for="edit-item-title"
                    class="mb-1.5 block ps-3 text-xs font-semibold text-secondary"
                  >
                    Title <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="edit-item-title"
                    type="text"
                    placeholder="Enter title..."
                    class="h-10 lg:h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-color placeholder:text-secondary/70 transition focus:border-brand/80 focus:outline-none"
                  />
                </div>

                <div class="flex flex-col sm:flex-row items-stretch sm:items-end gap-3.5 w-full">
                  <div class="flex flex-col flex-1 min-w-0">
                    <div
                      id="edit-plan-lifearea-container"
                      class="edit-tab-field w-full"
                      data-tab="plans"
                    >
                      <div
                        id="edit-plan-lifearea-autocomplete"
                        class="w-full"
                      ></div>
                    </div>
                    <div
                      id="edit-template-lifearea-container"
                      class="edit-tab-field hidden w-full"
                      data-tab="templates"
                    >
                      <div
                        id="edit-template-lifearea-autocomplete"
                        class="w-full"
                      ></div>
                    </div>
                  </div>

                  <div
                    class="edit-tab-field hidden shrink-0 w-auto h-10 lg:h-11 items-center justify-start sm:justify-end pt-2.5"
                    data-tab="templates"
                  >
                    <label
                      class="relative inline-flex items-center cursor-pointer gap-2.5 select-none"
                    >
                      <input
                        id="edit-template-favorite"
                        type="checkbox"
                        class="sr-only peer"
                      />
                      <div
                        class="w-10 h-5.5 bg-surface-3 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-brand"
                      ></div>
                      <span
                        class="text-xs font-semibold text-secondary whitespace-nowrap"
                        >Mark as Favorite</span
                      >
                    </label>
                  </div>
                </div>

                <div
                  id="edit-desc-container"
                  class="w-full flex flex-col"
                >
                  <label
                    for="edit-item-desc"
                    class="mb-1.5 block ps-3 text-xs font-semibold text-secondary"
                  >
                    Description
                  </label>
                  <textarea
                    id="edit-item-desc"
                    rows="2"
                    placeholder="Enter description or content..."
                    class="w-full scrollbar-thin scrollbar-thumb-surface rounded-xl border border-border bg-surface p-3 text-sm text-color placeholder:text-secondary/70 transition focus:border-brand/80 focus:outline-none resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- SECTION 2: PLANS - SCHEDULE & LIFECYCLE -->
            <div
              id="accordion-plan-lifecycle"
              class="accordion-item edit-tab-field flex flex-col rounded-2xl border border-border/60 bg-surface-2/60 overflow-hidden shrink-0 transition-all duration-300"
              data-tab="plans"
            >
              <button
                type="button"
                class="accordion-header w-full p-3.5 lg:p-4 border-b border-border flex items-center justify-between text-left cursor-pointer hover:bg-surface-2/80 transition"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-9 w-9 lg:h-10 lg:w-10 shrink-0 self-start items-center justify-center rounded-lg lg:rounded-xl bg-brand/10 text-brand/80"
                  >
                    <i class="fa-regular fa-sliders text-sm lg:text-base"></i>
                  </div>
                  <div>
                    <h4 class="text-xs lg:text-sm font-semibold text-color">
                      Schedule & Lifecycle State
                    </h4>
                    <p class="text-[10px] lg:text-xs leading-4 text-secondary">
                      Operational state and timeframe configuration.
                    </p>
                  </div>
                </div>
                <i
                  class="accordion-icon fa-regular fa-chevron-down text-secondary text-xs lg:text-sm transition-transform duration-200"
                ></i>
              </button>

              <div
                class="accordion-content hidden p-3.5 lg:p-4 flex-col gap-3.5"
              >
                <div class="w-full">
                  <div
                    id="edit-plan-state-autocomplete"
                    class="w-full"
                  ></div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
                  <div
                    id="edit-plan-startdate-container"
                    class="w-full"
                  ></div>
                  <div
                    id="edit-plan-enddate-container"
                    class="w-full"
                  ></div>
                </div>
              </div>
            </div>

            <!-- SECTION 3: PLANS - OBJECTIVES CHECKLIST -->
            <div
              id="accordion-plan-objectives"
              class="accordion-item edit-tab-field flex flex-col rounded-2xl border border-border/60 bg-surface-2/60 overflow-hidden shrink-0 transition-all duration-300"
              data-tab="plans"
            >
              <button
                type="button"
                class="accordion-header w-full p-3.5 lg:p-4 border-b border-border flex items-center justify-between text-left cursor-pointer hover:bg-surface-2/80 transition"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-9 w-9 lg:h-10 lg:w-10 shrink-0 self-start items-center justify-center rounded-lg lg:rounded-xl bg-brand/10 text-brand/80"
                  >
                    <i
                      class="fa-regular fa-bars-staggered text-sm lg:text-base"
                    ></i>
                  </div>
                  <div>
                    <h4 class="text-xs lg:text-sm font-semibold text-color">
                      Plan Objectives
                    </h4>
                    <p class="text-[10px] lg:text-xs leading-4 text-secondary">
                      Manage progress checkpoints and core sub-tasks.
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-2 lg:gap-3">
                  <span
                    id="objective-progress-badge"
                    class="text-[10px] lg:text-xs text-secondary px-2 lg:px-3 py-1 rounded-lg bg-surface border border-border shrink-0"
                  >
                    0/0 Done
                  </span>
                  <i
                    class="accordion-icon fa-regular fa-chevron-down text-secondary text-xs lg:text-sm transition-transform duration-200"
                  ></i>
                </div>
              </button>

              <div
                class="accordion-content hidden p-3.5 lg:p-4 flex-col gap-3.5"
              >
                <div
                  class="w-full flex relative items-center gap-2 rounded-xl border border-border bg-surface"
                >
                  <input
                    id="new-objective-input"
                    type="text"
                    placeholder="Add a new objective..."
                    class="h-10 lg:h-11 w-full rounded-xl bg-surface px-4 text-sm text-color placeholder:text-secondary/70 transition focus:border-brand/80 focus:outline-none"
                  />
                  <button
                    id="btn-add-objective"
                    type="button"
                    class="w-20 h-10 lg:h-11 absolute right-0 px-3.5 rounded-e-xl bg-brand/10 text-brand/80 transition hover:bg-brand/20 font-semibold text-xs lg:text-sm flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <i class="fa-regular fa-plus"></i> Add
                  </button>
                </div>

                <div
                  id="plan-objectives-list"
                  class="w-full flex flex-col gap-2"
                ></div>
              </div>
            </div>

            <!-- SECTION 4: LOGS - LINKAGE, STATE & NOTES -->
            <div
              id="accordion-log-fields"
              class="accordion-item edit-tab-field hidden flex-col rounded-2xl border border-border/60 bg-surface-2/60 overflow-hidden shrink-0 transition-all duration-300"
              data-tab="logs"
            >
              <button
                type="button"
                class="accordion-header w-full p-3.5 lg:p-4 border-b border-border flex items-center justify-between text-left cursor-pointer hover:bg-surface-2/80 transition"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-9 w-9 lg:h-10 lg:w-10 shrink-0 self-start items-center justify-center rounded-lg lg:rounded-xl bg-brand/10 text-brand/80"
                  >
                    <i
                      class="fa-regular fa-calendar-day text-sm lg:text-base"
                    ></i>
                  </div>
                  <div>
                    <h4 class="text-xs lg:text-sm font-semibold text-color">
                      Log Details & Linkage
                    </h4>
                    <p class="text-[10px] lg:text-xs leading-4 text-secondary">
                      Entry date, energy level, mood state, and parent plan link.
                    </p>
                  </div>
                </div>
                <i
                  class="accordion-icon fa-regular fa-chevron-down text-secondary text-xs lg:text-sm transition-transform duration-200"
                ></i>
              </button>

              <div
                class="accordion-content hidden p-3.5 lg:p-4 flex-col gap-3.5"
              >
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full">
                  <div
                    id="edit-log-datepicker-container"
                    class="w-full"
                  ></div>
                  <div
                    id="edit-log-energy-autocomplete"
                    class="w-full"
                  ></div>
                  <div
                    id="edit-log-mood-autocomplete"
                    class="w-full"
                  ></div>
                </div>

                <div
                  id="edit-log-plan-link-autocomplete"
                  class="w-full"
                ></div>

                <div class="w-full flex flex-col">
                  <label
                    for="edit-log-notes"
                    class="mb-1.5 block ps-3 text-xs font-semibold text-secondary"
                  >
                    Log Notes
                  </label>
                  <textarea
                    id="edit-log-notes"
                    rows="3"
                    placeholder="Enter daily reflections or detailed observations..."
                    class="w-full scrollbar-thin scrollbar-thumb-surface rounded-xl border border-border bg-surface p-3 text-sm text-color placeholder:text-secondary/70 transition focus:border-brand/80 focus:outline-none resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- SECTION 5: LOGS - QUANTITATIVE METRICS -->
            <div
              id="accordion-log-metrics"
              class="accordion-item edit-tab-field hidden flex-col rounded-2xl border border-border/60 bg-surface-2/60 overflow-hidden shrink-0 transition-all duration-300"
              data-tab="logs"
            >
              <button
                type="button"
                class="accordion-header w-full p-3.5 lg:p-4 border-b border-border flex items-center justify-between text-left cursor-pointer hover:bg-surface-2/80 transition"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-9 w-9 lg:h-10 lg:w-10 shrink-0 self-start items-center justify-center rounded-lg lg:rounded-xl bg-brand/10 text-brand/80"
                  >
                    <i
                      class="fa-regular fa-chart-line text-sm lg:text-base"
                    ></i>
                  </div>
                  <div>
                    <h4 class="text-xs lg:text-sm font-semibold text-color">
                      Log Metrics
                    </h4>
                    <p class="text-[10px] lg:text-xs leading-4 text-secondary">
                      Track quantitative metrics and key performance variables.
                    </p>
                  </div>
                </div>
                <i
                  class="accordion-icon fa-regular fa-chevron-down text-secondary text-xs lg:text-sm transition-transform duration-200"
                ></i>
              </button>

              <div
                class="accordion-content hidden p-3.5 lg:p-4 flex-col gap-3.5"
              >
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    id="new-metric-key"
                    type="text"
                    placeholder="Metric key (e.g. sleep_hours)"
                    class="h-10 lg:h-11 rounded-xl border border-border bg-surface px-3 text-xs lg:text-sm text-color placeholder:text-secondary/70 focus:border-brand/80 focus:outline-none"
                  />
                  <input
                    id="new-metric-val"
                    type="text"
                    inputmode="decimal"
                    placeholder="Value (e.g. 7.5)"
                    class="h-10 lg:h-11 rounded-xl border border-border bg-surface px-3 text-xs lg:text-sm text-color placeholder:text-secondary/70 focus:border-brand/80 focus:outline-none"
                  />
                  <div id="metric-actions-container" class="flex gap-2">
                    <input
                      id="new-metric-unit"
                      type="text"
                      placeholder="Unit (e.g. hrs)"
                      class="h-10 lg:h-11 w-full rounded-xl border border-border bg-surface px-3 text-xs lg:text-sm text-color placeholder:text-secondary/70 focus:border-brand/80 focus:outline-none"
                    />
                    <button
                      id="btn-add-metric"
                      type="button"
                      class="h-10 lg:h-11 px-4 rounded-xl bg-brand/10 text-brand/80 transition hover:bg-brand/20 font-semibold text-xs lg:text-sm flex items-center justify-center shrink-0 cursor-pointer"
                    >
                      <i class="fa-regular fa-plus"></i>
                    </button>
                  </div>
                </div>

                <div
                  id="log-metrics-list"
                  class="w-full flex flex-col gap-2 mt-1"
                ></div>
              </div>
            </div>

            <!-- SECTION 6: TEMPLATES - STRATEGY BASELINES -->
            <div
              id="accordion-template-strategies"
              class="accordion-item edit-tab-field hidden flex-col rounded-2xl border border-border/60 bg-surface-2/60 overflow-hidden shrink-0 transition-all duration-300"
              data-tab="templates"
            >
              <button
                type="button"
                class="accordion-header w-full p-3.5 lg:p-4 border-b border-border flex items-center justify-between text-left cursor-pointer hover:bg-surface-2/80 transition"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-9 w-9 lg:h-10 lg:w-10 shrink-0 self-start items-center justify-center rounded-lg lg:rounded-xl bg-brand/10 text-brand/80"
                  >
                    <i
                      class="fa-regular fa-compass text-sm lg:text-base"
                    ></i>
                  </div>
                  <div>
                    <h4 class="text-xs lg:text-sm font-semibold text-color">
                      Execution Benchmarks
                    </h4>
                    <p class="text-[10px] lg:text-xs leading-4 text-secondary">
                      Set baseline strategy standards and optimal performance goals.
                    </p>
                  </div>
                </div>
                <i
                  class="accordion-icon fa-regular fa-chevron-down text-secondary text-xs lg:text-sm transition-transform duration-200"
                ></i>
              </button>

              <div
                class="accordion-content hidden p-3.5 lg:p-4 flex-col gap-3.5"
              >
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
                  <div class="w-full flex flex-col">
                    <label
                      for="edit-template-baseline"
                      class="mb-1.5 block ps-3 text-xs font-semibold text-secondary"
                    >
                      Baseline Strategy
                    </label>
                    <input
                      id="edit-template-baseline"
                      type="text"
                      placeholder="e.g. Minimum acceptable standard"
                      class="h-10 lg:h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-color placeholder:text-secondary/70 focus:border-brand/80 focus:outline-none"
                    />
                  </div>
                  <div class="w-full flex flex-col">
                    <label
                      for="edit-template-optimal"
                      class="mb-1.5 block ps-3 text-xs font-semibold text-secondary"
                    >
                      Optimal Strategy
                    </label>
                    <input
                      id="edit-template-optimal"
                      type="text"
                      placeholder="e.g. Best performance target"
                      class="h-10 lg:h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-color placeholder:text-secondary/70 focus:border-brand/80 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Action Buttons -->
          <div
            class="grid grid-cols-2 gap-3 pt-3 border-t border-border shrink-0 w-full bg-surface mt-auto"
          >
            <button
              id="cancel-edit"
              type="button"
              class="h-10 lg:h-11 rounded-lg lg:rounded-xl bg-surface-2 hover:border-primary text-secondary hover:text-color font-medium text-xs lg:text-sm transition border border-border cursor-pointer flex items-center justify-center"
            >
              Cancel
            </button>

            <button
              id="confirm-edit"
              type="button"
              class="h-10 lg:h-11 rounded-lg lg:rounded-xl bg-brand/80 hover:bg-brand text-white font-medium text-xs lg:text-sm transition shadow-md shadow-brand/10 cursor-pointer flex items-center justify-center gap-2"
            >
              <i class="fa-regular fa-check"></i> Save Changes
            </button>
          </div>
        </div>
      </div>
    `;
  },
};

export function setupAccordionController(accordionContainer) {
  if (!accordionContainer) return;

  accordionContainer.addEventListener("click", (event) => {
    const headerBtn = event.target.closest(".accordion-header");
    if (!headerBtn) return;

    const clickedItem = headerBtn.closest(".accordion-item");
    if (!clickedItem) return;

    const allItems = accordionContainer.querySelectorAll(".accordion-item");

    allItems.forEach((item) => {
      const content = item.querySelector(".accordion-content");
      const icon = item.querySelector(".accordion-icon");

      if (item === clickedItem) {
        const isCurrentlyHidden = content.classList.contains("hidden");

        if (isCurrentlyHidden) {
          content.classList.remove("hidden");
          content.classList.add("flex");
          if (icon) icon.classList.add("rotate-180");
        } else {
          content.classList.add("hidden");
          content.classList.remove("flex");
          if (icon) icon.classList.remove("rotate-180");
        }
      } else {
        content.classList.add("hidden");
        content.classList.remove("flex");
        if (icon) icon.classList.remove("rotate-180");
      }
    });
  });
}
