<template>
  <Teleport to="body">
    <div v-if="visible" class="app-mega-menu-overlay" @click.self="$emit('close')">
      <div class="app-mega-modal app-glass-heavy">
        <div class="app-mega-grid">
          <div class="app-mega-apps">
            <div v-for="app in apps" :key="app.key" class="app-mega-card" @click="$emit('open-app', app)">
              <div class="app-mega-icon app-glass" :style="{ color: app.color || 'var(--app-primary)' }">
                <i :class="app.icon"></i>
              </div>
              <div class="app-mega-info">
                <span class="app-mega-title">{{ app.label }}</span>
                <span class="app-mega-desc">{{ app.description || 'Open module' }}</span>
              </div>
            </div>
          </div>
          <div class="app-mega-aside">
            <DataCard
              :title="card.title"
              :subtitle="card.subtitle"
              :icon="card.icon"
              :tone="card.tone"
              :body-items="card.bodyItems"
              :footer-items="card.footerItems"
              :cta-label="card.ctaLabel"
              :interactive="true"
              @action="$emit('close')"
            />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import DataCard from 'app/workspace/DataCard.vue';

export default {
  name: 'MegaMenu',
  components: { DataCard },
  emits: ['close', 'open-app'],
  props: {
    visible: { type: Boolean, default: false },
    apps: { type: Array, default: () => [] },
    card: { type: Object, default: () => ({}) },
  },
};
</script>
