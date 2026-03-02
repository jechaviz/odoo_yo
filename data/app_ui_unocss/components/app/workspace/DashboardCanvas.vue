<template>
  <CollapsibleCard :title="title" :subtitle="subtitle" icon="fa-solid fa-chart-simple" :open="open" @toggle="$emit('toggle')">
    <div class="app-dashboard-canvas">
      <LazyOnVisible
        v-for="section in sections"
        :key="section.key"
        :min-height="220"
        root-margin="220px"
      >
        <DashboardSection
          :section="section"
          @cta="$emit('section-cta', $event)"
          @widget-action="$emit('widget-action', $event)"
          @widget-select="$emit('widget-select', $event)"
          @widget-contextmenu="$emit('widget-contextmenu', $event)"
        />
        <template #fallback>
          <div class="app-dashboard-section app-dashboard-section--loading ui-card">
            <div class="app-dashboard-section__loading">
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
import DashboardSection from 'app/workspace/DashboardSection.vue';

export default {
  name: 'DashboardCanvas',
  components: {
    CollapsibleCard,
    DashboardSection,
    LazyOnVisible,
    Spinner,
  },
  emits: ['section-cta', 'toggle', 'widget-action', 'widget-contextmenu', 'widget-select'],
  props: {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    open: { type: Boolean, default: true },
    sections: { type: Array, default: () => [] },
    loadingLabel: { type: String, default: 'Loading section...' },
  },
};
</script>
