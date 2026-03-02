<template>
  <section class="app-collapsible-card" :class="{ 'is-open': open }">
    <button type="button" class="app-collapsible-card__header" @click="$emit('toggle')">
      <div class="app-collapsible-card__copy">
        <div class="app-collapsible-card__title-row">
          <i v-if="icon" :class="icon"></i>
          <h3 class="app-collapsible-card__title">{{ title }}</h3>
        </div>
        <p v-if="subtitle" class="app-collapsible-card__subtitle">{{ subtitle }}</p>
      </div>
      <div class="app-collapsible-card__chevron">
        <i class="fa-solid fa-chevron-down" :class="{ 'is-rotated': open }"></i>
      </div>
    </button>
    <div class="app-collapsible-card__content">
      <div class="app-collapsible-card__content-inner">
        <slot />
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'CollapsibleCard',
  emits: ['toggle'],
  props: {
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    icon: { type: String, default: '' },
    open: { type: Boolean, default: false },
  },
};
</script>

<style scoped>
/* Scoped overrides only - core styles moved to css/* modular files */
</style>
