(function () {
  "use strict";

  var body = document.body;
  if (!body) return;
  if (!body.classList.contains("theme-fw-enabled")) return;

  body.classList.add("theme-fw-vendor-hybrid");

  function applyFlags() {
    var panel = document.querySelector("#sidebar_panel, .sidebar_panel");
    if (panel) {
      body.classList.add("theme-fw-has-sidebar-panel");
    } else {
      body.classList.remove("theme-fw-has-sidebar-panel");
    }

    var settingsRoot = document.querySelector(".o_setting_container, .o_base_settings");
    if (settingsRoot) body.classList.add("theme-fw-has-settings-surface");

    var pivotRoot = document.querySelector(".o_pivot_view, .o_graph_view, .o_cohort_view");
    if (pivotRoot) body.classList.add("theme-fw-has-analytics-surface");
  }

  applyFlags();

  var timer = null;
  var observer = new MutationObserver(function () {
    if (timer) return;
    timer = window.setTimeout(function () {
      timer = null;
      applyFlags();
    }, 90);
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
