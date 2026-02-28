<template>
  <aside class="app-sidebar app-glass-heavy" :class="{ collapsed: isCollapsed }">
    <div class="app-sidebar-brand" 
         @mouseenter="hoverBrand = true" 
         @mouseleave="hoverBrand = false"
         @click="$emit('open-mega')">
      <div class="app-brand-logo" :class="{ 'apps-mode': hoverBrand }">
        <i class="fa-solid" :class="hoverBrand ? 'fa-grip' : 'fa-cube'"></i>
      </div>
      <span class="app-brand-name">{{ hoverBrand ? 'Apps' : 'Invoicing' }}</span>
      <i class="fa-solid fa-chevron-down app-brand-chevron"></i>
    </div>

    <nav class="app-sidebar-nav">
      <div v-for="cat in categories" :key="cat.name" class="app-nav-group">
        <div class="app-nav-label-wrapper" 
             @click="cat.isCollapsible && toggleSection(cat.key)">
          <i v-if="cat.icon" :class="cat.icon" class="app-cat-icon"></i>
          <span class="app-nav-label">{{ cat.name }}</span>
          <span class="app-sidebar-floating-label">{{ cat.name }}</span>
          <i v-if="cat.isCollapsible" 
             class="fa-solid fa-chevron-right app-cat-chevron" 
             :class="{ 'rotate-90': openSections[cat.key] && !isCollapsed }"></i>
        </div>
        <div class="app-nav-links" v-show="!cat.isCollapsible || (openSections[cat.key] && !isCollapsed) || isCollapsed">
          <a v-for="link in cat.links" 
             :key="link.key" 
             href="#" 
             class="app-nav-item" 
             :class="{ active: activeFilter === link.key }"
             @click.prevent="$emit('set-filter', link.key)">
             <i :class="link.icon" class="app-nav-icon"></i>
             <span class="app-item-text">{{ link.label }}</span>
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
      <div class="app-util-wrapper" 
           @mouseenter="handleSettingsEnter" 
           @mouseleave="handleSettingsLeave">
        <button type="button" class="app-sidebar-settings-btn" @click.stop>
          <i class="fa-solid fa-gear"></i>
          <span v-if="!isCollapsed" class="app-util-text">Settings</span>
        </button>
        <Transition name="app-fade-pro">
          <div v-if="showSettings" class="app-settings-popup app-glass-heavy">
             <div class="app-popup-header">Settings & Apps</div>
             <div class="app-popup-list">
               <div class="app-popup-item" @click="$emit('open-mega')"><i class="fa-solid fa-cubes-stacked"></i> App Installer (Odoo)</div>
               <div class="app-popup-item"><i class="fa-solid fa-user-gear"></i> Profile Settings</div>
               <div class="app-popup-item"><i class="fa-solid fa-sliders"></i> System Config</div>
             </div>
          </div>
        </Transition>
      </div>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'AppSidebar',
  props: {
    isCollapsed: { type: Boolean, default: false },
    categories: { type: Array, required: true },
    activeFilter: { type: String, default: 'all' },
    openSections: { type: Object, required: true }
  },
  data() {
    return {
      hoverBrand: false,
      showSettings: false,
      settingsTimeout: null
    };
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
    }
  }
};
</script>

<style scoped>
/* Scoped overrides only - core styles moved to 20_components.css */
</style>
