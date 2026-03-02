<template>
  <nav class="app-breadcrumbs" aria-label="Breadcrumb">
    <template v-for="(item, index) in items" :key="item.key || item.label || index">
      <a
        v-if="!item.active"
        href="#"
        class="app-bc-item navigable"
        @click.prevent="navigate(item)"
      >
        <i v-if="item.icon" :class="item.icon"></i>
        <span>{{ item.label }}</span>
      </a>
      <span v-else class="app-bc-item active">
        <i v-if="item.icon" :class="item.icon"></i>
        <span>{{ item.label }}</span>
      </span>
      <i
        v-if="index < items.length - 1"
        class="fa-solid fa-chevron-right app-bc-sep"
      ></i>
    </template>
  </nav>
</template>

<script>
export default {
  name: 'Breadcrumbs',
  emits: ['navigate'],
  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    navigate(item) {
      this.$emit('navigate', item);
    },
  },
};
</script>

<style scoped>
/* Scoped overrides only - core styles moved to css/* modular files */
</style>
