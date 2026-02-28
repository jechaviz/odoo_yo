(() => {
  // DOM adapter module: provides sq/native compatible primitives.

  function hasSq() {
    return typeof window.sq === "function";
  }

  function selectOne(selector, root = document) {
    if (!selector) return null;
    if (hasSq()) {
      const result = root === document ? window.sq(selector).get(0) : window.sq(root).find(selector).get(0);
      return result || null;
    }
    return root.querySelector(selector);
  }

  function selectAll(selector, root = document) {
    if (!selector) return [];
    if (hasSq()) {
      const result = root === document ? window.sq(selector).get() : window.sq(root).find(selector).get();
      return Array.isArray(result) ? result : result ? Array.from(result) : [];
    }
    return Array.from(root.querySelectorAll(selector));
  }

  function on(target, eventName, handler, options) {
    if (!target) return;
    if (hasSq() && !options) {
      window.sq(target).on(eventName, handler);
      return;
    }
    target.addEventListener(eventName, handler, options);
  }

  function toggleClass(target, className, force) {
    if (!target || !className) return;
    if (hasSq()) {
      if (typeof force === "boolean") {
        if (force) window.sq(target).addClass(className);
        else window.sq(target).removeClass(className);
      } else {
        window.sq(target).toggleClass(className);
      }
      return;
    }
    if (typeof force === "boolean") {
      target.classList.toggle(className, force);
    } else {
      target.classList.toggle(className);
    }
  }

  function hasClass(target, className) {
    if (!target || !className) return false;
    if (hasSq()) return Boolean(window.sq(target).hasClass(className));
    return target.classList.contains(className);
  }

  function create(tagName, options = {}) {
    if (!tagName) return null;
    const safeTag = String(tagName).trim().toLowerCase();
    if (!safeTag) return null;

    let element = null;
    if (hasSq()) {
      try {
        element = window.sq(`<${safeTag}>`).get(0) || null;
      } catch (_err) {
        // Fallback to native creation.
      }
    }
    if (!element) {
      element = document.createElement(safeTag);
    }

    if (options.id) element.id = String(options.id);
    if (options.className) element.className = String(options.className);
    if (options.type && "type" in element) element.type = String(options.type);
    if (options.href && "href" in element) element.href = String(options.href);
    if (options.textContent !== undefined) element.textContent = String(options.textContent);

    const attrs = options.attrs || {};
    Object.entries(attrs).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      element.setAttribute(String(key), String(value));
    });

    const dataset = options.dataset || {};
    Object.entries(dataset).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      element.dataset[String(key)] = String(value);
    });

    return element;
  }

  function append(parent, child) {
    if (!parent || !child) return;
    if (hasSq()) {
      window.sq(parent).append(child);
      return;
    }
    parent.appendChild(child);
  }

  function prepend(parent, child) {
    if (!parent || !child) return;
    if (hasSq()) {
      window.sq(parent).prepend(child);
      return;
    }
    parent.insertBefore(child, parent.firstChild || null);
  }

  function html(target, content) {
    if (!target) return;
    if (hasSq()) {
      window.sq(target).html(String(content || ""));
      return;
    }
    target.innerHTML = String(content || "");
  }

  window.APP_UI_DOM = Object.freeze({
    hasSq,
    selectOne,
    selectAll,
    on,
    toggleClass,
    hasClass,
    create,
    append,
    prepend,
    html,
  });
})();
