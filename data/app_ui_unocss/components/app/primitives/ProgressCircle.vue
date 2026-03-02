<template>
  <div class="app-progress-circle" :style="{ '--circle-size': `${size}px` }">
    <svg :width="size" :height="size" viewBox="0 0 120 120" class="app-progress-circle__svg">
      <circle class="app-progress-circle__track" cx="60" cy="60" :r="radius" />
      <circle
        class="app-progress-circle__value"
        :class="`is-${toneName}`"
        cx="60"
        cy="60"
        :r="radius"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
      />
    </svg>
    <div class="app-progress-circle__center">
      <strong>{{ normalizedValue }}%</strong>
      <span v-if="label">{{ label }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProgressCircle',
  props: {
    value: { type: Number, default: 0 },
    label: { type: String, default: '' },
    size: { type: Number, default: 108 },
    strokeWidth: { type: Number, default: 10 },
    tone: { type: String, default: 'primary' },
  },
  computed: {
    normalizedValue() {
      return Math.max(0, Math.min(100, Math.round(Number(this.value) || 0)));
    },
    toneName() {
      return String(this.tone || 'primary')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-');
    },
    radius() {
      return 60 - this.strokeWidth;
    },
    circumference() {
      return 2 * Math.PI * this.radius;
    },
    offset() {
      return this.circumference - (this.normalizedValue / 100) * this.circumference;
    },
  },
};
</script>

<style scoped>
/* Scoped overrides only - core styles moved to css/* modular files */
</style>
