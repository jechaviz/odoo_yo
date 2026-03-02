<template>
  <component
    :is="tagName"
    class="app-tag"
    :class="[`is-${toneName}`, { 'is-clickable': clickable }]"
    :type="tagName === 'button' ? 'button' : null"
    @click="handleClick"
  >
    <i v-if="icon" :class="icon"></i>
    <span>{{ label }}</span>
  </component>
</template>

<script>
export default {
  name: 'Tag',
  emits: ['click'],
  props: {
    label: { type: String, required: true },
    tone: { type: String, default: 'default' },
    icon: { type: String, default: '' },
    clickable: { type: Boolean, default: false },
  },
  computed: {
    toneName() {
      return String(this.tone || 'default').trim().toLowerCase().replace(/\s+/g, '-');
    },
    tagName() {
      return this.clickable ? 'button' : 'span';
    },
  },
  methods: {
    handleClick() {
      if (this.clickable) this.$emit('click');
    },
  },
};
</script>
