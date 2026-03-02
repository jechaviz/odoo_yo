<template>
  <section class="app-dashboard-section ui-card">
    <header class="app-dashboard-section__header">
      <div>
        <p class="app-dashboard-section__eyebrow">{{ section.eyebrow }}</p>
        <h3>{{ section.title }}</h3>
        <p>{{ section.subtitle }}</p>
      </div>
      <button v-if="section.ctaLabel" type="button" class="app-dashboard-section__cta" @click="$emit('cta', section)">
        {{ section.ctaLabel }}
      </button>
    </header>

    <div class="app-dashboard-section__grid">
      <DashboardWidget
        v-for="widget in section.widgets || []"
        :key="widget.key"
        :widget="widget"
        @action="$emit('widget-action', $event)"
        @select="$emit('widget-select', $event)"
        @contextmenu="$emit('widget-contextmenu', $event)"
      />
    </div>
  </section>
</template>

<script>
import DashboardWidget from 'app/workspace/DashboardWidget.vue';

export default {
  name: 'DashboardSection',
  components: { DashboardWidget },
  emits: ['cta', 'widget-action', 'widget-contextmenu', 'widget-select'],
  props: {
    section: { type: Object, required: true },
  },
};
</script>
