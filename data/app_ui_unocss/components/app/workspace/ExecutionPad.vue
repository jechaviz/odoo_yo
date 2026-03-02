<template>
  <CollapsibleCard
    class="app-execution-pad"
    :title="titleText"
    :subtitle="subtitleText"
    icon="fa-solid fa-pen-ruler"
    :open="open"
    @toggle="$emit('toggle')"
  >
    <div v-if="record" class="app-execution-pad__body">
      <header class="app-execution-pad__hero ui-card">
        <div class="app-execution-pad__hero-copy">
          <p class="app-execution-pad__eyebrow">{{ eyebrowText }}</p>
          <h3>{{ record.id }}</h3>
          <p>{{ record.customer }}</p>
        </div>
        <div class="app-execution-pad__hero-meta">
          <Tag :label="record.type || 'active'" :tone="record.type || 'default'" />
          <Tag :label="record.owner || '-'" tone="primary" icon="fa-solid fa-user" />
          <Tag :label="record.module || '-'" tone="default" icon="fa-solid fa-layer-group" />
        </div>
      </header>

      <div class="app-execution-pad__grid">
        <Textarea
          v-model="note"
          :label="noteLabel"
          :hint="noteHint"
          :placeholder="notePlaceholder"
          class="app-execution-pad__notes"
        />

        <div class="app-execution-pad__field ui-card">
          <div class="app-execution-pad__field-header">
            <span>{{ tagsLabel }}</span>
            <small>{{ tagsHint }}</small>
          </div>
          <TagInput
            v-model="tags"
            :placeholder="tagsPlaceholder"
          />
        </div>

        <div class="app-execution-pad__field ui-card">
          <div class="app-execution-pad__field-header">
            <span>{{ ratingLabel }}</span>
            <small>{{ ratingHint }}</small>
          </div>
          <StarInput v-model="rating" />
          <div class="app-execution-pad__rating-meta">
            <span>{{ ratingValueLabel }}</span>
            <StarRating :value="rating" />
          </div>
        </div>
      </div>

      <footer class="app-execution-pad__footer">
        <div class="app-execution-pad__suggestions">
          <Tag
            v-for="tag in suggestionTags"
            :key="tag"
            :label="tag"
            tone="default"
            clickable
            @click="appendSuggestion(tag)"
          />
        </div>

        <div class="app-execution-pad__actions">
          <Button variant="secondary" size="sm" :label="followUpLabel" @click="emitAction('followup')" />
          <Button variant="primary" size="sm" :label="saveLabel" @click="emitAction('save')" />
        </div>
      </footer>
    </div>

    <div v-else class="app-execution-pad__empty ui-card">{{ emptyText }}</div>
  </CollapsibleCard>
</template>

<script>
import Button from 'app/primitives/Button.vue';
import CollapsibleCard from 'app/primitives/CollapsibleCard.vue';
import StarInput from 'app/primitives/StarInput.vue';
import StarRating from 'app/primitives/StarRating.vue';
import Tag from 'app/primitives/Tag.vue';
import TagInput from 'app/primitives/TagInput.vue';
import Textarea from 'app/primitives/Textarea.vue';

export default {
  name: 'ExecutionPad',
  components: {
    Button,
    CollapsibleCard,
    StarInput,
    StarRating,
    Tag,
    TagInput,
    Textarea,
  },
  emits: ['action', 'toggle'],
  props: {
    record: { type: Object, default: null },
    uiText: { type: Object, default: () => ({}) },
    open: { type: Boolean, default: true },
  },
  data() {
    return {
      note: '',
      tags: [],
      rating: 0,
    };
  },
  computed: {
    titleText() {
      return this.uiText.shellExecutionTitle || 'Execution pad';
    },
    subtitleText() {
      return this.uiText.shellExecutionSubtitle || 'Capture operator intent, handoff notes, and priority without leaving the shell.';
    },
    eyebrowText() {
      return this.uiText.shellExecutionEyebrow || 'Working record';
    },
    noteLabel() {
      return this.uiText.shellExecutionNoteLabel || 'Operator note';
    },
    noteHint() {
      return this.uiText.shellExecutionNoteHint || 'Keep the note actionable and specific.';
    },
    notePlaceholder() {
      return this.uiText.shellExecutionNotePlaceholder || 'Summarize the next move, dependency, or blocker...';
    },
    tagsLabel() {
      return this.uiText.shellExecutionTagsLabel || 'Signal tags';
    },
    tagsHint() {
      return this.uiText.shellExecutionTagsHint || 'Short labels that survive handoff.';
    },
    tagsPlaceholder() {
      return this.uiText.shellExecutionTagsPlaceholder || 'Add tag and press Enter';
    },
    ratingLabel() {
      return this.uiText.shellExecutionRatingLabel || 'Priority score';
    },
    ratingHint() {
      return this.uiText.shellExecutionRatingHint || 'A compact score for urgency and operator attention.';
    },
    ratingValueLabel() {
      return this.uiText.shellExecutionRatingValue || 'Current score';
    },
    followUpLabel() {
      return this.uiText.shellExecutionFollowUpLabel || 'Create follow-up';
    },
    saveLabel() {
      return this.uiText.shellExecutionSaveLabel || 'Save note';
    },
    emptyText() {
      return this.uiText.shellExecutionEmpty || 'Pick a record to capture a note.';
    },
    suggestionTags() {
      const safe = this.record || {};
      return [...new Set([...(safe.tags || []), ...(safe.collaborators || []), safe.owner].filter(Boolean))].slice(0, 6);
    },
  },
  watch: {
    record: {
      immediate: true,
      handler(value) {
        this.note = value ? `${value.customer}: ` : '';
        this.tags = Array.isArray(value?.tags) ? [...value.tags] : [];
        this.rating = Number(value?.rating || 0);
      },
    },
  },
  methods: {
    appendSuggestion(tag) {
      if (!tag || this.tags.includes(tag)) return;
      this.tags = [...this.tags, tag];
    },
    emitAction(type) {
      if (!this.record) return;
      this.$emit('action', {
        type,
        record: this.record,
        note: this.note,
        tags: [...this.tags],
        rating: this.rating,
      });
    },
  },
};
</script>
