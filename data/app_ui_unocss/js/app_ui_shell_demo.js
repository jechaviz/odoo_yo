(() => {
  const ROOT = window.odooApp || (window.odooApp = {});
  function buildShellBrand(i18n = {}) {
    return {
      icon: "fa-file-invoice-dollar",
      title: i18n.navApps?.accounting || "Accounting",
      subtitle: i18n.headerSubtitle || "Unified shell",
    };
  }

  function buildShellBreadcrumbs(i18n = {}) {
    return [
      {
        key: "home",
        label: i18n.breadcrumbHome || "Home",
        icon: "fa-solid fa-house",
        href: "#",
      },
      {
        key: "records",
        label: i18n.breadcrumbRecords || i18n.sectionrecordList || "Records",
        active: true,
      },
    ];
  }

  function buildShellNotifications(i18n = {}) {
    return [
      {
        id: "notif-1",
        title: i18n.shellNotificationCollectionsTitle || "Collections follow-up",
        text: i18n.shellNotificationCollectionsText || "Innovate Inc. needs a payment commitment logged before noon.",
        time: "5m ago",
        read: false,
      },
      {
        id: "notif-2",
        title: i18n.shellNotificationDraftTitle || "Draft ready to post",
        text: i18n.shellNotificationDraftText || "RiverBend EPC is complete and ready for fiscal validation.",
        time: "22m ago",
        read: false,
      },
      {
        id: "notif-3",
        title: i18n.shellNotificationDataTitle || "Cross-app dependency",
        text: i18n.shellNotificationDataText || "Contacts requires one RFC fix before stamping can continue.",
        time: "46m ago",
        read: true,
      },
    ];
  }

  function buildShellUtilityActions(i18n = {}) {
    return [
      {
        key: "assistant",
        label: i18n.headerActionAssistant || "AI Assistant",
        icon: "fa-solid fa-wand-magic-sparkles",
        style: "color: var(--app-primary);",
      },
      {
        key: "discuss",
        label: i18n.headerActionDiscuss || "Discuss",
        icon: "fa-solid fa-comments",
      },
      {
        key: "activities",
        label: i18n.headerActionActivities || "Activities",
        icon: "fa-solid fa-clock",
      },
      {
        key: "theme",
        label: i18n.headerActionTheme || "Theme",
        icon: "fa-solid fa-sun",
      },
    ];
  }

  function buildShellProfile(i18n = {}) {
    return {
      name: "Jesus Chavez",
      role: "Operations Architect",
      avatar: "https://i.pravatar.cc/100?u=workspace-user",
      menuProfile: i18n.profileMenuProfile || "Profile",
      menuBilling: i18n.profileMenuBilling || "Billing",
      menuSettings: i18n.profileMenuSettings || "Settings",
      menuLogout: i18n.profileMenuLogout || "Log out",
      switchGroups: [
        {
          key: "finance",
          label: i18n.profileSwitchFinance || "Finance",
          items: [
            { key: "finance-lead", name: "Laura Soto", role: "Finance Lead", avatar: "https://i.pravatar.cc/64?u=finance-lead" },
            { key: "collections", name: "Marco Ruiz", role: "Collections Owner", avatar: "https://i.pravatar.cc/64?u=collections-owner" },
          ],
        },
        {
          key: "operations",
          label: i18n.profileSwitchOperations || "Operations",
          items: [
            { key: "rental-desk", name: "Nora Diaz", role: "Rental Desk", avatar: "https://i.pravatar.cc/64?u=rental-desk" },
            { key: "field-ops", name: "Ivan Perez", role: "Field Ops", avatar: "https://i.pravatar.cc/64?u=field-ops" },
          ],
        },
      ],
    };
  }

  function buildShellModes(i18n = {}) {
    return [
      {
        value: "overview",
        label: i18n.shellModeOverview || "Overview",
        description: i18n.shellModeOverviewDescription || "Stay at executive altitude and watch the handoffs that can block collections.",
      },
      {
        value: "execution",
        label: i18n.shellModeExecution || "Execution",
        description: i18n.shellModeExecutionDescription || "Focus on the next operator actions across accounting, rental, and customer master data.",
      },
      {
        value: "quality",
        label: i18n.shellModeQuality || "Data quality",
        description: i18n.shellModeQualityDescription || "Surface the records that usually fail before posting, stamping, or collection follow-up.",
      },
    ];
  }

  function buildQuickCreateActions(i18n = {}) {
    return [
      {
        key: "new-invoice",
        group: i18n.shellQuickCreateGroupFinance || "Finance",
        title: i18n.shellQuickCreateInvoiceTitle || "New invoice",
        subtitle: i18n.shellQuickCreateInvoiceSubtitle || "Start a posted or draft invoice from the current shell.",
        icon: "fa-solid fa-file-invoice-dollar",
        tone: "primary",
        ctaLabel: i18n.shellCtaOpen || "Open",
        badges: [i18n.navApps?.accounting || "Accounting", i18n.filterDraft || "Draft"],
        bodyItems: [
          { label: i18n.shellCardOwner || "Owner", value: "Finance Lead" },
          { label: i18n.shellCardStage || "Stage", value: "Draft to Post" },
        ],
      },
      {
        key: "new-payment",
        group: i18n.shellQuickCreateGroupFinance || "Finance",
        title: i18n.shellQuickCreatePaymentTitle || "Register payment",
        subtitle: i18n.shellQuickCreatePaymentSubtitle || "Capture payment evidence and keep the residual clean.",
        icon: "fa-solid fa-credit-card",
        ctaLabel: i18n.shellCtaReview || "Review",
        badges: [i18n.navApps?.payments || "Payments"],
        bodyItems: [
          { label: i18n.shellCardQueue || "Queue", value: "Collections" },
          { label: i18n.shellCardNext || "Next", value: "Match bank evidence" },
        ],
      },
      {
        key: "new-contact",
        group: i18n.shellQuickCreateGroupOperations || "Operations",
        title: i18n.shellQuickCreateContactTitle || "New customer contact",
        subtitle: i18n.shellQuickCreateContactSubtitle || "Create the partner record before pricing or invoicing.",
        icon: "fa-solid fa-address-book",
        ctaLabel: i18n.shellCtaInspect || "Inspect",
        badges: [i18n.navApps?.customers || "Customers"],
        bodyItems: [
          { label: i18n.shellCardMissingRfc || "Missing RFC", value: "Validate fiscal fields" },
          { label: i18n.shellCardStage || "Stage", value: "Master data" },
        ],
      },
      {
        key: "new-report",
        group: i18n.shellQuickCreateGroupOperations || "Operations",
        title: i18n.shellQuickCreateReportTitle || "Open report",
        subtitle: i18n.shellQuickCreateReportSubtitle || "Jump to reporting without leaving the shell context.",
        icon: "fa-solid fa-chart-line",
        ctaLabel: i18n.shellCtaOpen || "Open",
        badges: [i18n.navApps?.reports || "Reports"],
        bodyItems: [
          { label: i18n.shellCardQueue || "Queue", value: "Executive review" },
          { label: i18n.shellCardNext || "Next", value: "Cash and aging" },
        ],
      },
    ];
  }

  function buildShellInsights(i18n = {}) {
    return [
      {
        key: "collections",
        eyebrow: i18n.shellInsightCollectionsEyebrow || "Collections",
        title: i18n.shellInsightCollectionsTitle || "Cash exposure under control",
        description: i18n.shellInsightCollectionsDescription || "Overdue balances are isolated and the next owner is already assigned.",
        metaLabel: i18n.shellInsightCollectionsMetaLabel || "Today",
        metaValue: "$7.7K",
        progress: 78,
        progressLabel: i18n.shellInsightCollectionsProgress || "Coverage",
        tone: "warning",
      },
      {
        key: "operations",
        eyebrow: i18n.shellInsightOperationsEyebrow || "Operations",
        title: i18n.shellInsightOperationsTitle || "Rental handoff synchronized",
        description: i18n.shellInsightOperationsDescription || "Exchange, returns, and invoice readiness stay visible in the same shell.",
        metaLabel: i18n.shellInsightOperationsMetaLabel || "Queue",
        metaValue: "3 moves",
        progress: 64,
        progressLabel: i18n.shellInsightOperationsProgress || "Ready",
        tone: "primary",
      },
      {
        key: "quality",
        eyebrow: i18n.shellInsightQualityEyebrow || "Quality",
        title: i18n.shellInsightQualityTitle || "Data issues contained",
        description: i18n.shellInsightQualityDescription || "RFC, catalogs, and partner readiness are surfaced before posting fails.",
        metaLabel: i18n.shellInsightQualityMetaLabel || "Blocked",
        metaValue: "2 records",
        progress: 58,
        progressLabel: i18n.shellInsightQualityProgress || "Integrity",
        tone: "danger",
      },
    ];
  }

  function buildShellActivity(i18n = {}) {
    const now = Date.now();
    return [
      {
        key: "activity-1",
        type: "STATUS_CHANGE",
        tone: "primary",
        text: i18n.shellActivityStatusText || "moved RiverBend EPC from draft validation into posting review.",
        label: i18n.shellActivityStatusLabel || "Status change",
        timestamp: new Date(now - 1000 * 60 * 14).toISOString(),
        user: {
          name: "Laura Soto",
          avatar: "https://i.pravatar.cc/64?u=finance-lead",
          status: "online",
        },
        link: {
          text: i18n.shellActivityOpenRecord || "Open record",
          href: "#",
        },
      },
      {
        key: "activity-2",
        type: "QUALITY_ALERT",
        tone: "danger",
        text: i18n.shellActivityQualityText || "flagged two contacts without RFC before CFDI stamping.",
        label: i18n.shellActivityQualityLabel || "Quality alert",
        timestamp: new Date(now - 1000 * 60 * 37).toISOString(),
        user: {
          name: "Nora Diaz",
          avatar: "https://i.pravatar.cc/64?u=rental-desk",
          status: "busy",
        },
        link: {
          text: i18n.shellActivityOpenContacts || "Open contacts",
          href: "#",
        },
      },
      {
        key: "activity-3",
        type: "TASK_ASSIGNED",
        tone: "warning",
        text: i18n.shellActivityAssignedText || "assigned the rental exchange review to Field Ops before invoice release.",
        label: i18n.shellActivityAssignedLabel || "Task assigned",
        timestamp: new Date(now - 1000 * 60 * 65).toISOString(),
        user: {
          name: "Ivan Perez",
          avatar: "https://i.pravatar.cc/64?u=field-ops",
          status: "online",
        },
      },
    ];
  }

  function buildCommandPaletteActions(i18n = {}, apps = []) {
    const appEntries = (Array.isArray(apps) ? apps : []).slice(0, 6).map((app) => ({
      key: `app_${app.key}`,
      label: app.label || app.key,
      description: i18n.commandPaletteOpenApp || "Open app",
      icon: app.icon || "fa-solid fa-grid-2",
      href: app.href,
    }));

    return [
      {
        key: "new_record",
        label: i18n.commandPaletteCreateRecord || "Create new record",
        description: i18n.commandPaletteCreateRecordHint || "Start a new workflow from the current shell.",
        icon: "fa-solid fa-plus",
        action: "new-record",
      },
      {
        key: "focus_overdue",
        label: i18n.commandPaletteFocusOverdue || "Focus overdue records",
        description: i18n.commandPaletteFocusOverdueHint || "Jump directly to the records that need collection follow-up.",
        icon: "fa-solid fa-filter-circle-dollar",
        action: "filter-overdue",
      },
      {
        key: "open_contacts",
        label: i18n.commandPaletteOpenContacts || "Open contacts",
        description: i18n.commandPaletteOpenContactsHint || "Move to the customer master data surface.",
        icon: "fa-solid fa-address-book",
        href: "/odoo/action-contacts.action_contacts",
      },
      ...appEntries,
    ];
  }

  ROOT.shellDemo = Object.freeze({
    buildShellBrand,
    buildShellBreadcrumbs,
    buildShellNotifications,
    buildShellUtilityActions,
    buildShellProfile,
    buildShellModes,
    buildShellInsights,
    buildShellActivity,
    buildQuickCreateActions,
    buildCommandPaletteActions,
  });
})();
