<template>
  <Tooltip v-if="tooltipLabel" :content="tooltipLabel">
    <div class="app-user-avatar" :class="[sizeClass, { 'has-status': status }]">
      <img
        v-if="avatar"
        :src="avatar"
        :alt="name"
        class="app-user-avatar__image"
        loading="lazy"
        decoding="async"
      >
      <span v-else class="app-user-avatar__initials">{{ initials }}</span>
      <span v-if="status" class="app-user-avatar__status" :class="`is-${status}`"></span>
    </div>
  </Tooltip>
  <div v-else class="app-user-avatar" :class="[sizeClass, { 'has-status': status }]">
    <img
      v-if="avatar"
      :src="avatar"
      :alt="name"
      class="app-user-avatar__image"
      loading="lazy"
      decoding="async"
    >
    <span v-else class="app-user-avatar__initials">{{ initials }}</span>
    <span v-if="status" class="app-user-avatar__status" :class="`is-${status}`"></span>
  </div>
</template>

<script>
import Tooltip from 'app/primitives/Tooltip.vue';

export default {
  name: 'UserAvatar',
  components: {
    Tooltip,
  },
  props: {
    name: { type: String, default: '' },
    avatar: { type: String, default: '' },
    size: { type: String, default: 'md' },
    status: { type: String, default: '' },
    tooltip: { type: Boolean, default: true },
  },
  computed: {
    initials() {
      const words = String(this.name || 'User')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2);
      return words.map((word) => word.charAt(0).toUpperCase()).join('') || 'U';
    },
    sizeClass() {
      return `is-${String(this.size || 'md').trim().toLowerCase()}`;
    },
    tooltipLabel() {
      if (!this.tooltip) return '';
      return this.name || '';
    },
  },
};
</script>

<style scoped>
/* Scoped overrides only - core styles moved to css/* modular files */
</style>
