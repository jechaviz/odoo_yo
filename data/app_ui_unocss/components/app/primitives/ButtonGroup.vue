<template>
  <div class="app-button-group" role="group">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="app-button-group__option"
      :class="{ 'is-active': option.value === modelValue }"
      @click="select(option.value)"
    >
      <i v-if="option.icon" :class="option.icon"></i>
      <span>{{ option.label }}</span>
    </button>
  </div>
</template>

<script>
export default {
  name: 'ButtonGroup',
  emits: ['change', 'update:modelValue'],
  props: {
    modelValue: { type: String, default: '' },
    options: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    select(value) {
      this.$emit('update:modelValue', value);
      this.$emit('change', value);
    },
  },
};
</script>

<style scoped>
/* Scoped overrides only - core styles moved to css/* modular files */
</style>
