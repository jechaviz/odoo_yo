<template>
  <Teleport to="body">
    <div v-if="visible" class="app-modal-layer" @click.self="$emit('close')">
      <div class="app-modal app-glass-heavy" :class="sizeClass" role="dialog" aria-modal="true">
        <header class="app-modal__header">
          <div class="app-modal__copy">
            <h3 class="app-modal__title">{{ title }}</h3>
            <p v-if="subtitle" class="app-modal__subtitle">{{ subtitle }}</p>
          </div>
          <button type="button" class="app-modal__close" @click="$emit('close')">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </header>
        <div class="app-modal__body">
          <slot></slot>
        </div>
        <footer v-if="$slots.footer" class="app-modal__footer">
          <slot name="footer"></slot>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: 'Modal',
  emits: ['close'],
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    size: { type: String, default: 'lg' },
  },
  computed: {
    sizeClass() {
      return `is-${String(this.size || 'lg').trim().toLowerCase()}`;
    },
  },
  mounted() {
    document.addEventListener('keydown', this.handleEscape, true);
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleEscape, true);
  },
  methods: {
    handleEscape(event) {
      if (event.key === 'Escape' && this.visible) this.$emit('close');
    },
  },
};
</script>

<style scoped>
/* Scoped overrides only - core styles moved to css/* modular files */
</style>
