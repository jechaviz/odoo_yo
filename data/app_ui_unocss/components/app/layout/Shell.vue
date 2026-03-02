<template>
  <div class="app-pro-shell min-h-screen w-full text-ui-text font-sans" :class="themeClass">
    <Sidebar
      :is-collapsed="isSidebarCollapsed"
      :categories="navCategories"
      :active-filter="state.activeFilter"
      :active-surface="state.activeSurface || 'records'"
      :open-sections="openSections"
      :brand="shellBrand"
      :ui-text="state.i18n || {}"
      @toggle-section="toggleSection"
      @set-filter="$emit('set-filter', $event)"
      @set-surface="onSurfaceSelect"
      @open-mega="isMegaOpen = !isMegaOpen"
    />

    <div class="app-workspace relative">
      <Header
        :is-collapsed="isSidebarCollapsed"
        :ui-text="state.i18n || {}"
        :notifications="headerNotifications"
        :profile="headerProfile"
        :utility-actions="headerUtilityActions"
        :primary-action-label="headerPrimaryAction"
        @toggle-collapse="isSidebarCollapsed = !isSidebarCollapsed"
        @open-spotlight="$emit('open-spotlight')"
        @open-mega="isMegaOpen = !isMegaOpen"
        @mark-notifications-read="markNotificationsRead"
        @notification-select="onNotificationSelect"
        @primary-action="openQuickCreate"
        @profile-action="onProfileAction"
        @utility-action="onUtilityAction"
      />

      <main class="app-content-pane overflow-y-auto">
        <Breadcrumbs :items="breadcrumbs" @navigate="onBreadcrumbNavigate" />

        <header class="app-pane-header">
          <div class="app-pane-header-left">
            <h1 class="app-title-pro">{{ paneTitle }}</h1>
          </div>
          <div class="app-pane-header-right">
            <KPIs
              class="app-kpi-inline"
              :kpis="kpiData"
              :collapsed="true"
              @card-contextmenu="onKpiContextMenu"
              @card-select="onKpiSelect"
            />
          </div>
        </header>

        <Deck
          :active-mode="activeShellMode"
          :active-mode-meta="activeShellModeMeta"
          :mode-options="shellModeOptions"
          :ui-text="state.i18n || {}"
          :insights-title="shellInsightsTitle"
          :insights-subtitle="shellInsightsSubtitle"
          :insights="shellInsights"
          :activity-title="activityFeedTitle"
          :activity-subtitle="activityFeedSubtitle"
          :activity-empty="activityFeedEmpty"
          :activity-feed="activityFeed"
          :primary-panel="workspacePrimaryPanel"
          :secondary-panel="workspaceSecondaryPanel"
          :primary-cards="workspacePrimaryCards"
          :secondary-cards="workspaceSecondaryCards"
          :dashboard-title="dashboardTitle"
          :dashboard-subtitle="dashboardSubtitle"
          :dashboard-sections="dashboardSections"
          :detail-title="detailTitle"
          :detail-subtitle="detailSubtitle"
          :detail-eyebrow="detailEyebrow"
          :detail-cta="detailCta"
          :detail-empty="detailEmpty"
          :detail-record="selectedRecord"
          :detail-sections="detailSections"
          :operations-title="operationsTitle"
          :operations-subtitle="operationsSubtitle"
          :operations-data="operationsData"
          :operations-active-tab="operationsActiveTab"
          :panels="panelOpen"
          @mode-change="applyShellMode"
          @toggle-panel="togglePanel"
          @workspace-action="onWorkspaceAction"
          @workspace-contextmenu="onWorkspaceContextMenu"
          @activity-follow-link="onActivityFollowLink"
          @dashboard-widget-action="onDashboardWidgetAction"
          @dashboard-widget-contextmenu="onDashboardWidgetContextMenu"
          @detail-action="onDetailAction"
          @operations-update="onOperationsUpdate"
          @execution-action="onExecutionAction"
        />

        <section class="app-portal-card app-glass ui-card">
          <nav class="app-portal-tabs">
            <div
              v-for="chip in filterChips"
              :key="chip.key"
              class="app-tab ui-soft-hover"
              :class="{ 'is-tab-active': state.activeFilter === chip.key }"
              @click="applyFilterSelection(chip.key)"
              role="button"
              tabindex="0"
            >
              {{ chip.label }}
            </div>
          </nav>

          <div class="app-portal-content">
            <DataTable
              :view-mode="viewMode"
              :rows="state.tableRows || []"
              :i18n="state.i18n || {}"
              :counts="state.counts || {}"
              :loading="state.loading"
              :page-size="state.tablePageSize || 10"
              :current-page="state.tablePage || 1"
              @search="$emit('search', $event)"
              @update-view="viewMode = $event"
              @update-page="state.tablePage = $event"
              @update-page-size="state.tablePageSize = $event"
              @new-record="$emit('new-record')"
            >
              <template #content="{ viewMode }">
                <slot name="table" :viewMode="viewMode"></slot>
              </template>
            </DataTable>
          </div>
        </section>
      </main>
    </div>

    <ShellContextMenu
      :visible="contextMenu.visible"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :items="contextMenu.items"
      @close="closeContextMenu"
      @select="handleContextAction"
    />

    <MegaMenu :visible="isMegaOpen" :apps="apps" :card="megaCard" @close="isMegaOpen = false" @open-app="goApp" />

    <QuickCreateModal
      :visible="quickCreateOpen"
      :title="quickCreateTitle"
      :subtitle="quickCreateSubtitle"
      :actions="quickCreateActions"
      @close="quickCreateOpen = false"
      @select-action="handleQuickCreateAction"
    />
  </div>
</template>

<script>
import DataTable from 'app/datatable/DataTable.vue';
import Breadcrumbs from 'app/layout/Breadcrumbs.vue';
import Header from 'app/layout/Header.vue';
import KPIs from 'app/layout/KPIs.vue';
import MegaMenu from 'app/layout/MegaMenu.vue';
import Sidebar from 'app/layout/Sidebar.vue';
import DataCard from 'app/workspace/DataCard.vue';
import Deck from 'app/workspace/Deck.vue';
import QuickCreateModal from 'app/workspace/QuickCreateModal.vue';
import ShellContextMenu from 'app/workspace/ShellContextMenu.vue';

const DEMO = window.odooApp?.demo;

export default {
  name: 'Shell',
  components: {
    Breadcrumbs,
    DataCard,
    DataTable,
    Deck,
    Header,
    KPIs,
    MegaMenu,
    QuickCreateModal,
    ShellContextMenu,
    Sidebar,
  },
  emits: ['new-record', 'open-spotlight', 'search', 'set-filter'],
  props: {
    state: { type: Object, required: true },
    apps: { type: Array, required: true },
  },
  data() {
    return {
      isSidebarCollapsed: true,
      isMegaOpen: false,
      quickCreateOpen: false,
      viewMode: 'table',
      panelOpen: {
        primary: true,
        secondary: true,
        dashboard: true,
        detail: true,
        operations: true,
        execution: true,
      },
      contextMenu: {
        visible: false,
        x: 0,
        y: 0,
        items: [],
        payload: null,
      },
      openSections: {
        purchases: true,
        sales: true,
      },
    };
  },
  watch: {
    selectedRecord: {
      immediate: true,
      handler(nextRecord) {
        this.ensureOperationsRecord(nextRecord);
      },
    },
  },
  computed: {
    surfaceProfile() {
      return this.demoCall('buildSurfaceProfile', {}, this.state.activeSurface || 'records', this.state.i18n || {});
    },
    breadcrumbs() {
      if (Array.isArray(this.surfaceProfile?.breadcrumbs) && this.surfaceProfile.breadcrumbs.length) {
        return this.surfaceProfile.breadcrumbs;
      }
      return this.state.breadcrumbs?.length
        ? this.state.breadcrumbs
        : this.demoCall('buildShellBreadcrumbs', [], this.state.i18n || {});
    },
    paneTitle() {
      return this.surfaceProfile?.title || this.state.i18n?.sectionrecordList || 'Records';
    },
    activeShellMode() {
      return this.state.shellMode || this.shellModeOptions[0]?.value || 'overview';
    },
    activeShellModeMeta() {
      return this.shellModeOptions.find((mode) => mode.value === this.activeShellMode)
        || this.shellModeOptions[0]
        || { value: 'overview', label: 'Overview', description: '' };
    },
    navCategories() {
      if (DEMO?.buildSidebarCategories) {
        return DEMO.buildSidebarCategories(this.state.i18n || {}, this.state.counts || {});
      }
      return [];
    },
    shellModeOptions() {
      return this.state.shellModes?.length
        ? this.state.shellModes
        : this.demoCall('buildShellModes', [], this.state.i18n || {});
    },
    shellInsights() {
      return this.state.shellInsights?.length
        ? this.state.shellInsights
        : this.demoCall('buildShellInsights', [], this.state.i18n || {});
    },
    shellInsightsTitle() {
      return this.state.i18n?.shellInsightsTitle || 'System posture';
    },
    shellInsightsSubtitle() {
      return this.state.i18n?.shellInsightsSubtitle || 'Reusable shell signals shared across apps, not tied to one table.';
    },
    activityFeed() {
      return this.state.activityFeed?.length
        ? this.state.activityFeed
        : this.demoCall('buildShellActivity', [], this.state.i18n || {});
    },
    activityFeedTitle() {
      return this.state.i18n?.shellActivityTitle || 'Activity feed';
    },
    activityFeedSubtitle() {
      return this.state.i18n?.shellActivitySubtitle || 'Cross-app events that explain why the shell changed, not just what changed.';
    },
    activityFeedEmpty() {
      return this.state.i18n?.shellActivityEmpty || 'No activity yet.';
    },
    filterChips() {
      const i = this.state.i18n || {};
      return [
        { key: 'all', label: i.filterAll || 'All' },
        { key: 'paid', label: i.filterPaid || 'Paid' },
        { key: 'overdue', label: i.filterOverdue || 'Overdue' },
        { key: 'pending', label: i.filterPending || 'Pending' },
        { key: 'draft', label: i.filterDraft || 'Draft' },
      ];
    },
    quickCreateTitle() {
      return this.state.i18n?.shellQuickCreateTitle || 'Create in context';
    },
    quickCreateSubtitle() {
      return this.state.i18n?.shellQuickCreateSubtitle || 'Start the next workflow without losing the current app shell.';
    },
    quickCreateActions() {
      return this.state.quickCreateActions?.length
        ? this.state.quickCreateActions
        : this.demoCall('buildQuickCreateActions', [], this.state.i18n || {});
    },
    kpiData() {
      if (this.state?.kpis?.cards?.length) return this.state.kpis.cards;
      const i = this.state.i18n || {};
      return [
        { label: i.filterPending || 'Pending', value: '$0.00', count: 0, color: '#f59e0b', type: 'pending' },
        { label: i.filterOverdue || 'Overdue', value: '$5,706.00', count: 2, color: '#ef4444', type: 'overdue' },
      ];
    },
    themeClass() {
      return this.state.themeMode === 'ice' ? 'is-theme-ice' : 'is-theme-night';
    },
    shellBrand() {
      if (this.surfaceProfile?.brand) return this.surfaceProfile.brand;
      return this.state.shellBrand || {
        icon: 'fa-file-invoice-dollar',
        title: this.state.i18n?.navApps?.accounting || 'Accounting',
        subtitle: this.state.i18n?.headerSubtitle || 'Unified shell',
      };
    },
    headerNotifications() {
      return Array.isArray(this.state.notifications) ? this.state.notifications : this.demoNotifications();
    },
    headerProfile() {
      return this.state.profile || this.demoProfile();
    },
    headerUtilityActions() {
      return this.state.utilityActions?.length
        ? this.state.utilityActions
        : this.demoCall('buildShellUtilityActions', [], this.state.i18n || {});
    },
    headerPrimaryAction() {
      return this.state.primaryActionLabel || this.state.i18n?.headerCreateNew || 'Create New';
    },
    workspacePrimaryPanel() {
      const i = this.state.i18n || {};
      return {
        title: i.shellPanelPrimaryTitle || 'Workspace signals',
        subtitle: i.shellPanelPrimarySubtitle || 'Cross-app cards that surface collections, operations, and master data checkpoints.',
        icon: 'fa-solid fa-layer-group',
      };
    },
    workspaceSecondaryPanel() {
      const i = this.state.i18n || {};
      return {
        title: i.shellPanelSecondaryTitle || 'Execution shortcuts',
        subtitle: i.shellPanelSecondarySubtitle || 'Compact cards for the next action, context owner, and related surfaces.',
        icon: 'fa-solid fa-bolt',
      };
    },
    workspacePrimaryCards() {
      const cards = Array.isArray(this.state.workspaceCards?.primary)
        ? this.state.workspaceCards.primary
        : this.demoCall('buildWorkspaceCards', { primary: [], secondary: [] }, this.state.i18n || {}, this.state.activeSurface || 'records').primary;
      return cards.filter((card) => this.matchesMode(card));
    },
    workspaceSecondaryCards() {
      const cards = Array.isArray(this.state.workspaceCards?.secondary)
        ? this.state.workspaceCards.secondary
        : this.demoCall('buildWorkspaceCards', { primary: [], secondary: [] }, this.state.i18n || {}, this.state.activeSurface || 'records').secondary;
      return cards.filter((card) => this.matchesMode(card));
    },
    dashboardTitle() {
      return this.state.i18n?.shellDashboardTitle || 'Operational dashboard';
    },
    dashboardSubtitle() {
      return this.state.i18n?.shellDashboardSubtitle || 'Grouped widgets adapted from Buyniverse to keep analysis and action in the same shell.';
    },
    dashboardSections() {
      const sections = this.state.dashboardSections?.length
        ? this.state.dashboardSections
        : this.demoCall('buildDashboardSections', [], this.state.i18n || {}, this.allRows(), this.state.activeSurface || 'records');
      return sections.map((section) => ({
        ...section,
        widgets: (section.widgets || []).filter((widget) => this.matchesMode(widget)),
      }));
    },
    selectedRecord() {
      const allRows = this.allRows();
      const activeRows = Array.isArray(this.state.tableRows) && this.state.tableRows.length ? this.state.tableRows : allRows;
      return activeRows.find((row) => row.id === this.state.focusRecordId)
        || allRows.find((row) => row.id === this.state.focusRecordId)
        || activeRows[0]
        || allRows[0]
        || null;
    },
    detailTitle() {
      return this.state.i18n?.shellDetailTitle || 'Record detail';
    },
    detailSubtitle() {
      return this.state.i18n?.shellDetailSubtitle || 'A structured read of the selected record, not a raw form dump.';
    },
    detailEyebrow() {
      return this.state.i18n?.shellDetailEyebrow || 'Focused record';
    },
    detailCta() {
      return this.state.i18n?.shellDetailCta || 'Focus in table';
    },
    detailEmpty() {
      return this.state.i18n?.shellDetailEmpty || 'No active record to inspect.';
    },
    detailSections() {
      return this.demoCall('buildDetailSections', [], this.selectedRecord, this.state.i18n || {});
    },
    operationsTitle() {
      return this.state.i18n?.shellOpsTitle || 'Operations surfaces';
    },
    operationsSubtitle() {
      return this.state.i18n?.shellOpsSubtitle || 'Form, comments, files, tasks, and milestones in a single context-preserving panel.';
    },
    operationsData() {
      const recordId = this.selectedRecord?.id;
      if (!recordId) return {};
      return this.state.operationsByRecord?.[recordId] || {};
    },
    operationsActiveTab() {
      return this.state.operationsTab || 'form';
    },
    megaCard() {
      const i = this.state.i18n || {};
      return {
        title: i.shellMegaTitle || 'Cross-app handoff',
        subtitle: i.shellMegaSubtitle || 'Use the same shell to move from accounting into contacts, payments, reports, and operations without losing context.',
        icon: 'fa-solid fa-diagram-project',
        tone: 'primary',
        ctaLabel: i.navViewAllApps || 'View all apps',
        bodyItems: [
          { label: i.shellCardOwner || 'Owner', value: this.headerProfile.name || 'Workspace User' },
          { label: i.shellCardQueue || 'Queue', value: 'Accounting / Rental / Contacts' },
        ],
        footerItems: [{ label: i.shellCardNext || 'Next', value: 'Pick a module and continue' }],
      };
    },
  },
  methods: {
    demoCall(name, fallback, ...args) {
      return typeof DEMO?.[name] === 'function' ? DEMO[name](...args) : fallback;
    },
    allRows() {
      const surface = this.state.activeSurface || 'records';
      return this.demoCall('getTableRowsBySurface', this.demoCall('getTableRows', [], 'all', '', this.state.i18n || {}), surface, 'all', '', this.state.i18n || {});
    },
    ensureOperationsRecord(record) {
      const recordId = record?.id;
      if (!recordId) return;
      if (!this.state.operationsByRecord) this.state.operationsByRecord = {};
      if (this.state.operationsByRecord[recordId]) return;
      const seed = this.demoCall('buildOperationsSurfaceData', {}, record, this.state.i18n || {});
      this.state.operationsByRecord = {
        ...this.state.operationsByRecord,
        [recordId]: seed,
      };
      if (!this.state.operationsTab) this.state.operationsTab = seed?.activeTab || 'form';
    },
    applyShellMode(mode) {
      this.state.shellMode = mode;
    },
    togglePanel(name) {
      this.panelOpen[name] = !this.panelOpen[name];
    },
    closeContextMenu() {
      this.contextMenu.visible = false;
      this.contextMenu.items = [];
      this.contextMenu.payload = null;
    },
    demoNotifications() {
      return this.demoCall('buildShellNotifications', [], this.state.i18n || {});
    },
    demoProfile() {
      return this.demoCall('buildShellProfile', {}, this.state.i18n || {});
    },
    openQuickCreate() {
      this.quickCreateOpen = true;
    },
    goApp(app) {
      if (app?.href) window.location.href = app.href;
      this.isMegaOpen = false;
    },
    onBreadcrumbNavigate(item) {
      if (item?.key === 'home') {
        this.applyFilterSelection('all');
        return;
      }
      if (item?.href && item.href !== '#') window.location.href = item.href;
    },
    onSurfaceSelect(surfaceKey) {
      const nextSurface = String(surfaceKey || 'records');
      this.state.activeSurface = nextSurface;
      const profile = this.demoCall('buildSurfaceProfile', {}, nextSurface, this.state.i18n || {});
      this.state.surfaceProfile = profile;
      const defaultFilter = profile?.defaultFilter || 'all';
      this.applyFilterSelection(defaultFilter);
    },
    handleContextAction(item) {
      const key = item?.key || '';
      if (key === 'filter-overdue') this.applyFilterSelection('overdue');
      if (key === 'filter-pending') this.applyFilterSelection('pending');
      if (key === 'new-record') this.$emit('new-record');
      if (key === 'inspect-record' && this.contextMenu?.payload?.recordId) {
        this.state.focusRecordId = this.contextMenu.payload.recordId;
        this.panelOpen.detail = true;
      }
      if (key === 'open-app' && item.href) window.location.href = item.href;
      if (key === 'copy-value' && this.contextMenu?.payload?.value && navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(String(this.contextMenu.payload.value));
      }
      this.closeContextMenu();
    },
    handleQuickCreateAction(action) {
      this.quickCreateOpen = false;
      if (!action) return;
      if (action.href) {
        window.location.href = action.href;
        return;
      }
      this.$emit('new-record');
    },
    matchesMode(entity) {
      const modes = Array.isArray(entity?.modes) ? entity.modes : [];
      return !modes.length || modes.includes(this.activeShellMode);
    },
    markNotificationsRead() {
      this.state.notifications = this.headerNotifications.map((item) => ({ ...item, read: true }));
    },
    onKpiContextMenu(payload) {
      const kpi = payload?.kpi || {};
      this.openContextMenu(payload?.event, [
        { key: `filter-${kpi.type || 'all'}`, label: `Focus ${kpi.label || 'status'}`, icon: 'fa-solid fa-filter' },
        { key: 'copy-value', label: 'Copy metric value', icon: 'fa-solid fa-copy' },
      ], { value: kpi.value, kpi });
    },
    onKpiSelect(kpi) {
      if (kpi?.type) this.applyFilterSelection(kpi.type);
    },
    onNotificationSelect(item) {
      if (!item) return;
      this.state.notifications = this.headerNotifications.map((entry) => (
        entry.id === item.id ? { ...entry, read: true } : entry
      ));
    },
    onProfileAction(item) {
      if (!item) return;
      if (item.key === 'switch-user' && item.user) {
        this.state.profile = { ...this.headerProfile, name: item.user.name, role: item.user.role, avatar: item.user.avatar };
        return;
      }
      if (item.key === 'settings') this.isMegaOpen = true;
      if (item.key === 'profile') this.applyShellMode('overview');
    },
    onWorkspaceAction(card) {
      if (card?.key === 'next-action') {
        this.$emit('new-record');
        return;
      }
      if (card?.key === 'master-data') {
        this.goApp(this.apps.find((app) => app.key === 'contacts') || {});
      }
    },
    onActivityFollowLink(item) {
      if (!item) return;
      if (item.link?.href && item.link.href !== '#') {
        window.location.href = item.link.href;
        return;
      }
      if (item.type === 'QUALITY_ALERT') this.applyShellMode('quality');
      if (item.type === 'STATUS_CHANGE') this.applyFilterSelection('draft');
      if (item.type === 'TASK_ASSIGNED') this.applyShellMode('execution');
    },
    onWorkspaceContextMenu(payload) {
      const openApp = this.apps.find((app) => app.key === 'contacts');
      this.openContextMenu(payload?.event, [
        { key: 'open-app', label: payload?.card?.ctaLabel || 'Open card target', icon: 'fa-solid fa-arrow-up-right-from-square', href: openApp?.href || '' },
        { type: 'separator' },
        { key: 'copy-value', label: 'Copy primary signal', icon: 'fa-solid fa-copy' },
      ], { value: payload?.card?.bodyItems?.[0]?.value || '', card: payload?.card });
    },
    onDashboardWidgetAction(widget) {
      if (!widget) return;
      if (widget.mode) this.applyShellMode(widget.mode);
      if (widget.recordId) {
        this.state.focusRecordId = widget.recordId;
        this.panelOpen.detail = true;
      }
      if (widget.filter) this.applyFilterSelection(widget.filter);
    },
    onDashboardWidgetContextMenu(payload) {
      const widget = payload?.widget;
      this.openContextMenu(payload?.event, [
        { key: widget?.filter ? `filter-${widget.filter}` : 'filter-overdue', label: widget?.ctaLabel || 'Focus widget signal', icon: 'fa-solid fa-bullseye' },
        { key: 'inspect-record', label: 'Inspect record detail', icon: 'fa-solid fa-circle-info' },
        { type: 'separator' },
        { key: 'copy-value', label: 'Copy widget metric', icon: 'fa-solid fa-copy' },
      ], { value: widget?.metric || '', recordId: widget?.recordId || null, widget });
    },
    onDetailAction(record) {
      if (!record) return;
      this.state.focusRecordId = record.id;
      this.applyFilterSelection(record.type || 'all');
    },
    onOperationsUpdate(payload) {
      const recordId = payload?.recordId || this.selectedRecord?.id;
      if (!recordId) return;
      if (!this.state.operationsByRecord) this.state.operationsByRecord = {};
      const current = this.state.operationsByRecord[recordId] || {};
      const incoming = payload?.data || current;
      const currentJson = JSON.stringify(current);
      const incomingJson = JSON.stringify(incoming);
      if (currentJson !== incomingJson) {
        this.state.operationsByRecord = {
          ...this.state.operationsByRecord,
          [recordId]: incoming,
        };
      }
      if (payload?.tab && this.state.operationsTab !== payload.tab) this.state.operationsTab = payload.tab;
    },
    openContextMenu(event, items, payload = null) {
      if (!event) return;
      this.contextMenu.x = Number(event.clientX || 0) + (window.scrollX || 0);
      this.contextMenu.y = Number(event.clientY || 0) + (window.scrollY || 0);
      this.contextMenu.items = items;
      this.contextMenu.payload = payload;
      this.contextMenu.visible = true;
    },
    applyFilterSelection(filterName) {
      this.state.activeFilter = filterName;
      this.state.tablePage = 1;
      const surface = this.state.activeSurface || 'records';
      this.state.tableRows = this.demoCall(
        'getTableRowsBySurface',
        this.demoCall('getTableRows', [], filterName, this.state.tableQuery || '', this.state.i18n || {}),
        surface,
        filterName,
        this.state.tableQuery || '',
        this.state.i18n || {}
      );
      if (!this.state.tableRows.some((row) => row.id === this.state.focusRecordId)) {
        this.state.focusRecordId = this.state.tableRows[0]?.id || this.allRows()[0]?.id || null;
      }
      this.$emit('set-filter', filterName);
    },
    onUtilityAction(action) {
      if (!action?.key) return;
      if (action.key === 'assistant') this.$emit('open-spotlight');
      if (action.key === 'discuss') this.quickCreateOpen = true;
      if (action.key === 'activities') {
        this.panelOpen.secondary = true;
        this.applyShellMode('execution');
      }
      if (action.key === 'theme') this.state.themeMode = this.state.themeMode === 'ice' ? 'night' : 'ice';
    },
    onExecutionAction(payload) {
      if (!payload?.record) return;
      const note = String(payload.note || '').trim();
      const activityItem = {
        id: `execution-${Date.now()}`,
        key: `execution-${payload.record.id}`,
        type: payload.type === 'followup' ? 'TASK_ASSIGNED' : 'COMMENT',
        tone: payload.type === 'followup' ? 'warning' : 'primary',
        label: payload.type === 'followup' ? 'Follow-up created' : 'Execution note',
        text: note || `updated ${payload.record.id} inside the execution pad.`,
        timestamp: new Date().toISOString(),
        user: { name: this.headerProfile.name, avatar: this.headerProfile.avatar, status: 'online' },
        link: { text: 'Focus record', href: '#' },
      };
      this.state.activityFeed = [activityItem, ...(Array.isArray(this.state.activityFeed) ? this.state.activityFeed : this.activityFeed)];
      this.state.notifications = [
        {
          id: `notif-${Date.now()}`,
          title: payload.type === 'followup' ? 'Follow-up queued' : 'Execution note saved',
          text: payload.record.id,
          time: 'just now',
          read: false,
        },
        ...(Array.isArray(this.state.notifications) ? this.state.notifications : this.headerNotifications),
      ];
      this.applyShellMode('execution');
      this.panelOpen.secondary = true;
    },
    toggleSection(key) {
      this.openSections[key] = !this.openSections[key];
    },
  },
};
</script>
