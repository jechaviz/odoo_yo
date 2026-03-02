<template>
  <div class="app-input-field">
    <div v-if="label" class="app-input-field__label-row">
      <label v-if="inputId" :for="inputId" class="app-input-field__label">{{ label }}</label>
      <Tooltip v-if="tooltip" :content="tooltip">
        <span class="app-input-field__hint"><i class="fa-solid fa-circle-info"></i></span>
      </Tooltip>
    </div>
    <div class="app-input-field__control ui-focus-ring" :class="{ 'has-error': error }">
      <i v-if="icon" :class="icon" class="app-input-field__icon"></i>
      <input
        :id="inputId"
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :readonly="readonly"
        :disabled="disabled"
        @input="$emit('update:modelValue', $event.target.value)"
        @focus="$emit('focus', $event)"
        @click="$emit('click', $event)"
      >
    </div>
    <p v-if="error" class="app-input-field__error">{{ error }}</p>
  </div>
</template>

<script>
import Tooltip from 'app/primitives/Tooltip.vue';

export default {
  name: 'Input',
  components: {
    Tooltip,
  },
  emits: ['click', 'focus', 'update:modelValue'],
  props: {
    modelValue: { type: [String, Number], default: '' },
    label: { type: String, default: '' },
    tooltip: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    icon: { type: String, default: '' },
    error: { type: String, default: '' },
    id: { type: String, default: '' },
    type: { type: String, default: 'text' },
    readonly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  computed: {
    inputId() {
      if (this.id) return this.id;
      if (!this.label) return '';
      return this.label.toLowerCase().replace(/\s+/g, '-');
    },
  },
};
</script>

<style scoped>
/* Scoped overrides only - core styles moved to css/* modular files */
</style>
