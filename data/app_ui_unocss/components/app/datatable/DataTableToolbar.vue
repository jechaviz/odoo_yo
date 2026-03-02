<template>
  <div class="app-table-toolbar">
    <div class="app-toolbar-left">
      <DataTableViewsManager
        v-if="views.length"
        :views="views"
        :active-view-id="activeViewId"
        :i18n="i18n"
        :is-dirty="isDirty"
        @select-view="$emit('select-view', $event)"
        @manage-views="$emit('open-save-view')"
      />

      <div class="app-toolbar-search">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="text" :value="search" @input="$emit('update:search', $event.target.value)" :placeholder="i18n.searchPlaceholder || 'Search records...'" />
      </div>
    </div>

    <div class="app-toolbar-right">
      <button class="app-toolbar-more-toggle" type="button" title="More actions" @click="$emit('toggle-toolbar')" :aria-expanded="toolbarExpanded">
        <i class="fa-solid fa-angles-right"></i>
      </button>

      <div class="app-toolbar-onhover">
        <div class="app-toolbar-advanced">
          <div class="app-toolbar-sep"></div>
          <button class="app-toolbar-btn" :class="{ active: showColumnFilters }" title="Column filters" @click="$emit('toggle-column-filters')">
            <i class="fa-solid fa-filter"></i>
            <span v-if="activeRuleCount" class="app-btn-badge">{{ activeRuleCount }}</span>
          </button>
          <button class="app-toolbar-btn" :class="{ active: Boolean(groupByKey) }" title="Group By" @click="$emit('open-settings')">
            <i class="fa-solid fa-layer-group"></i>
          </button>
          <button class="app-toolbar-btn" :class="{ active: favoriteActive }" title="Save view" @click="$emit('open-save-view')">
            <i class="fa-solid fa-star"></i>
          </button>
          <div class="app-toolbar-sep"></div>
          <button class="app-toolbar-btn" title="Export" @click="$emit('export')"><i class="fa-solid fa-download"></i></button>
          <button class="app-toolbar-btn" title="Import" @click="$emit('import')"><i class="fa-solid fa-upload"></i></button>
          <button class="app-toolbar-btn" title="Refresh Table" @click="$emit('refresh')"><i class="fa-solid fa-arrows-rotate"></i></button>
          <button class="app-toolbar-btn" title="Table settings" @click="$emit('open-settings')"><i class="fa-solid fa-sliders"></i></button>
        </div>
      </div>

        <div class="app-view-switcher">
          <button class="app-view-btn" :class="{ active: viewMode === 'table' }" @click="$emit('update-view', 'table')"><i class="fa-solid fa-table"></i></button>
          <button class="app-view-btn" :class="{ active: viewMode === 'cards' }" @click="$emit('update-view', 'cards')"><i class="fa-solid fa-grip"></i></button>
          <button class="app-view-btn" :class="{ active: viewMode === 'kanban' }" @click="$emit('update-view', 'kanban')"><i class="fa-solid fa-table-columns"></i></button>
          <button class="app-view-btn" :class="{ active: viewMode === 'dashboard' }" @click="$emit('update-view', 'dashboard')"><i class="fa-solid fa-chart-pie"></i></button>
        </div>

      <button class="app-toolbar-new-record app-btn-blue-pro" type="button" @click="$emit('new-record')">
        <i class="fa-solid fa-plus"></i>
        <span>{{ i18n.newrecordButton || 'New' }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import DataTableViewsManager from 'app/datatable/DataTableViewsManager.vue';

export default {
  name: 'DataTableToolbar',
  components: { DataTableViewsManager },
  props: {
    views: { type: Array, default: () => [] },
    activeViewId: { type: String, default: '' },
    i18n: { type: Object, default: () => ({}) },
    isDirty: { type: Boolean, default: false },
    search: { type: String, default: '' },
    toolbarExpanded: { type: Boolean, default: false },
    showColumnFilters: { type: Boolean, default: false },
    activeRuleCount: { type: Number, default: 0 },
    favoriteActive: { type: Boolean, default: false },
    viewMode: { type: String, default: 'table' },
    groupByKey: { type: String, default: '' },
  },
  emits: ['update:search', 'toggle-toolbar', 'toggle-column-filters', 'open-settings', 'open-save-view', 'export', 'import', 'refresh', 'update-view', 'new-record', 'select-view'],
};
</script>
