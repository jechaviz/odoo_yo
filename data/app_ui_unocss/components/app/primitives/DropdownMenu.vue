<template>
  <div ref="host" class="app-dropdown" :class="{ 'is-open': isOpen }">
    <div class="app-dropdown__trigger" @click.stop="toggle">
      <slot name="trigger" :open="isOpen" :toggle="toggle" :close="close"></slot>
    </div>

    <Transition name="app-fade-pro">
      <div
        v-if="isOpen"
        class="app-dropdown__panel app-glass-heavy"
        :class="[alignClass, widthClass, contentClass]"
        @mousedown.stop
        @click.stop
      >
        <slot :open="isOpen" :toggle="toggle" :close="close"></slot>
      </div>
    </Transition>
  </div>
</template>

<script>
export default {
  name: 'DropdownMenu',
  emits: ['close', 'open'],
  props: {
    align: { type: String, default: 'right' },
    width: { type: String, default: 'md' },
    contentClass: { type: [String, Array, Object], default: '' },
    closeOnScroll: { type: Boolean, default: true },
  },
  data() {
    return {
      isOpen: false,
    };
  },
  computed: {
    alignClass() {
      return this.align === 'left' ? 'is-left' : 'is-right';
    },
    widthClass() {
      return `is-${String(this.width || 'md').trim().toLowerCase()}`;
    },
  },
  mounted() {
    document.addEventListener('mousedown', this.handleOutside, true);
    document.addEventListener('keydown', this.handleEscape, true);
    if (this.closeOnScroll) {
      document.addEventListener('scroll', this.close, true);
      window.addEventListener('resize', this.close, true);
    }
  },
  beforeUnmount() {
    document.removeEventListener('mousedown', this.handleOutside, true);
    document.removeEventListener('keydown', this.handleEscape, true);
    if (this.closeOnScroll) {
      document.removeEventListener('scroll', this.close, true);
      window.removeEventListener('resize', this.close, true);
    }
  },
  methods: {
    open() {
      if (this.isOpen) return;
      this.isOpen = true;
      this.$emit('open');
    },
    close() {
      if (!this.isOpen) return;
      this.isOpen = false;
      this.$emit('close');
    },
    toggle() {
      if (this.isOpen) {
        this.close();
        return;
      }
      this.open();
    },
    handleEscape(event) {
      if (event.key === 'Escape') this.close();
    },
    handleOutside(event) {
      if (!this.isOpen) return;
      const host = this.$refs.host;
      if (host && !host.contains(event.target)) this.close();
    },
  },
};
</script>

<style scoped>
/* Scoped overrides only - core styles moved to css/* modular files */
</style>
