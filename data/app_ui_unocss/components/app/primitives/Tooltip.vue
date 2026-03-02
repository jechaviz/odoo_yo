<template>
  <div
    class="app-tooltip"
    @mouseenter="visible = true"
    @mouseleave="visible = false"
    @focusin="visible = true"
    @focusout="visible = false"
  >
    <slot></slot>
    <Transition name="app-fade-pro">
      <div
        v-if="content && visible"
        class="app-tooltip__bubble"
        :class="`is-${placement}`"
      >
        {{ content }}
      </div>
    </Transition>
  </div>
</template>

<script>
export default {
  name: 'Tooltip',
  props: {
    content: { type: String, default: '' },
    placement: { type: String, default: 'bottom' },
  },
  data() {
    return {
      visible: false,
    };
  },
};
</script>

<style scoped>
/* Scoped overrides only - core styles moved to css/* modular files */
</style>
