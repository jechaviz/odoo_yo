<template>
  <button
    :type="type"
    class="app-button"
    :class="[
      `is-${variantName}`,
      `is-${sizeName}`,
      { 'is-block': block, 'has-icon-only': iconOnly },
    ]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <i v-if="icon && iconPosition === 'leading'" :class="icon"></i>
    <span v-if="!iconOnly" class="app-button__label">
      <slot>{{ label }}</slot>
    </span>
    <i v-if="icon && iconPosition === 'trailing'" :class="icon"></i>
  </button>
</template>

<script>
export default {
  name: 'Button',
  emits: ['click'],
  props: {
    type: { type: String, default: 'button' },
    variant: { type: String, default: 'primary' },
    size: { type: String, default: 'md' },
    label: { type: String, default: '' },
    icon: { type: String, default: '' },
    iconPosition: { type: String, default: 'leading' },
    iconOnly: { type: Boolean, default: false },
    block: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  computed: {
    sizeName() {
      return String(this.size || 'md').trim().toLowerCase();
    },
    variantName() {
      return String(this.variant || 'primary').trim().toLowerCase();
    },
  },
};
</script>

<style scoped>
/* Scoped overrides only - core styles moved to css/* modular files */
</style>
