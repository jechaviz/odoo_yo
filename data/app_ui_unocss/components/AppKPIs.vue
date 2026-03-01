<template>
  <div class="app-kpi-grid-pro" :class="{ 'is-collapsed': collapsed }">
    <div
      v-for="(kpi, idx) in kpis"
      :key="kpiKey(kpi, idx)"
      class="app-stat-card"
      :class="[kpi.type, { 'is-collapsed': collapsed }]"
    >
      <div class="app-stat-head">
        <div class="app-stat-label">
          {{ kpi.label }}
          <span v-if="kpi.count !== undefined && !collapsed" class="app-stat-count">({{ kpi.count }} Invoices)</span>
        </div>
      </div>
      <div class="app-stat-value" :class="{ 'app-stat-value--compact': collapsed }">{{ kpi.value }}</div>
      <div class="app-stat-accent" :style="{ background: kpi.color }"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppKPIs',
  props: {
    kpis: { type: Array, required: true },
    collapsed: { type: Boolean, default: true },
  },
  methods: {
    kpiKey(kpi, idx) {
      return `${kpi?.type || 'kpi'}:${kpi?.label || idx}`;
    },
  },
};
</script>

<style scoped>
/* Scoped overrides only - core styles moved to css/* modular files */
</style>
