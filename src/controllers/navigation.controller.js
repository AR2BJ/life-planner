import { StateManager, state } from "@/models/state.model.js";

import { AnalyticsController } from "./analytics.controller.js";
import { GlobalLoaderService } from "@/services/loader.service.js";
import { PlansController } from "./plans.controller.js";

export class NavigationController {
  static tagKeyBuffer = "";
  static tagKeyTimeoutId = null;
  static TAG_KEY_TIMEOUT = 200;

  static init() {
    this.setupNavigationListeners();
    this.setupKeyboardShortcuts();
    this.setDefaultActive();
  }

  static setupNavigationListeners() {
    const navButtons = ["plans", "analytics", "settings"];

    navButtons.forEach((v) => {
      const desktopBtn = document.getElementById(`nav-${v}`);
      const mobileBtn = document.getElementById(`mobile-${v}`);

      const handleNav = () => {
        if (state.currentView === v) return;

        const viewNames = {
          plans: "Plans Dashboard",
          analytics: "Analytical Metrics",
          settings: "System Settings",
        };

        GlobalLoaderService.show(`Navigating to ${viewNames[v]}...`);

        setTimeout(() => {
          try {
            this.setActiveTab(v);
          } finally {
            GlobalLoaderService.hide();
          }
        }, 30);
      };

      desktopBtn?.addEventListener("click", handleNav);
      mobileBtn?.addEventListener("click", handleNav);
    });
  }

  static setActiveTab(tabType = "plans") {
    StateManager.setView(tabType);
    this.updateNavigationDOM(tabType);
    this.showSection(tabType);

    if (tabType === "plans") {
      PlansController.refreshUI();
      PlansController.updateTabStyles(state.activeTab);
    } else if (tabType === "analytics") {
      AnalyticsController.dispatchRender(StateManager.getPlans());
    }
  }

  static updateNavigationDOM(currentView) {
    const views = ["plans", "analytics", "settings"];

    views.forEach((v) => {
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
        if (key === "a") return dispatchAsyncClick("tab-active");
        if (key === "d") return dispatchAsyncClick("tab-completed");
        if (key === "x") return dispatchAsyncClick("tab-archived");

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

      if (
        ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(event.key)
      ) {
        const currentSection = document.querySelector("section:not(.hidden)");
        if (currentSection?.id === "plans-view") {
          event.preventDefault();
          this.queueTagShortcutKey(event.key);
        }
      }
    });
  }

  static queueTagShortcutKey(digit) {
    if (this.tagKeyTimeoutId) clearTimeout(this.tagKeyTimeoutId);

    if (this.tagKeyBuffer.length >= 2) {
      this.tagKeyBuffer = digit;
    } else {
      this.tagKeyBuffer += digit;
    }

    this.tagKeyTimeoutId = setTimeout(() => {
      this.processTagShortcutKey();
    }, this.TAG_KEY_TIMEOUT);
  }

  static processTagShortcutKey() {
    const index = parseInt(this.tagKeyBuffer, 10);
    this.tagKeyBuffer = "";
    this.tagKeyTimeoutId = null;

    const tagButtons = Array.from(
      document.querySelectorAll("#tag-filters button, .tag-filter-btn"),
    ).filter((btn) => {
      const style = window.getComputedStyle(btn);
      return (
        !btn.disabled &&
        style.display !== "none" &&
        style.visibility !== "hidden"
      );
    });

    const targetButton = tagButtons[index];
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
