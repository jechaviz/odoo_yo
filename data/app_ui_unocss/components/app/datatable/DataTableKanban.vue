<template>
  <div class="app-kanban-wrap">
    <article
      v-for="bucket in buckets"
      :key="bucket.key"
      class="app-kanban-column"
      @dragover.prevent
      @drop="handleDrop(bucket.key)"
    >
      <header class="app-kanban-head">
        <h4>{{ bucket.label }}</h4>
        <span>{{ bucket.rows.length }}</span>
      </header>

      <div class="app-kanban-stack">
        <div
          v-for="row in bucket.rows"
          :key="row.id"
          class="app-kanban-card"
          draggable="true"
          @dragstart="draggingId = row.id"
          @contextmenu.prevent="$emit('open-context', $event, row)"
        >
          <div class="app-kanban-card-head">
            <span class="mono">{{ row.series }}-{{ row.folio }}</span>
            <span class="app-status-pill" :class="`app-status-${String(row.type || 'draft').toLowerCase()}`">{{ row.statusText || row.type }}</span>
          </div>
          <h5>{{ row.billTo }}</h5>
          <p>{{ row.billFrom }}</p>
          <footer>
            <strong>{{ formatMoney(row.total) }}</strong>
            <span>{{ row.owner || '-' }}</span>
          </footer>
        </div>
      </div>
    </article>
  </div>
</template>

<script>
export default {
  name: 'DataTableKanban',
  props: {
    buckets: { type: Array, default: () => [] },
    formatMoney: { type: Function, required: true },
  },
  emits: ['move-record', 'open-context'],
  data() {
    return { draggingId: '' };
  },
  methods: {
    handleDrop(bucketKey) {
      if (!this.draggingId) return;
      this.$emit('move-record', { rowId: this.draggingId, bucketKey });
      this.draggingId = '';
    },
  },
};
</script>
