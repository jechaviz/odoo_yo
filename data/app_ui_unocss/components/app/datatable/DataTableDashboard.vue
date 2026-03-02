<template>
  <div class="app-table-dashboard">
    <section class="app-table-dashboard-grid">
      <article class="app-dashboard-mini-card" v-for="metric in metrics" :key="metric.key">
        <small>{{ metric.label }}</small>
        <strong>{{ metric.value }}</strong>
        <span>{{ metric.meta }}</span>
      </article>
    </section>

    <section class="app-table-dashboard-groups">
      <article class="app-dashboard-group-card" v-for="bucket in buckets" :key="bucket.key">
        <header>
          <h4>{{ bucket.label }}</h4>
          <span>{{ bucket.rows.length }}</span>
        </header>
        <div class="app-dashboard-group-list">
          <div v-for="row in bucket.rows.slice(0, 3)" :key="row.id" class="app-dashboard-group-row">
            <div>
              <strong>{{ row.billTo }}</strong>
              <small>{{ row.series }}-{{ row.folio }}</small>
            </div>
            <strong>{{ formatMoney(row.total) }}</strong>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<script>
export default {
  name: 'DataTableDashboard',
  props: {
    rows: { type: Array, default: () => [] },
    buckets: { type: Array, default: () => [] },
    formatMoney: { type: Function, required: true },
    i18n: { type: Object, default: () => ({}) },
  },
  computed: {
    metrics() {
      const total = this.rows.reduce((sum, row) => sum + Number(row.total || 0), 0);
      const overdue = this.rows.filter((row) => row.type === 'overdue');
      const draft = this.rows.filter((row) => row.type === 'draft');
      return [
        { key: 'total', label: this.i18n.tableTotalCost || 'Total Cost', value: this.formatMoney(total), meta: `${this.rows.length} records` },
        { key: 'overdue', label: this.i18n.filterOverdue || 'Overdue', value: this.formatMoney(overdue.reduce((sum, row) => sum + Number(row.total || 0), 0)), meta: `${overdue.length} records` },
        { key: 'draft', label: this.i18n.filterDraft || 'Draft', value: this.formatMoney(draft.reduce((sum, row) => sum + Number(row.total || 0), 0)), meta: `${draft.length} records` },
      ];
    },
  },
};
</script>
