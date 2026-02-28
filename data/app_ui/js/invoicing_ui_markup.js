(() => {
  // Markup atomics: centralized HTML builders to reduce string duplication.
  const DEFAULT_TOOLTIP_CLASS = "app-APP_UI-tooltip";
  const STYLE_TOKENS = new Set(["solid", "regular", "brands", "light", "thin", "duotone"]);

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeIconClasses(icon, style = "solid") {
    const raw = String(icon || "").trim();
    const normalizedStyle = STYLE_TOKENS.has(style) ? `fa-${style}` : String(style || "fa-solid").trim();
    if (!raw) return `${normalizedStyle} fa-circle`;
    if (/\bfa-(solid|regular|brands|light|thin|duotone)\b/.test(raw)) return raw;
    if (raw.includes("fa-")) return `${normalizedStyle} ${raw}`;
    return `${normalizedStyle} fa-${raw}`;
  }

  function iconMarkup({ icon, style = "solid", iconClass = "" } = {}) {
    const classes = [normalizeIconClasses(icon, style), String(iconClass || "").trim()].filter(Boolean).join(" ");
    return `<i class="${escapeHtml(classes)}"></i>`;
  }

  function tooltipMarkup(text, tooltipClass = DEFAULT_TOOLTIP_CLASS) {
    return `<span class="${escapeHtml(tooltipClass)}">${escapeHtml(text)}</span>`;
  }

  function labelMarkup(text, labelClass = "") {
    const cls = String(labelClass || "").trim();
    if (!cls) return `<span>${escapeHtml(text)}</span>`;
    return `<span class="${escapeHtml(cls)}">${escapeHtml(text)}</span>`;
  }

  function iconTooltipMarkup(options = {}) {
    return iconMarkup(options) + tooltipMarkup(options.tooltip || "", options.tooltipClass);
  }

  function iconLabelMarkup(options = {}) {
    return iconMarkup(options) + labelMarkup(options.label || "", options.labelClass);
  }

  function chipMarkup({ label = "", value = "", tone = "default" } = {}) {
    const toneClass = `app-chip--${String(tone || "default").trim().toLowerCase()}`;
    return (
      `<span class="app-chip-label">${escapeHtml(label)}</span>` +
      `<span class="app-chip-value ${escapeHtml(toneClass)}">${escapeHtml(value)}</span>`
    );
  }

  function setInnerHtml(target, html) {
    if (!target) return null;
    target.innerHTML = String(html || "");
    return target;
  }

  window.APP_UI_MARKUP = Object.freeze({
    escapeHtml,
    normalizeIconClasses,
    iconMarkup,
    tooltipMarkup,
    labelMarkup,
    iconTooltipMarkup,
    iconLabelMarkup,
    chipMarkup,
    setInnerHtml,
  });
})();
