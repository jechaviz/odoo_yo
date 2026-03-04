(function () {
  "use strict";

  var root = document.body;
  if (!root) {
    return;
  }

  root.classList.add("theme-fw-enabled");

  var host = (window.location && window.location.hostname || "").toLowerCase();
  if (host.indexOf("procure1.odoo.com") >= 0) {
    root.classList.add("theme-fw-procurement");
    return;
  }
  if (host.indexOf("test1253.odoo.com") >= 0) {
    root.classList.add("theme-fw-accounting");
  }
})();

