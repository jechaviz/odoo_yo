<template>
  <div class="app-spinner" :class="[`is-${size}`]" role="status" :aria-label="label">
    <span class="app-spinner__ring"></span>
    <span class="app-spinner__sr">{{ label }}</span>
  </div>
</template>

<script>
export default {
  name: 'Spinner',
  props: {
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg'].includes(value),
    },
    label: {
      type: String,
      default: 'Loading',
    },
  },
};
</script>

