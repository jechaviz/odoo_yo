<template>
  <div class="app-table-footer">
    <div class="app-footer-info">
      <span>{{ footerLabel }}</span>
      <label class="app-page-size">
        <span>{{ i18n.showLabel || 'Show' }}</span>
        <select :value="pageSize" @change="$emit('change-page-size', $event)">
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
        <span>{{ i18n.perPageLabel || 'per page' }}</span>
      </label>
    </div>

    <div class="app-pagination">
      <button class="app-page-btn" :disabled="safePage <= 1" @click="$emit('set-page', safePage - 1)"><i class="fa-solid fa-chevron-left"></i></button>
      <button v-for="page in pageButtons" :key="page" class="app-page-btn" :class="{ active: page === safePage }" @click="$emit('set-page', page)">{{ page }}</button>
      <button class="app-page-btn" :disabled="safePage >= pageCount" @click="$emit('set-page', safePage + 1)"><i class="fa-solid fa-chevron-right"></i></button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataTableFooter',
  props: {
    footerLabel: { type: String, default: '' },
    pageSize: { type: Number, default: 10 },
    safePage: { type: Number, default: 1 },
    pageCount: { type: Number, default: 1 },
    pageButtons: { type: Array, default: () => [] },
    i18n: { type: Object, default: () => ({}) },
  },
  emits: ['set-page', 'change-page-size'],
};
</script>
