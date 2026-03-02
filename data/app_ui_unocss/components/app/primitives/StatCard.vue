<template>
  <article
    class="app-shell-stat-card"
    :class="[
      `is-${variantName}`,
      { 'is-compact': compact, 'is-interactive': interactive, 'is-open': open },
    ]"
    @click="$emit('select')"
    @contextmenu.prevent="$emit('contextmenu', $event)"
  >
    <div class="app-shell-stat-card__head">
      <div class="app-shell-stat-card__copy">
        <p class="app-shell-stat-card__label">{{ title }}</p>
        <p class="app-shell-stat-card__value">{{ value }}</p>
        <p v-if="description && !compact" class="app-shell-stat-card__description">{{ description }}</p>
      </div>
      <div v-if="icon" class="app-shell-stat-card__icon">
        <i :class="icon"></i>
      </div>
    </div>

    <div v-if="!compact && footerText" class="app-shell-stat-card__footer">
      {{ footerText }}
    </div>

    <div
      class="app-shell-stat-card__accent"
      :style="accentStyle"
      aria-hidden="true"
    ></div>
  </article>
</template>

<script>
export default {
  name: 'StatCard',
  emits: ['contextmenu', 'select'],
  props: {
    title: { type: String, required: true },
    value: { type: String, required: true },
    description: { type: String, default: '' },
    count: { type: [String, Number], default: '' },
    icon: { type: String, default: '' },
    color: { type: String, default: '' },
    compact: { type: Boolean, default: false },
    interactive: { type: Boolean, default: false },
    open: { type: Boolean, default: false },
    variant: { type: String, default: 'default' },
  },
  computed: {
    accentStyle() {
      return this.color ? { background: this.color, color: this.color } : {};
    },
    footerText() {
      if (this.count === '' || this.count === null || this.count === undefined) return '';
      return `${this.count}`;
    },
    variantName() {
      return String(this.variant || 'default')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-');
    },
  },
};
</script>

<style scoped>
/* Scoped overrides only - core styles moved to css/* modular files */
</style>
