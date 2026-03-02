<template>
  <article
    class="app-dashboard-widget"
    :class="[`is-${widget.tone || 'default'}`]"
    @click="$emit('select', widget)"
    @contextmenu.prevent="$emit('contextmenu', { event: $event, widget })"
  >
    <header class="app-dashboard-widget__header">
      <div>
        <p class="app-dashboard-widget__eyebrow">{{ widget.eyebrow }}</p>
        <h4>{{ widget.title }}</h4>
      </div>
      <button v-if="widget.ctaLabel" type="button" class="app-dashboard-widget__cta" @click.stop="$emit('action', widget)">
        {{ widget.ctaLabel }}
      </button>
    </header>

    <div class="app-dashboard-widget__metric-row">
      <strong class="app-dashboard-widget__metric">{{ widget.metric }}</strong>
      <span v-if="widget.delta" class="app-dashboard-widget__delta">{{ widget.delta }}</span>
    </div>

    <p class="app-dashboard-widget__description">{{ widget.description }}</p>

    <div v-if="widget.badges?.length" class="app-dashboard-widget__badges">
      <Tag v-for="badge in widget.badges" :key="badge" :label="badge" tone="default" />
    </div>

    <footer class="app-dashboard-widget__footer">
      <div v-for="item in widget.meta || []" :key="item.label" class="app-dashboard-widget__meta">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </div>
      <ProgressCircle
        v-if="Number.isFinite(Number(widget.score))"
        :value="Number(widget.score)"
        :size="72"
        :tone="widget.tone || 'primary'"
        class="app-dashboard-widget__score"
      />
    </footer>
  </article>
</template>

<script>
import ProgressCircle from 'app/primitives/ProgressCircle.vue';
import Tag from 'app/primitives/Tag.vue';

export default {
  name: 'DashboardWidget',
  components: {
    ProgressCircle,
    Tag,
  },
  emits: ['action', 'contextmenu', 'select'],
  props: {
    widget: { type: Object, required: true },
  },
};
</script>
