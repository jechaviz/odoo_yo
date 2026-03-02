<template>
  <div v-if="groupKey && buckets.length" class="app-group-tabs">
    <button
      class="app-group-tab"
      :class="{ active: activeBucket === '' }"
      type="button"
      @click="$emit('select-bucket', '')"
    >
      <span>{{ i18n.filterAll || 'All' }}</span>
      <small>{{ totalCount }}</small>
    </button>

    <button
      v-for="bucket in buckets"
      :key="bucket.key"
      class="app-group-tab"
      :class="{ active: activeBucket === bucket.key }"
      type="button"
      @click="$emit('select-bucket', bucket.key)"
    >
      <span>{{ bucket.label }}</span>
      <small>{{ bucket.rows.length }}</small>
    </button>
  </div>
</template>

<script>
export default {
  name: 'DataTableGroupTabs',
  props: {
    groupKey: { type: String, default: '' },
    buckets: { type: Array, default: () => [] },
    activeBucket: { type: String, default: '' },
    totalCount: { type: Number, default: 0 },
    i18n: { type: Object, default: () => ({}) },
  },
  emits: ['select-bucket'],
};
</script>
