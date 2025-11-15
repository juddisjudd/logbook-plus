<script setup lang="ts">
import { ref } from "vue";

defineProps<{
  title: string;
}>();

const isExpanded = ref(true);
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};
</script>

<template>
  <section class="tracker-section">
    <div class="section-header" @click="toggleExpanded">
      <span class="toggle-indicator">{{ isExpanded ? "▼" : "▶" }}</span>
      <h2 class="section-title">{{ title }}</h2>
    </div>

    <div v-if="isExpanded" class="section-content">
      <p class="placeholder">{{ title }} tracker data will appear here</p>
    </div>
  </section>
</template>

<style scoped>
.tracker-section {
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-primary);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  cursor: pointer;
  user-select: none;
  background: var(--color-bg-secondary);
  transition: background 0.2s;
}

.section-header:hover {
  background: var(--color-bg-tertiary);
}

.toggle-indicator {
  font-size: 10px;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 10px;
}

.section-title {
  font-size: 12px;
  font-weight: bold;
  color: var(--color-text-primary);
  margin: 0;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.section-content {
  padding: 12px;
  background: var(--color-bg-primary);
}

.placeholder {
  font-size: 11px;
  color: var(--color-text-secondary);
  margin: 0;
  text-align: center;
}
</style>
