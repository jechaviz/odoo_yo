<template>
  <div class="app-inline-editor" @keydown.stop>
    <select v-if="inputType === 'select' || inputType === 'user'" ref="inputEl" v-model="draftScalar" class="app-inline-input" @keydown.enter.prevent="commit" @keydown.esc.prevent="cancel" @blur="commit">
      <option v-for="opt in normalizedOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>

    <select v-else-if="inputType === 'multi-user'" ref="inputEl" v-model="draftArray" class="app-inline-input" multiple @blur="commit">
      <option v-for="opt in normalizedOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>

    <input v-else-if="inputType === 'slider'" ref="inputEl" class="app-inline-input" type="range" min="0" max="100" step="5" v-model="draftScalar" @change="commit" />

    <div v-else-if="inputType === 'rating'" class="app-inline-rating">
      <button v-for="star in 5" :key="star" type="button" class="app-inline-star" :class="{ active: Number(draftScalar) >= star }" @mousedown.prevent @click="draftScalar = star; commit()">
        <i class="fa-solid fa-star"></i>
      </button>
    </div>

    <input v-else-if="inputType === 'tags'" ref="inputEl" class="app-inline-input" type="text" v-model="draftScalar" placeholder="tag1, tag2" @keydown.enter.prevent="commit" @keydown.esc.prevent="cancel" @blur="commit" />

    <input v-else ref="inputEl" class="app-inline-input" :type="nativeType" v-model="draftScalar" @keydown.enter.prevent="commit" @keydown.esc.prevent="cancel" @blur="commit" />

    <button class="app-inline-btn is-save" type="button" @mousedown.prevent @click="commit" title="Save"><i class="fa-solid fa-check"></i></button>
    <button class="app-inline-btn" type="button" @mousedown.prevent @click="cancel" title="Cancel"><i class="fa-solid fa-xmark"></i></button>
  </div>
</template>

<script>
export default {
  name: 'InlineCellEditor',
  props: {
    modelValue: { type: [String, Number, Array], default: '' },
    inputType: { type: String, default: 'text' },
    options: { type: Array, default: () => [] },
  },
  emits: ['save', 'cancel'],
  data() {
    return {
      draftScalar: Array.isArray(this.modelValue) ? this.modelValue.join(', ') : this.modelValue,
      draftArray: Array.isArray(this.modelValue) ? [...this.modelValue] : [],
    };
  },
  computed: {
    nativeType() {
      if (this.inputType === 'date') return 'date';
      if (this.inputType === 'number') return 'number';
      if (this.inputType === 'email') return 'email';
      return 'text';
    },
    normalizedOptions() {
      return this.options
        .map((opt) => (opt && typeof opt === 'object' ? { value: String(opt.value ?? ''), label: String(opt.label ?? opt.value ?? '') } : { value: String(opt ?? ''), label: String(opt ?? '') }))
        .filter((opt) => opt.value.length > 0);
    },
  },
  watch: {
    modelValue(next) {
      this.draftScalar = Array.isArray(next) ? next.join(', ') : next;
      this.draftArray = Array.isArray(next) ? [...next] : [];
    },
  },
  mounted() {
    this.$nextTick(() => {
      const input = this.$refs.inputEl;
      if (input && typeof input.focus === 'function') input.focus();
    });
  },
  methods: {
    commit() {
      if (this.inputType === 'multi-user') {
        this.$emit('save', [...this.draftArray]);
        return;
      }
      if (this.inputType === 'tags') {
        this.$emit('save', String(this.draftScalar || '').split(',').map((entry) => entry.trim()).filter(Boolean));
        return;
      }
      this.$emit('save', this.draftScalar);
    },
    cancel() {
      this.$emit('cancel');
    },
  },
};
</script>
