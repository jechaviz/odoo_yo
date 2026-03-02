<template>
  <div ref="host" class="app-lazy-on-visible" :style="hostStyle">
    <template v-if="isVisible">
      <slot></slot>
    </template>
    <template v-else>
      <slot name="fallback"></slot>
    </template>
  </div>
</template>

<script>
export default {
  name: 'LazyOnVisible',
  emits: ['visible'],
  props: {
    minHeight: {
      type: Number,
      default: 180,
    },
    rootMargin: {
      type: String,
      default: '160px',
    },
    once: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      isVisible: false,
      observer: null,
    };
  },
  computed: {
    hostStyle() {
      if (this.isVisible) return {};
      return { minHeight: `${Math.max(64, Number(this.minHeight || 0))}px` };
    },
  },
  mounted() {
    this.startObserver();
  },
  beforeUnmount() {
    this.stopObserver();
  },
  methods: {
    startObserver() {
      const element = this.$refs.host;
      if (!element) return;
      if (!('IntersectionObserver' in window)) {
        this.reveal();
        return;
      }
      this.observer = new IntersectionObserver((entries) => {
        const match = entries.find((entry) => entry.target === element);
        if (!match || !match.isIntersecting) return;
        this.reveal();
        if (this.once) this.stopObserver();
      }, { root: null, rootMargin: this.rootMargin, threshold: 0.05 });
      this.observer.observe(element);
    },
    stopObserver() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
    },
    reveal() {
      if (this.isVisible) return;
      this.isVisible = true;
      this.$emit('visible');
    },
  },
};
</script>

