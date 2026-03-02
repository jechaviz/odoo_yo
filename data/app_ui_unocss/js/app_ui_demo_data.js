(() => {
  const ROOT = window.odooApp || (window.odooApp = {});
  // Buyniverse-inspired domain/demo catalog shared by runtime and preview.
  const moneyFmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  const SHELL = ROOT.shellDemo || {};

  function makeDate(offsetDays) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + offsetDays);
    return d;
  }

  const RAW_INVOICES = [
    {
      id: "INV-240701",
      series: "A",
      folio: "240701",
      billFrom: "RPP Rental Ops",
      billTo: "Innovate Inc.",
      customer: "Innovate Inc.",
      issuedDate: makeDate(-28),
      dueDate: makeDate(-8),
      total: 5706.0,
      residual: 5706.0,
      state: "posted",
      paymentState: "not_paid",
      paymentTerm: "Net 20",
      owner: "Operations",
      module: "Rental",
      type: "overdue",
      contactEmail: "ap@innovate.example",
      collaborators: ["Finance", "Field Ops"],
      tags: ["exchange", "field-critical"],
      rating: 5,
      urgency: 96,
      stage: "Review",
    },
    {
      id: "INV-240702",
      series: "A",
      folio: "240702",
      billFrom: "RPP Rental Ops",
      billTo: "Helix Industrial",
      customer: "Helix Industrial",
      issuedDate: makeDate(-24),
      dueDate: makeDate(-4),
      total: 2050.0,
      residual: 2050.0,
      state: "posted",
      paymentState: "partial",
      paymentTerm: "Net 15",
      owner: "Operations",
      module: "Sales",
      type: "overdue",
      contactEmail: "billing@helix.example",
      collaborators: ["Sales", "Collections"],
      tags: ["priority", "follow-up"],
      rating: 4,
      urgency: 88,
      stage: "Review",
    },
    {
      id: "INV-240703",
      series: "A",
      folio: "240703",
      billFrom: "RPP Rental Ops",
      billTo: "DrillForce LLC",
      customer: "DrillForce LLC",
      issuedDate: makeDate(-18),
      dueDate: makeDate(2),
      total: 1840.0,
      residual: 1840.0,
      state: "posted",
      paymentState: "in_payment",
      paymentTerm: "Net 20",
      owner: "Finance",
      module: "Accounting",
      type: "pending",
      contactEmail: "payments@drillforce.example",
      collaborators: ["Finance"],
      tags: ["awaiting-wire"],
      rating: 3,
      urgency: 64,
      stage: "Ready",
    },
    {
      id: "INV-240704",
      series: "A",
      folio: "240704",
      billFrom: "RPP Rental Ops",
      billTo: "Canyon Process",
      customer: "Canyon Process",
      issuedDate: makeDate(-14),
      dueDate: makeDate(4),
      total: 930.0,
      residual: 930.0,
      state: "posted",
      paymentState: "not_paid",
      paymentTerm: "Net 30",
      owner: "Finance",
      module: "Rental",
      type: "pending",
      contactEmail: "ops@canyon.example",
      collaborators: ["Finance", "Rental Desk"],
      tags: ["weekly-rental"],
      rating: 3,
      urgency: 58,
      stage: "Backlog",
    },
    {
      id: "INV-240705",
      series: "B",
      folio: "240705",
      billFrom: "RPP Rental Ops",
      billTo: "Atlas Field Services",
      customer: "Atlas Field Services",
      issuedDate: makeDate(-10),
      dueDate: makeDate(6),
      total: 1480.0,
      residual: 0,
      state: "posted",
      paymentState: "paid",
      paymentTerm: "Immediate",
      owner: "Sales",
      module: "Sales",
      type: "paid",
      contactEmail: "ap@atlasfield.example",
      collaborators: ["Sales"],
      tags: ["vip"],
      rating: 5,
      urgency: 22,
      stage: "Closed",
    },
    {
      id: "INV-240706",
      series: "B",
      folio: "240706",
      billFrom: "RPP Rental Ops",
      billTo: "Blue Water Energy",
      customer: "Blue Water Energy",
      issuedDate: makeDate(-9),
      dueDate: makeDate(7),
      total: 620.0,
      residual: 0,
      state: "posted",
      paymentState: "paid",
      paymentTerm: "Immediate",
      owner: "Sales",
      module: "Rental",
      type: "paid",
      contactEmail: "accounts@bluewater.example",
      collaborators: ["Sales", "Operations"],
      tags: ["fast-pay"],
      rating: 4,
      urgency: 18,
      stage: "Closed",
    },
    {
      id: "INV-240707",
      series: "C",
      folio: "240707",
      billFrom: "RPP Rental Ops",
      billTo: "North Delta Mining",
      customer: "North Delta Mining",
      issuedDate: makeDate(-5),
      dueDate: makeDate(15),
      total: 1200.0,
      residual: 1200.0,
      state: "draft",
      paymentState: "not_paid",
      paymentTerm: "Net 30",
      owner: "Sales",
      module: "Drafting",
      type: "draft",
      contactEmail: "drafts@northdelta.example",
      collaborators: ["Sales", "Pricing"],
      tags: ["draft", "approval"],
      rating: 2,
      urgency: 31,
      stage: "Backlog",
    },
    {
      id: "INV-240708",
      series: "C",
      folio: "240708",
      billFrom: "RPP Rental Ops",
      billTo: "Pipeline Controls",
      customer: "Pipeline Controls",
      issuedDate: makeDate(-3),
      dueDate: makeDate(17),
      total: 3400.0,
      residual: 3400.0,
      state: "draft",
      paymentState: "not_paid",
      paymentTerm: "Net 45",
      owner: "Operations",
      module: "Drafting",
      type: "draft",
      contactEmail: "finance@pipeline.example",
      collaborators: ["Operations", "Pricing"],
      tags: ["large-order", "draft"],
      rating: 2,
      urgency: 45,
      stage: "Backlog",
    },
    {
      id: "INV-240709",
      series: "C",
      folio: "240709",
      billFrom: "RPP Rental Ops",
      billTo: "RiverBend EPC",
      customer: "RiverBend EPC",
      issuedDate: makeDate(-2),
      dueDate: makeDate(20),
      total: 1680.0,
      residual: 1680.0,
      state: "draft",
      paymentState: "not_paid",
      paymentTerm: "Net 30",
      owner: "Operations",
      module: "Drafting",
      type: "draft",
      contactEmail: "ap@riverbend.example",
      collaborators: ["Operations"],
      tags: ["contract-review"],
      rating: 3,
      urgency: 52,
      stage: "Ready",
    },
    {
      id: "INV-240710",
      series: "B",
      folio: "240710",
      billFrom: "RPP Rental Ops",
      billTo: "Epsilon Drilling",
      customer: "Epsilon Drilling",
      issuedDate: makeDate(-13),
      dueDate: makeDate(1),
      total: 920.0,
      residual: 0,
      state: "posted",
      paymentState: "paid",
      paymentTerm: "Immediate",
      owner: "Finance",
      module: "Accounting",
      type: "paid",
      contactEmail: "payables@epsilon.example",
      collaborators: ["Finance", "Sales"],
      tags: ["paid", "recurring"],
      rating: 4,
      urgency: 16,
      stage: "Closed",
    },
  ].map((row) => ({
    ...row,
    issuedDateIso: row.issuedDate.toISOString().slice(0, 10),
    dueDateIso: row.dueDate.toISOString().slice(0, 10),
    amount: moneyFmt.format(row.total),
    residualAmount: moneyFmt.format(row.residual),
  }));

  const FILTER_ORDER = ["all", "paid", "overdue", "pending", "draft"];
  const SURFACE_ORDER = ["records", "customers", "vendors", "payments", "reports"];

  function normalizeSurface(surfaceKey) {
    return SURFACE_ORDER.includes(surfaceKey) ? surfaceKey : "records";
  }

  function rowsForSurface(surfaceKey = "records") {
    const surface = normalizeSurface(surfaceKey);
    if (surface === "customers") return RAW_INVOICES.filter((row) => ["Sales", "Operations"].includes(row.owner));
    if (surface === "vendors") return RAW_INVOICES.filter((row) => ["Drafting", "Accounting"].includes(row.module));
    if (surface === "payments") return RAW_INVOICES.filter((row) => row.paymentState !== "paid");
    if (surface === "reports") return RAW_INVOICES.slice();
    return RAW_INVOICES;
  }

  function normalizeSearch(text) {
    return String(text || "").trim().toLowerCase();
  }

  function toStatusText(record, i18n = {}) {
    const map = {
      paid: i18n.filterPaid || "Paid",
      overdue: i18n.filterOverdue || "Overdue",
      pending: i18n.filterPending || "Pending",
      draft: i18n.filterDraft || "Draft",
      all: i18n.filterAll || "All",
    };
    return map[record.type] || record.type;
  }

  function applyFilter(records, filterName) {
    if (!FILTER_ORDER.includes(filterName) || filterName === "all") return records;
    return records.filter((row) => row.type === filterName);
  }

  function applySearch(records, query) {
    const needle = normalizeSearch(query);
    if (!needle) return records;
    return records.filter((row) => {
      const haystack = [
        row.id,
        row.series,
        row.folio,
        row.billFrom,
        row.billTo,
        row.customer,
        row.owner,
        row.module,
        row.paymentTerm,
        row.contactEmail,
        row.stage,
        ...(Array.isArray(row.tags) ? row.tags : []),
        ...(Array.isArray(row.collaborators) ? row.collaborators : []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }

  function getTableRows(filterName = "all", query = "", i18n = {}) {
    const filtered = applyFilter(rowsForSurface("records"), filterName);
    return applySearch(filtered, query).map((row) => ({
      ...row,
      statusText: toStatusText(row, i18n),
    }));
  }

  function getTableRowsBySurface(surfaceKey = "records", filterName = "all", query = "", i18n = {}) {
    const filtered = applyFilter(rowsForSurface(surfaceKey), filterName);
    return applySearch(filtered, query).map((row) => ({
      ...row,
      statusText: toStatusText(row, i18n),
    }));
  }

  function toMetricRow(row) {
    return {
      state: row.state,
      amount_total: row.total,
      amount_residual: row.residual,
      payment_state: row.paymentState === "paid" ? "paid" : "not_paid",
      record_date_due: `${row.dueDateIso} 00:00:00`,
      record_date: `${row.issuedDateIso} 00:00:00`,
    };
  }

  function getMetricRows(filterName = "all") {
    return applyFilter(RAW_INVOICES, filterName).map(toMetricRow);
  }

  function getMetricRowsBySurface(surfaceKey = "records", filterName = "all") {
    return applyFilter(rowsForSurface(surfaceKey), filterName).map(toMetricRow);
  }

  function sum(rows, field) {
    return rows.reduce((acc, row) => acc + Number(row[field] || 0), 0);
  }

  function buildKpis(i18n = {}) {
    const pending = applyFilter(RAW_INVOICES, "pending");
    const overdue = applyFilter(RAW_INVOICES, "overdue");
    const draft = applyFilter(RAW_INVOICES, "draft");
    const paid = applyFilter(RAW_INVOICES, "paid");

    return {
      overdueAmount: moneyFmt.format(sum(overdue, "residual")),
      overdueCount: overdue.length,
      draftAmount: moneyFmt.format(sum(draft, "total")),
      draftCount: draft.length,
      unpaidAmount: moneyFmt.format(sum([...pending, ...overdue], "residual")),
      unpaidCount: pending.length + overdue.length,
      avgPaidDays: 7,
      postedCount: paid.length + pending.length + overdue.length,
      cards: [
        {
          key: "pending",
          label: i18n.filterPending || "Pending",
          value: moneyFmt.format(sum(pending, "residual")),
          count: pending.length,
          type: "pending",
        },
        {
          key: "overdue",
          label: i18n.filterOverdue || "Overdue",
          value: moneyFmt.format(sum(overdue, "residual")),
          count: overdue.length,
          type: "overdue",
        },
      ],
    };
  }

  function buildSidebarCategories(i18n = {}, counts = {}) {
    return [
      {
        name: i18n.navApps?.accounting || "Accounting",
        key: "finance",
        icon: "fa-solid fa-file-invoice-dollar",
        isCollapsible: true,
        links: [
          { key: "all", label: i18n.filterAll || "All records", icon: "fa-solid fa-table-list", badge: counts.all || "" },
          { key: "paid", label: i18n.filterPaid || "Paid", icon: "fa-solid fa-circle-check", badge: counts.paid || "" },
          { key: "overdue", label: i18n.filterOverdue || "Overdue", icon: "fa-solid fa-triangle-exclamation", badge: counts.overdue || "" },
          { key: "pending", label: i18n.filterPending || "Pending", icon: "", badge: counts.pending || "" },
          { key: "draft", label: i18n.filterDraft || "Draft", icon: "", badge: counts.draft || "" },
        ],
      },
      {
        name: "Operations",
        key: "ops",
        icon: "fa-solid fa-sitemap",
        isCollapsible: true,
        links: [
          { key: "customers", surfaceKey: "customers", label: i18n.navApps?.customers || "Customers", icon: "fa-solid fa-users" },
          { key: "vendors", surfaceKey: "vendors", label: i18n.navApps?.vendors || "Vendors", icon: "fa-solid fa-truck" },
          { key: "payments", surfaceKey: "payments", label: i18n.navApps?.payments || "Payments", icon: "fa-solid fa-credit-card" },
          { key: "reports", surfaceKey: "reports", label: i18n.navApps?.reports || "Reports", icon: "fa-solid fa-chart-line" },
        ],
      },
    ];
  }

  function buildSurfaceProfile(surfaceKey = "records", i18n = {}) {
    const surface = normalizeSurface(surfaceKey);
    const map = {
      records: {
        title: i18n.sectionrecordList || "Records",
        subtitle: i18n.headerSubtitle || "Unified shell",
        brandTitle: i18n.navApps?.accounting || "Accounting",
        breadcrumbs: buildShellBreadcrumbs(i18n),
      },
      customers: {
        title: i18n.navApps?.customers || "Customers",
        subtitle: i18n.shellSurfaceCustomersSubtitle || "Account and partner lifecycle with finance context.",
        brandTitle: i18n.navApps?.customers || "Customers",
        breadcrumbs: [
          { key: "home", label: i18n.breadcrumbHome || "Home", icon: "fa-solid fa-house", href: "#" },
          { key: "customers", label: i18n.navApps?.customers || "Customers", active: true },
        ],
      },
      vendors: {
        title: i18n.navApps?.vendors || "Vendors",
        subtitle: i18n.shellSurfaceVendorsSubtitle || "Supplier status, payables handoff, and procurement controls.",
        brandTitle: i18n.navApps?.vendors || "Vendors",
        breadcrumbs: [
          { key: "home", label: i18n.breadcrumbHome || "Home", icon: "fa-solid fa-house", href: "#" },
          { key: "vendors", label: i18n.navApps?.vendors || "Vendors", active: true },
        ],
      },
      payments: {
        title: i18n.navApps?.payments || "Payments",
        subtitle: i18n.shellSurfacePaymentsSubtitle || "Collections queue, reconciliation, and posting checkpoints.",
        brandTitle: i18n.navApps?.payments || "Payments",
        breadcrumbs: [
          { key: "home", label: i18n.breadcrumbHome || "Home", icon: "fa-solid fa-house", href: "#" },
          { key: "payments", label: i18n.navApps?.payments || "Payments", active: true },
        ],
      },
      reports: {
        title: i18n.navApps?.reports || "Reports",
        subtitle: i18n.shellSurfaceReportsSubtitle || "Executive metrics and operational drilldown from one shell.",
        brandTitle: i18n.navApps?.reports || "Reports",
        breadcrumbs: [
          { key: "home", label: i18n.breadcrumbHome || "Home", icon: "fa-solid fa-house", href: "#" },
          { key: "reports", label: i18n.navApps?.reports || "Reports", active: true },
        ],
      },
    };
    const selected = map[surface] || map.records;
    return {
      key: surface,
      title: selected.title,
      subtitle: selected.subtitle,
      breadcrumbs: selected.breadcrumbs,
      brand: {
        icon: "fa-file-invoice-dollar",
        title: selected.brandTitle,
        subtitle: selected.subtitle,
      },
      defaultFilter: surface === "payments" ? "overdue" : "all",
    };
  }


  function buildWorkspaceCards(i18n = {}) {
    return {
      primary: [
        {
          key: "collections",
          title: i18n.shellCardCollectionsTitle || "Collections focus",
          subtitle: i18n.shellCardCollectionsSubtitle || "Protect overdue revenue and assign the next contact motion.",
          icon: "fa-solid fa-sack-dollar",
          tone: "primary",
          ctaLabel: i18n.shellCtaOpen || "Open",
          badges: [i18n.navApps?.payments || "Payments", "Revenue"],
          bodyItems: [
            { label: i18n.filterOverdue || "Overdue", value: moneyFmt.format(sum(applyFilter(RAW_INVOICES, "overdue"), "residual")) },
            { label: i18n.shellCardOwner || "Owner", value: "Finance Lead" },
          ],
          footerItems: [{ label: i18n.shellCardNext || "Next", value: "Call top 2 accounts" }],
          assignees: [{ name: "Laura Soto", avatar: "https://i.pravatar.cc/64?u=finance-lead", status: "online" }],
          progress: { label: i18n.shellProgressCollection || "Collection coverage", value: 74, tone: "warning" },
          modes: ["overview", "execution"],
        },
        {
          key: "operations",
          title: i18n.shellCardOperationsTitle || "Operations handoff",
          subtitle: i18n.shellCardOperationsSubtitle || "Bridge execution, dispatch, and invoice readiness.",
          icon: "fa-solid fa-truck-ramp-box",
          tone: "default",
          ctaLabel: i18n.shellCtaReview || "Review",
          badges: [i18n.navApps?.rental || "Rental", i18n.navApps?.inventory || "Inventory"],
          bodyItems: [
            { label: i18n.shellCardDueToday || "Due today", value: "3 returns" },
            { label: i18n.shellCardQueue || "Queue", value: "Rental / Inventory" },
          ],
          footerItems: [{ label: i18n.shellCardNext || "Next", value: "Validate partial returns" }],
          assignees: [{ name: "Ivan Perez", avatar: "https://i.pravatar.cc/64?u=field-ops", status: "busy" }],
          progress: { label: i18n.shellProgressOperations || "Operational readiness", value: 63, tone: "primary" },
          modes: ["execution", "quality"],
        },
      ],
      secondary: [
        {
          key: "master-data",
          title: i18n.shellCardMasterDataTitle || "Master data watch",
          subtitle: i18n.shellCardMasterDataSubtitle || "Watch the records that usually break invoicing downstream.",
          icon: "fa-solid fa-address-book",
          tone: "default",
          ctaLabel: i18n.shellCtaInspect || "Inspect",
          badges: [i18n.navApps?.contacts || "Contacts", "Validation"],
          bodyItems: [
            { label: i18n.shellCardMissingRfc || "Missing RFC", value: "2 contacts" },
            { label: i18n.shellCardPendingCatalog || "Catalog review", value: "1 product family" },
          ],
          assignees: [{ name: "Nora Diaz", avatar: "https://i.pravatar.cc/64?u=rental-desk", status: "online" }],
          progress: { label: i18n.shellProgressQuality || "Quality score", value: 58, tone: "warning" },
          modes: ["quality", "execution"],
        },
        {
          key: "next-action",
          title: i18n.shellCardNextActionTitle || "Next action",
          subtitle: i18n.shellCardNextActionSubtitle || "The shortest path to the next meaningful move.",
          icon: "fa-solid fa-wand-magic-sparkles",
          tone: "primary",
          ctaLabel: i18n.newrecordButton || "+ New",
          badges: ["Priority", "Action"],
          bodyItems: [
            { label: i18n.shellCardStage || "Stage", value: "Draft to post" },
            { label: i18n.shellCardOwner || "Owner", value: "Jesus Chavez" },
          ],
          assignees: [{ name: "Jesus Chavez", avatar: "https://i.pravatar.cc/64?u=workspace-user", status: "online" }],
          progress: { label: i18n.shellProgressMomentum || "Momentum", value: 82, tone: "primary" },
          modes: ["overview", "execution", "quality"],
        },
      ],
    };
  }

  function findRecordById(recordId, rows = RAW_INVOICES) {
    const safeRows = Array.isArray(rows) && rows.length ? rows : RAW_INVOICES;
    if (!recordId) return safeRows[0] || null;
    return safeRows.find((row) => row.id === recordId) || safeRows[0] || null;
  }

  function buildDashboardSections(i18n = {}, rows = RAW_INVOICES) {
    const safeRows = Array.isArray(rows) && rows.length ? rows : RAW_INVOICES;
    const overdueRows = applyFilter(safeRows, "overdue");
    const pendingRows = applyFilter(safeRows, "pending");
    const draftRows = applyFilter(safeRows, "draft");
    const highestExposure = overdueRows.slice().sort((left, right) => (right.residual || 0) - (left.residual || 0))[0] || safeRows[0];
    const stampReady = draftRows.slice().sort((left, right) => (right.urgency || 0) - (left.urgency || 0))[0] || safeRows[0];
    const nextCollection = pendingRows.slice().sort((left, right) => new Date(left.dueDateIso) - new Date(right.dueDateIso))[0] || safeRows[0];

    return [
      {
        key: "collections",
        eyebrow: i18n.shellDashboardCollectionsEyebrow || "Collections board",
        title: i18n.shellDashboardCollectionsTitle || "Cash and promise control",
        subtitle: i18n.shellDashboardCollectionsSubtitle || "Widgets that prioritize cash protection before the operator gets lost in row-level work.",
        widgets: [
          {
            key: "overdue-hotspot",
            eyebrow: i18n.filterOverdue || "Overdue",
            title: highestExposure?.customer || "Exposure",
            metric: moneyFmt.format(highestExposure?.residual || 0),
            delta: `${overdueRows.length} ${i18n.kpirecordsSuffix || "records"}`,
            description: i18n.shellDashboardHotspotDescription || "Highest overdue balance with owner and next move already visible.",
            badges: [highestExposure?.owner || "Operations", highestExposure?.module || "Accounting"],
            meta: [
              { label: i18n.shellCardStage || "Stage", value: highestExposure?.stage || "Review" },
              { label: i18n.shellCardNext || "Next", value: "Commit payment date" },
            ],
            tone: "danger",
            ctaLabel: i18n.shellCtaOpen || "Open",
            filter: "overdue",
            recordId: highestExposure?.id || null,
            mode: "execution",
            score: highestExposure?.urgency || 0,
          },
          {
            key: "pending-window",
            eyebrow: i18n.filterPending || "Pending",
            title: i18n.shellDashboardPendingWindowTitle || "Due in the next 7 days",
            metric: String(pendingRows.length),
            delta: moneyFmt.format(sum(pendingRows, "residual")),
            description: i18n.shellDashboardPendingWindowDescription || "Pending balances that still have room for a clean reminder before due date turns red.",
            badges: [i18n.navApps?.payments || "Payments"],
            meta: [
              { label: i18n.shellCardOwner || "Owner", value: nextCollection?.owner || "Finance" },
              { label: i18n.tableDue || "Due", value: nextCollection?.dueDateIso || "-" },
            ],
            tone: "warning",
            ctaLabel: i18n.shellCtaReview || "Review",
            filter: "pending",
            recordId: nextCollection?.id || null,
            mode: "overview",
            score: nextCollection?.urgency || 0,
          },
        ],
      },
      {
        key: "quality",
        eyebrow: i18n.shellDashboardQualityEyebrow || "Quality board",
        title: i18n.shellDashboardQualityTitle || "Pre-posting integrity",
        subtitle: i18n.shellDashboardQualitySubtitle || "Buyniverse-style widgets that isolate what will break posting, stamping, or downstream collection.",
        widgets: [
          {
            key: "draft-flight-deck",
            eyebrow: i18n.filterDraft || "Draft",
            title: stampReady?.customer || "Draft review",
            metric: moneyFmt.format(stampReady?.total || 0),
            delta: `${draftRows.length} ${i18n.kpirecordsSuffix || "records"}`,
            description: i18n.shellDashboardDraftDescription || "Draft with the highest urgency score and the shortest path to posting.",
            badges: [i18n.navApps?.contacts || "Contacts", i18n.navApps?.accounting || "Accounting"],
            meta: [
              { label: i18n.shellCardMissingRfc || "Missing RFC", value: stampReady?.contactEmail ? "0" : "1" },
              { label: i18n.shellCardStage || "Stage", value: stampReady?.stage || "Backlog" },
            ],
            tone: "primary",
            ctaLabel: i18n.shellCtaInspect || "Inspect",
            filter: "draft",
            recordId: stampReady?.id || null,
            mode: "quality",
            score: stampReady?.urgency || 0,
          },
          {
            key: "master-data-breakers",
            eyebrow: i18n.shellInsightQualityEyebrow || "Quality",
            title: i18n.shellDashboardMasterDataTitle || "Master data blockers",
            metric: "2",
            delta: i18n.shellDashboardMasterDataDelta || "contacts missing fiscal data",
            description: i18n.shellDashboardMasterDataDescription || "Keep master data remediation in the same operating surface instead of forcing a context reset.",
            badges: [i18n.navApps?.contacts || "Contacts", "RFC"],
            meta: [
              { label: i18n.shellCardQueue || "Queue", value: "Contacts" },
              { label: i18n.shellCardNext || "Next", value: "Repair fiscal fields" },
            ],
            tone: "default",
            ctaLabel: i18n.shellCtaOpen || "Open",
            filter: "draft",
            recordId: stampReady?.id || null,
            mode: "quality",
            score: 58,
          },
        ],
      },
    ];
  }

  function buildDetailSections(record, i18n = {}) {
    if (!record) return [];
    return [
      {
        key: "account",
        title: i18n.shellDetailAccountTitle || "Account and ownership",
        subtitle: i18n.shellDetailAccountSubtitle || "Who owns the record and which module currently drives it.",
        fields: [
          { label: i18n.tableBillFrom || "Bill From", value: record.billFrom || "-" },
          { label: i18n.tableBillTo || "Bill To", value: record.billTo || "-" },
          { label: i18n.tableOwner || "Owner", value: record.owner || "-" },
          { label: i18n.tableModule || "Module", value: record.module || "-" },
        ],
      },
      {
        key: "finance",
        title: i18n.shellDetailFinanceTitle || "Financial posture",
        subtitle: i18n.shellDetailFinanceSubtitle || "Amounts, timing, and payment conditions aligned in one read.",
        fields: [
          { label: i18n.tableTotalCost || "Total Cost", value: record.amount || moneyFmt.format(record.total || 0) },
          { label: i18n.shellDetailResidual || "Residual", value: record.residualAmount || moneyFmt.format(record.residual || 0) },
          { label: i18n.tableCreated || "Created", value: record.issuedDateIso || "-" },
          { label: i18n.tableDue || "Due", value: record.dueDateIso || "-" },
          { label: i18n.tablePaymentTerm || "Payment Term", value: record.paymentTerm || "-" },
          { label: i18n.tableStage || "Stage", value: record.stage || "-" },
        ],
      },
      {
        key: "execution",
        title: i18n.shellDetailExecutionTitle || "Execution and quality",
        subtitle: i18n.shellDetailExecutionSubtitle || "Signals that decide whether the record can move without friction.",
        fields: [
          { label: i18n.tableEmail || "Email", value: record.contactEmail || "-" },
          { label: i18n.tableCollaborators || "Collaborators", value: (record.collaborators || []).join(", ") || "-" },
          { label: i18n.tableTags || "Tags", value: (record.tags || []).join(", ") || "-" },
          { label: i18n.tableUrgency || "Urgency", value: `${record.urgency || 0}%` },
          { label: i18n.tableRating || "Rating", value: `${record.rating || 0}/5` },
          { label: i18n.tableStatus || "Status", value: record.type || "-" },
        ],
      },
    ];
  }

  function buildOperationsSurfaceData(record, i18n = {}) {
    const safeRecord = record || RAW_INVOICES[0] || {};
    const baseId = String(safeRecord.id || "record");
    const customerSlug = String(safeRecord.customer || "customer")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const users = [
      { id: "workspace-user", name: "Jesus Chavez" },
      { id: "finance-lead", name: "Laura Soto" },
      { id: "ops-owner", name: "Ivan Perez" },
      { id: "data-owner", name: "Nora Diaz" },
    ];

    const comments = [
      {
        id: `${baseId}-comment-1`,
        userId: "finance-lead",
        text: i18n.shellOpsSeedCommentCollections || `Collections follow-up queued for ${safeRecord.customer || "the account"}.`,
        createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
        parentId: null,
      },
      {
        id: `${baseId}-comment-2`,
        userId: "ops-owner",
        text: i18n.shellOpsSeedCommentOps || "Operations confirms dispatch status and return window.",
        createdAt: new Date(Date.now() - 1000 * 60 * 27).toISOString(),
        parentId: null,
      },
      {
        id: `${baseId}-reply-1`,
        userId: "workspace-user",
        text: i18n.shellOpsSeedCommentReply || "Logged. Keeping this record in execution mode until posting passes.",
        createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        parentId: `${baseId}-comment-2`,
      },
    ];

    const files = [
      {
        id: `${baseId}-file-contract`,
        name: `${baseId.toLowerCase()}-contract.md`,
        path: `/contracts/${customerSlug}/`,
        content: `# ${safeRecord.id || "Record"}\\n\\nCustomer: ${safeRecord.customer || "-"}\\nStatus: ${safeRecord.type || "-"}\\n`,
        owner: "workspace-user",
        size: 1280,
        updatedAt: new Date().toISOString(),
      },
      {
        id: `${baseId}-file-intake`,
        name: "intake-checklist.md",
        path: "/operations/intake/",
        content: "- Validate fiscal data\\n- Confirm payment term\\n- Verify operational handoff\\n",
        owner: "ops-owner",
        size: 840,
        updatedAt: new Date().toISOString(),
      },
      {
        id: `${baseId}-file-evidence`,
        name: "payment-evidence.json",
        path: "/finance/evidence/",
        content: JSON.stringify(
          {
            record: safeRecord.id,
            residual: safeRecord.residualAmount || safeRecord.residual || 0,
            owner: safeRecord.owner || "Finance",
          },
          null,
          2
        ),
        owner: "finance-lead",
        size: 560,
        updatedAt: new Date().toISOString(),
      },
    ];

    const tasks = [
      {
        id: `${baseId}-task-1`,
        title: i18n.shellOpsSeedTaskReview || "Review fiscal profile",
        summary: "Validate RFC and fiscal regime before posting.",
        status: "new",
        comments: 2,
        attachments: 1,
        priority: "P1",
        milestoneId: `${baseId}-ms-1`,
      },
      {
        id: `${baseId}-task-2`,
        title: i18n.shellOpsSeedTaskCollections || "Collections call",
        summary: "Confirm commitment date with customer AP contact.",
        status: "in_progress",
        comments: 4,
        attachments: 0,
        priority: "P1",
        milestoneId: `${baseId}-ms-2`,
      },
      {
        id: `${baseId}-task-3`,
        title: i18n.shellOpsSeedTaskEvidence || "Attach payment evidence",
        summary: "Link bank evidence and reconcile residual.",
        status: "testing",
        comments: 1,
        attachments: 2,
        priority: "P2",
        milestoneId: `${baseId}-ms-2`,
      },
      {
        id: `${baseId}-task-4`,
        title: i18n.shellOpsSeedTaskApproval || "Posting approval",
        summary: "Get final approval before posting and stamping.",
        status: "awaiting_feedback",
        comments: 3,
        attachments: 1,
        priority: "P2",
        milestoneId: `${baseId}-ms-3`,
      },
      {
        id: `${baseId}-task-5`,
        title: i18n.shellOpsSeedTaskDone || "Close execution log",
        summary: "Record closure notes and archive evidence.",
        status: "complete",
        comments: 1,
        attachments: 3,
        priority: "P3",
        milestoneId: `${baseId}-ms-3`,
      },
    ];

    const milestones = [
      {
        id: `${baseId}-ms-1`,
        title: i18n.shellOpsSeedMilestoneIntake || "Intake readiness",
        status: "funded",
        owner: "Data Team",
        dueDate: safeRecord.issuedDateIso || "-",
        amount: safeRecord.amount || "$0.00",
      },
      {
        id: `${baseId}-ms-2`,
        title: i18n.shellOpsSeedMilestoneExecution || "Operational execution",
        status: "requested",
        owner: "Operations",
        dueDate: safeRecord.dueDateIso || "-",
        amount: safeRecord.residualAmount || "$0.00",
      },
      {
        id: `${baseId}-ms-3`,
        title: i18n.shellOpsSeedMilestoneClosure || "Financial closure",
        status: "pending",
        owner: "Finance",
        dueDate: safeRecord.dueDateIso || "-",
        amount: safeRecord.residualAmount || "$0.00",
      },
    ];

    const formSchema = [
      { key: "customer", type: "text", label: i18n.tableBillTo || "Bill To" },
      { key: "owner", type: "text", label: i18n.tableOwner || "Owner" },
      { key: "module", type: "select", label: i18n.tableModule || "Module", options: [
        { value: "Accounting", label: "Accounting" },
        { value: "Rental", label: "Rental" },
        { value: "Sales", label: "Sales" },
        { value: "Operations", label: "Operations" },
      ] },
      { key: "paymentTerm", type: "text", label: i18n.tablePaymentTerm || "Payment Term" },
      { key: "dueDateIso", type: "date", label: i18n.tableDue || "Due" },
      { key: "urgency", type: "number", label: i18n.tableUrgency || "Urgency" },
      { key: "tags", type: "tags", label: i18n.tableTags || "Tags" },
      { key: "rating", type: "rating", label: i18n.tableRating || "Rating" },
      { key: "notes", type: "textarea", label: i18n.shellExecutionNoteLabel || "Operator note" },
    ];

    const formModel = {
      customer: safeRecord.customer || "",
      owner: safeRecord.owner || "Operations",
      module: safeRecord.module || "Accounting",
      paymentTerm: safeRecord.paymentTerm || "Net 30",
      dueDateIso: safeRecord.dueDateIso || "",
      urgency: Number(safeRecord.urgency || 0),
      tags: Array.isArray(safeRecord.tags) ? safeRecord.tags.slice() : [],
      rating: Number(safeRecord.rating || 0),
      notes: `${safeRecord.id || ""} - ${safeRecord.customer || ""}`,
    };

    return {
      activeTab: "form",
      users,
      comments,
      files,
      tasks,
      milestones,
      form: {
        schema: formSchema,
        model: formModel,
      },
    };
  }


  const buildShellBrand = SHELL.buildShellBrand;
  const buildShellBreadcrumbs = SHELL.buildShellBreadcrumbs;
  const buildShellNotifications = SHELL.buildShellNotifications;
  const buildShellUtilityActions = SHELL.buildShellUtilityActions;
  const buildShellProfile = SHELL.buildShellProfile;
  const buildShellModes = SHELL.buildShellModes;
  const buildShellInsights = SHELL.buildShellInsights;
  const buildShellActivity = SHELL.buildShellActivity;
  const buildQuickCreateActions = SHELL.buildQuickCreateActions;
  const buildCommandPaletteActions = SHELL.buildCommandPaletteActions;

  function isPreviewMode() {
    const pathname = String(window.location.pathname || "").toLowerCase();
    const host = String(window.location.hostname || "").toLowerCase();
    return pathname.includes("/docs/app_ui_preview/") || host === "127.0.0.1" || host === "localhost";
  }

  ROOT.demo = Object.freeze({
    FILTER_ORDER,
    SURFACE_ORDER,
    isPreviewMode,
    getTableRows,
    getTableRowsBySurface,
    getMetricRows,
    getMetricRowsBySurface,
    buildKpis,
    buildSidebarCategories,
    buildSurfaceProfile,
    buildShellBrand,
    buildShellBreadcrumbs,
    buildShellNotifications,
    buildShellProfile,
    buildShellUtilityActions,
    buildShellModes,
    buildShellInsights,
    buildShellActivity,
    buildQuickCreateActions,
    buildWorkspaceCards,
    buildDashboardSections,
    buildDetailSections,
    buildOperationsSurfaceData,
    buildCommandPaletteActions,
    findRecordById,
  });
})();

