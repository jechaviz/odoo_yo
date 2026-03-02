<template>
  <section class="app-card-base" :class="[`is-${toneName}`, { 'is-interactive': interactive }]">
    <slot />
  </section>
</template>

<script>
export default {
  name: 'Card',
  props: {
    interactive: { type: Boolean, default: false },
    tone: { type: String, default: 'default' },
  },
  computed: {
    toneName() {
      return String(this.tone || 'default')
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
