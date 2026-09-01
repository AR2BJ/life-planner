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

  plans.forEach((plan) => {
    const item = document.createElement("div");
    item.className =
      "bg-surface border border-border/70 hover:border-border/90 rounded-2xl p-5 transition duration-200 shadow-xs hover:shadow-md";

    item.innerHTML = PlansItemComponent.render(plan);

    container.appendChild(item);
  });
}
