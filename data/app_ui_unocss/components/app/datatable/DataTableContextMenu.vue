<template>
  <div
    v-if="open"
    class="app-row-context-menu"
    :style="{ left: `${x}px`, top: `${y}px` }"
  >
    <button class="app-context-item" type="button" @click="$emit('action', 'open')"><i class="fa-solid fa-eye"></i><span>{{ i18n.actionOpen || 'Open' }}</span></button>
    <button class="app-context-item" type="button" @click="$emit('action', 'edit')"><i class="fa-solid fa-pen"></i><span>{{ i18n.actionEdit || 'Edit' }}</span></button>
    <button class="app-context-item" type="button" @click="$emit('action', 'send')"><i class="fa-solid fa-paper-plane"></i><span>{{ i18n.actionSend || 'Send' }}</span></button>
    <button class="app-context-item" type="button" @click="$emit('action', 'copy-id')"><i class="fa-solid fa-copy"></i><span>{{ i18n.actionCopyId || 'Copy ID' }}</span></button>
  </div>
</template>

<script>
export default {
  name: 'DataTableContextMenu',
  props: {
    open: { type: Boolean, default: false },
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    i18n: { type: Object, default: () => ({}) },
  },
  emits: ['action'],
};
</script>
