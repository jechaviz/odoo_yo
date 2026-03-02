<template>
  <div ref="kpiRoot" class="app-kpi-grid-pro" :class="{ 'is-collapsed': collapsed }">
    <StatCard
      v-for="(kpi, idx) in kpis"
      :key="kpiKey(kpi, idx)"
      class="app-stat-card"
      :compact="collapsed"
      :title="kpi.label"
      :value="kpi.value"
      :description="kpiDescription(kpi)"
      :count="kpiCount(kpi)"
      :color="kpi.color"
      :variant="kpi.type || 'default'"
      :interactive="true"
      :open="Boolean(kpi.isOpen)"
      @contextmenu="$emit('card-contextmenu', { event: $event, kpi })"
      @select="$emit('card-select', kpi)"
    />
  </div>
</template>

<script>
import StatCard from 'app/primitives/StatCard.vue';

export default {
  name: 'KPIs',
  components: {
    StatCard,
  },
  emits: ['card-contextmenu', 'card-select'],
  props: {
    kpis: { type: Array, required: true },
    collapsed: { type: Boolean, default: true },
  },
  data() {
    return {
      resizeObserver: null,
    };
  },
  mounted() {
    this.$nextTick(() => this.syncInlineCardWidth());
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.syncInlineCardWidth());
      if (this.$refs.kpiRoot) this.resizeObserver.observe(this.$refs.kpiRoot);
    }
    window.addEventListener('resize', this.syncInlineCardWidth);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.syncInlineCardWidth);
    if (this.resizeObserver) this.resizeObserver.disconnect();
  },
  watch: {
    kpis: {
      deep: true,
      handler() {
        this.$nextTick(() => this.syncInlineCardWidth());
      },
    },
    collapsed() {
      this.$nextTick(() => this.syncInlineCardWidth());
    },
  },
  methods: {
    kpiKey(kpi, idx) {
      return `${kpi?.type || 'kpi'}:${kpi?.label || idx}`;
    },
    kpiDescription(kpi) {
      if (!kpi) return '';
      if (kpi.description) return kpi.description;
      if (this.collapsed) return '';
      if (kpi.count === undefined || kpi.count === null) return '';
      return `${kpi.count} invoices`;
    },
    kpiCount(kpi) {
      if (this.collapsed) return '';
      return kpi?.count ?? '';
    },
    syncInlineCardWidth() {
      const root = this.$refs.kpiRoot;
      if (!root) return;

      root.style.removeProperty('--app-kpi-inline-card-width');
      const isInline = root.classList.contains('app-kpi-inline');
      if (!isInline || !this.collapsed) return;

      const cards = Array.from(root.querySelectorAll('.app-stat-card'));
      if (!cards.length) return;

      let maxWidth = 0;
      cards.forEach((card) => {
        const prevWidth = card.style.width;
        card.style.width = 'max-content';
        const width = Math.ceil(card.getBoundingClientRect().width);
        maxWidth = Math.max(maxWidth, width);
        card.style.width = prevWidth;
      });

      const normalized = Math.max(136, Math.min(220, maxWidth + 4));
      root.style.setProperty('--app-kpi-inline-card-width', `${normalized}px`);
    },
  },
};
</script>

<style scoped>
/* Scoped overrides only - core styles moved to css/* modular files */
</style>
