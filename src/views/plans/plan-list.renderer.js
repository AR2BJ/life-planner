import { PlansItemComponent } from "@/components/features/plans/plan-item.component";

export function renderPlanList(plans, activeTab = "goals") {
  const container = document.getElementById("plan-list");
  const countBadge = document.getElementById("plan-count-badge");

  if (!container) return;

  if (countBadge) {
    const totalCount = plans.length;
    const labels = {
      goals: totalCount === 1 || totalCount === 0 ? "goal" : "goals",
      daily: totalCount === 1 || totalCount === 0 ? "daily log" : "daily logs",
      templates:
        totalCount === 1 || totalCount === 0 ? "template" : "templates",
    };

    const currentLabel = labels[activeTab] || "plans";

    countBadge.innerHTML = `
      <p
        class="text-secondary font-semibold text-sm p-0.5 flex items-center gap-2"
      >
        <span class="text-brand/80 font-extrabold">${totalCount}</span
        >${currentLabel}
      </p>
    `;
  }

  container.innerHTML = "";

  const emptyStateConfig = {
    goals: {
      icon: "<i class='fa-regular fa-bullseye-arrow text-brand/60'></i>",
      title: "No goals created yet",
      description: "Define long-term objectives and track your journey.",
    },
    daily: {
      icon: "<i class='fa-regular fa-calendar-day text-brand/60'></i>",
      title: "No daily log entries",
      description: "Log your daily progress, thoughts, and habits.",
    },
    templates: {
      icon: "<i class='fa-regular fa-layer-group text-brand/60'></i>",
      title: "No templates created",
      description: "Save reusable planning structures and frameworks.",
    },
  };

  if (plans.length === 0) {
    const currentEmpty = emptyStateConfig[activeTab] || emptyStateConfig.goals;

    container.innerHTML = `
      <div class="min-h-72 bg-surface border border-dashed border-border rounded-2xl p-12 text-center flex flex-col items-center justify-center">
        <div class="text-5xl mb-4 text-brand/70">${currentEmpty.icon}</div>
        <h2 class="text-xl font-bold text-color">${currentEmpty.title}</h2>
        <p class="mt-2 text-sm text-secondary max-w-sm mx-auto">${currentEmpty.description}</p>
      </div>
    `;
    return;
  }

  const createPlanCard = (plan) => {
    const item = document.createElement("div");
    item.className =
      "bg-surface border border-border/70 hover:border-border/90 rounded-2xl p-5 transition duration-200 shadow-xs hover:shadow-md";
    item.innerHTML = PlansItemComponent.render(plan);
    return item;
  };

  if (activeTab === "goals") {
    const activeGoals = plans.filter((plan) => plan.status !== "done");
    const completedGoals = plans.filter((plan) => plan.status === "done");

    activeGoals.forEach((plan) => {
      container.appendChild(createPlanCard(plan));
    });

    if (activeGoals.length > 0 && completedGoals.length > 0) {
      const separatorWrapper = document.createElement("div");
      separatorWrapper.className = "w-full my-6 flex flex-col gap-4";

      separatorWrapper.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-border/60"></div>
          </div>
          <button
            id="toggle-completed-btn"
            type="button"
            class="group relative bg-surface hover:bg-surface-2 transition px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-2 rounded-full border border-border/60 shadow-xs cursor-pointer select-none"
          >
            <i class="fa-regular fa-circle-check text-emerald-500"></i>
            <span>Completed Goals (${completedGoals.length})</span>
            <span class="inline-flex transition duration-300 group-[.is-collapsed]:rotate-180">
              <i class="fa-regular fa-chevron-down text-[10px] text-muted"></i>
            </span>
          </button>
        </div>
        <div id="completed-goals-container" class="flex flex-col gap-4 transition-all duration-300"></div>
      `;

      container.appendChild(separatorWrapper);

      const completedContainer = separatorWrapper.querySelector(
        "#completed-goals-container",
      );
      const toggleBtn = separatorWrapper.querySelector("#toggle-completed-btn");

      completedGoals.forEach((plan) => {
        completedContainer.appendChild(createPlanCard(plan));
      });

      toggleBtn.addEventListener("click", () => {
        const isCollapsed = toggleBtn.classList.toggle("is-collapsed");
        completedContainer.classList.toggle("hidden", isCollapsed);
      });
    } else if (completedGoals.length > 0) {
      completedGoals.forEach((plan) => {
        container.appendChild(createPlanCard(plan));
      });
    }
  } else {
    plans.forEach((plan) => {
      container.appendChild(createPlanCard(plan));
    });
  }
}
