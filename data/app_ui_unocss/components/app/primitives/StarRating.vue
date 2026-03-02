<template>
  <div class="app-star-rating" :aria-label="`${safeValue}/${safeMax}`">
    <i
      v-for="index in safeMax"
      :key="index"
      class="fa-solid fa-star"
      :class="{ 'is-active': index <= safeValue }"
    ></i>
  </div>
</template>

<script>
export default {
  name: 'StarRating',
  props: {
    value: { type: Number, default: 0 },
    max: { type: Number, default: 5 },
  },
  computed: {
    safeValue() {
      const value = Number(this.value || 0);
      return Math.max(0, Math.min(this.safeMax, Number.isFinite(value) ? Math.round(value) : 0));
    },
    safeMax() {
      const value = Number(this.max || 5);
      return Math.max(1, Number.isFinite(value) ? Math.round(value) : 5);
    },
  },
};
</script>
