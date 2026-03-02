<template>
  <Card class="app-shell-activity-feed" tone="default">
    <header class="app-shell-activity-feed__header">
      <div>
        <h2>{{ title }}</h2>
        <p>{{ subtitle }}</p>
      </div>
    </header>

    <ul v-if="items.length" class="app-shell-activity-feed__list">
      <li
        v-for="item in items"
        :key="item.key || item.id"
        class="app-shell-activity-feed__item"
      >
        <div class="app-shell-activity-feed__icon" :class="toneClass(item.tone)">
          <i :class="resolveIcon(item.type, item.icon)"></i>
        </div>

        <div class="app-shell-activity-feed__body">
          <div class="app-shell-activity-feed__copy">
            <div class="app-shell-activity-feed__lead">
              <UserAvatar
                v-if="item.user"
                :name="item.user.name"
                :avatar="item.user.avatar"
                :status="item.user.status || ''"
                size="sm"
              />
              <p>
                <strong v-if="item.user">{{ item.user.name }}</strong>
                <span v-if="item.user"> </span>
                <span>{{ item.text }}</span>
                <a
                  v-if="item.link && item.link.text"
                  class="app-shell-activity-feed__link"
                  :href="item.link.href || '#'"
                  @click.prevent="$emit('follow-link', item)"
                >
                  {{ item.link.text }}
                </a>
              </p>
            </div>
            <div class="app-shell-activity-feed__meta">
              <span v-if="item.label" class="app-shell-activity-feed__label">{{ item.label }}</span>
              <time>{{ timeAgo(item.timestamp) }}</time>
            </div>
          </div>
        </div>
      </li>
    </ul>

    <p v-else class="app-shell-activity-feed__empty">{{ emptyText }}</p>
  </Card>
</template>

<script>
import Card from 'app/primitives/Card.vue';
import UserAvatar from 'app/primitives/UserAvatar.vue';

const TYPE_ICON_MAP = Object.freeze({
  COMMENT: 'fa-regular fa-comment',
  STATUS_CHANGE: 'fa-solid fa-flag',
  TASK_ASSIGNED: 'fa-solid fa-user-plus',
  ESTIMATE_CREATED: 'fa-solid fa-file-invoice-dollar',
  QUALITY_ALERT: 'fa-solid fa-triangle-exclamation',
});

export default {
  name: 'ActivityFeed',
  components: {
    Card,
    UserAvatar,
  },
  emits: ['follow-link'],
  props: {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    emptyText: { type: String, default: 'No activity yet.' },
    items: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    resolveIcon(type, icon) {
      if (icon) return icon;
      return TYPE_ICON_MAP[type] || 'fa-solid fa-bell';
    },
    toneClass(tone) {
      const safeTone = String(tone || 'default').trim().toLowerCase();
      return `is-${safeTone}`;
    },
    timeAgo(timestamp) {
      const value = new Date(timestamp);
      if (Number.isNaN(value.getTime())) return '';
      const seconds = Math.max(0, Math.floor((Date.now() - value.getTime()) / 1000));
      const units = [
        ['y', 31536000],
        ['mo', 2592000],
        ['d', 86400],
        ['h', 3600],
        ['m', 60],
      ];
      for (const [suffix, divisor] of units) {
        const amount = Math.floor(seconds / divisor);
        if (amount > 0) return `${amount}${suffix} ago`;
      }
      return 'just now';
    },
  },
};
</script>

<style scoped>
/* Scoped overrides only - core styles moved to css/* modular files */
</style>
