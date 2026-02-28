(() => {
  // SoC note: runtime config is expected from data/app_ui/app_ui_config.js.
  const CONFIG = window.app_ui_CONFIG;
  if (!CONFIG) return;

  const DISABLE_KEY = CONFIG.storage.disableKey;
  if (window.localStorage && window.localStorage.getItem(DISABLE_KEY) === "1") return;

  const COMPONENTS_MAP = __APP_UI_COMPONENTS_MAP__;
  const I18N_CATALOG = window.APP_UI_I18N || { default_locale: "en", messages: { en: {} } };
  const VUE_CDN = CONFIG.cdn.vue;
  const SFC_LOADER_CDN = CONFIG.cdn.sfcLoader;
  const SQUERY_CDN = CONFIG.cdn.squery;
  const APPS = Array.isArray(CONFIG.navigation?.railApps) ? CONFIG.navigation.railApps : [];
  const APPS_LANDING_HREF = CONFIG.navigation?.appsLandingHref || "/odoo/apps";

  let lastMetricFetch = 0;
  let metricsState = null;
  let vueMounted = false;
  let cpInstance = null;
  let cachedRows = [];
  let runtimeReadyPromise = null;
  let squeryReadyPromise = null;
  const FILTER_ORDER = Array.isArray(CONFIG.filters?.order)
    ? CONFIG.filters.order
    : ["all", "paid", "overdue", "pending", "draft"];
  const I18N_API = window.APP_UI_I18N_API;
  if (!I18N_API) return;
  const DOM = window.APP_UI_DOM;
  if (!DOM) return;
  const { hasSq, selectOne, selectAll, on, toggleClass, hasClass, create, append, prepend, html } = DOM;
  const COMPONENTS = window.APP_UI_COMPONENTS;
  if (!COMPONENTS) return;
  const { createIconAction, createRailLink, createGridLink } = COMPONENTS;
  const METRICS = window.APP_UI_METRICS;
  if (!METRICS) return;
  const { formatMoney, daysBetween, classifyRows, inferFilterFromStatusText } = METRICS;

  const API = window.APP_UI_API;
  const STATE_MGR = window.APP_UI_STATE;
  if (!API || !STATE_MGR) return;

  function appLabel(app, uiText) {
    if (!app) return "";
    const key = String(app.labelKey || app.key || "");
    return uiText?.navApps?.[key] || app.label || key;
  }

  function isTouchLike() {
    return window.matchMedia(`(max-width: ${CONFIG.breakpoints.touchLikeMaxWidth}px)`).matches;
  }

  function currentTextContext() {
    const crumbs = selectOne(CONFIG.selectors.breadcrumbs);
    return (crumbs && crumbs.textContent ? crumbs.textContent : "") + " " + document.title;
  }

  function currentHref() {
    return window.location.href + " " + window.location.hash;
  }

  function isAppActive(matchList) {
    const haystack = (currentHref() + " " + currentTextContext()).toLowerCase();
    return (matchList || []).some((item) => haystack.includes(String(item || "").toLowerCase()));
  }

  function ensureScript(url, id) {
    if (selectOne(`#${id}`)) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const tag = create("script");
      if (!tag) {
        reject(new Error(`Failed to create script node: ${url}`));
        return;
      }
      tag.id = id;
      tag.src = url;
      tag.async = true;
      tag.onload = () => resolve();
      tag.onerror = () => reject(new Error(`Failed to load script: ${url}`));
      append(document.head, tag);
    });
  }

  function ensureSQueryRuntime() {
    if (hasSq()) return Promise.resolve();
    if (squeryReadyPromise) return squeryReadyPromise;
    squeryReadyPromise = ensureScript(SQUERY_CDN, "app-APP_UI-squery-runtime").catch(() => { });
    return squeryReadyPromise;
  }

  function ensureVueRuntime() {
    if (window.Vue && window["vue3-sfc-loader"]) return Promise.resolve();
    if (runtimeReadyPromise) return runtimeReadyPromise;
    runtimeReadyPromise = (async () => {
      if (!window.Vue) await ensureScript(VUE_CDN, "app-APP_UI-vue-runtime");
      if (!window["vue3-sfc-loader"]) await ensureScript(SFC_LOADER_CDN, "app-APP_UI-sfc-loader");
    })().catch(() => { });
    return runtimeReadyPromise;
  }

  function ensureRail() {
    if (isTouchLike()) return;
    if (selectOne(`#${CONFIG.ui.railId}`)) return;
    const uiText = STATE_MGR.getUiText();

    toggleClass(document.body, "app-neural-active", true);

    const rail = create("aside", { id: CONFIG.ui.railId, className: "app-APP_UI-rail" });
    if (!rail) return;

    const top = create("div", { className: "app-top-actions" });
    const switcherBtn = createIconAction({
      id: CONFIG.ui.switcherButtonId,
      icon: "grip",
      tooltip: uiText.navAppSwitcher,
    });
    on(switcherBtn, "click", () => toggleSwitcher());
    append(top, switcherBtn);

    const searchAnchor = createIconAction({
      tag: "a",
      href: "#",
      icon: "magnifying-glass",
      tooltip: uiText.navSearchTooltip,
    });
    on(searchAnchor, "click", (ev) => {
      ev.preventDefault();
      const input = selectOne(CONFIG.selectors.searchInput);
      if (input) input.focus();
    });
    append(top, searchAnchor);
    append(rail, top);

    APPS.forEach((app) => {
      const link = createRailLink({
        href: app.href,
        dataKey: app.key,
        icon: app.icon,
        tooltip: appLabel(app, uiText),
        active: isAppActive(app.match),
      });
      append(rail, link);
    });

    const bottom = create("div", { className: "app-bottom-actions" });
    const collapseBtn = createIconAction({
      icon: "angles-left",
      tooltip: uiText.navCollapseRail,
    });
    on(collapseBtn, "click", () => {
      toggleClass(document.body, "app-APP_UI-rail-collapsed");
    });
    append(bottom, collapseBtn);
    append(rail, bottom);
    append(document.body, rail);
  }

  function ensureSwitcherPanel() {
    if (selectOne(`#${CONFIG.ui.switcherPanelId}`)) return;
    const uiText = STATE_MGR.getUiText();
    const panel = create("div", { id: CONFIG.ui.switcherPanelId, className: "app-APP_UI-switcher-panel" });
    if (!panel) return;

    const grid = create("div", { className: "app-APP_UI-switcher-grid" });
    APPS.forEach((app) => {
      const link = createGridLink({
        href: app.href,
        icon: app.icon,
        label: appLabel(app, uiText),
      });
      append(grid, link);
    });
    append(panel, grid);

    const all = create("button", {
      type: "button",
      className: "app-APP_UI-view-all",
      textContent: uiText.navViewAllApps,
    });
    on(all, "click", () => {
      window.location.href = APPS_LANDING_HREF;
    });
    append(panel, all);
    append(document.body, panel);

    on(document, "click", (ev) => {
      const btn = selectOne(`#${CONFIG.ui.switcherButtonId}`);
      if (!selectOne(CONFIG.selectors.switcherOpen)) return;
      if (panel.contains(ev.target) || (btn && btn.contains(ev.target))) return;
      toggleClass(panel, "is-open", false);
    });
  }

  function toggleSwitcher() {
    ensureSwitcherPanel();
    const panel = selectOne(`#${CONFIG.ui.switcherPanelId}`);
    if (panel) toggleClass(panel, "is-open");
  }

  function isrecordContext() {
    const haystack = (currentHref() + " " + currentTextContext()).toLowerCase();
    const tokens = Array.isArray(CONFIG.context?.recordTokens) ? CONFIG.context.recordTokens : [];
    return tokens.some((token) => haystack.includes(String(token || "").toLowerCase()));
  }

  function tipForFilter(filterName) {
    const uiText = STATE_MGR.ensureVueState().i18n || STATE_MGR.getUiText();
    const tips = {
      all: uiText.tipFilterAll,
      paid: uiText.tipFilterPaid,
      overdue: uiText.tipFilterOverdue,
      pending: uiText.tipFilterPending,
      draft: uiText.tipFilterDraft,
    };
    return tips[filterName] || tips.all;
  }

  function viewModeTip() {
    const uiText = STATE_MGR.ensureVueState().i18n || STATE_MGR.getUiText();
    if (selectOne(CONFIG.selectors.formView)) return uiText.tipViewForm;
    if (selectOne(CONFIG.selectors.kanbanView)) return uiText.tipViewKanban;
    if (selectOne(CONFIG.selectors.listView)) return uiText.tipViewList;
    return uiText.tipViewFallback;
  }

  function readRowFilterFromDom(row) {
    const statusEl = selectOne(CONFIG.selectors.statusTextNode, row);
    if (!statusEl) return "all";
    return inferFilterFromStatusText(statusEl.textContent || "");
  }

  function classifyBadgeElement(element) {
    const filter = inferFilterFromStatusText(element.textContent || "");
    toggleClass(element, "app-status-interactive", true);
    ["paid", "overdue", "pending", "draft"].forEach(f => toggleClass(element, `app-status-${f}`, f === filter));
    return filter;
  }

  function styleInteractiveBadges() {
    const state = STATE_MGR.ensureVueState();
    selectAll(CONFIG.selectors.statusBadges).forEach((badge) => {
      const filter = classifyBadgeElement(badge);
      if (!badge.dataset[CONFIG.ui.badgeBoundFlag]) {
        badge.dataset[CONFIG.ui.badgeBoundFlag] = "1";
        badge.setAttribute("title", state.i18n.runtimeBadgeFilterTitle);
        on(badge, "click", () => {
          if (FILTER_ORDER.includes(filter) && filter !== "all") {
            state.activeFilter = filter;
            applyMetricsFromRows(cachedRows);
          }
        });
      }
    });
  }

  function applyQuickFilterToVisibleList(filterName) {
    const tableBody = selectOne(CONFIG.selectors.listTableBody) || selectOne(CONFIG.selectors.listTableBodyFallback);
    if (!tableBody) return;

    let visibleCount = 0;
    const rows = selectAll(CONFIG.selectors.listTableRows, tableBody);
    for (const row of rows) {
      if (hasClass(row, "o_group_header") || hasClass(row, "o_list_table_grouped")) {
        toggleClass(row, CONFIG.ui.rowHiddenClass, false);
        continue;
      }
      const rowFilter = readRowFilterFromDom(row);
      const show = filterName === "all" || rowFilter === filterName || (filterName === "pending" && rowFilter === "all");
      toggleClass(row, CONFIG.ui.rowHiddenClass, !show);
      if (show) visibleCount += 1;
    }
    tableBody.dataset.yoVisibleCount = String(visibleCount);
  }

  function applyMetricsFromRows(rows) {
    const state = STATE_MGR.ensureVueState();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const buckets = classifyRows(rows);
    const selected = buckets[state.activeFilter] || buckets.all;

    let overdueAmount = 0, draftAmount = 0, unpaidAmount = 0;
    let overdueCount = 0, draftCount = 0, pendingCount = 0, postedCount = 0;
    let avgPaidDays = 0, avgPaidSamples = 0;

    for (const r of selected) {
      const stateCode = String(r.state || "");
      const residual = Number(r.amount_residual || 0);
      const total = Number(r.amount_total || 0);
      const due = r.record_date_due ? new Date(r.record_date_due) : null;
      if (due) due.setHours(0, 0, 0, 0);

      if (stateCode === "draft") { draftAmount += total; draftCount += 1; }
      if (stateCode === "posted") {
        postedCount += 1;
        unpaidAmount += Math.max(residual, 0);
        if (String(r.payment_state || "") !== "paid") pendingCount += 1;
        if (residual > 0 && due && due < today) { overdueAmount += residual; overdueCount += 1; }
        if (due) { avgPaidDays += Math.max(daysBetween(due, today), 0); avgPaidSamples += 1; }
      }
    }

    state.kpis.overdueAmount = formatMoney(overdueAmount);
    state.kpis.overdueCount = overdueCount;
    state.kpis.draftAmount = formatMoney(draftAmount);
    state.kpis.draftCount = draftCount;
    state.kpis.unpaidAmount = formatMoney(unpaidAmount);
    state.kpis.unpaidCount = pendingCount;
    state.kpis.avgPaidDays = avgPaidSamples ? Math.round(avgPaidDays / avgPaidSamples) : 0;
    state.kpis.postedCount = postedCount;

    state.counts.all = buckets.all.length;
    state.counts.paid = buckets.paid.length;
    state.counts.overdue = buckets.overdue.length;
    state.counts.pending = buckets.pending.length;
    state.counts.draft = buckets.draft.length;
    state.tip = `${tipForFilter(state.activeFilter)} ${viewModeTip()}`;

    applyQuickFilterToVisibleList(state.activeFilter);
    styleInteractiveBadges();
    STATE_MGR.updateChecklistFromDom();
  }

  function setActiveFilter(filterName) {
    const state = STATE_MGR.ensureVueState();
    state.activeFilter = FILTER_ORDER.includes(filterName) ? filterName : "all";
    applyMetricsFromRows(cachedRows);
  }

  function clickNewrecord() {
    const btn = selectOne(CONFIG.selectors.newrecordAction);
    if (btn) btn.click();
  }

  function ensurerecordMountPoint() {
    if (!isrecordContext()) return null;
    const content = selectOne(CONFIG.selectors.contentRoot);
    if (!content) return null;
    let wrapper = selectOne(`#${CONFIG.ui.mountId}`);
    if (!wrapper) {
      wrapper = create("div", { id: CONFIG.ui.mountId });
      prepend(content, wrapper);
    }
    return wrapper;
  }

  function attachGestureHandlers(wrapper) {
    if (!wrapper || wrapper.dataset[CONFIG.ui.gestureBoundFlag] === "1") return;
    wrapper.dataset[CONFIG.ui.gestureBoundFlag] = "1";
    let startX = 0, startY = 0;
    on(wrapper, "touchstart", (ev) => {
      const p = ev.touches && ev.touches[0];
      if (p) { startX = p.clientX; startY = p.clientY; }
    }, { passive: true });

    on(wrapper, "touchend", (ev) => {
      const p = ev.changedTouches && ev.changedTouches[0];
      if (!p) return;
      const dx = p.clientX - startX, dy = p.clientY - startY;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
      const state = STATE_MGR.ensureVueState();
      const idx = FILTER_ORDER.indexOf(state.activeFilter);
      if (dx > 0 && idx > 0) setActiveFilter(FILTER_ORDER[idx - 1]);
      if (dx < 0 && idx < FILTER_ORDER.length - 1) setActiveFilter(FILTER_ORDER[idx + 1]);
    }, { passive: true });
  }

  async function mountrecordHubVue() {
    const wrapper = ensurerecordMountPoint();
    if (!wrapper || vueMounted) return;
    attachGestureHandlers(wrapper);
    await ensureVueRuntime();

    if (!(window.Vue && window["vue3-sfc-loader"])) {
      const uiText = STATE_MGR.getUiText();
      html(wrapper, `<section id="app-APP_UI-record-hub"><div class="app-head"><div><h2>${uiText.runtimeFallbackTitle}</h2><p class="app-sub">${uiText.runtimeFallbackSubtitle}</p></div><button class="app-new-record">${uiText.newrecordButton}</button></div></section>`);
      const fallbackBtn = selectOne(CONFIG.selectors.fallbackNewrecordButton, wrapper);
      if (fallbackBtn) on(fallbackBtn, "click", clickNewrecord);
      vueMounted = true;
      return;
    }

    const { createApp, defineAsyncComponent } = window.Vue;

    const options = {
      moduleCache: { vue: window.Vue },
      getFile(url) {
        const name = url.split('/').pop();
        const source = COMPONENTS_MAP[name] || COMPONENTS_MAP[url] || COMPONENTS_MAP['./' + name];
        if (!source) throw new Error(`SFC file not found: ${url}`);
        return Promise.resolve(source);
      },
      addStyle(textContent) {
        const style = create("style", { textContent });
        prepend(document.head, style);
      },
    };

    const app = createApp({
      components: {
        AppShell: defineAsyncComponent(() => loadModule("AppShell.vue", options)),
        CommandPalette: defineAsyncComponent(() => loadModule("CommandPalette.vue", options))
      },
      setup() {
        const state = STATE_MGR.ensureVueState();
        const cpRef = window.Vue.ref(null);
        window.Vue.onMounted(() => { cpInstance = cpRef.value; });

        return {
          state,
          cpRef,
          apps: APPS,
          onNewrecord: clickNewrecord,
          onSetFilter: setActiveFilter,
        };
      },
      template: `
        <div>
          <AppShell :state="state" :apps="apps" @new-record="onNewrecord" @set-filter="onSetFilter" @open-spotlight="cpRef.open()" />
          <CommandPalette ref="cpRef" :i18n="state.i18n" :apps="apps" @new-record="onNewrecord" />
        </div>
      `,
    });
    app.mount(wrapper);
    vueMounted = true;
  }

  async function refreshrecordKpis() {
    const state = STATE_MGR.ensureVueState();
    const now = Date.now();
    if (now - lastMetricFetch < CONFIG.rpc.minRefreshMs) return;
    lastMetricFetch = now;
    state.loading = true;
    try {
      const rows = await API.fetchrecords();
      cachedRows = rows;
      applyMetricsFromRows(rows);
    } catch (_err) { } finally { state.loading = false; }
  }

  function markActiveIcons() {
    const rail = selectOne(`#${CONFIG.ui.railId}`);
    if (!rail) return;
    selectAll(CONFIG.selectors.railLinks, rail).forEach((a) => {
      const app = APPS.find((x) => x.key === a.getAttribute("data-key"));
      if (app) toggleClass(a, "is-active", isAppActive(app.match));
    });
  }

  function toggleCommandPalette() {
    if (cpInstance && cpInstance.open) {
      cpInstance.open();
    } else {
      console.warn("[NEURAL-INTERFACE] Interface not fully hydrated.");
    }
  }

  function removeRedundantElements() {
    [
      CONFIG.selectors.navbar,
      CONFIG.selectors.rail, // old rail
      ".preview-rail",
      ".preview-header",
      ".preview-nav"
    ].forEach(selector => {
      const el = selectOne(selector);
      if (el) el.remove();
    });
  }

  function bootstrap() {
    removeRedundantElements();
    ensureRail();
    ensureSwitcherPanel();
    markActiveIcons();
    mountrecordHubVue();
    if (isrecordContext()) refreshrecordKpis();
  }

  const observer = new MutationObserver(() => bootstrap());
  observer.observe(document.documentElement, { childList: true, subtree: true });
  on(window, "hashchange", () => setTimeout(bootstrap, 60));
  on(window, "keydown", (ev) => {
    if (ev.key === "/" && !ev.ctrlKey && !ev.metaKey && !["INPUT", "TEXTAREA"].includes(ev.target.tagName)) {
      const input = selectOne(CONFIG.selectors.searchInput);
      if (input) { ev.preventDefault(); input.focus(); }
    }
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "k") {
      ev.preventDefault();
      toggleCommandPalette();
    }
    if (ev.ctrlKey && ev.shiftKey && ev.key.toLowerCase() === "i") { ev.preventDefault(); clickNewrecord(); }
    if (ev.altKey && ["1", "2", "3", "4", "5"].includes(ev.key)) {
      const state = STATE_MGR.ensureVueState();
      state.activeFilter = CONFIG.shortcuts.filterMap[ev.key];
      applyMetricsFromRows(cachedRows);
    }
    if (ev.shiftKey && ev.altKey && ev.key.toLowerCase() === "u") {
      const disabled = window.localStorage.getItem(DISABLE_KEY) === "1";
      window.localStorage.setItem(DISABLE_KEY, disabled ? "0" : "1");
      window.location.reload();
    }
  });

  ensureSQueryRuntime().finally(() => bootstrap());
})();


