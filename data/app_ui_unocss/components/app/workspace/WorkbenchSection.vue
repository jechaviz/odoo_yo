<template>
  <CollapsibleCard
    :title="title"
    :subtitle="subtitle"
    :icon="icon"
    :open="open"
    @toggle="$emit('toggle')"
  >
    <div :class="layoutClass">
      <LazyOnVisible
        v-for="card in cards"
        :key="card.key"
        :min-height="170"
        root-margin="180px"
      >
        <DataCard
          :title="card.title"
          :subtitle="card.subtitle"
          :icon="card.icon"
          :tone="card.tone"
          :body-items="card.bodyItems"
          :footer-items="card.footerItems"
          :cta-label="card.ctaLabel"
          :interactive="true"
          @action="$emit('card-action', card)"
          @select="$emit('card-select', card)"
          @contextmenu="$emit('card-contextmenu', { event: $event, card })"
        />
        <template #fallback>
          <div class="app-data-card app-data-card--loading ui-card">
            <div class="app-data-card__loading">
              <Spinner size="sm" :label="loadingLabel" />
              <span>{{ loadingLabel }}</span>
            </div>
          </div>
        </template>
      </LazyOnVisible>
    </div>
  </CollapsibleCard>
</template>

<script>
import CollapsibleCard from 'app/primitives/CollapsibleCard.vue';
import LazyOnVisible from 'app/primitives/LazyOnVisible.vue';
import Spinner from 'app/primitives/Spinner.vue';
import DataCard from 'app/workspace/DataCard.vue';

export default {
  name: 'WorkbenchSection',
  components: {
    CollapsibleCard,
    DataCard,
    LazyOnVisible,
    Spinner,
  },
  emits: ['card-action', 'card-contextmenu', 'card-select', 'toggle'],
  props: {
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    icon: { type: String, default: '' },
    open: { type: Boolean, default: false },
    layout: { type: String, default: 'grid' },
    cards: {
      type: Array,
      default: () => [],
    },
    loadingLabel: { type: String, default: 'Loading card...' },
  },
  computed: {
    layoutClass() {
      return this.layout === 'stack' ? 'app-shell-mini-stack' : 'app-shell-card-grid';
    },
  },
};
</script>

<style scoped>
/* Scoped overrides only - core styles moved to css/* modular files */
</style>
