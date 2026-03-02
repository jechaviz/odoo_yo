<template>
  <section class="app-shell-insights">
    <header class="app-shell-insights__header">
      <div>
        <h2>{{ title }}</h2>
        <p>{{ subtitle }}</p>
      </div>
    </header>
    <div class="app-shell-insights__grid">
      <Card
        v-for="item in items"
        :key="item.key"
        class="app-shell-insight"
        :tone="item.tone || 'default'"
      >
        <div class="app-shell-insight__copy">
          <p class="app-shell-insight__eyebrow">{{ item.eyebrow }}</p>
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
          <div class="app-shell-insight__meta">
            <span>{{ item.metaLabel }}</span>
            <strong>{{ item.metaValue }}</strong>
          </div>
        </div>
        <ProgressCircle
          :value="item.progress"
          :label="item.progressLabel"
          :tone="item.tone || 'primary'"
        />
      </Card>
    </div>
  </section>
</template>

<script>
import Card from 'app/primitives/Card.vue';
import ProgressCircle from 'app/primitives/ProgressCircle.vue';

export default {
  name: 'ShellInsights',
  components: {
    Card,
    ProgressCircle,
  },
  props: {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    items: {
      type: Array,
      default: () => [],
    },
  },
};
</script>

<style scoped>
/* Scoped overrides only - core styles moved to css/* modular files */
</style>
