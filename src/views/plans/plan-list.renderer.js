export function renderPlanList(items, activeTab = "goals") {
  const container = document.getElementById("plan-list");
  const countBadge = document.getElementById("plan-count-badge");

  if (!container) return;

  if (countBadge) {
    const totalCount = items.length;
    const labels = {
      goals: totalCount === 1 ? "goal" : "goals",
      daily: totalCount === 1 ? "daily log" : "daily logs",
      templates: totalCount === 1 ? "template" : "templates",
    };

    const currentLabel = labels[activeTab] || "items";

    countBadge.innerHTML = `
      <p class="text-secondary font-semibold text-sm p-0.5">
        <span class="text-brand/80 font-extrabold">${totalCount}</span>&nbsp;${currentLabel}
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

  if (items.length === 0) {
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

  items.forEach((item) => {
    const wrapper = document.createElement("div");
    wrapper.className =
      "bg-surface border border-border/70 hover:border-border/90 rounded-2xl p-5 transition duration-200 shadow-xs";
    wrapper.innerHTML = `<div class="text-sm font-semibold text-color">${item.title || item.name || "Untitled"}</div>`;
    container.appendChild(wrapper);
  });
}
