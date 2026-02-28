(() => {
  // Component layer for runtime shell (buttons, links, chips).
  const DOM = window.APP_UI_DOM;
  const MARKUP = window.APP_UI_MARKUP;
  if (!DOM || !MARKUP) return;

  const { create, append, on, html, toggleClass } = DOM;
  const { iconTooltipMarkup, iconLabelMarkup, chipMarkup } = MARKUP;

  function createIconAction(options = {}) {
    const tagName = options.tag || "button";
    const element = create(tagName, {
      id: options.id,
      className: options.className,
      type: options.type || (tagName === "button" ? "button" : undefined),
      href: options.href,
      attrs: options.attrs,
      dataset: options.dataset,
    });
    if (!element) return null;

    html(
      element,
      iconTooltipMarkup({
        icon: options.icon,
        style: options.iconStyle || "solid",
        iconClass: options.iconClass,
        tooltip: options.tooltip || "",
        tooltipClass: options.tooltipClass,
      })
    );
    if (typeof options.onClick === "function") on(element, "click", options.onClick);
    return element;
  }

  function createRailLink(options = {}) {
    const element = createIconAction({
      tag: "a",
      href: options.href,
      className: options.className,
      icon: options.icon,
      iconStyle: options.iconStyle || "solid",
      iconClass: options.iconClass,
      tooltip: options.tooltip,
      tooltipClass: options.tooltipClass,
      dataset: { key: options.dataKey },
      attrs: options.attrs,
    });
    if (!element) return null;
    toggleClass(element, "is-active", Boolean(options.active));
    return element;
  }

  function createGridLink(options = {}) {
    const element = create("a", {
      href: options.href,
      className: options.className,
      attrs: options.attrs,
      dataset: options.dataset,
    });
    if (!element) return null;
    html(
      element,
      iconLabelMarkup({
        icon: options.icon,
        style: options.iconStyle || "solid",
        iconClass: options.iconClass,
        label: options.label || "",
        labelClass: options.labelClass,
      })
    );
    return element;
  }

  function createChip(options = {}) {
    const element = create(options.tag || "button", {
      className: options.className,
      type: options.type || "button",
      attrs: options.attrs,
      dataset: options.dataset,
    });
    if (!element) return null;
    html(
      element,
      chipMarkup({
        label: options.label || "",
        value: options.value ?? "",
        tone: options.tone || "default",
      })
    );
    if (typeof options.onClick === "function") on(element, "click", options.onClick);
    return element;
  }

  function appendMany(parent, children) {
    if (!parent || !Array.isArray(children)) return;
    children.filter(Boolean).forEach((child) => append(parent, child));
  }

  window.APP_UI_COMPONENTS = Object.freeze({
    createIconAction,
    createRailLink,
    createGridLink,
    createChip,
    appendMany,
  });
})();
