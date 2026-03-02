<template>
  <div class="app-data-table-shell" :class="{ 'is-toolbar-expanded': toolbarExpanded }">
    <DataTableToolbar
      :views="views"
      :active-view-id="activeViewId"
      :i18n="i18n"
      :is-dirty="isDirty"
      :search="internalFilter"
      :toolbar-expanded="toolbarExpanded"
      :show-column-filters="showColumnFilters"
      :active-rule-count="activeAdvancedRuleCount"
      :favorite-active="hasSavedViews"
      :view-mode="viewMode"
      :group-by-key="groupByKey"
      @update:search="handleSearch"
      @toggle-toolbar="toolbarExpanded = !toolbarExpanded"
      @toggle-column-filters="toggleColumnFilters"
      @open-settings="showSettings = true"
      @open-save-view="showSaveView = true"
      @export="exportVisibleRows"
      @import="openImportPicker"
      @refresh="emitRefresh"
      @update-view="$emit('update-view', $event)"
      @new-record="$emit('new-record')"
      @select-view="applyNamedView"
    />

    <DataTableGroupTabs
      v-if="groupByKey"
      :group-key="groupByKey"
      :buckets="groupBuckets"
      :active-bucket="activeGroupBucket"
      :total-count="filteredRows.length"
      :i18n="i18n"
      @select-bucket="activeGroupBucket = $event"
    />

    <div class="app-table-content" :class="{ 'cards-view': viewMode === 'cards' }">
      <div v-if="loading" class="app-table-skeleton">
        <div class="app-table-skeleton__head">
          <Spinner size="sm" :label="loadingLabel" />
          <span>{{ loadingLabel }}</span>
        </div>
        <div v-for="idx in 5" :key="idx" class="app-skeleton-row"></div>
      </div>

      <template v-else-if="pagedRows.length || viewMode === 'kanban' || viewMode === 'dashboard'">
        <DataTableKanban
          v-if="viewMode === 'kanban'"
          :buckets="kanbanBuckets"
          :format-money="formatMoney"
          @move-record="moveKanbanRecord"
          @open-context="openContextMenu"
        />

        <div v-else-if="viewMode === 'table'" class="app-record-table-wrap">
          <table class="app-record-table">
            <thead>
              <tr>
                <DataTableHeaderCell
                  v-for="column in visibleColumns"
                  :key="column.key"
                  :column="column"
                  :sort-state="sortState(column.key)"
                  :filter-value="columnFilters[column.key] || ''"
                  :status-options="statusOptions"
                  :i18n="i18n"
                  @sort="setSort"
                  @drag-start="dragColumnKey = $event"
                  @drop-column="handleColumnDrop"
                  @resize-column="handleColumnResize"
                  @update-filter="handleHeaderFilter"
                />
                <th class="is-actions">{{ i18n.tableAction || 'Action' }}</th>
              </tr>

              <tr v-if="showColumnFilters" class="app-table-filter-row">
                <th v-for="column in visibleColumns" :key="`filter:${column.key}`">
                  <input
                    v-if="column.filterable && column.key !== 'status'"
                    v-model="columnFilters[column.key]"
                    class="app-column-filter-input"
                    :placeholder="`Filter ${column.label}`"
                    @input="setPage(1)"
                  />
                  <select v-else-if="column.key === 'status'" v-model="columnFilters[column.key]" class="app-column-filter-input" @change="setPage(1)">
                    <option value="">All</option>
                    <option v-for="status in statusOptions" :key="status" :value="status">{{ statusLabel(status) }}</option>
                  </select>
                  <span v-else class="app-column-filter-empty">-</span>
                </th>
                <th class="is-actions"></th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="row in pagedRows" :key="row.id" @contextmenu.prevent="openContextMenu($event, row)">
                <td
                  v-for="column in visibleColumns"
                  :key="`${row.id}:${column.key}`"
                  :class="[{ 'is-numeric': column.numeric }, 'app-cell']"
                  :style="columnStyle(column)"
                  @dblclick="startEdit(row, column)"
                >
                  <InlineCellEditor
                    v-if="isEditing(row, column)"
                    :model-value="resolveCellValue(row, column)"
                    :input-type="column.editorType || 'text'"
                    :options="column.options || editorOptions(column)"
                    @save="saveEdit(row, column, $event)"
                    @cancel="cancelEdit"
                  />

                  <template v-else>
                    <span v-if="column.key === 'status'" class="app-status-pill" :class="statusClass(row.type)">{{ statusLabel(row.type) }}</span>
                    <div v-else-if="column.key === 'tags'" class="app-inline-chip-list"><span v-for="tag in (row.tags || [])" :key="tag" class="app-mini-chip">{{ tag }}</span></div>
                    <div v-else-if="column.key === 'collaborators'" class="app-inline-chip-list"><span v-for="user in (row.collaborators || [])" :key="user" class="app-mini-chip is-user">{{ user }}</span></div>
                    <div v-else-if="column.key === 'rating'" class="app-rating-readonly"><i v-for="star in 5" :key="star" class="fa-solid fa-star" :class="{ active: Number(row.rating || 0) >= star }"></i></div>
                    <div v-else-if="column.key === 'urgency'" class="app-urgency-readonly"><span>{{ row.urgency || 0 }}%</span><div class="app-urgency-track"><i :style="{ width: `${row.urgency || 0}%` }"></i></div></div>
                    <span v-else>{{ displayCellValue(row, column) }}</span>
                  </template>
                </td>

                <td class="is-actions">
                  <button type="button" class="app-row-action" title="Open"><i class="fa-solid fa-eye"></i></button>
                  <button type="button" class="app-row-action" title="Edit" @click="startRowInlineEdit(row)"><i class="fa-solid fa-pen"></i></button>
                  <button type="button" class="app-row-action" title="Send"><i class="fa-solid fa-paper-plane"></i></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <DataTableDashboard
          v-else-if="viewMode === 'dashboard'"
          :rows="sortedRows"
          :buckets="kanbanBuckets"
          :format-money="formatMoney"
          :i18n="i18n"
        />

        <DataTableCards v-else :rows="pagedRows" :format-money="formatMoney" @open-context="openContextMenu" @edit-row="startRowInlineEdit" />

      </template>

      <div v-else class="app-empty-state">
        <i class="fa-solid fa-circle-info"></i>
        <p>{{ i18n.emptyStateTitle || 'No records match current filters.' }}</p>
      </div>
    </div>

    <DataTableFooter
      v-if="viewMode !== 'kanban' && viewMode !== 'dashboard'"
      :footer-label="footerLabel"
      :page-size="pageSize"
      :safe-page="safePage"
      :page-count="pageCount"
      :page-buttons="pageButtons"
      :i18n="i18n"
      @set-page="setPage"
      @change-page-size="onPageSizeChange"
    />

    <DataTableSettingsModal :open="showSettings" :columns="columns" :filter-group="filterGroup" :sorting="sorting" :group-by-key="groupByKey" :i18n="i18n" @close="showSettings = false" @apply="applyTableSettings" />
    <DataTableSaveViewModal :open="showSaveView" :current-view="activeView" :i18n="i18n" @close="showSaveView = false" @save-as-new="saveAsNewView" @update-current="updateCurrentView" @delete-current="deleteCurrentView" />
    <DataTableContextMenu :open="contextMenu.open" :x="contextMenu.x" :y="contextMenu.y" :i18n="i18n" @action="handleContextAction" />
    <input ref="importInput" class="app-hidden-import" type="file" accept=".csv,text/csv" @change="importCsv" />
  </div>
</template>

<script>
import DataTableToolbar from 'app/datatable/DataTableToolbar.vue';
import DataTableGroupTabs from 'app/datatable/DataTableGroupTabs.vue';
import DataTableKanban from 'app/datatable/DataTableKanban.vue';
import DataTableDashboard from 'app/datatable/DataTableDashboard.vue';
import DataTableHeaderCell from 'app/datatable/DataTableHeaderCell.vue';
import DataTableCards from 'app/datatable/DataTableCards.vue';
import DataTableFooter from 'app/datatable/DataTableFooter.vue';
import DataTableSaveViewModal from 'app/datatable/DataTableSaveViewModal.vue';
import DataTableContextMenu from 'app/datatable/DataTableContextMenu.vue';
import InlineCellEditor from 'app/datatable/InlineCellEditor.vue';
import DataTableSettingsModal from 'app/datatable/DataTableSettingsModal.vue';
import Spinner from 'app/primitives/Spinner.vue';

const SCHEMA = window.odooApp?.datatable?.schema || {};
const FILTERS = window.odooApp?.datatable?.filters || {};
const VIEWS = window.odooApp?.datatable?.views || {};
const { STATUS_VALUES = ['paid', 'overdue', 'pending', 'draft'], createColumnSchema = () => [], createGroup = () => ({ logic: 'AND', filters: [] }), normalizeDate = (value) => value, normalizeFilterGroup = (group) => group, resolveCellValue = (row, column) => row?.[column?.key], toText = (value) => String(value ?? '') } = SCHEMA;
const { buildGroupBuckets = () => [], createColumnMap = () => ({}), escapeCsvCell = (value) => `\"${String(value ?? '')}\"`, filterRows = ({ rows }) => rows, formatMoney = (value) => String(value ?? ''), paginateRows = (rows) => ({ pageCount: 1, safePage: 1, pageRows: rows, startIndex: rows.length ? 1 : 0, endIndex: rows.length }), sortRows = (rows) => rows, statusLabel = (value) => String(value ?? '') } = FILTERS;
const { createView = (name, config) => ({ id: name, name, config }), loadJson = (_key, fallback) => fallback, normalizeViews = (list) => list || [], saveJson = () => {}, storageKey = (name) => name } = VIEWS;

export default {
  name: 'DataTable',
  components: {
    DataTableToolbar,
    DataTableGroupTabs,
    DataTableKanban,
    DataTableDashboard,
    DataTableHeaderCell,
    DataTableCards,
    DataTableFooter,
    DataTableSaveViewModal,
    DataTableContextMenu,
    InlineCellEditor,
    DataTableSettingsModal,
    Spinner,
  },
  emits: ['search', 'update-view', 'new-record', 'update-page', 'update-page-size', 'refresh'],
  props: {
    viewMode: { type: String, default: 'table' },
    rows: { type: Array, default: () => [] },
    i18n: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    pageSize: { type: Number, default: 10 },
    currentPage: { type: Number, default: 1 },
  },
  data() {
    return {
      internalFilter: '',
      toolbarExpanded: false,
      showColumnFilters: false,
      showSettings: false,
      showSaveView: false,
      localRows: [],
      columns: createColumnSchema(),
      sorting: [{ id: 'dueDateIso', dir: 'asc' }],
      filterGroup: createGroup('billTo'),
      columnFilters: {},
      editingCell: null,
      groupByKey: '',
      activeGroupBucket: '',
      views: [],
      activeViewId: 'default',
      isDirty: false,
      dragColumnKey: '',
      contextMenu: { open: false, x: 0, y: 0, row: null },
    };
  },
  computed: {
    statusOptions() {
      return STATUS_VALUES;
    },
    columnMap() {
      return createColumnMap(this.columns);
    },
    visibleColumns() {
      return this.columns.filter((column) => column.visible !== false);
    },
    activeView() {
      return this.views.find((view) => view.id === this.activeViewId) || null;
    },
    hasSavedViews() {
      return this.views.length > 1;
    },
    activeAdvancedRuleCount() {
      const walk = (group) => (group.filters || []).reduce((count, entry) => count + (entry.filters ? walk(entry) : (toText(entry.value).trim() ? 1 : 0)), 0);
      return walk(this.filterGroup);
    },
    filteredRows() {
      const searchKeys = ['id', 'series', 'folio', 'billFrom', 'billTo', 'customer', 'owner', 'module', 'paymentTerm', 'contactEmail', 'stage'];
      return filterRows({
        rows: this.localRows,
        query: this.internalFilter,
        searchKeys,
        visibleColumns: this.visibleColumns,
        columnFilters: this.columnFilters,
        filterGroup: this.filterGroup,
        columnMap: this.columnMap,
      });
    },
    groupBuckets() {
      if (!this.groupByKey) return [];
      return buildGroupBuckets(this.filteredRows, this.groupByKey, this.columnMap, this.i18n);
    },
    groupScopedRows() {
      if (!this.groupByKey || !this.activeGroupBucket) return this.filteredRows;
      const bucket = this.groupBuckets.find((entry) => entry.key === this.activeGroupBucket);
      return bucket ? bucket.rows : this.filteredRows;
    },
    sortedRows() {
      return sortRows(this.groupScopedRows, this.sorting, this.columns);
    },
    paginationModel() {
      return paginateRows(this.sortedRows, this.currentPage, this.pageSize);
    },
    pageCount() {
      return this.paginationModel.pageCount;
    },
    safePage() {
      return this.paginationModel.safePage;
    },
    pagedRows() {
      return this.paginationModel.pageRows;
    },
    footerLabel() {
      return `Showing ${this.paginationModel.startIndex} to ${this.paginationModel.endIndex} of ${this.sortedRows.length} entries`;
    },
    pageButtons() {
      const total = this.pageCount;
      const current = this.safePage;
      if (total <= 5) return Array.from({ length: total }, (_, idx) => idx + 1);
      const start = Math.max(1, current - 1);
      const end = Math.min(total, start + 2);
      return Array.from({ length: end - start + 1 }, (_, idx) => start + idx);
    },
    kanbanBuckets() {
      const key = this.groupByKey || 'status';
      return buildGroupBuckets(this.sortedRows, key, this.columnMap, this.i18n);
    },
    loadingLabel() {
      return this.i18n.tableLoadingLabel || 'Loading records...';
    },
  },
  watch: {
    rows: {
      deep: true,
      immediate: true,
      handler(nextRows) {
        this.localRows = (Array.isArray(nextRows) ? nextRows : []).map((row) => ({ ...row }));
      },
    },
    i18n: {
      deep: true,
      immediate: true,
      handler() {
        const stateByKey = Object.fromEntries(this.columns.map((column) => [column.key, column]));
        this.columns = createColumnSchema(this.i18n).map((column) => ({ ...column, ...stateByKey[column.key] }));
      },
    },
  },
  mounted() {
    this.restoreViews();
    document.addEventListener('click', this.handleOutsideContextMenu);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideContextMenu);
  },
  methods: {
    storageKeys() {
      return {
        views: storageKey('datatable.views'),
      };
    },
    defaultViewConfig() {
      return {
        columns: this.columns.map((column) => ({ ...column })),
        filterGroup: normalizeFilterGroup(this.filterGroup, this.columns[0]?.key || 'billTo'),
        sorting: this.sorting.map((entry) => ({ ...entry })),
        groupByKey: this.groupByKey,
        showColumnFilters: this.showColumnFilters,
      };
    },
    restoreViews() {
      const defaults = [{ id: 'default', name: this.i18n.defaultViewName || 'Default view', isDefault: true, config: this.defaultViewConfig() }];
      const persisted = normalizeViews(loadJson(this.storageKeys().views, defaults));
      this.views = persisted.length ? persisted : defaults;
      this.applyNamedView(this.views[0].id, false);
    },
    persistViews() {
      saveJson(this.storageKeys().views, this.views);
    },
    applyNamedView(viewId, markClean = true) {
      const view = this.views.find((entry) => entry.id === viewId);
      if (!view) return;
      this.activeViewId = view.id;
      this.columns = (view.config.columns || []).map((column) => ({ ...column }));
      this.filterGroup = normalizeFilterGroup(view.config.filterGroup, this.columns[0]?.key || 'billTo');
      this.sorting = Array.isArray(view.config.sorting) && view.config.sorting.length ? view.config.sorting.map((entry) => ({ ...entry })) : [{ id: 'dueDateIso', dir: 'asc' }];
      this.groupByKey = view.config.groupByKey || '';
      this.showColumnFilters = Boolean(view.config.showColumnFilters);
      this.activeGroupBucket = '';
      if (markClean) this.isDirty = false;
    },
    saveAsNewView(name) {
      this.views = [...this.views, createView(name, this.defaultViewConfig())];
      this.persistViews();
      this.showSaveView = false;
      this.isDirty = false;
    },
    updateCurrentView(name) {
      if (!this.activeView) return;
      this.views = this.views.map((view) => (view.id === this.activeView.id ? { ...view, name, config: this.defaultViewConfig() } : view));
      this.persistViews();
      this.showSaveView = false;
      this.isDirty = false;
    },
    deleteCurrentView() {
      if (!this.activeView || this.activeView.isDefault) return;
      this.views = this.views.filter((view) => view.id !== this.activeView.id);
      this.persistViews();
      this.showSaveView = false;
      this.applyNamedView('default');
    },
    markDirty() {
      this.isDirty = true;
    },
    columnStyle(column) {
      return column.width ? { width: `${column.width}px`, minWidth: `${column.width}px` } : {};
    },
    handleSearch(value) {
      this.internalFilter = value;
      this.$emit('search', value);
      this.setPage(1);
    },
    handleHeaderFilter({ key, value }) {
      this.columnFilters = { ...this.columnFilters, [key]: value };
      this.markDirty();
      this.setPage(1);
    },
    toggleColumnFilters() {
      this.showColumnFilters = !this.showColumnFilters;
      this.markDirty();
      this.setPage(1);
    },
    sortState(columnKey) {
      const rule = this.sorting.find((entry) => entry.id === columnKey);
      return rule ? rule.dir : 'none';
    },
    setSort(column) {
      if (!column?.sortable) return;
      const current = this.sorting.find((entry) => entry.id === column.key);
      if (!current) {
        this.sorting = [{ id: column.key, dir: 'asc' }, ...this.sorting.filter((entry) => entry.id !== column.key)];
      } else if (current.dir === 'asc') {
        this.sorting = [{ id: column.key, dir: 'desc' }, ...this.sorting.filter((entry) => entry.id !== column.key)];
      } else {
        this.sorting = this.sorting.filter((entry) => entry.id !== column.key);
      }
      this.markDirty();
    },
    handleColumnDrop({ sourceKey, targetKey }) {
      const activeSource = sourceKey || this.dragColumnKey;
      if (!activeSource || activeSource === targetKey) return;
      const next = this.columns.slice();
      const sourceIndex = next.findIndex((column) => column.key === activeSource);
      const targetIndex = next.findIndex((column) => column.key === targetKey);
      if (sourceIndex < 0 || targetIndex < 0) return;
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      this.columns = next;
      this.dragColumnKey = '';
      this.markDirty();
    },
    handleColumnResize({ key, width }) {
      this.columns = this.columns.map((column) => (column.key === key ? { ...column, width } : column));
      this.markDirty();
    },
    resolveCellValue(row, column) {
      return resolveCellValue(row, column);
    },
    displayCellValue(row, column) {
      const value = this.resolveCellValue(row, column);
      if (column.key === 'total') return this.formatMoney(value);
      if (Array.isArray(value)) return value.join(', ');
      return value == null || value === '' ? '-' : value;
    },
    statusLabel(type) {
      return statusLabel(type, this.i18n);
    },
    statusClass(type) {
      return `app-status-${toText(type || 'draft').toLowerCase()}`;
    },
    formatMoney(value) {
      return formatMoney(value);
    },
    editorOptions(column) {
      if (column.key === 'owner' || column.key === 'collaborators') {
        return ['Operations', 'Finance', 'Sales', 'Pricing', 'Collections', 'Field Ops'].map((value) => ({ value, label: value }));
      }
      return column.options || [];
    },
    isEditing(row, column) {
      return Boolean(this.editingCell && this.editingCell.rowId === row.id && this.editingCell.colKey === column.key);
    },
    startEdit(row, column) {
      if (!column?.editable) return;
      this.editingCell = { rowId: row.id, colKey: column.key };
    },
    startRowInlineEdit(row) {
      const firstEditable = this.visibleColumns.find((column) => column.editable);
      if (firstEditable) this.startEdit(row, firstEditable);
    },
    saveEdit(row, column, nextValue) {
      const target = this.localRows.find((candidate) => candidate.id === row.id);
      if (!target) return;
      if (column.key === 'status') {
        target.type = STATUS_VALUES.includes(toText(nextValue).toLowerCase()) ? toText(nextValue).toLowerCase() : 'draft';
        target.statusText = this.statusLabel(target.type);
      } else if (column.key === 'total') {
        const amount = Number(toText(nextValue).replace(/[^\d.-]/g, ''));
        target.total = Number.isNaN(amount) ? 0 : amount;
        target.amount = this.formatMoney(target.total);
      } else if (column.key === 'issuedDateIso' || column.key === 'dueDateIso') {
        target[column.key] = normalizeDate(nextValue);
      } else {
        target[column.key] = Array.isArray(nextValue) ? [...nextValue] : nextValue;
      }
      this.editingCell = null;
      this.markDirty();
    },
    cancelEdit() {
      this.editingCell = null;
    },
    openContextMenu(event, row) {
      this.contextMenu = { open: true, x: event.clientX + 8, y: event.clientY + 8, row };
    },
    handleOutsideContextMenu(event) {
      if (!this.contextMenu.open) return;
      if (this.$el.contains(event.target) && event.target.closest('.app-row-context-menu')) return;
      this.contextMenu.open = false;
    },
    handleContextAction(action) {
      const row = this.contextMenu.row;
      this.contextMenu.open = false;
      if (!row) return;
      if (action === 'edit') this.startRowInlineEdit(row);
      if (action === 'copy-id' && navigator.clipboard) navigator.clipboard.writeText(row.id || '');
    },
    applyTableSettings(payload) {
      if (!payload) return;
      this.columns = (payload.columns || []).map((column) => ({ ...column }));
      this.filterGroup = normalizeFilterGroup(payload.filterGroup, this.columns[0]?.key || 'billTo');
      this.sorting = Array.isArray(payload.sorting) && payload.sorting.length ? payload.sorting : this.sorting;
      this.groupByKey = payload.groupByKey || '';
      this.activeGroupBucket = '';
      this.showSettings = false;
      this.markDirty();
      this.setPage(1);
    },
    setPage(page) {
      const next = Math.min(Math.max(page, 1), this.pageCount);
      this.$emit('update-page', next);
    },
    onPageSizeChange(ev) {
      const size = Math.max(1, Number(ev?.target?.value || this.pageSize));
      this.$emit('update-page-size', size);
      this.$emit('update-page', 1);
    },
    moveKanbanRecord({ rowId, bucketKey }) {
      const target = this.localRows.find((row) => row.id === rowId);
      if (!target) return;
      const groupKey = this.groupByKey || 'status';
      if (groupKey === 'status') {
        target.type = bucketKey.toLowerCase();
        target.statusText = this.statusLabel(target.type);
      } else {
        target[groupKey] = bucketKey;
      }
      this.markDirty();
    },
    emitRefresh() {
      this.$emit('refresh');
    },
    exportVisibleRows() {
      const headers = this.visibleColumns.map((column) => column.label);
      const lines = [headers.join(',')];
      this.sortedRows.forEach((row) => {
        const cells = this.visibleColumns.map((column) => escapeCsvCell(this.displayCellValue(row, column)));
        lines.push(cells.join(','));
      });
      const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
      const href = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      link.download = 'app-ui-records.csv';
      link.click();
      URL.revokeObjectURL(href);
    },
    openImportPicker() {
      this.$refs.importInput?.click();
    },
    importCsv(event) {
      const file = event?.target?.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const raw = String(reader.result || '').trim();
        if (!raw) return;
        const [headerLine, ...bodyLines] = raw.split(/\r?\n/);
        const headers = headerLine.split(',').map((header) => header.replace(/^"|"$/g, '').trim());
        this.localRows = bodyLines.filter((line) => line.trim().length > 0).map((line, index) => {
          const values = line.split(',').map((cell) => cell.replace(/^"|"$/g, '').replaceAll('""', '"').trim());
          const row = {
            id: `import-${Date.now()}-${index}`,
            series: 'I',
            folio: String(index + 1).padStart(6, '0'),
            type: 'draft',
            stage: 'Backlog',
            total: 0,
            tags: [],
            collaborators: [],
            rating: 0,
            urgency: 0,
          };
          headers.forEach((header, cellIndex) => {
            const column = this.columns.find((entry) => entry.label === header);
            if (!column) return;
            row[column.key] = values[cellIndex] || '';
          });
          row.issuedDateIso = normalizeDate(row.issuedDateIso || new Date().toISOString().slice(0, 10));
          row.dueDateIso = normalizeDate(row.dueDateIso || new Date().toISOString().slice(0, 10));
          row.total = Number(toText(row.total).replace(/[^\d.-]/g, '')) || 0;
          row.amount = this.formatMoney(row.total);
          row.statusText = this.statusLabel(row.type);
          return row;
        });
      };
      reader.readAsText(file);
      event.target.value = '';
    },
  },
};
</script>
