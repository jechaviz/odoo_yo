(() => {
    // Reactive state management for APP_UI UI.
    const CONFIG = window.app_ui_CONFIG;
    const I18N_API = window.APP_UI_I18N_API;
    const I18N_CATALOG = window.APP_UI_I18N;
    const DOM = window.APP_UI_DOM;

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
        return {
            loading: false,
            activeFilter: "all",
            tip: uiText.tipKeyboardShortcuts || "",
            checklistOpen: false,
            checklistCompleted: 0,
            checklist: buildChecklist(uiText),
            i18n: uiText,
            kpis: {
                overdueAmount: "$0.00",
                overdueCount: 0,
                draftAmount: "$0.00",
                draftCount: 0,
                unpaidAmount: "$0.00",
                unpaidCount: 0,
                avgPaidDays: 0,
                postedCount: 0,
            },
            counts: { all: 0, paid: 0, overdue: 0, pending: 0, draft: 0 },
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

    window.APP_UI_STATE = Object.freeze({
        ensureVueState,
        updateChecklistFromDom,
        getUiText,
    });
})();
