(() => {
  // Centralized runtime config (SoC): selectors, IDs, shortcuts, URLs.
  const config = {
    storage: {
      disableKey: "appUiDisabled",
    },
    breakpoints: {
      touchLikeMaxWidth: 1200,
    },
    cdn: {
      vue: "https://unpkg.com/vue@3/dist/vue.global.prod.js",
      sfcLoader: "https://unpkg.com/vue3-sfc-loader/dist/vue3-sfc-loader.js",
      squery: "https://cdn.jsdelivr.net/gh/exis9/squery@latest/squery.min.js",
    },
    ui: {
      railId: "app-rail",
      switcherButtonId: "app-switcher-btn",
      switcherPanelId: "app-switcher-panel",
      mountId: "app-record-root",
      rowHiddenClass: "app-row-hidden",
      badgeBoundFlag: "appBound",
      gestureBoundFlag: "appGestureBound",
    },
    selectors: {
      breadcrumbs: ".o_control_panel_breadcrumbs",
      searchInput: ".o_searchview_input, input.o_searchview_input",
      formView: ".o_form_view",
      kanbanView: ".o_kanban_view",
      listView: ".o_list_view",
      listTableBody: ".o_list_view table.o_list_table tbody",
      listTableBodyFallback: ".o_list_view table tbody",
      listTableRows: "tr",
      listTable: ".o_list_view table.o_list_table, .o_list_view table",
      statusBadges: ".o_list_view .badge, .o_form_view .badge, .o_list_view .o_status, .o_form_view .o_status",
      newrecordAction: ".o_list_button_add, .o-kanban-button-new, button.o_form_button_create",
      contentRoot: ".o_content",
      railLinks: "a[data-key]",
      switcherOpen: "#app-switcher-panel.is-open",
      fallbackNewrecordButton: ".app-new-record",
      statusTextNode: ".badge, .o_status, .o_field_badge, .text-bg-success, .text-bg-warning, .text-bg-danger",
    },
    rpc: {
      recordSearchReadUrl: "/web/dataset/call_kw/account.move/search_read",
      minRefreshMs: 15000,
      recordLimit: 400,
    },
    context: {
      recordTokens: [
        "account.move",
        "action_move_out_record_type",
        "record",
        "factura",
      ],
    },
    filters: {
      order: ["all", "paid", "overdue", "pending", "draft"],
    },
    navigation: {
      appsLandingHref: "/odoo/apps",
      railApps: [
        {
          key: "conversations",
          labelKey: "conversations",
          icon: "fa-comments",
          color: "#ff8400",
          href: "/odoo/action-mail.action_discuss",
          match: ["mail.discuss"],
        },
        {
          key: "dashboards",
          labelKey: "dashboards",
          icon: "fa-table-cells-large",
          color: "#875a7b",
          href: "/odoo/action-board.board_my_dash_action",
          match: ["board.board"],
        },
        {
          key: "accounting",
          labelKey: "accounting",
          icon: "fa-file-invoice-dollar",
          color: "#00a09d",
          href: "/odoo/action-account.action_move_out_invoice_type",
          match: ["account.move"],
        },
        {
          key: "apps",
          labelKey: "apps",
          icon: "fa-puzzle-piece",
          color: "#00b5e2",
          href: "/odoo/apps",
          match: ["base.action_bundle_install_all_app"],
        },
        {
          key: "settings",
          labelKey: "settings",
          icon: "fa-hexagon-nodes-bold",
          color: "#714b67",
          href: "/odoo/action-base.action_res_config_settings",
          match: ["res_config_settings"],
        },
      ],
    },
    shortcuts: {
      filterMap: { "1": "all", "2": "paid", "3": "overdue", "4": "pending", "5": "draft" },
    },
  };

  // Decoupled i18n catalog (loaded from YAML at build/apply time).
  const i18n = __APP_UI_I18N__;

  window.app_ui_CONFIG = Object.freeze(config);
  window.APP_UI_I18N = i18n;
})();
