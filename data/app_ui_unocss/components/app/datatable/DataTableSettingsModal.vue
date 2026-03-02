<template>
  <div v-if="open" class="app-table-settings-overlay" @click.self="$emit('close')">
    <div class="app-table-settings-modal is-wide">
      <header class="app-table-settings-head">
        <div>
          <p class="eyebrow">Layout</p>
          <h3>{{ titleText }}</h3>
        </div>
        <button class="icon-btn" type="button" @click="$emit('close')"><i class="fa-solid fa-xmark"></i></button>
      </header>

      <nav class="app-table-settings-tabs">
        <button v-for="tab in tabs" :key="tab.key" type="button" class="app-table-settings-tab" :class="{ active: activeTab === tab.key }" @click="activeTab = tab.key">{{ tab.label }}</button>
      </nav>

      <section v-if="activeTab === 'columns'" class="app-table-settings-section">
        <div class="app-table-settings-grid two-col">
          <label v-for="column in localColumns" :key="column.key" class="app-table-settings-check is-column-row">
            <div>
              <strong>{{ column.label }}</strong>
              <small>{{ column.key }}</small>
            </div>
            <input type="checkbox" v-model="column.visible" />
          </label>
        </div>
      </section>

      <section v-else-if="activeTab === 'filters'" class="app-table-settings-section">
        <FilterGroupEditor :group="localFilterGroup" :columns="filterableColumns" @update="localFilterGroup = $event" />
      </section>

      <section v-else-if="activeTab === 'sort'" class="app-table-settings-section">
        <div class="app-table-settings-columns sortable-list">
          <label v-for="(sort, index) in localSorting" :key="sort.id" class="app-filter-rule-row">
            <select v-model="sort.id" class="app-filter-select">
              <option v-for="column in sortableColumns" :key="column.key" :value="column.key">{{ column.label }}</option>
            </select>
            <select v-model="sort.dir" class="app-filter-select compact">
              <option value="asc">ASC</option>
              <option value="desc">DESC</option>
            </select>
            <button class="app-btn-ghost danger" type="button" @click="removeSort(index)"><i class="fa-solid fa-trash"></i></button>
          </label>
          <button class="app-btn-ghost" type="button" @click="addSort">{{ i18n.addSort || 'Add sort' }}</button>
        </div>
      </section>

      <section v-else-if="activeTab === 'group'" class="app-table-settings-section">
        <div class="app-table-settings-columns">
          <label class="app-filter-rule-row">
            <span>{{ i18n.groupByLabel || 'Group by' }}</span>
            <select v-model="localGroupByKey" class="app-filter-select">
              <option value="">None</option>
              <option v-for="column in filterableColumns" :key="column.key" :value="column.key">{{ column.label }}</option>
            </select>
          </label>
        </div>
      </section>

      <section v-else class="app-table-settings-section">
        <div class="app-table-settings-grid order-grid">
          <div class="app-order-panel">
            <h4>{{ i18n.orderLabel || 'Column order' }}</h4>
            <div v-for="(column, index) in localColumns" :key="column.key" class="app-order-row">
              <span>{{ column.label }}</span>
              <div class="app-order-actions">
                <button class="app-btn-ghost" type="button" @click="moveColumn(index, -1)" :disabled="index === 0"><i class="fa-solid fa-arrow-up"></i></button>
                <button class="app-btn-ghost" type="button" @click="moveColumn(index, 1)" :disabled="index === localColumns.length - 1"><i class="fa-solid fa-arrow-down"></i></button>
              </div>
            </div>
          </div>
          <div class="app-width-panel">
            <h4>{{ i18n.widthLabel || 'Column widths' }}</h4>
            <label v-for="column in localColumns" :key="`${column.key}:width`" class="app-filter-rule-row">
              <span>{{ column.label }}</span>
              <input v-model.number="column.width" class="app-filter-input compact" type="number" min="90" max="420" step="10" />
            </label>
          </div>
        </div>
      </section>

      <footer class="app-table-settings-foot">
        <button class="app-btn-ghost" type="button" @click="$emit('close')">{{ i18n.cancelText || 'Cancel' }}</button>
        <button class="app-btn-blue-pro" type="button" @click="apply">{{ i18n.applyText || 'Apply' }}</button>
      </footer>
    </div>
  </div>
</template>

<script>
const DATATABLE_SCHEMA = window.odooApp?.datatable?.schema || {};
const { createGroup = () => ({ logic: 'AND', filters: [] }), createRule = () => ({ column: 'billTo', operator: 'contains', value: '' }), normalizeFilterGroup = (group) => group } = DATATABLE_SCHEMA;

const FilterGroupEditor = {
  name: 'FilterGroupEditor',
  props: {
    group: { type: Object, required: true },
    columns: { type: Array, default: () => [] },
  },
  emits: ['update'],
  methods: {
    fallbackColumn() {
      return this.columns[0]?.key || 'billTo';
    },
    updateRule(index, patch) {
      const filters = this.group.filters.slice();
      filters[index] = { ...filters[index], ...patch };
      this.$emit('update', { ...this.group, filters });
    },
    updateGroup(index, nextGroup) {
      const filters = this.group.filters.slice();
      filters[index] = nextGroup;
      this.$emit('update', { ...this.group, filters });
    },
    removeAt(index) {
      const filters = this.group.filters.filter((_, current) => current !== index);
      this.$emit('update', { ...this.group, filters });
    },
    addRule() {
      this.$emit('update', { ...this.group, filters: [...this.group.filters, createRule(this.fallbackColumn())] });
    },
    addGroup() {
      this.$emit('update', { ...this.group, filters: [...this.group.filters, createGroup(this.fallbackColumn())] });
    },
  },
  template: `
    <div class="app-filter-group-editor">
      <div class="app-filter-group-head">
        <select v-model="group.logic" class="app-filter-select logic">
          <option value="AND">AND</option>
          <option value="OR">OR</option>
        </select>
        <div class="app-table-settings-actions-inline">
          <button class="app-btn-ghost" type="button" @click="addRule">Add rule</button>
          <button class="app-btn-ghost" type="button" @click="addGroup">Add group</button>
        </div>
      </div>

      <div class="app-filter-rules nested">
        <div v-for="(entry, index) in group.filters" :key="entry.id" class="app-filter-node">
          <FilterGroupEditor v-if="entry.filters" :group="entry" :columns="columns" @update="updateGroup(index, $event)" />
          <div v-else class="app-filter-rule-row">
            <select v-model="entry.column" class="app-filter-select">
              <option v-for="column in columns" :key="column.key" :value="column.key">{{ column.label }}</option>
            </select>
            <select v-model="entry.operator" class="app-filter-select compact">
              <option value="contains">Contains</option>
              <option value="equals">Equals</option>
              <option value="starts_with">Starts With</option>
              <option value="gt">&gt;</option>
              <option value="lt">&lt;</option>
              <option value="before">Before</option>
              <option value="after">After</option>
            </select>
            <input v-model="entry.value" class="app-filter-input" type="text" />
            <button class="app-btn-ghost danger" type="button" @click="removeAt(index)"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
      </div>
    </div>
  `,
};

export default {
  name: 'DataTableSettingsModal',
  components: { FilterGroupEditor },
  props: {
    open: { type: Boolean, default: false },
    columns: { type: Array, default: () => [] },
    filterGroup: { type: Object, default: null },
    sorting: { type: Array, default: () => [] },
    groupByKey: { type: String, default: '' },
    i18n: { type: Object, default: () => ({}) },
  },
  emits: ['close', 'apply'],
  data() {
    return {
      activeTab: 'columns',
      localColumns: [],
      localFilterGroup: createGroup('billTo'),
      localSorting: [],
      localGroupByKey: '',
    };
  },
  computed: {
    tabs() {
      return [
        { key: 'columns', label: this.i18n.tableSettingsColumns || 'Columns' },
        { key: 'filters', label: this.i18n.tableSettingsFilters || 'Filters' },
        { key: 'sort', label: this.i18n.sortLabel || 'Sort' },
        { key: 'group', label: this.i18n.groupByLabel || 'Group' },
        { key: 'layout', label: this.i18n.layoutLabel || 'Layout' },
      ];
    },
    titleText() {
      return this.i18n.tableSettingsTitle || 'Table settings';
    },
    filterableColumns() {
      return this.localColumns.filter((column) => column.filterable !== false);
    },
    sortableColumns() {
      return this.localColumns.filter((column) => column.sortable !== false);
    },
  },
  watch: {
    open: {
      immediate: true,
      handler(next) {
        if (!next) return;
        const fallbackColumn = this.columns[0]?.key || 'billTo';
        this.localColumns = this.columns.map((column) => ({ ...column }));
        this.localFilterGroup = normalizeFilterGroup(this.filterGroup, fallbackColumn);
        this.localSorting = (Array.isArray(this.sorting) ? this.sorting : []).map((entry, index) => ({ id: entry.id || fallbackColumn, dir: entry.dir === 'desc' ? 'desc' : 'asc', key: `sort-${index}` }));
        this.localGroupByKey = this.groupByKey || '';
      },
    },
  },
  methods: {
    addSort() {
      const fallbackColumn = this.sortableColumns[0]?.key || 'billTo';
      this.localSorting.push({ id: fallbackColumn, dir: 'asc', key: `sort-${Date.now()}` });
    },
    removeSort(index) {
      this.localSorting.splice(index, 1);
    },
    moveColumn(index, direction) {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= this.localColumns.length) return;
      const buffer = this.localColumns.slice();
      const [moved] = buffer.splice(index, 1);
      buffer.splice(nextIndex, 0, moved);
      this.localColumns = buffer;
    },
    apply() {
      this.$emit('apply', {
        columns: this.localColumns.map((column) => ({ ...column })),
        filterGroup: normalizeFilterGroup(this.localFilterGroup, this.localColumns[0]?.key || 'billTo'),
        sorting: this.localSorting.map((entry) => ({ id: entry.id, dir: entry.dir })),
        groupByKey: this.localGroupByKey,
      });
    },
  },
};
</script>
