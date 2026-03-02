<template>
  <header class="app-topbar app-glass ui-card">
    <div class="app-topbar-left">
      <Tooltip :content="uiText.navAppSwitcher || 'App Switcher'">
        <button
          type="button"
          class="app-util-btn app-topbar-apps-trigger ui-soft-hover"
          :title="uiText.navAppSwitcher || 'App Switcher'"
          @click="$emit('open-mega')"
        >
          <i class="fa-solid fa-grip"></i>
        </button>
      </Tooltip>
      <button
        type="button"
        class="app-util-btn hamburguer-menu"
        @click="$emit('toggle-collapse')"
      >
        <i class="fa-solid fa-bars"></i>
      </button>
      <Input
        class="app-search-bar-pro"
        :placeholder="uiText.searchPlaceholder || 'Search records...'"
        icon="fa-solid fa-magnifying-glass"
        readonly
        @click="$emit('open-spotlight')"
        @focus="$emit('open-spotlight')"
      />
    </div>

    <div class="app-topbar-right">
      <Button
        v-if="primaryActionLabel"
        variant="primary"
        size="sm"
        :label="primaryActionLabel"
        class="app-topbar-primary-action"
        @click="$emit('primary-action')"
      />

      <Tooltip
        v-for="action in resolvedUtilityActions"
        :key="action.key"
        :content="action.label"
      >
        <button
          type="button"
          class="app-util-btn ui-soft-hover"
          :title="action.label"
          @click.stop="$emit('utility-action', action)"
        >
          <i :class="action.icon" :style="action.style || null"></i>
        </button>
      </Tooltip>

      <div class="app-toolbar-divider"></div>

      <DropdownMenu width="lg" content-class="app-header-menu-panel">
        <template #trigger>
          <button
            type="button"
            class="app-util-btn ui-soft-hover app-header-menu-trigger"
          >
            <i class="fa-solid fa-bell"></i>
            <span v-if="unreadCount" class="app-header-badge">{{ unreadCount }}</span>
          </button>
        </template>
        <template #default="{ close }">
          <div>
            <div class="app-header-menu-panel__top">
              <div>
                <h4>{{ notificationTitle }}</h4>
                <p>{{ notificationSubtitle }}</p>
              </div>
              <button type="button" class="app-header-link-btn" @click="$emit('mark-notifications-read')">
                {{ notificationMarkAll }}
              </button>
            </div>
            <div class="app-header-menu-list">
              <button
                v-for="item in notificationsSlice"
                :key="item.id"
                type="button"
                class="app-header-menu-item"
                :class="{ 'is-unread': !item.read }"
                @click="handleNotificationSelect(item, close)"
              >
                <div class="app-header-menu-item__main">
                  <strong>{{ item.title }}</strong>
                  <span>{{ item.text }}</span>
                </div>
                <small>{{ item.time }}</small>
              </button>
            </div>
          </div>
        </template>
      </DropdownMenu>

      <DropdownMenu width="md" content-class="app-profile-dropdown">
        <template #trigger>
          <button
            type="button"
            class="app-user-profile"
          >
            <UserAvatar :name="profileName" :avatar="profileAvatar" size="md" :tooltip="false" />
          </button>
        </template>
        <template #default="{ close }">
          <div>
            <div class="app-profile-header">
              <div class="app-profile-avatar-lg">
                <UserAvatar :name="profileName" :avatar="profileAvatar" size="lg" :tooltip="false" />
              </div>
              <div class="app-profile-info">
                <div class="app-user-name">{{ profileName }}</div>
                <div class="app-user-role">{{ profileRole }}</div>
              </div>
            </div>
            <div class="app-popup-list">
              <button
                v-for="item in profileMenu"
                :key="item.key"
                type="button"
                class="app-popup-item"
                :class="{ logout: item.key === 'logout' }"
                @click="handleProfileAction(item, close)"
              >
                <i :class="item.icon"></i>
                <span>{{ item.label }}</span>
              </button>
            </div>
            <div v-if="profileSwitcherGroups.length" class="app-profile-switcher">
              <div class="app-profile-switcher__title">{{ profileSwitchTitle }}</div>
              <div v-for="group in profileSwitcherGroups" :key="group.key">
                <div class="app-profile-switcher__label">{{ group.label }}</div>
                <button
                  v-for="user in group.items"
                  :key="user.key"
                  type="button"
                  class="app-profile-switcher__item"
                  @click="handleProfileAction({ key: 'switch-user', user }, close)"
                >
                  <UserAvatar
                    :name="user.name"
                    :avatar="user.avatar"
                    size="sm"
                    :status="user.status || ''"
                  />
                  <div class="app-profile-switcher__copy">
                    <strong>{{ user.name }}</strong>
                    <span>{{ user.role }}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </template>
      </DropdownMenu>
    </div>
  </header>
</template>

<script>
import Button from 'app/primitives/Button.vue';
import DropdownMenu from 'app/primitives/DropdownMenu.vue';
import Input from 'app/primitives/Input.vue';
import Tooltip from 'app/primitives/Tooltip.vue';
import UserAvatar from 'app/primitives/UserAvatar.vue';

export default {
  name: 'Header',
  components: {
    Button,
    DropdownMenu,
    Input,
    Tooltip,
    UserAvatar,
  },
  emits: [
    'mark-notifications-read',
    'notification-select',
    'open-mega',
    'open-spotlight',
    'primary-action',
    'profile-action',
    'toggle-collapse',
    'utility-action',
  ],
  props: {
    isCollapsed: { type: Boolean, default: false },
    uiText: {
      type: Object,
      default: () => ({}),
    },
    notifications: {
      type: Array,
      default: () => [],
    },
    profile: {
      type: Object,
      default: () => ({}),
    },
    utilityActions: {
      type: Array,
      default: () => [],
    },
    primaryActionLabel: { type: String, default: '' },
  },
  computed: {
    resolvedUtilityActions() {
      if (Array.isArray(this.utilityActions) && this.utilityActions.length) return this.utilityActions;
      return [
        { key: 'assistant', label: this.uiText.headerActionAssistant || 'AI Assistant', icon: 'fa-solid fa-wand-magic-sparkles', style: 'color: var(--app-primary);' },
        { key: 'discuss', label: this.uiText.headerActionDiscuss || 'Discuss', icon: 'fa-solid fa-comments' },
        { key: 'activities', label: this.uiText.headerActionActivities || 'Activities', icon: 'fa-solid fa-clock' },
        { key: 'theme', label: this.uiText.headerActionTheme || 'Theme', icon: 'fa-solid fa-sun' },
      ];
    },
    unreadCount() {
      return this.notifications.filter((item) => !item.read).length;
    },
    notificationsSlice() {
      return this.notifications.slice(0, 5);
    },
    profileAvatar() {
      return this.profile.avatar || 'https://i.pravatar.cc/100?u=workspace-user';
    },
    profileName() {
      return this.profile.name || 'Workspace User';
    },
    profileRole() {
      return this.profile.role || 'Operator';
    },
    profileMenu() {
      return [
        { key: 'profile', label: this.profile.menuProfile || 'Profile', icon: 'fa-solid fa-id-card' },
        { key: 'billing', label: this.profile.menuBilling || 'Billing', icon: 'fa-solid fa-credit-card' },
        { key: 'settings', label: this.profile.menuSettings || 'Settings', icon: 'fa-solid fa-sliders' },
        { key: 'logout', label: this.profile.menuLogout || 'Log out', icon: 'fa-solid fa-right-from-bracket' },
      ];
    },
    profileSwitcherGroups() {
      return Array.isArray(this.profile.switchGroups) ? this.profile.switchGroups : [];
    },
    profileSwitchTitle() {
      return this.uiText.profileSwitchTitle || 'Switch user';
    },
    notificationTitle() {
      return this.uiText.headerNotificationsTitle || 'Notifications';
    },
    notificationSubtitle() {
      return this.uiText.headerNotificationsSubtitle || 'Events that require attention across apps.';
    },
    notificationMarkAll() {
      return this.uiText.headerNotificationsMarkAll || 'Mark all as read';
    },
  },
  methods: {
    handleNotificationSelect(item, close) {
      this.$emit('notification-select', item);
      close();
    },
    handleProfileAction(item, close) {
      this.$emit('profile-action', item);
      close();
    },
  },
};
</script>

<style scoped>
/* Scoped overrides only - core styles moved to css/* modular files */
</style>
