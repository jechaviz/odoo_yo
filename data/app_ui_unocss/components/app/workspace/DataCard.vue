<template>
  <article
    class="app-data-card"
    :class="[`is-${toneName}`, { 'is-interactive': interactive }]"
    @click="$emit('select')"
    @contextmenu.prevent="$emit('contextmenu', $event)"
  >
    <header class="app-data-card__header">
      <div class="app-data-card__identity">
        <div v-if="icon" class="app-data-card__icon">
          <i :class="icon"></i>
        </div>
        <div class="app-data-card__heading">
          <p class="app-data-card__title">{{ title }}</p>
          <p v-if="subtitle" class="app-data-card__subtitle">{{ subtitle }}</p>
        </div>
      </div>
      <button
        v-if="ctaLabel"
        type="button"
        class="app-data-card__cta"
        @click.stop="$emit('action')"
      >
        {{ ctaLabel }}
      </button>
    </header>

    <div v-if="badges.length" class="app-data-card__badges">
      <Tag v-for="badge in badges" :key="badge" :label="badge" tone="default" />
    </div>

    <div v-if="bodyItems.length" class="app-data-card__body">
      <div
        v-for="item in bodyItems"
        :key="item.label"
        class="app-data-card__row"
      >
        <span class="app-data-card__row-label">{{ item.label }}</span>
        <span class="app-data-card__row-value">{{ item.value }}</span>
      </div>
    </div>

    <div v-if="hasProgress" class="app-data-card__progress">
      <ProgressBar
        :value="progress.value"
        :label="progress.label"
        :tone="progress.tone || toneName"
      />
    </div>

    <footer v-if="footerItems.length" class="app-data-card__footer">
      <div
        v-for="item in footerItems"
        :key="item.label"
        class="app-data-card__footer-item"
      >
        <span class="app-data-card__footer-label">{{ item.label }}</span>
        <span class="app-data-card__footer-value">{{ item.value }}</span>
      </div>
      <div v-if="assignees.length" class="app-data-card__assignees">
        <div v-for="assignee in assignees" :key="assignee.name" class="app-data-card__assignee">
          <UserAvatar
            :name="assignee.name"
            :avatar="assignee.avatar"
            size="sm"
            :status="assignee.status || ''"
          />
          <span class="app-data-card__assignee-name">{{ assignee.name }}</span>
        </div>
      </div>
    </footer>
  </article>
</template>

<script>
import ProgressBar from 'app/primitives/ProgressBar.vue';
import Tag from 'app/primitives/Tag.vue';
import UserAvatar from 'app/primitives/UserAvatar.vue';

export default {
  name: 'DataCard',
  components: {
    ProgressBar,
    Tag,
    UserAvatar,
  },
  emits: ['action', 'contextmenu', 'select'],
  props: {
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    icon: { type: String, default: '' },
    tone: { type: String, default: 'default' },
    ctaLabel: { type: String, default: '' },
    interactive: { type: Boolean, default: false },
    bodyItems: {
      type: Array,
      default: () => [],
    },
    badges: {
      type: Array,
      default: () => [],
    },
    footerItems: {
      type: Array,
      default: () => [],
    },
    assignees: {
      type: Array,
      default: () => [],
    },
    progress: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    hasProgress() {
      return Number.isFinite(Number(this.progress?.value));
    },
    toneName() {
      return String(this.tone || 'default')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-');
    },
  },
};
</script>

<style scoped>
/* Scoped overrides only - core styles moved to css/* modular files */
</style>
