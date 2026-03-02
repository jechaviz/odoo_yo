<template>
  <aside class="app-sidebar app-glass-heavy" :class="{ collapsed: isCollapsed }">
    <div
      class="app-sidebar-brand"
      @mouseenter="hoverBrand = true"
      @mouseleave="hoverBrand = false"
      @click="$emit('open-mega')"
    >
      <div class="app-brand-logo" :class="{ 'apps-mode': hoverBrand }">
        <i class="fa-solid" :class="hoverBrand ? 'fa-grip' : brandIcon"></i>
      </div>
      <div class="app-brand-copy">
        <span class="app-brand-name">{{ hoverBrand ? brandAppsLabel : brandTitle }}</span>
        <small class="app-brand-subtitle">{{ hoverBrand ? brandAppsHint : brandSubtitle }}</small>
      </div>
      <i class="fa-solid fa-chevron-down app-brand-chevron"></i>
    </div>

    <nav class="app-sidebar-nav">
      <div v-for="cat in categories" :key="cat.name" class="app-nav-group">
        <div class="app-nav-label-wrapper" @click="cat.isCollapsible && toggleSection(cat.key)">
          <i v-if="cat.icon" :class="cat.icon" class="app-cat-icon"></i>
          <span class="app-nav-label">{{ cat.name }}</span>
          <span class="app-sidebar-floating-label">{{ cat.name }}</span>
          <i
            v-if="cat.isCollapsible"
            class="fa-solid fa-chevron-right app-cat-chevron"
            :class="{ 'rotate-90': openSections[cat.key] && !isCollapsed }"
          ></i>
        </div>
        <div
          class="app-nav-links"
          :class="{ 'has-active': hasActiveLink(cat) }"
          v-show="!cat.isCollapsible || (openSections[cat.key] && !isCollapsed) || isCollapsed"
        >
          <a
            v-for="link in cat.links"
            :key="link.key"
            :href="link.href || '#'"
            class="app-nav-item"
            :class="{ active: isLinkActive(link), 'is-dot-only': !link.icon }"
            @click.prevent="handleNav(link)"
          >
            <i v-if="link.icon" :class="link.icon" class="app-nav-icon"></i>
            <span v-else class="app-nav-dot" aria-hidden="true"></span>
            <span class="app-item-text">{{ link.label }}</span>
            <span v-if="link.badge && !isCollapsed" class="app-nav-badge">{{ link.badge }}</span>
            <span class="app-sidebar-floating-label">
              <span class="cat-ctx">{{ cat.name }}</span>
              <i class="fa-solid fa-chevron-right ctx-sep"></i>
              <span class="item-name">{{ link.label }}</span>
            </span>
          </a>
        </div>
      </div>
    </nav>

    <div class="app-sidebar-util">
      <div class="app-util-wrapper" @mouseenter="handleSettingsEnter" @mouseleave="handleSettingsLeave">
        <button type="button" class="app-sidebar-settings-btn" @click.stop>
          <i class="fa-solid fa-gear"></i>
          <span v-if="!isCollapsed" class="app-util-text">{{ settingsLabel }}</span>
        </button>
        <Transition name="app-fade-pro">
          <div v-if="showSettings" class="app-settings-popup app-glass-heavy">
            <div class="app-popup-header">{{ settingsPopupTitle }}</div>
            <div class="app-popup-list">
              <button type="button" class="app-popup-item" @click="$emit('open-mega')">
                <i class="fa-solid fa-cubes-stacked"></i>
                <span>{{ settingsAppsLabel }}</span>
              </button>
              <button type="button" class="app-popup-item">
                <i class="fa-solid fa-user-gear"></i>
                <span>{{ settingsProfileLabel }}</span>
              </button>
              <button type="button" class="app-popup-item">
                <i class="fa-solid fa-sliders"></i>
                <span>{{ settingsSystemLabel }}</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'Sidebar',
  emits: ['open-mega', 'set-filter', 'set-surface', 'toggle-section'],
  props: {
    isCollapsed: { type: Boolean, default: false },
    categories: { type: Array, required: true },
    activeFilter: { type: String, default: 'all' },
    activeSurface: { type: String, default: 'records' },
    openSections: { type: Object, required: true },
    brand: {
      type: Object,
      default: () => ({}),
    },
    uiText: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      hoverBrand: false,
      showSettings: false,
      settingsTimeout: null,
    };
  },
  computed: {
    brandIcon() {
      return this.brand.icon || 'fa-cube';
    },
    brandTitle() {
      return this.brand.title || 'Workspace';
    },
    brandSubtitle() {
      return this.brand.subtitle || 'Unified shell';
    },
    brandAppsLabel() {
      return this.uiText.navApps?.apps || 'Apps';
    },
    brandAppsHint() {
      return this.uiText.navViewAllApps || 'View all apps';
    },
    settingsLabel() {
      return this.uiText.navApps?.settings || 'Settings';
    },
    settingsPopupTitle() {
      return this.uiText.sidebarSettingsPopupTitle || 'Settings & Apps';
    },
    settingsAppsLabel() {
      return this.uiText.sidebarSettingsAppsLabel || 'App switcher';
    },
    settingsProfileLabel() {
      return this.uiText.sidebarSettingsProfileLabel || 'Profile settings';
    },
    settingsSystemLabel() {
      return this.uiText.sidebarSettingsSystemLabel || 'System config';
    },
  },
  methods: {
    handleSettingsEnter() {
      if (this.settingsTimeout) clearTimeout(this.settingsTimeout);
      this.showSettings = true;
    },
    handleSettingsLeave() {
      this.settingsTimeout = setTimeout(() => {
        this.showSettings = false;
      }, 300);
    },
    toggleSection(key) {
      this.$emit('toggle-section', key);
    },
    handleNav(link) {
      if (link?.surfaceKey) {
        this.$emit('set-surface', link.surfaceKey);
        return;
      }
      if (link && link.href) {
        window.location.href = link.href;
        return;
      }
      this.$emit('set-filter', link?.key || 'all');
    },
    isLinkActive(link) {
      if (link?.surfaceKey) return String(this.activeSurface || 'records') === String(link.surfaceKey);
      return String(this.activeFilter || 'all') === String(link?.key || '');
    },
    hasActiveLink(category) {
      const links = Array.isArray(category?.links) ? category.links : [];
      return links.some((link) => this.isLinkActive(link));
    },
  },
};
</script>

<style scoped>
/* Scoped overrides only - core styles moved to css/* modular files */
</style>
