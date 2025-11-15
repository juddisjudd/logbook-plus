<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  modelValue: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const value = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});
</script>

<template>
  <input
    v-model="value"
    type="text"
    class="search-input"
    :placeholder="placeholder || 'Search...'"
  />
</template>

<style scoped>
.search-input {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  padding: 6px 8px;
  font-size: 11px;
  font-family: "Barlow", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  border-radius: 2px;
  transition: border-color 0.2s;
  width: 100%;
}

.search-input::placeholder {
  color: var(--color-text-secondary);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-accent);
}
</style>
