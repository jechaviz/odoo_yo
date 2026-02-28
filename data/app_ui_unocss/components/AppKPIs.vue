<template>
  <div class="app-kpi-grid-pro">
    <div v-for="kpi in kpis" 
         :key="kpi.label" 
         class="app-stat-card" 
         :class="kpi.type">
      <div class="app-stat-value">{{ kpi.value }}</div>
      <div class="app-stat-label">
        {{ kpi.label }} 
        <span v-if="kpi.count !== undefined" class="app-stat-count">({{ kpi.count }} Invoices)</span>
      </div>
      <div class="app-stat-accent" :style="{ background: kpi.color }"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppKPIs',
  props: {
    kpis: { type: Array, required: true }
  }
};
</script>

<style scoped>
/* Scoped overrides only - core styles moved to 20_components.css */
</style>
