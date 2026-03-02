(() => {
  const ROOT = window.odooApp || (window.odooApp = {});
    // Reactive state management for the app shell.
    const CONFIG = ROOT.config;
    const I18N_API = ROOT.i18n;
    const I18N_CATALOG = ROOT.i18nCatalog;
    const DOM = ROOT.dom;
    const DEMO = ROOT.demo;

    let metricsState = null;

    function getUiText() {
        if (!I18N_API || !I18N_CATALOG) return {};
        const translate = I18N_API.createTranslator(I18N_CATALOG);
        return I18N_API.buildUiText(translate);
    }

    function buildChecklist(uiText) {
        return [
            { id: "search", label: uiText.checklistSearch, ok: false },
            { id: "new", label: uiText.checklistNew, ok: false },
            { id: "list", label: uiText.checklistList, ok: false },
            { id: "status", label: uiText.checklistStatus, ok: false },
        ];
    }

    function buildStateSeed() {
        const uiText = getUiText();
        const activeSurface = "records";
        const surfaceProfile = DEMO && typeof DEMO.buildSurfaceProfile === "function"
            ? DEMO.buildSurfaceProfile(activeSurface, uiText)
            : {};
        const demoRows = DEMO
            ? (typeof DEMO.getTableRowsBySurface === "function"
                ? DEMO.getTableRowsBySurface(activeSurface, "all", "", uiText)
                : DEMO.getTableRows("all", "", uiText))
            : [];
        const demoKpis = DEMO ? DEMO.buildKpis(uiText) : null;
        const demoNotifications = DEMO && typeof DEMO.buildShellNotifications === "function" ? DEMO.buildShellNotifications(uiText) : [];
        const demoProfile = DEMO && typeof DEMO.buildShellProfile === "function" ? DEMO.buildShellProfile(uiText) : {};
        const demoWorkspaceCards = DEMO && typeof DEMO.buildWorkspaceCards === "function" ? DEMO.buildWorkspaceCards(uiText) : { primary: [], secondary: [] };
        const demoBrand = surfaceProfile.brand
            || (DEMO && typeof DEMO.buildShellBrand === "function" ? DEMO.buildShellBrand(uiText) : {});
        const demoBreadcrumbs = surfaceProfile.breadcrumbs?.length
            ? surfaceProfile.breadcrumbs
            : (DEMO && typeof DEMO.buildShellBreadcrumbs === "function" ? DEMO.buildShellBreadcrumbs(uiText) : []);
        const demoUtilityActions = DEMO && typeof DEMO.buildShellUtilityActions === "function" ? DEMO.buildShellUtilityActions(uiText) : [];
        const demoShellModes = DEMO && typeof DEMO.buildShellModes === "function" ? DEMO.buildShellModes(uiText) : [];
        const demoShellInsights = DEMO && typeof DEMO.buildShellInsights === "function" ? DEMO.buildShellInsights(uiText) : [];
        const demoShellActivity = DEMO && typeof DEMO.buildShellActivity === "function" ? DEMO.buildShellActivity(uiText) : [];
        const demoQuickCreateActions = DEMO && typeof DEMO.buildQuickCreateActions === "function" ? DEMO.buildQuickCreateActions(uiText) : [];
        const demoDashboardSections = DEMO && typeof DEMO.buildDashboardSections === "function" ? DEMO.buildDashboardSections(uiText, demoRows) : [];
        const seedRecord = demoRows[0] || null;
        const seedOperations = DEMO && typeof DEMO.buildOperationsSurfaceData === "function" && seedRecord
            ? DEMO.buildOperationsSurfaceData(seedRecord, uiText)
            : {};
        return {
            loading: false,
            activeFilter: "all",
            tip: uiText.tipKeyboardShortcuts || "",
            checklistOpen: false,
            checklistCompleted: 0,
            checklist: buildChecklist(uiText),
            i18n: uiText,
            kpis: {
                overdueAmount: demoKpis?.overdueAmount || "$0.00",
                overdueCount: demoKpis?.overdueCount || 0,
                draftAmount: demoKpis?.draftAmount || "$0.00",
                draftCount: demoKpis?.draftCount || 0,
                unpaidAmount: demoKpis?.unpaidAmount || "$0.00",
                unpaidCount: demoKpis?.unpaidCount || 0,
                avgPaidDays: demoKpis?.avgPaidDays || 0,
                postedCount: demoKpis?.postedCount || 0,
                cards: demoKpis?.cards || [],
            },
            counts: {
                all: demoRows.length,
                paid: demoRows.filter((row) => row.type === "paid").length,
                overdue: demoRows.filter((row) => row.type === "overdue").length,
                pending: demoRows.filter((row) => row.type === "pending").length,
                draft: demoRows.filter((row) => row.type === "draft").length,
            },
            tableRows: demoRows,
            tableQuery: "",
            tablePage: 1,
            tablePageSize: 10,
            notifications: demoNotifications,
            profile: demoProfile,
            workspaceCards: demoWorkspaceCards,
            shellBrand: demoBrand,
            activeSurface,
            surfaceProfile,
            breadcrumbs: demoBreadcrumbs,
            utilityActions: demoUtilityActions,
            shellModes: demoShellModes,
            shellInsights: demoShellInsights,
            activityFeed: demoShellActivity,
            quickCreateActions: demoQuickCreateActions,
            dashboardSections: demoDashboardSections,
            focusRecordId: demoRows[0]?.id || null,
            shellMode: demoShellModes[0]?.value || "overview",
            themeMode: "night",
            primaryActionLabel: uiText.headerCreateNew || "Create New",
            operationsByRecord: seedRecord ? { [seedRecord.id]: seedOperations } : {},
            operationsTab: seedOperations?.activeTab || "form",
        };
    }

    function ensureVueState() {
        if (metricsState) return metricsState;
        const seed = buildStateSeed();
        if (!window.Vue || !window.Vue.reactive) {
            metricsState = seed;
            return metricsState;
        }
        metricsState = window.Vue.reactive(seed);
        return metricsState;
    }

    function updateChecklistFromDom() {
        if (!DOM || !CONFIG) return;
        const { selectOne } = DOM;
        const state = ensureVueState();
        const checks = {
            search: Boolean(selectOne(CONFIG.selectors.searchInput)),
            new: Boolean(selectOne(CONFIG.selectors.newrecordAction)),
            list: Boolean(selectOne(CONFIG.selectors.listTable)),
            status: Boolean(selectOne(CONFIG.selectors.statusBadges)),
        };
        state.checklist = state.checklist.map((item) => ({ ...item, ok: Boolean(checks[item.id]) }));
        state.checklistCompleted = state.checklist.filter((item) => item.ok).length;
        state.checklistOpen = state.checklistCompleted < state.checklist.length;
    }

    ROOT.state = Object.freeze({
        ensureVueState,
        updateChecklistFromDom,
        getUiText,
    });
})();
