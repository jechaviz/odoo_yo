<template>
  <div class="app-table-views" @keydown.esc="open = false">
    <button class="app-table-view-trigger" type="button" @click="open = !open">
      <span>{{ activeViewName }}</span>
      <span v-if="isDirty" class="app-table-view-dirty"></span>
      <i class="fa-solid fa-chevron-down"></i>
    </button>

    <div v-if="open" class="app-table-view-menu">
      <button
        v-for="view in views"
        :key="view.id"
        class="app-table-view-item"
        :class="{ active: view.id === activeViewId }"
        type="button"
        @click="selectView(view.id)"
      >
        <span>{{ view.name }}</span>
        <small v-if="view.isDefault">Default</small>
      </button>
      <button class="app-table-view-item manage" type="button" @click="manageViews">
        <i class="fa-solid fa-floppy-disk"></i>
        <span>{{ i18n.manageViews || 'Manage views' }}</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataTableViewsManager',
  props: {
    views: { type: Array, default: () => [] },
    activeViewId: { type: String, default: '' },
    i18n: { type: Object, default: () => ({}) },
    isDirty: { type: Boolean, default: false },
  },
  emits: ['select-view', 'manage-views'],
  data() {
    return { open: false };
  },
  computed: {
    activeViewName() {
      return this.views.find((view) => view.id === this.activeViewId)?.name || this.i18n.defaultViewName || 'Default view';
    },
  },
  mounted() {
    document.addEventListener('click', this.handleOutsideClick);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideClick);
  },
  methods: {
    handleOutsideClick(event) {
      if (!this.$el.contains(event.target)) this.open = false;
    },
    selectView(viewId) {
      this.open = false;
      this.$emit('select-view', viewId);
    },
    manageViews() {
      this.open = false;
      this.$emit('manage-views');
    },
  },
};
</script>
