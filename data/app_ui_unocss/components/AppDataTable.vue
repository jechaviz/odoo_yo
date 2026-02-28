<template>
  <div class="app-data-table-shell">
    <!-- Buyniverse Table Toolbar -->
    <div class="app-table-toolbar">
      <div class="app-toolbar-left">
        <div class="app-toolbar-search">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" 
                 v-model="internalFilter" 
                 @input="handleSearch"
                 placeholder="Search records...">
        </div>
      </div>
      <div class="app-toolbar-right">
        <div class="app-view-switcher">
          <button class="app-view-btn" :class="{ active: viewMode === 'table' }" @click="$emit('update-view', 'table')">
            <i class="fa-solid fa-table"></i>
          </button>
          <button class="app-view-btn" :class="{ active: viewMode === 'cards' }" @click="$emit('update-view', 'cards')">
            <i class="fa-solid fa-grip"></i>
          </button>
        </div>
        <div class="app-toolbar-sep"></div>
        <button class="app-toolbar-btn" title="Search Filters"><i class="fa-solid fa-filter"></i></button>
        <button class="app-toolbar-btn" title="Group By"><i class="fa-solid fa-layer-group"></i></button>
        <button class="app-toolbar-btn" title="Favorites"><i class="fa-solid fa-star"></i></button>
        <div class="app-toolbar-sep"></div>
        <button class="app-toolbar-btn" title="Export"><i class="fa-solid fa-download"></i></button>
        <button class="app-toolbar-btn" title="Import"><i class="fa-solid fa-upload"></i></button>
        <button class="app-toolbar-btn" title="Refresh Table"><i class="fa-solid fa-arrows-rotate"></i></button>
        <button class="app-toolbar-btn" title="Configuration"><i class="fa-solid fa-sliders"></i></button>
      </div>
    </div>

    <!-- Main Table / Cards View -->
    <div class="app-table-content" :class="{ 'cards-view': viewMode === 'cards' }">
      <slot name="content" :viewMode="viewMode"></slot>
    </div>

    <!-- Table Footer / Pagination -->
    <div class="app-table-footer">
      <div class="app-footer-info">
        Showing 1 to 10 of 42 entries
      </div>
      <div class="app-pagination">
        <button class="app-page-btn disabled"><i class="fa-solid fa-chevron-left"></i></button>
        <button class="app-page-btn active">1</button>
        <button class="app-page-btn">2</button>
        <button class="app-page-btn">3</button>
        <button class="app-page-btn"><i class="fa-solid fa-chevron-right"></i></button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppDataTable',
  props: {
    viewMode: { type: String, default: 'table' }
  },
  data() {
    return {
      internalFilter: ''
    };
  },
  methods: {
    handleSearch() {
      this.$emit('search', this.internalFilter);
    }
  }
};
</script>

<style scoped>
/* Scoped overrides only - core styles moved to 20_components.css */
</style>
