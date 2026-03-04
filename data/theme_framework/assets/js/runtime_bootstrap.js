(function () {
  "use strict";

  function applyThemeFlags() {
    var root = document.body;
    if (!root) return false;

    root.classList.add("theme-fw-enabled");

    var host = ((window.location && window.location.hostname) || "").toLowerCase();
    if (host.indexOf("procure1.odoo.com") >= 0) {
      root.classList.add("theme-fw-procurement");
      root.classList.remove("theme-fw-accounting");
      return true;
    }
    if (host.indexOf("test1253.odoo.com") >= 0) {
      root.classList.add("theme-fw-accounting");
      root.classList.remove("theme-fw-procurement");
      return true;
    }
    return true;
  }

  if (!applyThemeFlags()) {
    window.addEventListener("DOMContentLoaded", function () {
      applyThemeFlags();
    }, { once: true });
    setTimeout(applyThemeFlags, 120);
    setTimeout(applyThemeFlags, 480);
  }
})();
