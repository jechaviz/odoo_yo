<template>
  <Modal :visible="visible" :title="title" :subtitle="subtitle" size="xl" @close="$emit('close')">
    <div class="app-quick-create">
      <ButtonGroup
        v-if="groupOptions.length > 1"
        v-model="activeGroup"
        :options="groupOptions"
        class="app-quick-create__groups"
      />

      <div class="app-quick-create__grid">
        <DataCard
          v-for="action in filteredActions"
          :key="action.key"
          :title="action.title"
          :subtitle="action.subtitle"
          :icon="action.icon"
          :tone="action.tone || 'default'"
          :badges="action.badges || []"
          :body-items="action.bodyItems || []"
          :footer-items="action.footerItems || []"
          :cta-label="action.ctaLabel"
          :interactive="true"
          @action="$emit('select-action', action)"
          @select="$emit('select-action', action)"
        />
      </div>
    </div>
  </Modal>
</template>

<script>
import ButtonGroup from 'app/primitives/ButtonGroup.vue';
import DataCard from 'app/workspace/DataCard.vue';
import Modal from 'app/primitives/Modal.vue';

export default {
  name: 'QuickCreateModal',
  components: {
    ButtonGroup,
    DataCard,
    Modal,
  },
  emits: ['close', 'select-action'],
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    actions: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      activeGroup: '',
    };
  },
  computed: {
    groupOptions() {
      const groups = Array.from(new Set(
        this.actions
          .map((action) => action?.group)
          .filter(Boolean)
      ));
      return groups.map((group) => ({
        value: group,
        label: group,
      }));
    },
    filteredActions() {
      if (!this.activeGroup) return this.actions;
      return this.actions.filter((action) => action.group === this.activeGroup);
    },
  },
  watch: {
    visible(value) {
      if (value) this.ensureGroup();
    },
    actions: {
      immediate: true,
      handler() {
        this.ensureGroup();
      },
    },
  },
  methods: {
    ensureGroup() {
      if (this.activeGroup) return;
      this.activeGroup = this.groupOptions[0]?.value || '';
    },
  },
};
</script>

<style scoped>
/* Scoped overrides only - core styles moved to css/* modular files */
</style>
