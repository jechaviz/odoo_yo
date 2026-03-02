<template>
  <div class="app-tag-input">
    <div v-if="modelValue.length" class="app-tag-input__chips">
      <Tag
        v-for="tag in modelValue"
        :key="tag"
        :label="tag"
        tone="default"
        icon="fa-solid fa-xmark"
        clickable
        @click="removeTag(tag)"
      />
    </div>

    <label class="app-tag-input__field">
      <span v-if="label" class="app-tag-input__label">{{ label }}</span>
      <input
        v-model="draft"
        type="text"
        :placeholder="placeholder"
        @keydown.enter.prevent="commit"
        @keydown.tab.prevent="commit"
      />
    </label>
  </div>
</template>

<script>
import Tag from 'app/primitives/Tag.vue';

export default {
  name: 'TagInput',
  components: { Tag },
  emits: ['update:modelValue'],
  props: {
    modelValue: { type: Array, default: () => [] },
    label: { type: String, default: '' },
    placeholder: { type: String, default: '' },
  },
  data() {
    return {
      draft: '',
    };
  },
  methods: {
    commit() {
      const value = String(this.draft || '').trim();
      if (!value) return;
      if (!this.modelValue.includes(value)) {
        this.$emit('update:modelValue', [...this.modelValue, value]);
      }
      this.draft = '';
    },
    removeTag(tag) {
      this.$emit('update:modelValue', this.modelValue.filter((item) => item !== tag));
    },
  },
};
</script>
