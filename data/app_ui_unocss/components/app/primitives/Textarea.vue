<template>
  <label class="app-textarea">
    <span v-if="label" class="app-textarea__label">{{ label }}</span>
    <textarea
      :value="modelValue"
      :rows="rows"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', $event.target.value)"
    ></textarea>
    <small v-if="hint" class="app-textarea__hint">{{ hint }}</small>
  </label>
</template>

<script>
export default {
  name: 'Textarea',
  emits: ['update:modelValue'],
  props: {
    modelValue: { type: String, default: '' },
    label: { type: String, default: '' },
    hint: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    rows: { type: Number, default: 4 },
  },
};
</script>
