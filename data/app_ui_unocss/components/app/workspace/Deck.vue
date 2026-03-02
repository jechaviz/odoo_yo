<template>
  <section class="app-workspace-deck">
    <section class="app-shell-modebar">
      <div class="app-shell-modebar__copy">
        <p class="app-shell-modebar__title">{{ activeModeMeta.label }}</p>
        <p class="app-shell-modebar__description">{{ activeModeMeta.description }}</p>
      </div>
      <ButtonGroup :model-value="activeMode" :options="modeOptions" @update:modelValue="$emit('mode-change', $event)" />
    </section>

    <ShellInsights :title="insightsTitle" :subtitle="insightsSubtitle" :items="insights" />

    <ActivityFeed
      :title="activityTitle"
      :subtitle="activitySubtitle"
      :empty-text="activityEmpty"
      :items="activityFeed"
      @follow-link="$emit('activity-follow-link', $event)"
    />

    <section class="app-shell-secondary-grid">
      <WorkbenchSection
        :title="primaryPanel.title"
        :subtitle="primaryPanel.subtitle"
        :icon="primaryPanel.icon"
        :open="panels.primary"
        :cards="primaryCards"
        :loading-label="uiText.workspaceLoadingCard || 'Loading card...'"
        layout="grid"
        @toggle="$emit('toggle-panel', 'primary')"
        @card-action="$emit('workspace-action', $event)"
        @card-select="$emit('workspace-action', $event)"
        @card-contextmenu="$emit('workspace-contextmenu', $event)"
      />

      <WorkbenchSection
        :title="secondaryPanel.title"
        :subtitle="secondaryPanel.subtitle"
        :icon="secondaryPanel.icon"
        :open="panels.secondary"
        :cards="secondaryCards"
        :loading-label="uiText.workspaceLoadingCard || 'Loading card...'"
        layout="stack"
        @toggle="$emit('toggle-panel', 'secondary')"
        @card-action="$emit('workspace-action', $event)"
        @card-select="$emit('workspace-action', $event)"
        @card-contextmenu="$emit('workspace-contextmenu', $event)"
      />
    </section>

    <section class="app-shell-surface-grid">
      <DashboardCanvas
        :title="dashboardTitle"
        :subtitle="dashboardSubtitle"
        :loading-label="uiText.dashboardLoadingSection || 'Loading section...'"
        :open="panels.dashboard"
        :sections="dashboardSections"
        @toggle="$emit('toggle-panel', 'dashboard')"
        @widget-action="$emit('dashboard-widget-action', $event)"
        @widget-select="$emit('dashboard-widget-action', $event)"
        @widget-contextmenu="$emit('dashboard-widget-contextmenu', $event)"
      />

      <DetailView
        :title="detailTitle"
        :subtitle="detailSubtitle"
        :eyebrow="detailEyebrow"
        :cta-label="detailCta"
        :empty-text="detailEmpty"
        :open="panels.detail"
        :record="detailRecord"
        :sections="detailSections"
        @toggle="$emit('toggle-panel', 'detail')"
        @action="$emit('detail-action', $event)"
      />
    </section>

    <section class="app-shell-operations-grid">
      <OperationsSurface
        :title="operationsTitle"
        :subtitle="operationsSubtitle"
        :record="detailRecord"
        :data="operationsData"
        :active-tab="operationsActiveTab"
        :open="panels.operations"
        :ui-text="uiText"
        @toggle="$emit('toggle-panel', 'operations')"
        @update="$emit('operations-update', $event)"
      />
    </section>

    <section class="app-shell-composer-grid">
      <ExecutionPad
        :record="detailRecord"
        :ui-text="uiText"
        :open="panels.execution"
        @toggle="$emit('toggle-panel', 'execution')"
        @action="$emit('execution-action', $event)"
      />
    </section>
  </section>
</template>

<script>
import ButtonGroup from 'app/primitives/ButtonGroup.vue';
import ActivityFeed from 'app/workspace/ActivityFeed.vue';
import DashboardCanvas from 'app/workspace/DashboardCanvas.vue';
import DetailView from 'app/workspace/DetailView.vue';
import ExecutionPad from 'app/workspace/ExecutionPad.vue';
import OperationsSurface from 'app/workspace/OperationsSurface.vue';
import ShellInsights from 'app/workspace/ShellInsights.vue';
import WorkbenchSection from 'app/workspace/WorkbenchSection.vue';

export default {
  name: 'Deck',
  components: {
    ActivityFeed,
    ButtonGroup,
    DashboardCanvas,
    DetailView,
    ExecutionPad,
    OperationsSurface,
    ShellInsights,
    WorkbenchSection,
  },
  emits: [
    'activity-follow-link',
    'dashboard-widget-action',
    'dashboard-widget-contextmenu',
    'detail-action',
    'execution-action',
    'mode-change',
    'operations-update',
    'toggle-panel',
    'workspace-action',
    'workspace-contextmenu',
  ],
  props: {
    activeMode: { type: String, default: 'overview' },
    activeModeMeta: { type: Object, default: () => ({}) },
    modeOptions: { type: Array, default: () => [] },
    insightsTitle: { type: String, default: '' },
    insightsSubtitle: { type: String, default: '' },
    insights: { type: Array, default: () => [] },
    activityTitle: { type: String, default: '' },
    activitySubtitle: { type: String, default: '' },
    activityEmpty: { type: String, default: '' },
    activityFeed: { type: Array, default: () => [] },
    primaryPanel: { type: Object, default: () => ({}) },
    secondaryPanel: { type: Object, default: () => ({}) },
    primaryCards: { type: Array, default: () => [] },
    secondaryCards: { type: Array, default: () => [] },
    dashboardTitle: { type: String, default: '' },
    dashboardSubtitle: { type: String, default: '' },
    dashboardSections: { type: Array, default: () => [] },
    detailTitle: { type: String, default: '' },
    detailSubtitle: { type: String, default: '' },
    detailEyebrow: { type: String, default: '' },
    detailCta: { type: String, default: '' },
    detailEmpty: { type: String, default: '' },
    detailRecord: { type: Object, default: null },
    detailSections: { type: Array, default: () => [] },
    operationsTitle: { type: String, default: '' },
    operationsSubtitle: { type: String, default: '' },
    operationsData: { type: Object, default: () => ({}) },
    operationsActiveTab: { type: String, default: 'form' },
    panels: { type: Object, default: () => ({}) },
    uiText: { type: Object, default: () => ({}) },
  },
};
</script>
