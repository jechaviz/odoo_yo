<template>
  <th
    :class="[{ 'is-numeric': column.numeric }, 'app-th-sortable', { 'is-filter-open': filterOpen }]"
    :style="columnStyle"
    @dragover.prevent
    @drop="handleDrop"
  >
    <div class="app-th-shell">
      <div class="app-th-main" @click="$emit('sort', column)">
        <button
          type="button"
          class="app-th-drag"
          :title="i18n.columnReorderLabel || 'Reorder column'"
          draggable="true"
          @click.stop
          @dragstart="handleDragStart"
        >
          <i class="fa-solid fa-grip-vertical"></i>
        </button>
        <span class="app-th-label">{{ column.label }}</span>
        <span v-if="column.sortable" class="app-sort-icon">
          <i v-if="sortState === 'none'" class="fa-solid fa-sort"></i>
          <i v-else-if="sortState === 'asc'" class="fa-solid fa-sort-up"></i>
          <i v-else class="fa-solid fa-sort-down"></i>
        </span>
      </div>

      <div class="app-th-actions">
        <button
          v-if="column.filterable"
          type="button"
          class="app-th-filter"
          :class="{ active: hasFilterValue || filterOpen }"
          :title="i18n.columnFilterLabel || 'Column filter'"
          @click.stop="toggleFilter"
        >
          <i class="fa-solid fa-filter"></i>
        </button>
      </div>

      <div v-if="filterOpen && column.filterable" class="app-column-filter-popover" @click.stop>
        <div class="app-column-filter-popover-head">
          <strong>{{ column.label }}</strong>
          <button type="button" class="app-btn-ghost danger compact" @click="clearFilter">
            <i class="fa-solid fa-eraser"></i>
          </button>
        </div>
        <select
          v-if="column.key === 'status'"
          :value="filterValue"
          class="app-column-filter-input"
          @change="emitFilter($event.target.value)"
        >
          <option value="">{{ i18n.filterAll || 'All' }}</option>
          <option v-for="status in statusOptions" :key="status" :value="status">{{ statusLabel(status) }}</option>
        </select>
        <input
          v-else
          :value="filterValue"
          class="app-column-filter-input"
          type="text"
          :placeholder="`${i18n.searchPlaceholder || 'Search'} ${column.label}`"
          @input="emitFilter($event.target.value)"
        />
      </div>

      <div class="app-th-resizer" @mousedown.stop.prevent="startResize"></div>
    </div>
  </th>
</template>

<script>
const DATATABLE_FILTERS = window.odooApp?.datatable?.filters || {};
const { statusLabel = (value) => String(value || '') } = DATATABLE_FILTERS;

export default {
  name: 'DataTableHeaderCell',
  props: {
    column: { type: Object, required: true },
    sortState: { type: String, default: 'none' },
    filterValue: { type: String, default: '' },
    statusOptions: { type: Array, default: () => [] },
    i18n: { type: Object, default: () => ({}) },
  },
  emits: ['sort', 'drag-start', 'drop-column', 'update-filter', 'resize-column'],
  data() {
    return {
      filterOpen: false,
      resizeOriginX: 0,
      resizeOriginWidth: 0,
    };
  },
  computed: {
    columnStyle() {
      return this.column.width
        ? { width: `${this.column.width}px`, minWidth: `${this.column.width}px` }
        : {};
    },
    hasFilterValue() {
      return String(this.filterValue || '').trim().length > 0;
    },
  },
  mounted() {
    document.addEventListener('click', this.handleOutsideClick);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideClick);
    this.stopResize();
  },
  methods: {
    statusLabel,
    handleOutsideClick(event) {
      if (!this.$el.contains(event.target)) this.filterOpen = false;
    },
    toggleFilter() {
      this.filterOpen = !this.filterOpen;
    },
    emitFilter(value) {
      this.$emit('update-filter', { key: this.column.key, value });
    },
    clearFilter() {
      this.emitFilter('');
      this.filterOpen = false;
    },
    handleDragStart(event) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', this.column.key);
      this.$emit('drag-start', this.column.key);
    },
    handleDrop(event) {
      const sourceKey = event.dataTransfer.getData('text/plain');
      this.$emit('drop-column', { sourceKey, targetKey: this.column.key });
    },
    startResize(event) {
      this.resizeOriginX = event.clientX;
      this.resizeOriginWidth = Number(this.column.width || this.$el.offsetWidth || 160);
      document.body.style.cursor = 'col-resize';
      window.addEventListener('mousemove', this.onResize);
      window.addEventListener('mouseup', this.stopResize);
    },
    onResize(event) {
      const nextWidth = Math.max(90, this.resizeOriginWidth + (event.clientX - this.resizeOriginX));
      this.$emit('resize-column', { key: this.column.key, width: nextWidth });
    },
    stopResize() {
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', this.onResize);
      window.removeEventListener('mouseup', this.stopResize);
    },
  },
};
</script>
