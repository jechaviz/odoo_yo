(function () {
  "use strict";

  var HOST = ((window.location && window.location.hostname) || "").toLowerCase();
  if (HOST.indexOf("test1253.odoo.com") < 0 && HOST.indexOf("procure1.odoo.com") < 0) return;

  var FLAG = "appPortTopbarBoot";
  if (window[FLAG]) return;
  window[FLAG] = true;

  var body = null;

  function q(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function on(node, eventName, handler, opts) {
    if (!node) return;
    node.addEventListener(eventName, handler, opts || false);
  }

  function addClass(node, className) {
    if (!node || !className) return;
    node.classList.add(className);
  }

  function removeClass(node, className) {
    if (!node || !className) return;
    node.classList.remove(className);
  }

  function ensureFaCss() {
    if (q("#theme-fw-fa-css")) return;
    var link = document.createElement("link");
    link.id = "theme-fw-fa-css";
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css";
    document.head.appendChild(link);
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function labelFromNode(node) {
    if (!node) return "";
    var attrs = [
      node.getAttribute("title"),
      node.getAttribute("aria-label"),
      node.getAttribute("data-tooltip"),
      node.getAttribute("data-hotkey"),
      node.textContent,
    ];
    return normalize(attrs.filter(Boolean).join(" "));
  }

  function getIconClass(toggle, text) {
    if (!toggle) return "";
    var t = normalize(text || "");
    var cls = toggle.className || "";
    if (toggle.closest(".o_user_menu")) return "";
    if (toggle.closest(".o_switch_company_menu") || t.indexOf("company") >= 0 || t.indexOf("compa") >= 0) {
      return "fa-building";
    }
    if (cls.indexOf("o-mail") >= 0 || t.indexOf("message") >= 0 || t.indexOf("discuss") >= 0 || t.indexOf("chat") >= 0 || t.indexOf("convers") >= 0) {
      return "fa-comment-dots";
    }
    if (cls.indexOf("o_Activity") >= 0 || t.indexOf("activity") >= 0 || t.indexOf("activ") >= 0 || t.indexOf("to do") >= 0) {
      return "fa-bolt";
    }
    if (cls.indexOf("notification") >= 0 || t.indexOf("notification") >= 0 || t.indexOf("notific") >= 0) {
      return "fa-bell";
    }
    if (t.indexOf("ai") >= 0 || t.indexOf("assistant") >= 0 || t.indexOf("copilot") >= 0) {
      return "fa-sparkles";
    }
    if (t.indexOf("debug") >= 0 || t.indexOf("developer") >= 0) {
      return "fa-wrench";
    }
    if (cls.indexOf("fa-") >= 0) return "";
    return "fa-circle";
  }

  function decorateTopbarIcons(navbar) {
    var systray = q(".o_menu_systray", navbar);
    if (!systray) return;
    addClass(systray, "app-port-systray");

    var toggles = qa(".dropdown-toggle, .o_nav_entry, button, a", systray);
    toggles.forEach(function (toggle) {
      if (!toggle || toggle.closest(".o_user_menu")) return;
      var iconClass = getIconClass(toggle, labelFromNode(toggle));
      if (!iconClass) return;

      qa("i, img, svg", toggle).forEach(function (node) {
        if (!node.classList.contains("app-port-fa-icon")) addClass(node, "app-port-native-icon");
      });

      var fa = q(".app-port-fa-icon", toggle);
      if (!fa) {
        fa = document.createElement("i");
        toggle.appendChild(fa);
      }
      fa.className = "app-port-fa-icon fa-solid " + iconClass;
      fa.setAttribute("aria-hidden", "true");
    });
  }

  function extractUserMeta(userToggle) {
    var avatar = q("img.o_avatar, .o_avatar img, img", userToggle);
    var nameNode = q(".oe_topbar_name, .o_user_menu_name", userToggle);
    var name = normalize(nameNode && nameNode.textContent ? nameNode.textContent : "");
    if (!name) {
      var fallback = normalize(userToggle.textContent || "");
      if (fallback && fallback.length < 64) name = fallback;
    }
    var companyNode = q(".o_switch_company_menu .oe_topbar_name") || q(".o_company_name") || q(".o_user_company_name");
    var subtitle = normalize(companyNode && companyNode.textContent ? companyNode.textContent : "");
    return {
      displayName: (name || "User").replace(/(^|\s)\S/g, function (m) { return m.toUpperCase(); }),
      subtitle: subtitle ? subtitle.replace(/(^|\s)\S/g, function (m) { return m.toUpperCase(); }) : "Session",
      avatar: avatar && avatar.getAttribute("src") ? avatar.getAttribute("src") : "",
    };
  }

  function likelyUserMenu(menu) {
    if (!menu) return false;
    var text = normalize(menu.textContent || "");
    return (
      text.indexOf("preferences") >= 0 ||
      text.indexOf("my profile") >= 0 ||
      text.indexOf("cerrar") >= 0 ||
      text.indexOf("log out") >= 0 ||
      text.indexOf("sign out") >= 0 ||
      text.indexOf("mis preferencias") >= 0
    );
  }

  function iconForUserItem(text) {
    var t = normalize(text);
    if (t.indexOf("status") >= 0 || t.indexOf("estado") >= 0) return "fa-circle-dot";
    if (t.indexOf("profile") >= 0 || t.indexOf("perfil") >= 0) return "fa-id-card";
    if (t.indexOf("preferences") >= 0 || t.indexOf("preferencias") >= 0) return "fa-sliders";
    if (t.indexOf("my databases") >= 0 || t.indexOf("bases") >= 0) return "fa-database";
    if (t.indexOf("documentation") >= 0 || t.indexOf("document") >= 0) return "fa-book";
    if (t.indexOf("support") >= 0 || t.indexOf("ayuda") >= 0) return "fa-life-ring";
    if (t.indexOf("keyboard") >= 0 || t.indexOf("atajos") >= 0) return "fa-keyboard";
    if (t.indexOf("log out") >= 0 || t.indexOf("cerrar") >= 0 || t.indexOf("sign out") >= 0) return "fa-right-from-bracket";
    return "fa-circle";
  }

  function decorateUserItem(item) {
    if (!item) return;
    addClass(item, "app-port-user-item");
    var iconClass = iconForUserItem(item.textContent || "");
    var icon = q(".app-port-user-item__icon", item);
    if (!icon) {
      icon = document.createElement("i");
      item.insertBefore(icon, item.firstChild);
    }
    icon.className = "app-port-user-item__icon fa-solid " + iconClass;
    icon.setAttribute("aria-hidden", "true");
  }

  function ensureUserHeader(menu, meta) {
    addClass(menu, "app-port-user-dropdown");
    var header = q(".app-port-user-header", menu);
    if (!header) {
      header = document.createElement("div");
      header.className = "app-port-user-header";

      var avatarWrap = document.createElement("div");
      avatarWrap.className = "app-port-user-header__avatar";
      var avatarImg = document.createElement("img");
      avatarImg.className = "app-port-user-header__avatar-img";
      avatarImg.alt = "User avatar";
      avatarWrap.appendChild(avatarImg);

      var copy = document.createElement("div");
      copy.className = "app-port-user-header__copy";
      var nameNode = document.createElement("div");
      nameNode.className = "app-port-user-header__name";
      var subtitleNode = document.createElement("div");
      subtitleNode.className = "app-port-user-header__subtitle";
      copy.appendChild(nameNode);
      copy.appendChild(subtitleNode);

      header.appendChild(avatarWrap);
      header.appendChild(copy);
      menu.insertBefore(header, menu.firstChild);
    }

    var avatarImgNode = q(".app-port-user-header__avatar-img", header);
    var nameNodeRef = q(".app-port-user-header__name", header);
    var subtitleNodeRef = q(".app-port-user-header__subtitle", header);

    if (avatarImgNode) {
      if (meta.avatar) {
        avatarImgNode.src = meta.avatar;
        avatarImgNode.style.display = "";
      } else {
        avatarImgNode.style.display = "none";
      }
    }
    if (nameNodeRef) nameNodeRef.textContent = meta.displayName || "User";
    if (subtitleNodeRef) subtitleNodeRef.textContent = meta.subtitle || "Session";

    qa(".dropdown-item, .o-dropdown-item, [role='menuitem']", menu).forEach(decorateUserItem);
  }

  function decorateUserMenu(userToggle) {
    if (!userToggle) return;
    var meta = extractUserMeta(userToggle);
    var menus = qa(".o-dropdown--menu.dropdown-menu, .o_user_menu .dropdown-menu, .dropdown-menu");
    var decorated = false;
    menus.forEach(function (menu) {
      var rect = menu.getBoundingClientRect();
      if (rect.width < 40 || rect.height < 40) return;
      if (!likelyUserMenu(menu)) return;
      ensureUserHeader(menu, meta);
      decorated = true;
    });
    if (decorated) removeClass(body, "app-port-user-menu-opening");
  }

  function bindUserMenu(navbar) {
    var userToggle = q(".o_menu_systray .o_user_menu", navbar);
    if (!userToggle || userToggle.dataset.appPortBound === "1") return;
    userToggle.dataset.appPortBound = "1";

    on(userToggle, "pointerdown", function () {
      addClass(body, "app-port-user-menu-opening");
    }, true);

    on(userToggle, "click", function () {
      window.requestAnimationFrame(function () {
        decorateUserMenu(userToggle);
        setTimeout(function () { decorateUserMenu(userToggle); }, 60);
      });
    }, true);

    on(document, "click", function () {
      setTimeout(function () {
        removeClass(body, "app-port-user-menu-opening");
      }, 140);
    }, true);
  }

  function applyHeaderGroupClass() {
    addClass(body, "app-port-header-group-active");
    var panel = q(".o_control_panel") || q(".o-control-panel");
    if (panel) addClass(panel, "app-port-control-panel");
  }

  function apply() {
    body = document.body || body;
    if (!body) return false;

    var navbar = q(".o_main_navbar") || q("nav.o_navbar");
    if (!navbar) return false;

    addClass(body, "theme-fw-enabled");
    addClass(body, "app-port-topbar-active");
    addClass(body, "app-port-usermenu-active");
    addClass(navbar, "app-port-topbar");

    decorateTopbarIcons(navbar);
    bindUserMenu(navbar);
    applyHeaderGroupClass();
    return true;
  }

  function boot() {
    ensureFaCss();
    if (!apply()) {
      window.requestAnimationFrame(boot);
      return;
    }
  }

  boot();

  var throttle = null;
  var observer = new MutationObserver(function () {
    if (throttle) return;
    throttle = window.setTimeout(function () {
      throttle = null;
      apply();
    }, 80);
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  on(window, "hashchange", function () {
    setTimeout(apply, 120);
  });
})();
