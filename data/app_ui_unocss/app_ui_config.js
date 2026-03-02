(() => {
  const ROOT = window.odooApp || (window.odooApp = {});
  const BOOTSTRAP = ROOT.bootstrap || (ROOT.bootstrap = {});
  // Centralized runtime config (SoC): selectors, IDs, shortcuts, URLs.
  const config = {
    storage: {
      disableKey: "odooAppRevampDisabled",
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
          key: "discuss",
          labelKey: "discuss",
          icon: "fa-comments",
          color: "#ff8400",
          href: "/odoo/action-mail.action_discuss",
          match: ["mail.discuss", "action_discuss"],
        },
        {
          key: "contacts",
          labelKey: "contacts",
          icon: "fa-address-book",
          color: "#00b8d9",
          href: "/odoo/action-contacts.action_contacts",
          match: ["contacts", "res.partner"],
        },
        {
          key: "sales",
          labelKey: "sales",
          icon: "fa-chart-line",
          color: "#5a6acf",
          href: "/odoo/action-sale.action_quotations_with_onboarding",
          match: ["sale.order", "action_quotations"],
        },
        {
          key: "rental",
          labelKey: "rental",
          icon: "fa-key",
          color: "#2fb67e",
          href: "/odoo/action-sale_renting.rental_order_action",
          match: ["rental", "sale_renting"],
        },
        {
          key: "inventory",
          labelKey: "inventory",
          icon: "fa-boxes-stacked",
          color: "#f58b4c",
          href: "/odoo/action-stock.stock_picking_type_action",
          match: ["stock.picking", "stock.quant", "inventory"],
        },
        {
          key: "accounting",
          labelKey: "accounting",
          icon: "fa-file-invoice-dollar",
          color: "#00a09d",
          href: "/odoo/action-account.action_move_out_invoice_type",
          match: ["account.move", "account.payment", "invoice"],
        },
        {
          key: "purchase",
          labelKey: "purchase",
          icon: "fa-cart-shopping",
          color: "#9f65c2",
          href: "/odoo/action-purchase.purchase_rfq",
          match: ["purchase.order", "purchase"],
        },
        {
          key: "reports",
          labelKey: "reports",
          icon: "fa-chart-pie",
          color: "#66b2ff",
          href: "/odoo/apps",
          match: ["report", "dashboard"],
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
  const i18nCatalog = __ODOO_BOOTSTRAP_I18N_CATALOG__;

  ROOT.config = Object.freeze(config);
  BOOTSTRAP.i18nCatalog = Object.freeze(i18nCatalog || { default_locale: "en", messages: { en: {} } });
  ROOT.i18nCatalog = BOOTSTRAP.i18nCatalog;
})();
