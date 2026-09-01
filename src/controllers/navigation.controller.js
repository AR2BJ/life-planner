import { StateManager, state } from "@/models/state.model.js";

import { AnalyticsController } from "./analytics.controller.js";
import { GlobalLoaderService } from "@/services/loader.service.js";
import { PlansController } from "./plans.controller.js";

export class NavigationController {
  static categoryKeyBuffer = "";
  static categoryKeyTimeoutId = null;
  static CATEGORY_KEY_TIMEOUT = 200;

  static init() {
    this.setupNavigationListeners();
    this.setupKeyboardShortcuts();
    this.setDefaultActive();
  }

  static setupNavigationListeners() {
    document.getElementById("nav-plans")?.addEventListener("click", () => {
      this.setActiveTab("plans");
    });
    document.getElementById("nav-analytics")?.addEventListener("click", () => {
      this.setActiveTab("analytics");
    });
    document.getElementById("nav-settings")?.addEventListener("click", () => {
      this.setActiveTab("settings");
    });

    document.getElementById("mobile-plans")?.addEventListener("click", () => {
      this.setActiveTab("plans");
    });
    document
      .getElementById("mobile-analytics")
      ?.addEventListener("click", () => {
        this.setActiveTab("analytics");
      });
    document
      .getElementById("mobile-settings")
      ?.addEventListener("click", () => {
        this.setActiveTab("settings");
      });
  }

  static setActiveTab(tabType = "plans") {
    StateManager.setView(tabType);
    this.updateNavigationDOM();
    this.showSection(tabType);

    if (tabType === "plans") {
      PlansController.refreshUI();
      PlansController.updateTabStyles(state.activeTab);
    } else if (tabType === "analytics") {
      AnalyticsController.dispatchRender(StateManager.getPlans());
    }
  }

  static updateNavigationDOM() {
    const views = ["plans", "analytics", "settings"];
    const currentView = state.currentView;

    views.forEach((v) => {
      const el = document.getElementById(`${v}-view`);
      if (el) {
        if (currentView === v) el.classList.replace("hidden", "flex");
        else el.classList.replace("flex", "hidden");
      }

      const desktopBtn = document.getElementById(`nav-${v}`);
      const mobileBtn = document.getElementById(`mobile-${v}`);

      if (currentView === v) {
        desktopBtn?.classList.replace("text-secondary", "text-brand/80");
        desktopBtn?.classList.add("shadow-brand/10", "active");
        mobileBtn?.classList.replace("text-secondary", "text-brand/80");
        mobileBtn?.classList.add("active");
      } else {
        desktopBtn?.classList.replace("text-brand/80", "text-secondary");
        desktopBtn?.classList.remove("shadow-brand/10", "active");
        mobileBtn?.classList.replace("text-brand/80", "text-secondary");
        mobileBtn?.classList.remove("active");
      }
    });
  }

  static showSection(sectionType) {
    document.querySelectorAll('section[id$="-view"]').forEach((section) => {
      section.classList.add("hidden");
      section.classList.remove("flex");
    });

    const activeSection = document.getElementById(`${sectionType}-view`);
    if (activeSection) {
      activeSection.classList.remove("hidden");
      activeSection.classList.add("flex");
    }
  }

  static setupKeyboardShortcuts() {
    window.addEventListener("keydown", (event) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.isContentEditable)
      ) {
        if (event.key === "Escape") {
          activeEl.blur();
          this.closeAllActiveModals();
        }
        return;
      }

      const key = event.key.toLowerCase();

      if (event.key === "Escape") {
        event.preventDefault();
        this.closeAllActiveModals();
        return;
      }

      const dispatchAsyncClick = (elementId) => {
        event.preventDefault();
        setTimeout(() => {
          document.getElementById(elementId)?.click();
        }, 10);
      };

      if (event.altKey) {
        if (key === "b") return dispatchAsyncClick("scroll-to-top-btn");
        if (key === "c") return dispatchAsyncClick("btn-toggle-plan-form");
        if (key === "t") return dispatchAsyncClick("theme-toggle");
        if (key === "n") return dispatchAsyncClick("menu-toggle");
        if (key === "g") return dispatchAsyncClick("tab-goals");
        if (key === "d") return dispatchAsyncClick("tab-daily");
        if (key === "x") return dispatchAsyncClick("tab-templates");

        if (key === "r") {
          event.preventDefault();
          GlobalLoaderService.show("Redirecting to purge terminal...");
          setTimeout(() => {
            try {
              this.setActiveTab("settings");
              const resetBtn =
                document.getElementById("trigger-reset-btn") ||
                document.querySelector('[id*="reset"]');
              setTimeout(() => resetBtn?.click(), 10);
            } finally {
              GlobalLoaderService.hide();
            }
          }, 50);
          return;
        }

        if (["1", "2", "3"].includes(event.key)) {
          const currentSection = document.querySelector("section:not(.hidden)");
          if (currentSection?.id === "analytics-view") {
            const chartViewButtons = Array.from(
              document.querySelectorAll(
                "#heatmap-mobile-menu button, #chart-view-switcher button, button[data-view]",
              ),
            ).filter(
              (btn) =>
                !btn.disabled &&
                window.getComputedStyle(btn).display !== "none",
            );

            const targetButton = chartViewButtons[parseInt(event.key, 10) - 1];
            if (targetButton) {
              event.preventDefault();
              setTimeout(() => targetButton.click(), 10);
            }
          }
        }
      }

      if (event.shiftKey && ["p", "a", "s"].includes(key)) {
        event.preventDefault();
        const targetTab =
          key === "p" ? "plans" : key === "a" ? "analytics" : "settings";
        this.setActiveTab(targetTab);
        return;
      }

      if (key === "/") {
        const searchInput =
          document.getElementById("search-plans") ||
          document.querySelector('input[type="search"]');
        if (searchInput) {
          event.preventDefault();
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      if (event.key === "?") return dispatchAsyncClick("help-toggle");

      if (["0", "1", "2", "3", "4", "5", "6", "7"].includes(event.key)) {
        const currentSection = document.querySelector("section:not(.hidden)");
        if (currentSection?.id === "plans-view") {
          event.preventDefault();
          this.queueCategoryShortcutKey(event.key);
        }
      }
    });
  }

  static queueCategoryShortcutKey(digit) {
    if (this.categoryKeyTimeoutId) clearTimeout(this.categoryKeyTimeoutId);

    if (this.categoryKeyBuffer.length >= 2) {
      this.categoryKeyBuffer = digit;
    } else {
      this.categoryKeyBuffer += digit;
    }

    this.categoryKeyTimeoutId = setTimeout(() => {
      this.processCategoryShortcutKey();
    }, this.CATEGORY_KEY_TIMEOUT);
  }

  static processCategoryShortcutKey() {
    const index = parseInt(this.categoryKeyBuffer, 10);
    this.categoryKeyBuffer = "";
    this.categoryKeyTimeoutId = null;

    const categoryContainer = document.getElementById("category-filter-scroll");
    const categoryButtons = Array.from(
      categoryContainer
        ? categoryContainer.querySelectorAll("button, .tag-filter-btn")
        : document.querySelectorAll(
            "#category-filter-scroll button, .tag-filter-btn",
          ),
    ).filter((btn) => {
      const style = window.getComputedStyle(btn);
      return (
        !btn.disabled &&
        style.display !== "none" &&
        style.visibility !== "hidden"
      );
    });

    const targetButton = categoryButtons[index];
    if (targetButton) setTimeout(() => targetButton.click(), 10);
  }

  static closeAllActiveModals() {
    const modalIds = [
      "help-modal",
      "plan-modal",
      "delete-modal",
      "reset-modal",
      "edit-modal",
    ];
    modalIds.forEach((id) => {
      const modal = document.getElementById(id);
      if (modal && !modal.classList.contains("hidden")) {
        modal.querySelector('[id*="close"], [id*="btn-close"]')?.click() ||
          modal.classList.add("hidden");
      }
    });
  }

  static setDefaultActive() {
    this.setActiveTab("plans");
  }
}
