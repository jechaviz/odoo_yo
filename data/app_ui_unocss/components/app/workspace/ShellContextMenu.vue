<template>
  <Teleport to="body">
    <div
      v-if="visible"
      ref="menuRoot"
      class="app-shell-context-menu app-glass-heavy"
      :style="menuStyle"
      @contextmenu.prevent
    >
      <template v-for="(item, index) in items" :key="item.key || index">
        <div v-if="item.type === 'separator'" class="app-shell-context-menu__separator"></div>
        <button
          v-else
          type="button"
          class="app-shell-context-menu__item"
          @mousedown.stop
          @click.stop="$emit('select', item)"
        >
          <i v-if="item.icon" :class="item.icon"></i>
          <span>{{ item.label }}</span>
        </button>
      </template>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: 'ShellContextMenu',
  emits: ['close', 'select'],
  props: {
    visible: { type: Boolean, default: false },
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    items: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    menuStyle() {
      return {
        left: `${this.x}px`,
        top: `${this.y}px`,
      };
    },
  },
  mounted() {
    document.addEventListener('mousedown', this.handleOutside, true);
    document.addEventListener('scroll', this.handleClose, true);
    window.addEventListener('resize', this.handleClose, true);
  },
  beforeUnmount() {
    document.removeEventListener('mousedown', this.handleOutside, true);
    document.removeEventListener('scroll', this.handleClose, true);
    window.removeEventListener('resize', this.handleClose, true);
  },
  methods: {
    handleOutside(event) {
      if (!this.visible) return;
      const root = this.$refs.menuRoot;
      if (root && !root.contains(event.target)) {
        this.$emit('close');
      }
    },
    handleClose() {
      if (this.visible) this.$emit('close');
    },
  },
};
</script>

<style scoped>
/* Scoped overrides only - core styles moved to css/* modular files */
</style>
