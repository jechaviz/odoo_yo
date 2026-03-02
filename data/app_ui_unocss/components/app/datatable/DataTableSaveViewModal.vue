<template>
  <div v-if="open" class="app-table-settings-overlay" @click.self="$emit('close')">
    <div class="app-table-settings-modal app-table-save-view-modal">
      <header class="app-table-settings-head">
        <div>
          <p class="eyebrow">Views</p>
          <h3>{{ i18n.manageViews || 'Manage views' }}</h3>
        </div>
        <button class="icon-btn" type="button" @click="$emit('close')"><i class="fa-solid fa-xmark"></i></button>
      </header>

      <section class="app-table-settings-section">
        <label class="app-filter-rule-row is-stack">
          <span>{{ i18n.viewName || 'View name' }}</span>
          <input v-model="viewName" class="app-filter-input" type="text" />
        </label>
      </section>

      <footer class="app-table-settings-foot split">
        <button class="app-btn-ghost" type="button" @click="deleteCurrent" :disabled="!currentView || currentView.isDefault">{{ i18n.deleteView || 'Delete view' }}</button>
        <div class="app-table-settings-actions-inline">
          <button class="app-btn-ghost" type="button" @click="saveAsNew">{{ i18n.saveAsNew || 'Save as new' }}</button>
          <button class="app-btn-blue-pro" type="button" @click="updateCurrent" :disabled="!currentView">{{ i18n.updateCurrent || 'Update current' }}</button>
        </div>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataTableSaveViewModal',
  props: {
    open: { type: Boolean, default: false },
    currentView: { type: Object, default: null },
    i18n: { type: Object, default: () => ({}) },
  },
  emits: ['close', 'save-as-new', 'update-current', 'delete-current'],
  data() {
    return { viewName: '' };
  },
  watch: {
    open: {
      immediate: true,
      handler(next) {
        if (!next) return;
        this.viewName = this.currentView?.name || '';
      },
    },
    currentView(next) {
      this.viewName = next?.name || '';
    },
  },
  methods: {
    saveAsNew() {
      if (!String(this.viewName || '').trim()) return;
      this.$emit('save-as-new', this.viewName.trim());
    },
    updateCurrent() {
      if (!this.currentView || !String(this.viewName || '').trim()) return;
      this.$emit('update-current', this.viewName.trim());
    },
    deleteCurrent() {
      if (!this.currentView || this.currentView.isDefault) return;
      this.$emit('delete-current');
    },
  },
};
</script>
