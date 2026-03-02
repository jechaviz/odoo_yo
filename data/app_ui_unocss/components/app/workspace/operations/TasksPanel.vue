<template>
  <section class="app-ops-tasks ui-card">
    <header class="app-ops-panel-header">
      <h4>{{ titleText }}</h4>
      <p>{{ subtitleText }}</p>
    </header>

    <div class="app-ops-task-board">
      <section
        v-for="column in statusColumns"
        :key="column.key"
        class="app-ops-task-column"
        @dragover.prevent
        @drop="onDrop(column.key)"
      >
        <header class="app-ops-task-column__header">
          <span>{{ column.label }}</span>
          <strong>{{ tasksByStatus[column.key]?.length || 0 }}</strong>
        </header>

        <div class="app-ops-task-column__body">
          <article
            v-for="task in tasksByStatus[column.key] || []"
            :key="task.id"
            class="app-ops-task-card ui-soft-hover"
            draggable="true"
            @dragstart="onDragStart(task.id)"
          >
            <h5>{{ task.title }}</h5>
            <p>{{ task.summary }}</p>
            <div class="app-ops-task-card__meta">
              <span>
                <i class="fa-regular fa-comment-dots" /> {{ Number(task.comments || 0) }}
              </span>
              <span>
                <i class="fa-solid fa-paperclip" /> {{ Number(task.attachments || 0) }}
              </span>
              <span>{{ task.priority }}</span>
            </div>
          </article>
        </div>
      </section>
    </div>
  </section>
</template>

<script>
function deepClone(value) {
  return JSON.parse(JSON.stringify(value || []));
}

export default {
  name: 'TasksPanel',
  emits: ['update:modelValue'],
  props: {
    modelValue: { type: Array, default: () => [] },
    uiText: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      tasks: deepClone(this.modelValue),
      dragTaskId: null,
      isSyncingFromProp: false,
    };
  },
  computed: {
    titleText() {
      return this.uiText.shellOpsTasksTitle || 'Task board';
    },
    subtitleText() {
      return this.uiText.shellOpsTasksSubtitle || 'Drag tasks between status columns to keep handoffs visible.';
    },
    statusColumns() {
      return [
        { key: 'new', label: this.uiText.shellOpsTasksStatusNew || 'New' },
        { key: 'in_progress', label: this.uiText.shellOpsTasksStatusInProgress || 'In progress' },
        { key: 'testing', label: this.uiText.shellOpsTasksStatusTesting || 'Testing' },
        { key: 'awaiting_feedback', label: this.uiText.shellOpsTasksStatusAwaitingFeedback || 'Awaiting feedback' },
        { key: 'complete', label: this.uiText.shellOpsTasksStatusComplete || 'Complete' },
      ];
    },
    tasksByStatus() {
      return this.tasks.reduce((acc, task) => {
        const key = task.status || 'new';
        if (!acc[key]) acc[key] = [];
        acc[key].push(task);
        return acc;
      }, {});
    },
  },
  watch: {
    modelValue: {
      deep: true,
      handler(nextValue) {
        this.isSyncingFromProp = true;
        this.tasks = deepClone(nextValue);
        this.$nextTick(() => {
          this.isSyncingFromProp = false;
        });
      },
    },
    tasks: {
      deep: true,
      handler(nextValue) {
        if (this.isSyncingFromProp) return;
        const incoming = JSON.stringify(nextValue || []);
        const current = JSON.stringify(this.modelValue || []);
        if (incoming === current) return;
        this.$emit('update:modelValue', deepClone(nextValue));
      },
    },
  },
  methods: {
    onDragStart(taskId) {
      this.dragTaskId = taskId;
    },
    onDrop(nextStatus) {
      if (!this.dragTaskId) return;
      this.tasks = this.tasks.map((task) => (
        task.id === this.dragTaskId
          ? { ...task, status: nextStatus }
          : task
      ));
      this.dragTaskId = null;
    },
  },
};
</script>
