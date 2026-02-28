<template>
  <div v-if="isOpen" class="app-spotlight-overlay" @click.self="close">
    <div class="app-spotlight-modal app-glass-heavy app-neon-pulse">
      <!-- Search Input -->
      <div class="app-spotlight-search">
        <i class="fa-solid fa-bolt-lightning app-neon-glow"></i>
        <input 
          ref="input"
          v-model="query" 
          type="text" 
          :placeholder="i18n.commandPalettePlaceholder || 'Execute command...'" 
          @keydown.esc="close"
          @keydown.down="moveDown"
          @keydown.up="moveUp"
          @keydown.enter="executeActive"
        />
        <div class="app-cp-esc">ESC</div>
      </div>
      
      <!-- Results Portals -->
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
            <strong class="app-glitch-text-sm" :data-text="item.label">{{ item.label }}</strong>
            <span>{{ item.description }}</span>
          </div>
          <div class="app-item-action"><i class="fa-solid fa-chevron-right"></i></div>
        </div>
      </div>
      
      <!-- Footer Info -->
      <div class="app-spotlight-footer">
        <div class="app-footer-keys">
          <span><kbd>↑</kbd><kbd>↓</kbd> NAVIGATE</span>
          <span><kbd>↵</kbd> EXECUTE</span>
        </div>
        <div class="app-footer-sys">Neural Interface v1.1</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['i18n', 'apps'],
  data() {
    return {
      isOpen: false,
      query: '',
      activeIndex: 0,
      baseActions: [
        { key: 'new_invoice', label: 'INITIALIZE INVOICE', description: 'Create a new ledger entry', icon: 'fa-solid fa-plus', action: 'new-invoice' },
        { key: 'go_customers', label: 'BROWSE NODES', description: 'Jump to partner database', icon: 'fa-solid fa-database', href: '/odoo/action-base.action_partner_form' },
      ]
    };
  },
  computed: {
    allPool() {
      const appEx = (this.apps || []).map(a => ({
        key: 'app_' + a.key,
        label: (a.label || a.key).toUpperCase(),
        description: 'Open ' + (a.label || a.key) + ' portal',
        icon: a.icon || 'fa-solid fa-microchip',
        href: a.href
      }));
      return [...this.baseActions, ...appEx];
    },
    filteredResults() {
      if (!this.query) return this.allPool.slice(0, 6);
      const q = this.query.toLowerCase();
      return this.allPool.filter(i => 
        i.label.toLowerCase().includes(q) || 
        i.description.toLowerCase().includes(q)
      ).slice(0, 10);
    }
  },
  watch: {
    query() { this.activeIndex = 0; }
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
      if (this.activeIndex < this.filteredResults.length - 1) this.activeIndex++;
    },
    moveUp() {
      if (this.activeIndex > 0) this.activeIndex--;
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
    }
  }
};
</script>

<style scoped>
.app-spotlight-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  z-index: 10000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
}

.app-spotlight-modal {
  width: 100%;
  max-width: 640px;
  border-radius: var(--app-radius-lg);
  overflow: hidden;
  border: 1px solid var(--app-border);
}

.app-spotlight-search {
  display: flex;
  align-items: center;
  padding: 24px;
  gap: 16px;
  border-bottom: 1px solid var(--app-border);
}

.app-neon-glow {
  color: var(--app-primary);
  filter: drop-shadow(0 0 5px var(--app-primary-glow));
}

.app-spotlight-search input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 18px;
  font-weight: 500;
  color: var(--app-text-primary);
  font-family: var(--app-font-main);
}

.app-spotlight-search input::placeholder { color: var(--app-text-muted); }

.app-cp-esc {
  font-size: 10px;
  font-weight: 700;
  color: var(--app-text-muted);
  padding: 4px 8px;
  border: 1px solid var(--app-border);
  border-radius: 4px;
}

.app-spotlight-results {
  max-height: 480px;
  overflow-y: auto;
  padding: 12px;
}

.app-spotlight-item {
  display: flex;
  align-items: center;
  padding: 14px;
  gap: 16px;
  border-radius: var(--app-radius);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
}

.app-spotlight-item.is-active {
  background: rgba(56, 189, 248, 0.08);
  border-color: var(--app-border-active);
  transform: translateX(4px);
}

.app-item-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: var(--app-text-secondary);
}

.app-spotlight-item.is-active .app-item-icon {
  color: var(--app-primary);
  background: var(--app-primary-glow);
  box-shadow: 0 0 15px var(--app-primary-glow);
}

.app-item-label {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.app-item-label strong {
  font-size: 13px;
  letter-spacing: 1px;
}

.app-item-label span {
  font-size: 11px;
  color: var(--app-text-muted);
  text-transform: uppercase;
  margin-top: 2px;
}

.app-item-action {
  opacity: 0;
  color: var(--app-primary);
  transition: opacity 0.2s;
}

.app-spotlight-item.is-active .app-item-action {
  opacity: 1;
}

.app-spotlight-footer {
  padding: 12px 24px;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--app-border);
}

.app-footer-keys {
  display: flex;
  gap: 20px;
  font-size: 10px;
  font-weight: 700;
  color: var(--app-text-muted);
}

.app-footer-keys kbd {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--app-border);
  border-radius: 4px;
  padding: 2px 5px;
  margin-right: 4px;
}

.app-footer-sys {
  font-size: 9px;
  font-weight: 800;
  color: var(--app-primary);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  opacity: 0.6;
}
</style>
