<template>
  <div class="app-star-input" role="radiogroup">
    <button
      v-for="index in safeMax"
      :key="index"
      type="button"
      class="app-star-input__button"
      :class="{ 'is-active': index <= safeValue }"
      :aria-checked="index === safeValue ? 'true' : 'false'"
      role="radio"
      @click="$emit('update:modelValue', index)"
    >
      <i class="fa-solid fa-star"></i>
    </button>
  </div>
</template>

<script>
export default {
  name: 'StarInput',
  emits: ['update:modelValue'],
  props: {
    modelValue: { type: Number, default: 0 },
    max: { type: Number, default: 5 },
  },
  computed: {
    safeValue() {
      const value = Number(this.modelValue || 0);
      return Math.max(0, Math.min(this.safeMax, Number.isFinite(value) ? Math.round(value) : 0));
    },
    safeMax() {
      const value = Number(this.max || 5);
      return Math.max(1, Number.isFinite(value) ? Math.round(value) : 5);
    },
  },
};
</script>
