export const EditModalsComponent = {
  renderStepItem(step) {
    const isCompleted = step.completed;

    return `
    <div class="group flex items-center justify-between gap-3 p-2.5 lg:p-3 rounded-xl bg-surface border border-border/80 hover:border-border transition">
      <div class="flex items-center gap-3 min-w-0 flex-1">
        <button
          type="button"
          data-step-id="${step.id}"
          class="toggle-step-btn shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-base transition cursor-pointer ${
            isCompleted ? "text-brand" : "text-secondary hover:text-color"
          }"
        >
          <i class="${isCompleted ? "fa-solid fa-square-check" : "fa-regular fa-square"}"></i>
        </button>

        <span class="text-xs lg:text-sm text-color truncate ${isCompleted ? "line-through text-secondary" : ""}">
          ${step.title}
        </span>
      </div>

      <button
        type="button"
        data-step-id="${step.id}"
        class="delete-step-btn opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-surface-2 hover:bg-red-600/10 text-secondary hover:text-red-500 flex items-center justify-center transition cursor-pointer shrink-0"
      >
        <i class="fa-regular fa-trash-can text-xs"></i>
      </button>
    </div>
  `;
  },

  renderMilestoneItem(milestone) {
    const isCompleted = Boolean(milestone.completed);

    return `
    <div class="group flex items-center justify-between gap-3 p-2.5 lg:p-3 rounded-xl bg-surface border border-border/80 hover:border-border transition">
      <div class="flex items-center gap-3 min-w-0 flex-1">
        <button
          type="button"
          data-milestone-id="${milestone.id}"
          class="toggle-milestone-btn shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-base transition cursor-pointer ${
            isCompleted ? "text-brand" : "text-secondary hover:text-color"
          }"
        >
          <i class="${isCompleted ? "fa-solid fa-square-check" : "fa-regular fa-square"}"></i>
        </button>

        <span class="text-xs lg:text-sm text-color truncate ${isCompleted ? "line-through text-secondary" : ""}">
          ${milestone.title}
        </span>
      </div>

      <button
        type="button"
        data-milestone-id="${milestone.id}"
        class="delete-milestone-btn opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-surface-2 hover:bg-red-600/10 text-secondary hover:text-red-500 flex items-center justify-center transition cursor-pointer shrink-0"
      >
        <i class="fa-regular fa-trash-can text-xs"></i>
      </button>
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

          <div
            id="edit-accordion-group"
            class="flex-1 min-h-0 flex flex-col gap-3 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-surface-2 pe-1"
          >
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
                      Title, category, and core description.
                    </p>
                  </div>
                </div>
                <i
                  class="accordion-icon fa-regular fa-chevron-down text-secondary text-xs lg:text-sm transition-transform duration-200"
                ></i>
              </button>

              <div class="accordion-content p-3.5 lg:p-4 flex flex-col gap-3.5">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full">
                  <div class="sm:col-span-2 flex flex-col">
                    <label
                      for="edit-item-title"
                      class="mb-1.5 block ps-1 text-xs font-semibold text-secondary"
                    >
                      Title <span class="text-red-500">*</span>
                    </label>
                    <input
                      id="edit-item-title"
                      type="text"
                      placeholder="Enter title..."
                      class="h-10 lg:h-11 w-full rounded-xl bg-surface border border-border px-3.5 text-xs lg:text-sm text-color placeholder:text-secondary/70 outline-none focus:border-brand/80 transition"
                    />
                  </div>

                  <div class="sm:col-span-1 flex flex-col justify-end">
                    <div
                      id="edit-goal-category-container"
                      class="edit-tab-field w-full"
                      data-tab="goals"
                    >
                      <div
                        id="edit-goal-category-autocomplete"
                        class="w-full"
                      ></div>
                    </div>
                    <div
                      id="edit-daily-category-container"
                      class="edit-tab-field hidden w-full"
                      data-tab="daily"
                    >
                      <div
                        id="edit-daily-category-autocomplete"
                        class="w-full"
                      ></div>
                    </div>
                    <div
                      id="edit-template-category-container"
                      class="edit-tab-field hidden w-full"
                      data-tab="templates"
                    >
                      <div
                        id="edit-template-category-autocomplete"
                        class="w-full"
                      ></div>
                    </div>
                  </div>
                </div>

                <div class="w-full flex flex-col">
                  <label
                    for="edit-item-desc"
                    class="mb-1.5 block ps-1 text-xs font-semibold text-secondary"
                  >
                    Description
                  </label>
                  <textarea
                    id="edit-item-desc"
                    rows="3"
                    placeholder="Enter description or content..."
                    class="w-full scrollbar-thin scrollbar-thumb-surface rounded-xl bg-surface border border-border p-3 text-xs lg:text-sm text-color placeholder:text-secondary/70 outline-none focus:border-brand/80 transition resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            <div
              id="accordion-goal-metrics"
              class="accordion-item edit-tab-field flex flex-col rounded-2xl border border-border/60 bg-surface-2/60 overflow-hidden shrink-0 transition-all duration-300"
              data-tab="goals"
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
                      Metrics & Schedule
                    </h4>
                    <p class="text-[10px] lg:text-xs leading-4 text-secondary">
                      Timeframe, priority, tracking progress, and target dates.
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
                  <div
                    id="edit-goal-timeframe-autocomplete"
                    class="w-full"
                  ></div>
                  <div
                    id="edit-goal-priority-autocomplete"
                    class="w-full"
                  ></div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full">
                  <div class="flex flex-col">
                    <label
                      for="edit-goal-current"
                      class="mb-1.5 block ps-1 text-xs font-semibold text-secondary"
                    >
                      Current Value
                    </label>
                    <input
                      id="edit-goal-current"
                      type="text"
                      inputmode="numeric"
                      class="h-10 lg:h-11 w-full rounded-xl bg-surface border border-border px-3.5 text-xs lg:text-sm text-color focus:border-brand/80 transition"
                    />
                  </div>
                  <div class="flex flex-col">
                    <label
                      for="edit-goal-target"
                      class="mb-1.5 block ps-1 text-xs font-semibold text-secondary"
                    >
                      Target Value
                    </label>
                    <input
                      id="edit-goal-target"
                      type="text"
                      inputmode="numeric"
                      class="h-10 lg:h-11 w-full rounded-xl bg-surface border border-border px-3.5 text-xs lg:text-sm text-color focus:border-brand/80 transition"
                    />
                  </div>
                  <div
                    id="edit-goal-unit-autocomplete"
                    class="w-full"
                  ></div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
                  <div
                    id="edit-goal-startdate-container"
                    class="w-full"
                  ></div>
                  <div
                    id="edit-goal-enddate-container"
                    class="w-full"
                  ></div>
                </div>
              </div>
            </div>

            <div
              id="accordion-goal-milestones"
              class="accordion-item edit-tab-field flex flex-col rounded-2xl border border-border/60 bg-surface-2/60 overflow-hidden shrink-0 transition-all duration-300"
              data-tab="goals"
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
                      Goal Milestones
                    </h4>
                    <p class="text-[10px] lg:text-xs leading-4 text-secondary">
                      Manage progress checkpoints and key sub-tasks.
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-2 lg:gap-3">
                  <span
                    id="milestone-progress-badge"
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
                    id="new-milestone-input"
                    type="text"
                    placeholder="Add a new milestone or checkpoint..."
                    class="w-full h-10 lg:h-11 flex-1 rounded-xl bg-transparent px-3.5 pe-23 text-xs lg:text-sm text-color placeholder:text-secondary/70 outline-none focus:border-brand/80 transition"
                  />
                  <button
                    id="add-milestone-btn"
                    type="button"
                    class="w-20 h-10 lg:h-11 absolute right-0 px-3.5 rounded-e-xl bg-brand/10 text-brand/80 transition hover:bg-brand/20 font-semibold text-xs lg:text-sm flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <i class="fa-regular fa-plus"></i> Add
                  </button>
                </div>

                <div
                  id="edit-milestones-list"
                  class="w-full flex flex-col gap-2"
                ></div>
              </div>
            </div>

            <div
              id="accordion-daily-fields"
              class="accordion-item edit-tab-field hidden flex-col rounded-2xl border border-border/60 bg-surface-2/60 overflow-hidden shrink-0 transition-all duration-300"
              data-tab="daily"
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
                      Mood state, entry date, and associated goal.
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
                  <div
                    id="edit-daily-mood-autocomplete"
                    class="w-full"
                  ></div>
                  <div
                    id="edit-daily-datepicker-container"
                    class="w-full"
                  ></div>
                </div>
                <div
                  id="edit-daily-goal-link-autocomplete"
                  class="w-full"
                ></div>
              </div>
            </div>

            <div
              id="accordion-template-fields"
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
                      class="fa-regular fa-list-check text-sm lg:text-base"
                    ></i>
                  </div>
                  <div>
                    <h4 class="text-xs lg:text-sm font-semibold text-color">
                      Execution Steps
                    </h4>
                    <p class="text-[10px] lg:text-xs leading-4 text-secondary">
                      Manage template execution steps and tasks.
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-2 lg:gap-3">
                  <span
                    id="step-progress-badge"
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
                    id="new-step-input"
                    type="text"
                    placeholder="Add a new execution step..."
                    class="w-full h-10 lg:h-11 flex-1 rounded-xl bg-transparent px-3.5 pe-23 text-xs lg:text-sm text-color placeholder:text-secondary/70 outline-none focus:border-brand/80 transition"
                  />
                  <button
                    id="add-step-btn"
                    type="button"
                    class="w-20 h-10 lg:h-11 absolute right-0 px-3.5 rounded-e-xl bg-brand/10 text-brand/80 transition hover:bg-brand/20 font-semibold text-xs lg:text-sm flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <i class="fa-regular fa-plus"></i> Add
                  </button>
                </div>

                <div
                  id="steps-list-container"
                  class="w-full flex flex-col gap-2"
                ></div>
              </div>
            </div>
          </div>

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
