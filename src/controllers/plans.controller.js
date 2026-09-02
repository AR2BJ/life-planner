import {
  FILTER_OPTIONS_BY_TAB,
  SORT_OPTIONS_BY_TAB,
} from "@/utils/constants/options-value.constants.js";
import { StateManager, state } from "@/models/state.model.js";

import { AnalyticsController } from "./analytics.controller.js";
import { AnalyticsView } from "@/views/analytics-view.js";
import { AutocompleteComponent } from "@/components/ui/autocomplete.component.js";
import { DeleteModalsComponent } from "@/components/modals/delete-modals.component.js";
import { DesktopNavComponent } from "@/components/layout/desktop-nav.component.js";
import { EditModalsComponent } from "@/components/modals/edit-modals.component.js";
import { GlobalLoaderService } from "@/services/loader.service.js";
import { HeaderComponent } from "@/components/shared/header.component.js";
import { InfoModalComponent } from "@/components/modals/info-modal.component.js";
import { MobileNavComponent } from "@/components/layout/mobile-nav.component.js";
import { NavigationController } from "./navigation.controller.js";
import { PlansActionController } from "./plans/plans-action.controller.js";
import { PlansFormController } from "./plans/plans-form.controller.js";
import { PlansView } from "@/views/plans-view.js";
import { SettingsViewComponent } from "@/components/features/settings/settings-view.component.js";
import { eventBus } from "@/services/event-bus.service.js";
import { initUserCurrency } from "@/services/currency.service.js";
import { renderPlanList } from "@/views/plans/plan-list.renderer.js";

export const PlansController = {
  async init() {
    StateManager.init();
    this.renderComponent();

    this.initFilterAutocompletes();
    this.refreshUI();

    PlansFormController.init(this);
    PlansActionController.init(this);

    await initUserCurrency();

    this.bindStaticEvents();
    this.bindMenuToggle();
    this.bindActionMenuToggle();
    this.setupTabIndicatorObserver();
    this.subscribeToDataChanges();

    requestAnimationFrame(() => {
      this.updateTabStyles(state.activeTab);
    });
  },

  initFilterAutocompletes() {
    const currentTab = state.activeTab || "goals";
    const dateWrapper = document.getElementById(
      "date-filter-autocomplete-wrapper",
    );
    const sortWrapper = document.getElementById("sort-autocomplete-wrapper");

    if (dateWrapper) {
      if (this.dateFilterAutocomplete) {
        this.dateFilterAutocomplete.destroy();
      }

      const dateOptions =
        FILTER_OPTIONS_BY_TAB[currentTab] || FILTER_OPTIONS_BY_TAB.goals;

      this.dateFilterAutocomplete = new AutocompleteComponent(
        dateWrapper,
        dateOptions,
        {
          label: currentTab === "templates" ? "Type" : "Filter",
          isRow: true,
          placeholder: "Select Filter...",
          itemTitle: "title",
          itemValue: "value",
          itemIcon: "icon",
          containerClass: "min-h-8! bg-surface!",
          inputClass: "h-5! pb-0! w-full lg:w-36 text-xs sm:text-sm",
          onChange: (selectedVal) => {
            GlobalLoaderService.show("Applying filter...");
            setTimeout(() => {
              try {
                StateManager.setDateFilter(selectedVal);
                this.refreshUI();
              } finally {
                GlobalLoaderService.hide();
              }
            }, 100);
          },
        },
      );

      const activeFilter = this.getSelectedDateFilterForTab(currentTab);
      this.dateFilterAutocomplete.setValue(activeFilter);
    }

    if (sortWrapper) {
      if (this.sortAutocomplete) {
        this.sortAutocomplete.destroy();
      }

      const sortOptions =
        SORT_OPTIONS_BY_TAB[currentTab] || SORT_OPTIONS_BY_TAB.goals;

      this.sortAutocomplete = new AutocompleteComponent(
        sortWrapper,
        sortOptions,
        {
          label: "Sort",
          isRow: true,
          placeholder: "Sort By...",
          itemTitle: "title",
          itemValue: "value",
          itemIcon: "icon",
          containerClass: "min-h-8! bg-surface!",
          inputClass: "h-5! pb-0! w-full lg:w-36 text-xs sm:text-sm",
          onChange: (selectedVal) => {
            GlobalLoaderService.show("Sorting items...");
            setTimeout(() => {
              try {
                StateManager.setSortBy(selectedVal);
                this.refreshUI();
              } finally {
                GlobalLoaderService.hide();
              }
            }, 100);
          },
        },
      );

      const activeSort = this.getSelectedSortForTab(currentTab);
      this.sortAutocomplete.setValue(activeSort);
    }
  },

  getSelectedDateFilterForTab(tab) {
    if (tab === "goals") return state.goalsUI?.dateFilter || "all";
    if (tab === "daily") return state.dailyLogsUI?.dateFilter || "all";
    if (tab === "templates") return state.templatesUI?.dateFilter || "all";
    return "all";
  },

  getSelectedSortForTab(tab) {
    if (tab === "goals") return state.goalsUI?.sortBy || "priority";
    if (tab === "daily") return state.dailyLogsUI?.sortBy || "date_desc";
    if (tab === "templates") return state.templatesUI?.sortBy || "favorites";
    return "title";
  },

  renderComponent() {
    const renderMap = {
      "header-container": HeaderComponent.render,
      "desktop-nav-container": DesktopNavComponent.render,
      "mobile-nav-container": MobileNavComponent.render,
      "plans-view-container": PlansView.render,
      "analytics-view-container": AnalyticsView.render,
      "settings-view-container": SettingsViewComponent.render,
      "help-modal-container": InfoModalComponent.render,
      "edit-modals-container": EditModalsComponent.render,
      "delete-modals-container": DeleteModalsComponent.render,
    };

    Object.entries(renderMap).forEach(([id, renderFn]) => {
      const container = document.getElementById(id);
      if (container && typeof renderFn === "function") {
        container.innerHTML = renderFn();
      }
    });
  },

  subscribeToDataChanges() {
    eventBus.subscribe("store:changed", () => {
      this.refreshUI();
    });
    eventBus.subscribe("store:goals:changed", () => {
      this.refreshUI();
    });
    eventBus.subscribe("store:daily:changed", () => {
      this.refreshUI();
    });
    eventBus.subscribe("store:templates:changed", () => {
      this.refreshUI();
    });
  },

  getCategoriesForTab(tab) {
    return StateManager.getCategoriesForTab(tab);
  },

  getSelectedCategoryForTab(tab) {
    if (tab === "goals") return state.goalsUI?.selectedCategory || "all";
    if (tab === "daily") return state.dailyLogsUI?.selectedCategory || "all";
    if (tab === "templates")
      return state.templatesUI?.selectedCategory || "all";
    return "all";
  },

  getSearchQueryForTab(tab) {
    if (tab === "goals") return state.goalsUI?.searchQuery || "";
    if (tab === "daily") return state.dailyLogsUI?.searchQuery || "";
    if (tab === "templates") return state.templatesUI?.searchQuery || "";
    return "";
  },

  renderCategories() {
    const container = document.getElementById("category-filter-scroll");
    if (!container) return;

    const currentTab = state.activeTab || "goals";
    const categories = this.getCategoriesForTab(currentTab);
    const activeCategory = this.getSelectedCategoryForTab(currentTab);

    const allButtonHtml = `
      <button
        data-tag="all"
        class="tag-filter-btn h-8 shrink-0 whitespace-nowrap rounded-lg px-3.5 text-xs font-semibold transition cursor-pointer ${
          activeCategory === "all"
            ? "bg-brand/80 text-white shadow-brand/10"
            : "bg-surface-2 hover:bg-surface-3 text-secondary hover:text-color"
        }"
      >
        All ${currentTab.charAt(0).toUpperCase() + currentTab.slice(1)}
      </button>
    `;

    const categoriesHtml = categories
      .map((cat) => {
        const isActive = activeCategory === cat.id;
        const activeClasses = isActive
          ? "bg-brand/80 text-white shadow-brand/10"
          : "bg-surface-2 hover:bg-surface-3 text-secondary hover:text-color";

        let iconClass = cat.icon
          ? cat.icon.replace("fa-solid", "fa-regular")
          : "";
        if (isActive) {
          iconClass =
            iconClass.replace(/text-[a-zA-Z0-9\/\-]+/g, "").trim() +
            " text-white";
        }

        return `
        <button
          data-tag="${cat.id}"
          class="tag-filter-btn flex items-center gap-1.5 h-8 shrink-0 whitespace-nowrap rounded-lg px-3.5 text-xs font-semibold transition cursor-pointer ${activeClasses}"
        >
          ${cat.icon ? `<i class="${iconClass} text-[11px]"></i>` : ""}
          <span>${cat.name}</span>
        </button>
      `;
      })
      .join("");

    container.innerHTML = allButtonHtml + categoriesHtml;
  },

  refreshUI() {
    this.renderCategories();

    const allPlans = StateManager.getPlans();
    const filteredPlans = StateManager.getFilteredPlans();

    renderPlanList(filteredPlans, state.activeTab);
    AnalyticsController.dispatchRender(allPlans);
    NavigationController.updateNavigationDOM();
    PlansFormController.refreshUI();
  },

  bindMenuToggle() {
    const menuToggle = document.getElementById("menu-toggle");
    const desktopNav = document.getElementById("desktop-nav");
    const app = document.getElementById("app");

    let isMenuOpen = false;

    menuToggle?.addEventListener("click", () => {
      isMenuOpen = !isMenuOpen;
      if (isMenuOpen) {
        desktopNav?.classList.replace(
          "-translate-x-[calc(100%+2rem)]",
          "translate-x-0",
        );
        app?.classList.replace("lg:ps-8", "lg:ps-30");
      } else {
        desktopNav?.classList.replace(
          "translate-x-0",
          "-translate-x-[calc(100%+2rem)]",
        );
        app?.classList.replace("lg:ps-30", "lg:ps-8");
      }
    });
  },

  bindActionMenuToggle() {
    document.addEventListener("click", (e) => {
      const toggleBtn = e.target.closest(".dropdown-toggle-btn");

      if (toggleBtn) {
        e.stopPropagation();
        const container = toggleBtn.closest(".dropdown-container");
        const menu = container?.querySelector(".dropdown-menu");

        document.querySelectorAll(".dropdown-menu").forEach((m) => {
          if (m !== menu) m.classList.add("hidden");
        });

        menu?.classList.toggle("hidden");
        return;
      }

      if (!e.target.closest(".dropdown-container")) {
        document
          .querySelectorAll(".dropdown-menu")
          .forEach((m) => m.classList.add("hidden"));
      }
    });
  },

  bindStaticEvents() {
    // 1. Tag Filters
    const tagFilterBtn = document.getElementById("category-filter-scroll");
    if (tagFilterBtn) {
      tagFilterBtn.addEventListener("click", (e) => {
        const btn = e.target.closest(".tag-filter-btn");
        if (!btn) return;

        const selectedTag = btn.dataset.tag;
        StateManager.setSelectedCategory(selectedTag, state.activeTab);
        this.refreshUI();
      });
    }

    // 2. Select Elements fallback
    const sortSelect = document.getElementById("plan-sort-select");
    if (sortSelect) {
      sortSelect.value = state.goalsUI?.sortBy || "priority";
      sortSelect.addEventListener("change", (e) => {
        GlobalLoaderService.show("Sorting plans...");
        setTimeout(() => {
          try {
            StateManager.setSortBy(e.target.value);
            this.refreshUI();
          } finally {
            GlobalLoaderService.hide();
          }
        }, 100);
      });
    }

    const dateFilterSelect = document.getElementById("plan-date-filter-select");
    if (dateFilterSelect) {
      dateFilterSelect.value = state.goalsUI?.dateFilter || "all";
      dateFilterSelect.addEventListener("change", (e) => {
        GlobalLoaderService.show("Filtering plans by date...");
        setTimeout(() => {
          try {
            StateManager.setDateFilter(e.target.value);
            this.refreshUI();
          } finally {
            GlobalLoaderService.hide();
          }
        }, 100);
      });
    }

    // 3. Toggle Form Visibility
    const toggleFormBtn = document.getElementById("btn-toggle-plan-form");
    const formContainer = document.getElementById("plan-form-container");
    const formChevron = document.getElementById("form-chevron");
    if (toggleFormBtn && formContainer && formChevron) {
      toggleFormBtn.addEventListener("click", () => {
        const isHidden = formContainer.classList.contains("hidden");
        if (isHidden) {
          formContainer.classList.replace("hidden", "flex");
          formChevron.classList.add("rotate-180");
        } else {
          formContainer.classList.replace("flex", "hidden");
          formChevron.classList.remove("rotate-180");
        }
      });
    }

    // 4. Search Handler
    const searchInput = document.getElementById("search-plans");
    const clearBtn = document.getElementById("clear-search-btn");
    const searchContainer = searchInput?.closest(".group\\/search");

    if (searchInput) {
      searchInput.value = this.getSearchQueryForTab(state.activeTab);

      const evaluateSearchState = () => {
        const hasValue = searchInput.value.trim().length > 0;
        const isHovered = searchContainer?.matches(":hover");

        if (hasValue && isHovered) {
          if (clearBtn) {
            clearBtn.classList.replace("hidden", "flex");
            requestAnimationFrame(() => {
              clearBtn.classList.remove("opacity-0", "scale-75");
              clearBtn.classList.add("opacity-100", "scale-100");
            });
          }
        } else if (clearBtn) {
          clearBtn.classList.remove("opacity-100", "scale-100");
          clearBtn.classList.add("opacity-0", "scale-75");

          setTimeout(() => {
            if (
              !searchInput.value.trim().length ||
              !searchContainer?.matches(":hover")
            ) {
              clearBtn.classList.replace("flex", "hidden");
            }
          }, 200);
        }
      };

      searchInput.addEventListener("input", (e) => {
        GlobalLoaderService.show("Searching plans...");
        setTimeout(() => {
          try {
            StateManager.setSearchQuery(e.target.value);
            this.refreshUI();
            evaluateSearchState();
          } finally {
            GlobalLoaderService.hide();
          }
        }, 100);
      });

      searchContainer?.addEventListener("mouseenter", evaluateSearchState);
      searchContainer?.addEventListener("mouseleave", evaluateSearchState);

      clearBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        GlobalLoaderService.show("Clearing search...");
        setTimeout(() => {
          try {
            searchInput.value = "";
            StateManager.setSearchQuery("");
            setTimeout(() => searchInput.focus(), 100);
            this.refreshUI();
            evaluateSearchState();
          } finally {
            GlobalLoaderService.hide();
          }
        }, 100);
      });
    }

    // 5. Internal Sub-Tabs Handling
    const goalsBtn = document.getElementById("tab-goals");
    const dailyBtn = document.getElementById("tab-daily");
    const templatesBtn = document.getElementById("tab-templates");

    const handleTabClick = (targetTab, loaderText) => {
      if (state.activeTab === targetTab) return;

      GlobalLoaderService.show(loaderText);

      setTimeout(() => {
        try {
          this.handleTabSwitch(targetTab);
        } finally {
          GlobalLoaderService.hide();
        }
      }, 30);
    };

    goalsBtn?.addEventListener("click", () =>
      handleTabClick("goals", "Switching to Goals Planner..."),
    );
    dailyBtn?.addEventListener("click", () =>
      handleTabClick("daily", "Loading Daily Tracker..."),
    );
    templatesBtn?.addEventListener("click", () =>
      handleTabClick("templates", "Loading Routine Templates..."),
    );

    // 6. Navigation Views (Plans / Analytics / Settings)
    const navButtons = ["plans", "analytics", "settings"];
    navButtons.forEach((v) => {
      const desktopBtn = document.getElementById(`nav-${v}`);
      const mobileBtn = document.getElementById(`mobile-${v}`);

      const handleNav = () => {
        if (state.currentView === v) return;

        GlobalLoaderService.show(`Navigating...`);

        setTimeout(() => {
          try {
            StateManager.setView(v);

            navButtons.forEach((nav) => {
              const dEl = document.getElementById(`nav-${nav}`);
              const mEl = document.getElementById(`mobile-${nav}`);
              dEl?.classList.replace("text-brand/80", "text-secondary");
              mEl?.classList.replace("text-brand/80", "text-secondary");
            });

            desktopBtn?.classList.replace("text-secondary", "text-brand/80");
            mobileBtn?.classList.replace("text-secondary", "text-brand/80");

            this.refreshUI();
          } finally {
            GlobalLoaderService.hide();
          }
        }, 30);
      };

      desktopBtn?.addEventListener("click", handleNav);
      mobileBtn?.addEventListener("click", handleNav);
    });

    // 7. Modal Help Handlers
    const helpToggle = document.getElementById("help-toggle");
    const helpModal = document.getElementById("help-modal");
    const closeHelpModal = document.getElementById("close-help-modal");
    const btnCloseHelp = document.getElementById("btn-close-help");
    const helpBackdrop = document.getElementById("help-modal-backdrop");

    const openHelp = (defaultTab = "safeguard") => {
      if (helpModal) helpModal.classList.replace("hidden", "flex");

      const switchHelpTab = (tabName) => {
        const btnSafeguard = document.getElementById("tab-help-safeguard");
        const btnShortcuts = document.getElementById("tab-help-shortcuts");
        const contentSafeguard = document.getElementById(
          "content-help-safeguard",
        );
        const contentShortcuts = document.getElementById(
          "content-help-shortcuts",
        );

        if (!btnSafeguard || !btnShortcuts) return;

        if (tabName === "safeguard") {
          btnSafeguard.className =
            "flex-1 py-2 text-xs font-bold rounded-lg bg-brand text-white transition cursor-pointer";
          btnShortcuts.className =
            "flex-1 py-2 text-xs font-bold rounded-lg text-secondary hover:text-color transition cursor-pointer";
          contentSafeguard?.classList.remove("hidden");
          contentShortcuts?.classList.add("hidden");
        } else if (tabName === "shortcuts") {
          btnShortcuts.className =
            "flex-1 py-2 text-xs font-bold rounded-lg bg-brand text-white transition cursor-pointer";
          btnSafeguard.className =
            "flex-1 py-2 text-xs font-bold rounded-lg text-secondary hover:text-color transition cursor-pointer";
          contentShortcuts?.classList.remove("hidden");
          contentSafeguard?.classList.add("hidden");
        }
      };

      switchHelpTab(defaultTab);

      const btnSafeguard = document.getElementById("tab-help-safeguard");
      const btnShortcuts = document.getElementById("tab-help-shortcuts");

      if (btnSafeguard && !btnSafeguard.dataset.bound) {
        btnSafeguard.addEventListener("click", () =>
          switchHelpTab("safeguard"),
        );
        btnSafeguard.dataset.bound = "true";
      }

      if (btnShortcuts && !btnShortcuts.dataset.bound) {
        btnShortcuts.addEventListener("click", () =>
          switchHelpTab("shortcuts"),
        );
        btnShortcuts.dataset.bound = "true";
      }

      document.body.classList.add("overflow-hidden");
    };

    const closeHelp = () => {
      if (helpModal) helpModal.classList.replace("flex", "hidden");
      document.body.classList.remove("overflow-hidden");
    };

    helpToggle?.addEventListener("click", openHelp);
    closeHelpModal?.addEventListener("click", closeHelp);
    btnCloseHelp?.addEventListener("click", closeHelp);
    helpBackdrop?.addEventListener("click", closeHelp);

    // 8. Scroll To Top Button
    const scrollTopBtn = document.getElementById("scroll-to-top-btn");
    if (scrollTopBtn) {
      let isVisible = false;
      let hideTimeout;

      window.addEventListener("scroll", () => {
        const scrollThreshold = 600;

        if (window.scrollY > scrollThreshold) {
          if (!isVisible) {
            isVisible = true;
            clearTimeout(hideTimeout);
            scrollTopBtn.classList.replace("hidden", "flex");
            requestAnimationFrame(() => {
              scrollTopBtn.classList.remove("opacity-0", "scale-75");
              scrollTopBtn.classList.add("opacity-100", "scale-100");
            });
          }
        } else if (isVisible) {
          isVisible = false;
          requestAnimationFrame(() => {
            scrollTopBtn.classList.remove("opacity-100", "scale-100");
            scrollTopBtn.classList.add("opacity-0", "scale-75");
          });

          hideTimeout = setTimeout(() => {
            if (!isVisible) {
              scrollTopBtn.classList.replace("flex", "hidden");
            }
          }, 200);
        }
      });

      scrollTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    // 9. Theme Listener
    if (window.currentThemeListener) {
      document.removeEventListener("themeChanged", window.currentThemeListener);
    }
    window.currentThemeListener = () => {
      const allPlans = StateManager.getPlans();
      AnalyticsController.dispatchRender(allPlans);
    };
    document.addEventListener("themeChanged", window.currentThemeListener);
  },

  handleTabSwitch(tab) {
    StateManager.setTab(tab);

    const searchInput = document.getElementById("search-plans");
    if (searchInput) {
      searchInput.value = this.getSearchQueryForTab(tab);
    }

    this.initFilterAutocompletes();

    this.updateTabStyles(tab);
    this.switchFormTabVisibility(tab);
    this.refreshUI();
  },

  switchFormTabVisibility(tab) {
    const fields = document.querySelectorAll(".plan-tab-fields");
    fields.forEach((field) => {
      if (field.dataset.tabFields === tab) {
        field.classList.remove("hidden");
        field.classList.add("flex");
      } else {
        field.classList.add("hidden");
        field.classList.remove("flex");
      }
    });

    const formToggleTitle = document.getElementById("form-toggle-title");
    if (formToggleTitle) {
      const titles = {
        goals: "Create New Goal",
        daily: "Create New Daily Log",
        templates: "Create New Template",
      };
      formToggleTitle.textContent = titles[tab] || "Create New Item";
    }

    const titleInput = document.getElementById("create-plan-title");
    const descInput = document.getElementById("create-plan-desc");
    if (titleInput) titleInput.value = "";
    if (descInput) descInput.value = "";
  },

  toggleModal(modalId, show) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    if (show) {
      modal.classList.replace("hidden", "flex");
      document.body.classList.add("overflow-hidden");
    } else {
      modal.classList.replace("flex", "hidden");
      document.body.classList.remove("overflow-hidden");
    }
  },

  setupTabIndicatorObserver() {
    const goalsBtn = document.getElementById("tab-goals");
    const dailyBtn = document.getElementById("tab-daily");
    const templatesBtn = document.getElementById("tab-templates");

    if (!goalsBtn || !dailyBtn || !templatesBtn) return;

    if (!window.planTabResizeObserver) {
      window.planTabResizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(() => {
          this.updateTabStyles(state.activeTab || "goals");
        });
      });
    }

    window.planTabResizeObserver.disconnect();
    window.planTabResizeObserver.observe(goalsBtn);
    window.planTabResizeObserver.observe(dailyBtn);
    window.planTabResizeObserver.observe(templatesBtn);
  },

  updateTabStyles(tab) {
    const indicator = document.getElementById("tab-indicator");
    const goalsBtn = document.getElementById("tab-goals");
    const dailyBtn = document.getElementById("tab-daily");
    const templatesBtn = document.getElementById("tab-templates");

    if (!indicator || !goalsBtn || !dailyBtn || !templatesBtn) return;

    const buttons = [goalsBtn, dailyBtn, templatesBtn];
    const activeIndex =
      {
        goals: 0,
        daily: 1,
        templates: 2,
      }[tab] ?? 0;
    const targetBtn = buttons[activeIndex];

    const buttonWidth =
      targetBtn.offsetWidth || targetBtn.getBoundingClientRect().width;
    if (!buttonWidth) return;

    const isWide = window.matchMedia("(min-width: 375px)").matches;

    if (isWide) {
      let offsetLeft = 4;
      for (let i = 0; i < activeIndex; i++) {
        offsetLeft += buttons[i].offsetWidth;
      }

      indicator.style.width = `${buttonWidth}px`;
      indicator.style.left = `${offsetLeft}px`;
      indicator.style.top = `4px`;
      indicator.style.height = `${targetBtn.offsetHeight}px`;
    } else {
      let offsetTop = 4;
      for (let i = 0; i < activeIndex; i++) {
        offsetTop += buttons[i].offsetHeight;
      }

      indicator.style.height = `${targetBtn.offsetHeight}px`;
      indicator.style.top = `${offsetTop}px`;
      indicator.style.left = `4px`;
      indicator.style.width = `${buttonWidth}px`;
    }

    buttons.forEach((btn, idx) => {
      if (idx === activeIndex) {
        btn.classList.replace("text-secondary", "text-white");
      } else {
        btn.classList.replace("text-white", "text-secondary");
      }
    });
  },
};
