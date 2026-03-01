<template>
  <header class="app-topbar app-glass ui-card">
    <div class="app-topbar-left">
      <div class="app-util-btn hamburguer-menu" @click="$emit('toggle-collapse')" role="button" tabindex="0"><i class="fa-solid fa-bars"></i></div>
      <div class="app-search-bar-pro ui-focus-ring">
         <i class="fa-solid fa-magnifying-glass"></i>
         <input type="text" placeholder="Search records..." @click="$emit('open-spotlight')">
      </div>
    </div>

    <div class="app-topbar-right">
      <div class="app-util-btn ui-soft-hover" title="AI Assistant" role="button" tabindex="0"><i class="fa-solid fa-wand-magic-sparkles" style="color: var(--app-primary);"></i></div>
      <div class="app-util-btn ui-soft-hover" title="Discuss" role="button" tabindex="0"><i class="fa-solid fa-comments"></i></div>
      <div class="app-util-btn ui-soft-hover" title="Activities" role="button" tabindex="0"><i class="fa-solid fa-clock"></i></div>
      <div class="app-util-btn ui-soft-hover" title="Brightness" role="button" tabindex="0"><i class="fa-solid fa-sun"></i></div>
      <div class="app-util-btn ui-soft-hover" title="Notifications" role="button" tabindex="0"><i class="fa-solid fa-bell"></i></div>
      
      <div class="app-user-profile-wrapper" @mouseenter="showProfile = true" @mouseleave="showProfile = false">
        <div class="app-user-profile">
          <img src="https://i.pravatar.cc/100?u=odoo-user" alt="Profile">
        </div>
        <Transition name="app-fade-pro">
          <div v-if="showProfile" class="app-profile-dropdown app-glass-heavy">
            <div class="app-profile-header">
              <div class="app-profile-avatar-lg">
                <img src="https://i.pravatar.cc/100?u=odoo-user" alt="Profile">
              </div>
              <div class="app-profile-info">
                <div class="app-user-name">Jecha Viz</div>
                <div class="app-user-role">Administrator</div>
              </div>
            </div>
            <div class="app-popup-list">
              <div class="app-popup-item"><i class="fa-solid fa-id-card"></i> My Profile</div>
              <div class="app-popup-item"><i class="fa-solid fa-book"></i> Documentation</div>
              <div class="app-popup-item"><i class="fa-solid fa-headset"></i> Support</div>
              <div class="app-toolbar-sep"></div>
              <div class="app-popup-item logout"><i class="fa-solid fa-right-from-bracket"></i> Log Out</div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'AppHeader',
  props: {
    isCollapsed: { type: Boolean, default: false }
  },
  data() {
    return {
      showProfile: false
    };
  }
};
</script>

<style scoped>
/* Scoped overrides only - core styles moved to css/* modular files */
</style>

