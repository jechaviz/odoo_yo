<template>
  <div v-if="isOpen" class="app-spotlight-overlay" @click.self="close">
    <div class="app-spotlight-modal app-glass-heavy app-neon-pulse">
      <div class="app-spotlight-search">
        <i class="fa-solid fa-bolt-lightning app-neon-glow"></i>
        <input
          ref="input"
          v-model="query"
          type="text"
          :placeholder="i18n.commandPalettePlaceholder || 'Search actions, apps, or records...'"
          @keydown.esc="close"
          @keydown.down="moveDown"
          @keydown.up="moveUp"
          @keydown.enter="executeActive"
        />
        <div class="app-cp-esc">ESC</div>
      </div>

      <div class="app-spotlight-results" v-if="filteredResults.length">
        <div
          v-for="(item, idx) in filteredResults"
          :key="item.key"
          class="app-spotlight-item"
          :class="{ 'is-active': activeIndex === idx }"
          @click="executeItem(item)"
          @mouseenter="activeIndex = idx"
        >
          <div class="app-item-icon app-glass">
            <i :class="item.icon"></i>
          </div>
          <div class="app-item-label">
            <strong>{{ item.label }}</strong>
            <span>{{ item.description }}</span>
          </div>
          <div class="app-item-action"><i class="fa-solid fa-chevron-right"></i></div>
        </div>
      </div>

      <div class="app-spotlight-footer">
        <div class="app-footer-keys">
          <span><kbd>&uarr;</kbd><kbd>&darr;</kbd> {{ i18n.commandPaletteNavigate || 'Navigate' }}</span>
          <span><kbd>&crarr;</kbd> {{ i18n.commandPaletteExecute || 'Execute' }}</span>
          <span><kbd>ESC</kbd> {{ i18n.commandPaletteClose || 'Close' }}</span>
        </div>
        <div class="app-footer-sys">{{ i18n.commandPaletteSystem || 'Unified command surface' }}</div>
      </div>
    </div>
  </div>
</template>

<script>
const DEMO = window.odooApp?.demo;

export default {
  name: 'CommandPalette',
  emits: ['filter-overdue', 'new-record'],
  props: {
    i18n: {
      type: Object,
      default: () => ({}),
    },
    apps: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      isOpen: false,
      query: '',
      activeIndex: 0,
    };
  },
  computed: {
    allPool() {
      if (DEMO && typeof DEMO.buildCommandPaletteActions === 'function') {
        return DEMO.buildCommandPaletteActions(this.i18n || {}, this.apps || []);
      }
      return [];
    },
    filteredResults() {
      if (!this.query) return this.allPool.slice(0, 6);
      const q = this.query.toLowerCase();
      return this.allPool.filter((item) =>
        String(item.label || '').toLowerCase().includes(q) ||
        String(item.description || '').toLowerCase().includes(q)
      ).slice(0, 10);
    },
  },
  watch: {
    query() {
      this.activeIndex = 0;
    },
  },
  methods: {
    open() {
      this.isOpen = true;
      this.query = '';
      this.activeIndex = 0;
      this.$nextTick(() => {
        if (this.$refs.input) this.$refs.input.focus();
      });
    },
    close() {
      this.isOpen = false;
    },
    moveDown() {
      if (this.activeIndex < this.filteredResults.length - 1) this.activeIndex += 1;
    },
    moveUp() {
      if (this.activeIndex > 0) this.activeIndex -= 1;
    },
    executeActive() {
      const item = this.filteredResults[this.activeIndex];
      if (item) this.executeItem(item);
    },
    executeItem(item) {
      if (item.href) {
        window.location.href = item.href;
      } else if (item.action) {
        this.$emit(item.action);
      }
      this.close();
    },
  },
};
</script>

<style scoped>
/* Scoped overrides only - core styles moved to css/* modular files */
</style>
