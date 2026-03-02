<template>
  <section class="app-ops-milestones ui-card">
    <header class="app-ops-panel-header">
      <h4>{{ titleText }}</h4>
      <p>{{ subtitleText }}</p>
    </header>

    <div class="app-ops-milestones__grid">
      <article
        v-for="milestone in milestones"
        :key="milestone.id"
        class="app-ops-milestone ui-soft-hover"
        :class="{ 'is-active': focusedMilestoneId === milestone.id }"
        @click="focusMilestone(milestone.id)"
      >
        <header>
          <h5>{{ milestone.title }}</h5>
          <Tag :label="milestone.status" :tone="toneForStatus(milestone.status)" />
        </header>

        <div class="app-ops-milestone__meta">
          <span>{{ milestone.owner }}</span>
          <span>{{ milestone.dueDate }}</span>
          <strong>{{ milestone.amount }}</strong>
        </div>

        <ProgressBar :value="progressForMilestone(milestone.id)" :label="progressLabel" tone="primary" />
      </article>
    </div>

    <section v-if="focusedMilestone" class="app-ops-milestones__tasks ui-card">
      <header class="app-ops-panel-header">
        <h4>{{ focusedMilestone.title }}</h4>
        <p>{{ tasksLabel }}</p>
      </header>
      <ul>
        <li v-for="task in tasksForFocusedMilestone" :key="task.id" class="app-ops-milestones__task-row">
          <span>{{ task.title }}</span>
          <Tag :label="task.status" :tone="toneForTaskStatus(task.status)" />
        </li>
      </ul>
    </section>
  </section>
</template>

<script>
import ProgressBar from 'app/primitives/ProgressBar.vue';
import Tag from 'app/primitives/Tag.vue';

export default {
  name: 'MilestonesPanel',
  components: {
    ProgressBar,
    Tag,
  },
  props: {
    milestones: { type: Array, default: () => [] },
    tasks: { type: Array, default: () => [] },
    uiText: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      focusedMilestoneId: null,
    };
  },
  computed: {
    titleText() {
      return this.uiText.shellOpsMilestonesTitle || 'Milestones';
    },
    subtitleText() {
      return this.uiText.shellOpsMilestonesSubtitle || 'Track contract stages and drill into task readiness.';
    },
    progressLabel() {
      return this.uiText.shellOpsMilestonesProgress || 'Completion';
    },
    tasksLabel() {
      return this.uiText.shellOpsMilestonesTasksLabel || 'Tasks linked to this milestone';
    },
    focusedMilestone() {
      return this.milestones.find((item) => item.id === this.focusedMilestoneId) || null;
    },
    tasksForFocusedMilestone() {
      if (!this.focusedMilestoneId) return [];
      return this.tasks.filter((task) => task.milestoneId === this.focusedMilestoneId);
    },
  },
  watch: {
    milestones: {
      immediate: true,
      handler(nextValue) {
        if (!nextValue?.length) {
          this.focusedMilestoneId = null;
          return;
        }
        if (!this.focusedMilestoneId || !nextValue.some((item) => item.id === this.focusedMilestoneId)) {
          this.focusedMilestoneId = nextValue[0].id;
        }
      },
    },
  },
  methods: {
    focusMilestone(milestoneId) {
      this.focusedMilestoneId = milestoneId;
    },
    progressForMilestone(milestoneId) {
      const tasks = this.tasks.filter((task) => task.milestoneId === milestoneId);
      if (!tasks.length) return 0;
      const completed = tasks.filter((task) => task.status === 'complete').length;
      return Math.round((completed / tasks.length) * 100);
    },
    toneForStatus(status) {
      if (status === 'released') return 'success';
      if (status === 'requested') return 'warning';
      if (status === 'funded') return 'primary';
      return 'default';
    },
    toneForTaskStatus(status) {
      if (status === 'complete') return 'success';
      if (status === 'awaiting_feedback') return 'warning';
      if (status === 'in_progress') return 'primary';
      return 'default';
    },
  },
};
</script>
