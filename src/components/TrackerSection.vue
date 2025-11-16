<script setup lang="ts">
import LootFocuser from "./trackers/LootFocuser.vue";
import QuestTracker from "./trackers/QuestTracker.vue";
import HideoutTracker from "./trackers/HideoutTracker.vue";
import ProjectTracker from "./trackers/ProjectTracker.vue";
import BlueprintTracker from "./trackers/BlueprintTracker.vue";
import ItemTracker from "./trackers/ItemTracker.vue";

const props = defineProps<{
  id: string;
  title: string;
  isExpanded: boolean;
}>();

const emit = defineEmits<{
  toggle: [];
}>();

const toggleExpanded = () => {
  emit("toggle");
};
</script>

<template>
  <section class="tracker-section" :class="{ expanded: props.isExpanded }">
    <div class="section-header" @click="toggleExpanded">
      <span class="toggle-indicator">{{ props.isExpanded ? "▼" : "▶" }}</span>
      <h2 class="section-title">{{ props.title }}</h2>
    </div>

    <div v-if="props.isExpanded" class="section-content">
      <LootFocuser v-if="id === 'loot-focuser'" />
      <QuestTracker v-else-if="id === 'quests'" />
      <HideoutTracker v-else-if="id === 'hideout'" />
      <ProjectTracker v-else-if="id === 'projects'" />
      <Suspense v-else-if="id === 'blueprints'">
        <template #default>
          <BlueprintTracker />
        </template>
        <template #fallback>
          <div class="placeholder">Loading blueprints...</div>
        </template>
      </Suspense>
      <Suspense v-else-if="id === 'items'">
        <template #default>
          <ItemTracker />
        </template>
        <template #fallback>
          <div class="placeholder">Loading items...</div>
        </template>
      </Suspense>
      <p v-else class="placeholder">{{ title }} tracker data will appear here</p>
    </div>
  </section>
</template>

<style scoped>
.tracker-section {
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-primary);
  flex: 0 0 auto;
  transition: flex 0.3s ease;
}

.tracker-section.expanded {
  flex: 1 1 auto;
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
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-family: "Barlow", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.section-content {
  padding: 0;
  background: var(--color-bg-primary);
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
}

.placeholder {
  font-size: 11px;
  color: var(--color-text-secondary);
  margin: 0;
  text-align: center;
  padding: 12px;
}
</style>
