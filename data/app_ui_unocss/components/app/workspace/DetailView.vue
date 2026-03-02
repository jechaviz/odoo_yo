<template>
  <CollapsibleCard :title="title" :subtitle="subtitle" icon="fa-solid fa-circle-info" :open="open" @toggle="$emit('toggle')">
    <div v-if="record" class="app-detail-view">
      <header class="app-detail-view__hero ui-card">
        <div>
          <p class="app-detail-view__eyebrow">{{ eyebrow }}</p>
          <h3>{{ record.id }}</h3>
          <p>{{ record.customer }}</p>
          <div class="app-detail-view__hero-tags">
            <Tag :label="record.owner || '-'" tone="primary" icon="fa-solid fa-user" />
            <Tag :label="record.module || '-'" tone="default" icon="fa-solid fa-layer-group" />
          </div>
        </div>
        <div class="app-detail-view__hero-status">
          <Tag :label="record.type || 'active'" :tone="record.type || 'default'" />
          <StarRating :value="record.rating || 0" />
          <button v-if="ctaLabel" type="button" class="app-detail-view__cta" @click="$emit('action', record)">
            {{ ctaLabel }}
          </button>
        </div>
      </header>

      <div v-if="record.tags?.length" class="app-detail-view__record-tags ui-card">
        <Tag v-for="tag in record.tags" :key="tag" :label="tag" tone="default" />
      </div>

      <div class="app-detail-view__sections">
        <section v-for="section in sections" :key="section.key" class="app-detail-view__section ui-card">
          <header class="app-detail-view__section-header">
            <h4>{{ section.title }}</h4>
            <p v-if="section.subtitle">{{ section.subtitle }}</p>
          </header>
          <div class="app-detail-view__grid">
            <div v-for="field in section.fields" :key="field.label" class="app-detail-view__field">
              <span>{{ field.label }}</span>
              <strong>{{ field.value }}</strong>
            </div>
          </div>
        </section>
      </div>
    </div>
    <div v-else class="app-detail-view__empty ui-card">{{ emptyText }}</div>
  </CollapsibleCard>
</template>

<script>
import CollapsibleCard from 'app/primitives/CollapsibleCard.vue';
import StarRating from 'app/primitives/StarRating.vue';
import Tag from 'app/primitives/Tag.vue';

export default {
  name: 'DetailView',
  components: {
    CollapsibleCard,
    StarRating,
    Tag,
  },
  emits: ['action', 'toggle'],
  props: {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    eyebrow: { type: String, default: '' },
    ctaLabel: { type: String, default: '' },
    emptyText: { type: String, default: '' },
    open: { type: Boolean, default: true },
    record: { type: Object, default: null },
    sections: { type: Array, default: () => [] },
  },
};
</script>
