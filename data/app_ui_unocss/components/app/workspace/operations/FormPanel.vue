<template>
  <section class="app-ops-form ui-card">
    <header class="app-ops-panel-header">
      <h4>{{ titleText }}</h4>
      <p>{{ subtitleText }}</p>
    </header>

    <div class="app-ops-form__grid">
      <div
        v-for="field in schema"
        :key="field.key"
        class="app-ops-form__field"
        :class="`is-${field.type || 'text'}`"
      >
        <Input
          v-if="isInputField(field.type)"
          v-model="draft[field.key]"
          :label="field.label"
          :type="field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'"
          :placeholder="field.placeholder || ''"
        />

        <label v-else-if="field.type === 'select'" class="app-ops-select">
          <span>{{ field.label }}</span>
          <select :value="draft[field.key]" @change="onSelect(field.key, $event)">
            <option
              v-for="option in field.options || []"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </label>

        <Textarea
          v-else-if="field.type === 'textarea'"
          v-model="draft[field.key]"
          :label="field.label"
          :rows="Number(field.rows || 4)"
          :placeholder="field.placeholder || ''"
        />

        <TagInput
          v-else-if="field.type === 'tags'"
          v-model="draft[field.key]"
          :label="field.label"
          :placeholder="field.placeholder || ''"
        />

        <div v-else-if="field.type === 'rating'" class="app-ops-rating">
          <p class="app-ops-rating__label">{{ field.label }}</p>
          <StarInput v-model="draft[field.key]" />
        </div>

        <Input
          v-else
          v-model="draft[field.key]"
          :label="field.label"
          :placeholder="field.placeholder || ''"
        />
      </div>
    </div>

    <footer class="app-ops-panel-footer">
      <Button variant="secondary" size="sm" :label="resetLabel" @click="resetDraft" />
      <Button variant="primary" size="sm" :label="saveLabel" @click="emitSave" />
    </footer>
  </section>
</template>

<script>
import Button from 'app/primitives/Button.vue';
import Input from 'app/primitives/Input.vue';
import StarInput from 'app/primitives/StarInput.vue';
import TagInput from 'app/primitives/TagInput.vue';
import Textarea from 'app/primitives/Textarea.vue';

function deepClone(value) {
  return JSON.parse(JSON.stringify(value || {}));
}

export default {
  name: 'FormPanel',
  components: {
    Button,
    Input,
    StarInput,
    TagInput,
    Textarea,
  },
  emits: ['update:modelValue', 'save'],
  props: {
    schema: { type: Array, default: () => [] },
    modelValue: { type: Object, default: () => ({}) },
    uiText: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      draft: deepClone(this.modelValue),
      isSyncingFromProp: false,
    };
  },
  computed: {
    titleText() {
      return this.uiText.shellOpsFormTitle || 'Record form';
    },
    subtitleText() {
      return this.uiText.shellOpsFormSubtitle || 'Field-level edits with explicit save and reset controls.';
    },
    saveLabel() {
      return this.uiText.shellOpsFormSave || 'Save changes';
    },
    resetLabel() {
      return this.uiText.shellOpsFormReset || 'Reset';
    },
  },
  watch: {
    modelValue: {
      deep: true,
      handler(nextValue) {
        this.isSyncingFromProp = true;
        this.draft = deepClone(nextValue);
        this.$nextTick(() => {
          this.isSyncingFromProp = false;
        });
      },
    },
    draft: {
      deep: true,
      handler(nextValue) {
        if (this.isSyncingFromProp) return;
        const incoming = JSON.stringify(nextValue || {});
        const current = JSON.stringify(this.modelValue || {});
        if (incoming === current) return;
        this.$emit('update:modelValue', deepClone(nextValue));
      },
    },
  },
  methods: {
    isInputField(type) {
      return type === 'text' || type === 'number' || type === 'date';
    },
    onSelect(key, event) {
      this.draft = {
        ...this.draft,
        [key]: event.target.value,
      };
    },
    resetDraft() {
      this.draft = deepClone(this.modelValue);
    },
    emitSave() {
      this.$emit('save', deepClone(this.draft));
    },
  },
};
</script>
