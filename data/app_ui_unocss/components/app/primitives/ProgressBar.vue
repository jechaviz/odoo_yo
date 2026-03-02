<template>
  <div class="app-progress" :class="`is-${toneName}`" role="progressbar" :aria-valuenow="cappedValue" aria-valuemin="0" aria-valuemax="100">
    <div class="app-progress__track">
      <div class="app-progress__value" :style="{ width: `${cappedValue}%` }"></div>
    </div>
    <div v-if="showMeta" class="app-progress__meta">
      <span class="app-progress__label">{{ label }}</span>
      <strong class="app-progress__number">{{ cappedValue }}%</strong>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProgressBar',
  props: {
    value: { type: Number, default: 0 },
    label: { type: String, default: '' },
    tone: { type: String, default: 'primary' },
    showMeta: { type: Boolean, default: true },
  },
  computed: {
    cappedValue() {
      return Math.max(0, Math.min(100, Math.round(Number(this.value || 0))));
    },
    toneName() {
      return String(this.tone || 'primary').trim().toLowerCase();
    },
  },
};
</script>

<style scoped>
/* Scoped overrides only - core styles moved to css/* modular files */
</style>
