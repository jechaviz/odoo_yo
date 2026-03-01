<template>
  <div class="app-pro-shell">
    <AppSidebar
      :is-collapsed="isSidebarCollapsed"
      :categories="navCategories"
      :active-filter="state.activeFilter"
      :open-sections="openSections"
      @toggle-collapse="isSidebarCollapsed = !isSidebarCollapsed"
      @toggle-section="toggleSection"
      @set-filter="$emit('set-filter', $event)"
      @open-mega="isMegaOpen = !isMegaOpen"
    />

    <div class="app-workspace">
      <AppHeader
        :is-collapsed="isSidebarCollapsed"
        @toggle-collapse="isSidebarCollapsed = !isSidebarCollapsed"
        @open-spotlight="$emit('open-spotlight')"
        @open-mega="isMegaOpen = !isMegaOpen"
      />

      <main class="app-content-pane">
        <nav class="app-breadcrumbs">
          <a href="#" class="app-bc-item navigable" @click.prevent="goHome">
            <i class="fa-solid fa-house"></i>
            Home
          </a>
          <i class="fa-solid fa-chevron-right app-bc-sep"></i>
          <span class="app-bc-item active">Records</span>
        </nav>

        <header class="app-pane-header">
          <div class="app-pane-header-left">
            <h1 class="app-title-pro">Records</h1>
          </div>
          <div class="app-pane-header-right">
            <AppKPIs class="app-kpi-inline" :kpis="kpiData" :collapsed="true" />
          </div>
        </header>

        <section class="app-portal-card app-glass">
          <nav class="app-portal-tabs">
            <div
              v-for="chip in filterChips"
              :key="chip.key"
              class="app-tab"
              :class="{ 'is-tab-active': state.activeFilter === chip.key }"
              @click="$emit('set-filter', chip.key)"
              role="button"
              tabindex="0"
            >
              {{ chip.label }}
            </div>
          </nav>

          <div class="app-portal-content">
            <AppDataTable
              :view-mode="viewMode"
              @search="$emit('search', $event)"
              @update-view="viewMode = $event"
              @new-record="$emit('new-record')"
            >
              <template #content="{ viewMode }">
                <slot name="table" :viewMode="viewMode"></slot>
              </template>
            </AppDataTable>
          </div>
        </section>
      </main>
    </div>

    <!-- Mega Menu Modal -->
    <Teleport to="body">
      <div v-if="isMegaOpen" class="app-mega-menu-overlay" @click.self="isMegaOpen = false">
        <div class="app-mega-modal app-glass-heavy">
          <div class="app-mega-grid">
            <div class="app-mega-apps">
              <div v-for="app in apps" :key="app.key" class="app-mega-card" @click="goApp(app)">
                <div class="app-mega-icon app-glass" :style="{ color: app.color || 'var(--app-primary)' }">
                  <i :class="app.icon"></i>
                </div>
                <div class="app-mega-info">
                  <span class="app-mega-title">{{ app.label }}</span>
                  <span class="app-mega-desc">{{ app.description || 'Open module' }}</span>
                </div>
              </div>
            </div>
            <div class="app-mega-aside">
              <div class="app-mega-promo">
                <h3>Appniverse Portal</h3>
                <p>Unified enterprise experience. Unlock advanced analytics and automated workflows.</p>
                <div class="app-btn-blue-pro sm" role="button" tabindex="0">Learn More</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import AppSidebar from './AppSidebar.vue';
import AppHeader from './AppHeader.vue';
import AppKPIs from './AppKPIs.vue';
import AppDataTable from './AppDataTable.vue';

export default {
  components: {
    AppSidebar,
    AppHeader,
    AppKPIs,
    AppDataTable,
  },
  props: {
    state: { type: Object, required: true },
    apps: { type: Array, required: true },
  },
  data() {
    return {
      isSidebarCollapsed: true,
      isMegaOpen: false,
      leaveTimeout: null,
      viewMode: 'table',
      openSections: {
        purchases: true,
        sales: true,
      },
    };
  },
  computed: {
    navCategories() {
      const i = this.state.i18n || {};
      return [
        {
          name: 'PURCHASES',
          key: 'purchases',
          icon: 'fa-solid fa-cart-shopping',
          isCollapsible: true,
          links: [
            { key: 'projects', label: i.menuProjects || 'Projects', icon: 'fa-solid fa-folder' },
            { key: 'suppliers', label: i.menuSuppliers || 'Suppliers', icon: 'fa-solid fa-truck-field' },
            { key: 'expenses', label: i.menuExpenses || 'Expenses', icon: 'fa-solid fa-money-bill-wave' },
          ],
        },
        {
          name: 'SALES',
          key: 'sales',
          icon: 'fa-solid fa-tag',
          isCollapsible: true,
          links: [
            { key: 'customers', label: i.menuCustomers || 'Clients', icon: 'fa-solid fa-user-tie' },
            { key: 'all', label: i.menurecords || 'records', icon: '' },
            { key: 'estimates', label: i.menuEstimates || 'Estimates', icon: '' },
            { key: 'payments', label: i.menuPayments || 'Payments', icon: 'fa-solid fa-credit-card' },
          ],
        },
      ];
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
    kpiData() {
      const i = this.state.i18n || {};
      return [
        { label: i.filterPending || 'Pending', value: '$0.00', count: 0, color: '#f59e0b', type: 'pending' },
        { label: i.filterOverdue || 'Overdue', value: '$5,706.00', count: 2, color: '#ef4444', type: 'overdue' },
      ];
    },
  },
  methods: {
    handleMouseEnterBrand() {
      if (this.leaveTimeout) clearTimeout(this.leaveTimeout);
      this.isMegaOpen = true;
    },
    handleMouseLeave() {
      this.leaveTimeout = setTimeout(() => {
        this.isMegaOpen = false;
      }, 200);
    },
    handleMouseEnterMenu() {
      if (this.leaveTimeout) clearTimeout(this.leaveTimeout);
    },
    toggleSection(key) {
      this.openSections[key] = !this.openSections[key];
    },
    goHome() {
      this.$emit('set-filter', 'all');
    },
    goApp(app) {
      if (app.href) window.location.href = app.href;
      this.isMegaOpen = false;
    },
  },
};
</script>

<style>
/* Scoped overrides only - core styles moved to css/* modular files */
</style>
