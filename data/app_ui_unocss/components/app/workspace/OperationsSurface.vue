<template>
  <CollapsibleCard
    class="app-ops-surface"
    :title="title"
    :subtitle="subtitle"
    icon="fa-solid fa-screwdriver-wrench"
    :open="open"
    @toggle="$emit('toggle')"
  >
    <section v-if="record" class="app-ops-surface__body">
      <nav class="app-ops-surface__tabs" role="tablist">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="app-ops-surface__tab"
          :data-tab-key="tab.key"
          :class="{ 'is-active': currentTab === tab.key }"
          @click="setTab(tab.key)"
        >
          <i :class="tab.icon" />
          <span>{{ tab.label }}</span>
        </button>
      </nav>

      <div class="app-ops-surface__panels">
        <FormPanel
          v-if="currentTab === 'form'"
          v-model="working.form.model"
          :schema="working.form.schema"
          :ui-text="uiText"
          @save="onFormSave"
        />

        <CommentsPanel
          v-else-if="currentTab === 'comments'"
          v-model="working.comments"
          :users="working.users"
          :ui-text="uiText"
        />

        <FilesPanel
          v-else-if="currentTab === 'files'"
          v-model="working.files"
          :ui-text="uiText"
        />

        <TasksPanel
          v-else-if="currentTab === 'tasks'"
          v-model="working.tasks"
          :ui-text="uiText"
        />

        <MilestonesPanel
          v-else-if="currentTab === 'milestones'"
          :milestones="working.milestones"
          :tasks="working.tasks"
          :ui-text="uiText"
        />
      </div>
    </section>

    <p v-else class="app-ops-surface__empty ui-card">{{ emptyText }}</p>
  </CollapsibleCard>
</template>

<script>
import CollapsibleCard from 'app/primitives/CollapsibleCard.vue';
import CommentsPanel from 'app/workspace/operations/CommentsPanel.vue';
import FilesPanel from 'app/workspace/operations/FilesPanel.vue';
import FormPanel from 'app/workspace/operations/FormPanel.vue';
import MilestonesPanel from 'app/workspace/operations/MilestonesPanel.vue';
import TasksPanel from 'app/workspace/operations/TasksPanel.vue';

function deepClone(value) {
  return JSON.parse(JSON.stringify(value || {}));
}

export default {
  name: 'OperationsSurface',
  components: {
    CollapsibleCard,
    CommentsPanel,
    FilesPanel,
    FormPanel,
    MilestonesPanel,
    TasksPanel,
  },
  emits: ['toggle', 'update'],
  props: {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    record: { type: Object, default: null },
    data: { type: Object, default: () => ({}) },
    activeTab: { type: String, default: 'form' },
    open: { type: Boolean, default: true },
    uiText: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      currentTab: this.activeTab || 'form',
      working: deepClone(this.data),
      isSyncingFromProps: false,
      lastEmittedSignature: '',
    };
  },
  computed: {
    tabs() {
      return [
        { key: 'form', label: this.uiText.shellOpsTabForm || 'Form', icon: 'fa-solid fa-pen-to-square' },
        { key: 'comments', label: this.uiText.shellOpsTabComments || 'Comments', icon: 'fa-regular fa-comments' },
        { key: 'files', label: this.uiText.shellOpsTabFiles || 'Files', icon: 'fa-regular fa-folder-open' },
        { key: 'tasks', label: this.uiText.shellOpsTabTasks || 'Tasks', icon: 'fa-solid fa-list-check' },
        { key: 'milestones', label: this.uiText.shellOpsTabMilestones || 'Milestones', icon: 'fa-solid fa-flag-checkered' },
      ];
    },
    emptyText() {
      return this.uiText.shellOpsEmpty || 'Pick a record to activate operations surfaces.';
    },
  },
  watch: {
    activeTab(nextTab) {
      if (nextTab) this.currentTab = nextTab;
    },
    data: {
      deep: true,
      immediate: true,
      handler(nextValue) {
        this.isSyncingFromProps = true;
        this.working = deepClone(nextValue);
        this.$nextTick(() => {
          this.isSyncingFromProps = false;
        });
      },
    },
    working: {
      deep: true,
      handler(nextValue) {
        if (this.isSyncingFromProps) return;
        this.emitUpdate(this.currentTab, nextValue);
      },
    },
  },
  methods: {
    buildSignature(tab, data) {
      return JSON.stringify({
        tab: tab || this.currentTab,
        recordId: this.record?.id || null,
        data: data || this.working,
      });
    },
    emitUpdate(tab = this.currentTab, data = this.working) {
      const payloadData = deepClone(data);
      const signature = this.buildSignature(tab, payloadData);
      if (signature === this.lastEmittedSignature) return;
      this.lastEmittedSignature = signature;
      this.$emit('update', {
        tab,
        data: payloadData,
        recordId: this.record?.id || null,
      });
    },
    setTab(tabKey) {
      this.currentTab = tabKey;
      this.emitUpdate(tabKey, this.working);
    },
    onFormSave(payload) {
      this.working = {
        ...this.working,
        form: {
          ...(this.working.form || {}),
          model: payload,
        },
      };
    },
  },
};
</script>
