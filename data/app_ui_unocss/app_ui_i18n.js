(() => {
  const ROOT = window.odooApp || (window.odooApp = {});
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
      headerTitle: t("header.title", "Unified app workspace"),
      headerSubtitle: t(
        "header.subtitle",
        "All record-critical actions in one surface: customers, vendors, payments, reports and CFDI flow."
      ),
      sectionrecordList: t("header.section_record_list", "record List"),
      newrecordButton: t("header.new_record", "+ New"),
      headerCreateNew: t("header.create_new", "Create New"),
      headerActionAssistant: t("header.actions.assistant", "AI Assistant"),
      headerActionDiscuss: t("header.actions.discuss", "Discuss"),
      headerActionActivities: t("header.actions.activities", "Activities"),
      headerActionTheme: t("header.actions.theme", "Theme"),
      profileSwitchTitle: t("profile.switch.title", "Switch user"),
      profileSwitchFinance: t("profile.switch.finance", "Finance"),
      profileSwitchOperations: t("profile.switch.operations", "Operations"),
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
      tableEmail: t("table.email", "Email"),
      tableTotalCost: t("table.total_cost", "Total Cost"),
      tableStatus: t("table.status", "Status"),
      tableStage: t("table.stage", "Stage"),
      tableCreated: t("table.created", "Created"),
      tableDue: t("table.due", "Due"),
      tableOwner: t("table.owner", "Owner"),
      tableCollaborators: t("table.collaborators", "Collaborators"),
      tableModule: t("table.module", "Module"),
      tablePaymentTerm: t("table.payment_term", "Payment Term"),
      tableTags: t("table.tags", "Tags"),
      tableRating: t("table.rating", "Rating"),
      tableUrgency: t("table.urgency", "Urgency"),
      tableAction: t("table.action", "Action"),
      tableLoadingLabel: t("table.loading", "Loading records..."),
      tableSettingsTitle: t("table.settings_title", "Table settings"),
      tableSettingsColumns: t("table.settings_columns", "Columns"),
      tableSettingsFilters: t("table.settings_filters", "Advanced filters"),
      tableSettingsValue: t("table.settings_value", "Value"),
      manageViews: t("table.manage_views", "Manage views"),
      defaultViewName: t("table.default_view_name", "Default view"),
      viewName: t("table.view_name", "View name"),
      saveAsNew: t("table.save_as_new", "Save as new"),
      updateCurrent: t("table.update_current", "Update current"),
      deleteView: t("table.delete_view", "Delete view"),
      sortLabel: t("table.sort_label", "Sort"),
      groupByLabel: t("table.group_by_label", "Group by"),
      layoutLabel: t("table.layout_label", "Layout"),
      orderLabel: t("table.order_label", "Column order"),
      widthLabel: t("table.width_label", "Column widths"),
      addSort: t("table.add_sort", "Add sort"),
      cancelText: t("table.cancel_text", "Cancel"),
      applyText: t("table.apply_text", "Apply"),
      navAppSwitcher: t("navigation.app_switcher", "App Switcher"),
      navSearchTooltip: t("navigation.search_tooltip", "Use Odoo Search"),
      navCollapseRail: t("navigation.collapse_rail", "Collapse Rail"),
      navViewAllApps: t("navigation.view_all_apps", "View All Apps"),
      headerNotificationsTitle: t("header.notifications.title", "Notifications"),
      headerNotificationsSubtitle: t("header.notifications.subtitle", "Events that require attention across apps."),
      headerNotificationsMarkAll: t("header.notifications.mark_all", "Mark all as read"),
      navApps: {
        discuss: t("navigation.apps.discuss", "Discuss"),
        contacts: t("navigation.apps.contacts", "Contacts"),
        sales: t("navigation.apps.sales", "Sales"),
        rental: t("navigation.apps.rental", "Rental"),
        inventory: t("navigation.apps.inventory", "Inventory"),
        customers: t("navigation.apps.customers", "Customers"),
        vendors: t("navigation.apps.vendors", "Vendors"),
        payments: t("navigation.apps.payments", "Payments"),
        reports: t("navigation.apps.reports", "Reports"),
        accounting: t("navigation.apps.accounting", "Accounting"),
        purchase: t("navigation.apps.purchase", "Purchase"),
        apps: t("navigation.apps.apps", "Apps"),
        settings: t("navigation.apps.settings", "Settings"),
      },
      breadcrumbHome: t("breadcrumbs.home", "Home"),
      breadcrumbRecords: t("breadcrumbs.records", "Records"),
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
      runtimeFallbackTitle: t("runtime.fallback_title", "Unified app workspace"),
      runtimeFallbackSubtitle: t(
        "runtime.fallback_subtitle",
        "Vue loader not available. App shell is in fallback mode."
      ),
      runtimeBadgeFilterTitle: t("runtime.badge_filter_title", "Click to filter by this status"),
      sidebarSettingsPopupTitle: t("sidebar.settings.popup_title", "Settings & Apps"),
      sidebarSettingsAppsLabel: t("sidebar.settings.apps", "App switcher"),
      sidebarSettingsProfileLabel: t("sidebar.settings.profile", "Profile settings"),
      sidebarSettingsSystemLabel: t("sidebar.settings.system", "System config"),
      shellPanelPrimaryTitle: t("shell.panels.primary.title", "Workspace signals"),
      shellPanelPrimarySubtitle: t(
        "shell.panels.primary.subtitle",
        "Cross-app cards that surface collections, operations, and master data checkpoints."
      ),
      shellPanelSecondaryTitle: t("shell.panels.secondary.title", "Execution shortcuts"),
      shellPanelSecondarySubtitle: t(
        "shell.panels.secondary.subtitle",
        "Compact cards for the next action, context owner, and related surfaces."
      ),
      workspaceLoadingCard: t("shell.workspace.loading_card", "Loading card..."),
      dashboardLoadingSection: t("shell.dashboard.loading_section", "Loading section..."),
      shellDetailTitle: t("shell.detail.title", "Record detail"),
      shellDetailSubtitle: t("shell.detail.subtitle", "A structured read of the selected record, not a raw form dump."),
      shellDetailEyebrow: t("shell.detail.eyebrow", "Focused record"),
      shellDetailCta: t("shell.detail.cta", "Focus in table"),
      shellDetailEmpty: t("shell.detail.empty", "No active record to inspect."),
      shellExecutionTitle: t("shell.execution.title", "Execution pad"),
      shellExecutionSubtitle: t("shell.execution.subtitle", "Capture operator intent, handoff notes, and priority without leaving the shell."),
      shellExecutionEyebrow: t("shell.execution.eyebrow", "Working record"),
      shellExecutionNoteLabel: t("shell.execution.note_label", "Operator note"),
      shellExecutionNoteHint: t("shell.execution.note_hint", "Keep the note actionable and specific."),
      shellExecutionNotePlaceholder: t("shell.execution.note_placeholder", "Summarize the next move, dependency, or blocker..."),
      shellExecutionTagsLabel: t("shell.execution.tags_label", "Signal tags"),
      shellExecutionTagsHint: t("shell.execution.tags_hint", "Short labels that survive handoff."),
      shellExecutionTagsPlaceholder: t("shell.execution.tags_placeholder", "Add tag and press Enter"),
      shellExecutionRatingLabel: t("shell.execution.rating_label", "Priority score"),
      shellExecutionRatingHint: t("shell.execution.rating_hint", "A compact score for urgency and operator attention."),
      shellExecutionRatingValue: t("shell.execution.rating_value", "Current score"),
      shellExecutionSaveLabel: t("shell.execution.save", "Save note"),
      shellExecutionFollowUpLabel: t("shell.execution.follow_up", "Create follow-up"),
      shellExecutionEmpty: t("shell.execution.empty", "Pick a record to capture a note."),
      shellOpsTitle: t("shell.operations.title", "Operations surfaces"),
      shellOpsSubtitle: t(
        "shell.operations.subtitle",
        "Form, comments, files, tasks, and milestones in a single context-preserving panel."
      ),
      shellOpsEmpty: t("shell.operations.empty", "Pick a record to activate operations surfaces."),
      shellOpsTabForm: t("shell.operations.tabs.form", "Form"),
      shellOpsTabComments: t("shell.operations.tabs.comments", "Comments"),
      shellOpsTabFiles: t("shell.operations.tabs.files", "Files"),
      shellOpsTabTasks: t("shell.operations.tabs.tasks", "Tasks"),
      shellOpsTabMilestones: t("shell.operations.tabs.milestones", "Milestones"),
      shellOpsFormTitle: t("shell.operations.form.title", "Record form"),
      shellOpsFormSubtitle: t("shell.operations.form.subtitle", "Field-level edits with explicit save and reset controls."),
      shellOpsFormSave: t("shell.operations.form.save", "Save changes"),
      shellOpsFormReset: t("shell.operations.form.reset", "Reset"),
      shellOpsCommentsTitle: t("shell.operations.comments.title", "Threaded comments"),
      shellOpsCommentsSubtitle: t("shell.operations.comments.subtitle", "Capture rationale and handoff context directly on the focused record."),
      shellOpsCommentsComposerLabel: t("shell.operations.comments.composer_label", "New comment"),
      shellOpsCommentsComposerPlaceholder: t("shell.operations.comments.composer_placeholder", "Write a precise update for the next owner..."),
      shellOpsCommentsPost: t("shell.operations.comments.post", "Post comment"),
      shellOpsCommentsReply: t("shell.operations.comments.reply", "Reply"),
      shellOpsCommentsReplySend: t("shell.operations.comments.reply_send", "Send reply"),
      shellOpsCommentsReplyPlaceholder: t("shell.operations.comments.reply_placeholder", "Add a reply..."),
      shellOpsCommentsEmpty: t("shell.operations.comments.empty", "No comments yet."),
      shellOpsFilesTitle: t("shell.operations.files.title", "File explorer"),
      shellOpsFilesSubtitle: t("shell.operations.files.subtitle", "Organize and edit record artifacts in-context."),
      shellOpsFilesUpload: t("shell.operations.files.upload", "Upload"),
      shellOpsFilesNew: t("shell.operations.files.new", "New file"),
      shellOpsFilesRename: t("shell.operations.files.rename", "Rename"),
      shellOpsFilesSave: t("shell.operations.files.save", "Save"),
      shellOpsFilesRenameInput: t("shell.operations.files.rename_input", "New file name"),
      shellOpsFilesRenameApply: t("shell.operations.files.rename_apply", "Apply"),
      shellOpsFilesEditorLabel: t("shell.operations.files.editor_label", "File content"),
      shellOpsFilesEditorPlaceholder: t("shell.operations.files.editor_placeholder", "Write markdown, notes, or structured text..."),
      shellOpsFilesEmpty: t("shell.operations.files.empty", "Select a file from the explorer."),
      shellOpsTasksTitle: t("shell.operations.tasks.title", "Task board"),
      shellOpsTasksSubtitle: t("shell.operations.tasks.subtitle", "Drag tasks between status columns to keep handoffs visible."),
      shellOpsTasksStatusNew: t("shell.operations.tasks.status_new", "New"),
      shellOpsTasksStatusInProgress: t("shell.operations.tasks.status_in_progress", "In progress"),
      shellOpsTasksStatusTesting: t("shell.operations.tasks.status_testing", "Testing"),
      shellOpsTasksStatusAwaitingFeedback: t("shell.operations.tasks.status_awaiting_feedback", "Awaiting feedback"),
      shellOpsTasksStatusComplete: t("shell.operations.tasks.status_complete", "Complete"),
      shellOpsMilestonesTitle: t("shell.operations.milestones.title", "Milestones"),
      shellOpsMilestonesSubtitle: t("shell.operations.milestones.subtitle", "Track contract stages and drill into task readiness."),
      shellOpsMilestonesProgress: t("shell.operations.milestones.progress", "Completion"),
      shellOpsMilestonesTasksLabel: t("shell.operations.milestones.tasks_label", "Tasks linked to this milestone"),
      shellOpsSeedCommentCollections: t("shell.operations.seed.comment_collections", "Collections follow-up queued for the account."),
      shellOpsSeedCommentOps: t("shell.operations.seed.comment_ops", "Operations confirms dispatch status and return window."),
      shellOpsSeedCommentReply: t("shell.operations.seed.comment_reply", "Logged. Keeping this record in execution mode until posting passes."),
      shellOpsSeedTaskReview: t("shell.operations.seed.task_review", "Review fiscal profile"),
      shellOpsSeedTaskCollections: t("shell.operations.seed.task_collections", "Collections call"),
      shellOpsSeedTaskEvidence: t("shell.operations.seed.task_evidence", "Attach payment evidence"),
      shellOpsSeedTaskApproval: t("shell.operations.seed.task_approval", "Posting approval"),
      shellOpsSeedTaskDone: t("shell.operations.seed.task_done", "Close execution log"),
      shellOpsSeedMilestoneIntake: t("shell.operations.seed.milestone_intake", "Intake readiness"),
      shellOpsSeedMilestoneExecution: t("shell.operations.seed.milestone_execution", "Operational execution"),
      shellOpsSeedMilestoneClosure: t("shell.operations.seed.milestone_closure", "Financial closure"),
      shellMegaTitle: t("shell.mega.title", "Cross-app handoff"),
      shellMegaSubtitle: t(
        "shell.mega.subtitle",
        "Use the same shell to move across apps without losing context."
      ),
      shellCardCollectionsTitle: t("shell.cards.collections.title", "Collections focus"),
      shellCardCollectionsSubtitle: t(
        "shell.cards.collections.subtitle",
        "Protect overdue revenue and assign the next contact motion."
      ),
      shellCardOperationsTitle: t("shell.cards.operations.title", "Operations handoff"),
      shellCardOperationsSubtitle: t(
        "shell.cards.operations.subtitle",
        "Bridge execution, dispatch, and invoice readiness."
      ),
      shellCardMasterDataTitle: t("shell.cards.master_data.title", "Master data watch"),
      shellCardMasterDataSubtitle: t(
        "shell.cards.master_data.subtitle",
        "Watch the records that usually break invoicing downstream."
      ),
      shellCardNextActionTitle: t("shell.cards.next_action.title", "Next action"),
      shellCardNextActionSubtitle: t(
        "shell.cards.next_action.subtitle",
        "The shortest path to the next meaningful move."
      ),
      shellCardOwner: t("shell.labels.owner", "Owner"),
      shellCardNext: t("shell.labels.next", "Next"),
      shellCardQueue: t("shell.labels.queue", "Queue"),
      shellCardDueToday: t("shell.labels.due_today", "Due today"),
      shellCardMissingRfc: t("shell.labels.missing_rfc", "Missing RFC"),
      shellCardPendingCatalog: t("shell.labels.pending_catalog", "Catalog review"),
      shellCardStage: t("shell.labels.stage", "Stage"),
      shellProgressCollection: t("shell.labels.progress_collection", "Collection coverage"),
      shellProgressOperations: t("shell.labels.progress_operations", "Operational readiness"),
      shellProgressQuality: t("shell.labels.progress_quality", "Quality score"),
      shellProgressMomentum: t("shell.labels.progress_momentum", "Momentum"),
      shellCtaOpen: t("shell.actions.open", "Open"),
      shellCtaReview: t("shell.actions.review", "Review"),
      shellCtaInspect: t("shell.actions.inspect", "Inspect"),
      shellModeOverview: t("shell.modes.overview.label", "Overview"),
      shellModeOverviewDescription: t("shell.modes.overview.description", "Stay at executive altitude and watch the handoffs that can block collections."),
      shellModeExecution: t("shell.modes.execution.label", "Execution"),
      shellModeExecutionDescription: t("shell.modes.execution.description", "Focus on the next operator actions across accounting, rental, and customer master data."),
      shellModeQuality: t("shell.modes.quality.label", "Data quality"),
      shellModeQualityDescription: t("shell.modes.quality.description", "Surface the records that usually fail before posting, stamping, or collection follow-up."),
      shellQuickCreateTitle: t("shell.quick_create.title", "Create in context"),
      shellQuickCreateSubtitle: t("shell.quick_create.subtitle", "Start the next workflow without losing the current app shell."),
      shellQuickCreateGroupFinance: t("shell.quick_create.groups.finance", "Finance"),
      shellQuickCreateGroupOperations: t("shell.quick_create.groups.operations", "Operations"),
      shellQuickCreateInvoiceTitle: t("shell.quick_create.invoice.title", "New invoice"),
      shellQuickCreateInvoiceSubtitle: t("shell.quick_create.invoice.subtitle", "Start a posted or draft invoice from the current shell."),
      shellQuickCreatePaymentTitle: t("shell.quick_create.payment.title", "Register payment"),
      shellQuickCreatePaymentSubtitle: t("shell.quick_create.payment.subtitle", "Capture payment evidence and keep the residual clean."),
      shellQuickCreateContactTitle: t("shell.quick_create.contact.title", "New customer contact"),
      shellQuickCreateContactSubtitle: t("shell.quick_create.contact.subtitle", "Create the partner record before pricing or invoicing."),
      shellQuickCreateReportTitle: t("shell.quick_create.report.title", "Open report"),
      shellQuickCreateReportSubtitle: t("shell.quick_create.report.subtitle", "Jump to reporting without leaving the shell context."),
      shellInsightsTitle: t("shell.insights.title", "System posture"),
      shellInsightsSubtitle: t("shell.insights.subtitle", "Reusable shell signals shared across apps, not tied to one table."),
      shellInsightCollectionsEyebrow: t("shell.insights.collections.eyebrow", "Collections"),
      shellInsightCollectionsTitle: t("shell.insights.collections.title", "Cash exposure under control"),
      shellInsightCollectionsDescription: t("shell.insights.collections.description", "Overdue balances are isolated and the next owner is already assigned."),
      shellInsightCollectionsMetaLabel: t("shell.insights.collections.meta_label", "Today"),
      shellInsightCollectionsProgress: t("shell.insights.collections.progress", "Coverage"),
      shellInsightOperationsEyebrow: t("shell.insights.operations.eyebrow", "Operations"),
      shellInsightOperationsTitle: t("shell.insights.operations.title", "Rental handoff synchronized"),
      shellInsightOperationsDescription: t("shell.insights.operations.description", "Exchange, returns, and invoice readiness stay visible in the same shell."),
      shellInsightOperationsMetaLabel: t("shell.insights.operations.meta_label", "Queue"),
      shellInsightOperationsProgress: t("shell.insights.operations.progress", "Ready"),
      shellInsightQualityEyebrow: t("shell.insights.quality.eyebrow", "Quality"),
      shellInsightQualityTitle: t("shell.insights.quality.title", "Data issues contained"),
      shellInsightQualityDescription: t("shell.insights.quality.description", "RFC, catalogs, and partner readiness are surfaced before posting fails."),
      shellInsightQualityMetaLabel: t("shell.insights.quality.meta_label", "Blocked"),
      shellInsightQualityProgress: t("shell.insights.quality.progress", "Integrity"),
      shellActivityTitle: t("shell.activity.title", "Activity feed"),
      shellActivitySubtitle: t("shell.activity.subtitle", "Cross-app events that explain why the shell changed, not just what changed."),
      shellActivityEmpty: t("shell.activity.empty", "No activity yet."),
      shellActivityStatusLabel: t("shell.activity.status_label", "Status change"),
      shellActivityStatusText: t("shell.activity.status_text", "moved RiverBend EPC from draft validation into posting review."),
      shellActivityQualityLabel: t("shell.activity.quality_label", "Quality alert"),
      shellActivityQualityText: t("shell.activity.quality_text", "flagged two contacts without RFC before CFDI stamping."),
      shellActivityAssignedLabel: t("shell.activity.assigned_label", "Task assigned"),
      shellActivityAssignedText: t("shell.activity.assigned_text", "assigned the rental exchange review to Field Ops before invoice release."),
      shellActivityOpenRecord: t("shell.activity.open_record", "Open record"),
      shellActivityOpenContacts: t("shell.activity.open_contacts", "Open contacts"),
      shellNotificationCollectionsTitle: t("shell.notifications.collections.title", "Collections follow-up"),
      shellNotificationCollectionsText: t("shell.notifications.collections.text", "Innovate Inc. needs a payment commitment logged before noon."),
      shellNotificationDraftTitle: t("shell.notifications.draft.title", "Draft ready to post"),
      shellNotificationDraftText: t("shell.notifications.draft.text", "RiverBend EPC is complete and ready for fiscal validation."),
      shellNotificationDataTitle: t("shell.notifications.data.title", "Cross-app dependency"),
      shellNotificationDataText: t("shell.notifications.data.text", "Contacts requires one RFC fix before stamping can continue."),
      profileMenuProfile: t("profile.menu.profile", "Profile"),
      profileMenuBilling: t("profile.menu.billing", "Billing"),
      profileMenuSettings: t("profile.menu.settings", "Settings"),
      profileMenuLogout: t("profile.menu.logout", "Log out"),
      commandPalettePlaceholder: t("command_palette.placeholder", "Search actions, apps, or records..."),
      commandPaletteNavigate: t("command_palette.footer.navigate", "Navigate"),
      commandPaletteExecute: t("command_palette.footer.execute", "Execute"),
      commandPaletteClose: t("command_palette.footer.close", "Close"),
      commandPaletteSystem: t("command_palette.footer.system", "Unified command surface"),
      commandPaletteCreateRecord: t("command_palette.actions.create_record.title", "Create new record"),
      commandPaletteCreateRecordHint: t("command_palette.actions.create_record.description", "Start a new workflow from the current shell."),
      commandPaletteFocusOverdue: t("command_palette.actions.focus_overdue.title", "Focus overdue records"),
      commandPaletteFocusOverdueHint: t("command_palette.actions.focus_overdue.description", "Jump directly to the records that need collection follow-up."),
      commandPaletteOpenContacts: t("command_palette.actions.open_contacts.title", "Open contacts"),
      commandPaletteOpenContactsHint: t("command_palette.actions.open_contacts.description", "Move to the customer master data surface."),
      commandPaletteOpenApp: t("command_palette.actions.open_app", "Open app"),
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
        "Use the unified rail to keep app context while navigating related modules."
      ),
    };
  }

  ROOT.i18n = Object.freeze({
    createTranslator,
    buildUiText,
  });
})();
