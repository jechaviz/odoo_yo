(() => {
  // i18n helper module (SoC): locale resolution + text dictionary mapping.

  function normalizeLocale(rawLocale) {
    return String(rawLocale || "")
      .replace("_", "-")
      .toLowerCase()
      .trim();
  }

  function getByPath(obj, path) {
    if (!obj || !path) return undefined;
    const keys = String(path).split(".");
    let current = obj;
    for (const key of keys) {
      if (current == null || typeof current !== "object" || !(key in current)) return undefined;
      current = current[key];
    }
    return current;
  }

  function createTranslator(catalog, forcedLocale) {
    const safeCatalog = catalog && typeof catalog === "object" ? catalog : {};
    const defaultLocale = normalizeLocale(safeCatalog.default_locale || "en") || "en";
    const locales = safeCatalog.messages && typeof safeCatalog.messages === "object" ? safeCatalog.messages : {};

    const preferredRaw = forcedLocale || document.documentElement?.lang || navigator.language || defaultLocale;
    const preferred = normalizeLocale(preferredRaw);
    const preferredBase = preferred.split("-")[0];

    const current = locales[preferred] || locales[preferredBase] || locales[defaultLocale] || {};
    const fallback = locales[defaultLocale] || {};

    return function t(path, fallbackText = "") {
      const localized = getByPath(current, path);
      if (localized != null) return String(localized);
      const fallbackValue = getByPath(fallback, path);
      if (fallbackValue != null) return String(fallbackValue);
      return String(fallbackText || "");
    };
  }

  function buildUiText(t) {
    return {
      headerTitle: t("header.title", "Unified E-APP_UI Workspace"),
      headerSubtitle: t(
        "header.subtitle",
        "All record-critical actions in one surface: customers, vendors, payments, reports and CFDI flow."
      ),
      sectionrecordList: t("header.section_record_list", "record List"),
      newrecordButton: t("header.new_record", "+ New record"),
      kpiOverdueAmount: t("kpis.overdue_amount", "Overdue Amount"),
      kpiDraftedTotals: t("kpis.drafted_totals", "Drafted Totals"),
      kpiUnpaidTotals: t("kpis.unpaid_totals", "Unpaid Totals"),
      kpiAveragePaidTime: t("kpis.average_paid_time", "Average Paid Time"),
      kpirecordsSuffix: t("kpis.records_suffix", "records"),
      kpiPostedrecordsSuffix: t("kpis.posted_records_suffix", "posted records"),
      kpiDaysSuffix: t("kpis.days_suffix", "days"),
      filterAll: t("filters.all", "All record"),
      filterPaid: t("filters.paid", "Paid"),
      filterOverdue: t("filters.overdue", "Overdue"),
      filterPending: t("filters.pending", "Pending"),
      filterDraft: t("filters.draft", "Draft"),
      searchHint: t("filters.search_hint", "Use native Odoo filters for detailed search"),
      searchPlaceholder: t("filters.search_placeholder", "Look up bill to..."),
      createdDate: t("filters.created_date", "Created Date"),
      dueDate: t("filters.due_date", "Due Date"),
      showLabel: t("filters.show_label", "Show"),
      perPageLabel: t("filters.per_page_label", "per page"),
      tableId: t("table.id", "Id"),
      tableBillFrom: t("table.bill_from", "Bill From"),
      tableBillTo: t("table.bill_to", "Bill To"),
      tableTotalCost: t("table.total_cost", "Total Cost"),
      tableStatus: t("table.status", "Status"),
      tableCreated: t("table.created", "Created"),
      tableDue: t("table.due", "Due"),
      tableAction: t("table.action", "Action"),
      navAppSwitcher: t("navigation.app_switcher", "App Switcher"),
      navSearchTooltip: t("navigation.search_tooltip", "Use Odoo Search"),
      navCollapseRail: t("navigation.collapse_rail", "Collapse Rail"),
      navViewAllApps: t("navigation.view_all_apps", "View All Apps"),
      navApps: {
        APP_UI: t("navigation.apps.APP_UI", "APP_UI"),
        customers: t("navigation.apps.customers", "Customers"),
        vendors: t("navigation.apps.vendors", "Vendors"),
        payments: t("navigation.apps.payments", "Payments"),
        reports: t("navigation.apps.reports", "Reports"),
      },
      checklistTitle: t("checklist.title", "Operational checklist"),
      checklistSearch: t("checklist.search", "Search bar available"),
      checklistNew: t("checklist.new", "New record action available"),
      checklistList: t("checklist.list", "record list visible"),
      checklistStatus: t("checklist.status", "Status badges detected"),
      emptyStateTitle: t("empty_state.title", "No records found for this scope."),
      emptyStateDescription: t(
        "empty_state.description",
        "Use New record or adjust Odoo filters/date range to continue."
      ),
      runtimeFallbackTitle: t("runtime.fallback_title", "Unified E-APP_UI Workspace"),
      runtimeFallbackSubtitle: t(
        "runtime.fallback_subtitle",
        "Vue loader not available. APP_UI shell is in fallback mode."
      ),
      runtimeBadgeFilterTitle: t("runtime.badge_filter_title", "Click to filter by this status"),
      tipKeyboardShortcuts: t("tips.keyboard_shortcuts", "Tip: use Ctrl+Shift+I for new record and / for search."),
      tipFilterAll: t("tips.filter.all", "Tip: review overdue and pending first to protect cash flow."),
      tipFilterPaid: t("tips.filter.paid", "Tip: paid records are useful to validate payment delays and customer behavior."),
      tipFilterOverdue: t("tips.filter.overdue", "Tip: overdue requires immediate follow-up and payment commitment logging."),
      tipFilterPending: t("tips.filter.pending", "Tip: pending records should be checked for due date and payment terms."),
      tipFilterDraft: t("tips.filter.draft", "Tip: draft records need validation before posting and stamping."),
      tipViewForm: t("tips.view_mode.form", "Form mode: validate fiscal fields before posting."),
      tipViewKanban: t("tips.view_mode.kanban", "Kanban mode: triage by stage, then open record for action."),
      tipViewList: t("tips.view_mode.list", "List mode: use status chips + native filters for fast bulk review."),
      tipViewFallback: t(
        "tips.view_mode.fallback",
        "Use the unified rail to keep APP_UI context while navigating related modules."
      ),
    };
  }

  window.APP_UI_I18N_API = Object.freeze({
    createTranslator,
    buildUiText,
  });
})();
