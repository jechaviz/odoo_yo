<template>
  <div class="app-record-card-grid">
    <article v-for="row in rows" :key="row.id" class="app-record-card" @contextmenu.prevent="$emit('open-context', $event, row)">
      <header class="app-record-card-head">
        <span class="app-record-card-id">{{ row.series }}-{{ row.folio }}</span>
        <span class="app-status-pill" :class="statusClass(row.type)">{{ statusLabel(row.type) }}</span>
      </header>
      <div class="app-record-card-body">
        <div><span>From:</span> <strong>{{ row.billFrom }}</strong></div>
        <div><span>To:</span> <strong>{{ row.billTo }}</strong></div>
        <div><span>Total:</span> <strong>{{ formatMoney(row.total) }}</strong></div>
        <div><span>Due:</span> <strong>{{ row.dueDateIso }}</strong></div>
        <div><span>Owner:</span> <strong>{{ row.owner || '-' }}</strong></div>
        <div class="app-inline-chip-list"><span v-for="tag in (row.tags || [])" :key="tag" class="app-mini-chip">{{ tag }}</span></div>
      </div>
      <footer class="app-record-card-actions">
        <button type="button" class="app-row-action" title="Open"><i class="fa-solid fa-eye"></i></button>
        <button type="button" class="app-row-action" title="Edit" @click="$emit('edit-row', row)"><i class="fa-solid fa-pen"></i></button>
        <button type="button" class="app-row-action" title="Send"><i class="fa-solid fa-paper-plane"></i></button>
      </footer>
    </article>
  </div>
</template>

<script>
const DATATABLE_FILTERS = window.odooApp?.datatable?.filters || {};
const { statusLabel = (value) => String(value || '') } = DATATABLE_FILTERS;

export default {
  name: 'DataTableCards',
  props: {
    rows: { type: Array, default: () => [] },
    formatMoney: { type: Function, required: true },
  },
  emits: ['open-context', 'edit-row'],
  methods: {
    statusLabel,
    statusClass(type) {
      return `app-status-${String(type || 'draft').toLowerCase()}`;
    },
  },
};
</script>
