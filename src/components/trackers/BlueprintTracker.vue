<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import SearchInput from "../SearchInput.vue";
import { useBlueprints } from "../../composables/useBlueprints";

const { getAllBlueprints, getBlueprintTracker, toggleBlueprintCollection } = useBlueprints();
const searchQuery = ref("");

onMounted(() => {
  const allBlueprints = getAllBlueprints();
  console.log("BlueprintTracker mounted, found blueprints:", allBlueprints.length);
});

const getLocalizedText = (localized?: Record<string, string>) => {
  if (!localized) return "";
  return localized.en || Object.values(localized)[0] || "";
};

const blueprints = computed(() => {
  let filtered = getAllBlueprints().sort((a, b) => {
    const aName = getLocalizedText(a.name).toLowerCase();
    const bName = getLocalizedText(b.name).toLowerCase();
    return aName.localeCompare(bName);
  });

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter((blueprint) => {
      const name = getLocalizedText(blueprint.name).toLowerCase();
      const description = getLocalizedText(blueprint.description).toLowerCase();
      return name.includes(query) || description.includes(query);
    });
  }

  return filtered;
});

const collectedCount = computed(() => {
  return getAllBlueprints().filter((b) => getBlueprintTracker(b.id).isCollected).length;
});

const handleToggleCollection = (blueprintId: string) => {
  toggleBlueprintCollection(blueprintId);
};
</script>

<template>
  <div class="blueprint-tracker">
    <div class="blueprint-controls">
      <div class="stats">
        <span class="stat-label">Collected:</span>
        <span class="stat-value">{{ collectedCount }}/{{ getAllBlueprints().length }}</span>
      </div>
      <SearchInput
        v-model="searchQuery"
        placeholder="Search blueprints..."
      />
    </div>

    <div v-if="getAllBlueprints().length === 0" class="empty-state">
      <p>No blueprints loaded</p>
    </div>

    <div v-else-if="blueprints.length === 0" class="empty-state">
      <p v-if="searchQuery">No blueprints found</p>
      <p v-else>No blueprints available</p>
    </div>

    <div v-else class="blueprint-list">
      <div
        v-for="blueprint in blueprints"
        :key="blueprint.id"
        class="blueprint-item"
        :class="{ collected: getBlueprintTracker(blueprint.id).isCollected }"
      >
        <div class="blueprint-header">
          <div class="blueprint-info">
            <h3 class="blueprint-name">{{ getLocalizedText(blueprint.name) }}</h3>
            <p class="blueprint-description">{{ getLocalizedText(blueprint.description) }}</p>
          </div>
          <button
            class="collect-button"
            :class="{ collected: getBlueprintTracker(blueprint.id).isCollected }"
            @click="handleToggleCollection(blueprint.id)"
          >
            {{ getBlueprintTracker(blueprint.id).isCollected ? "✓" : "○" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.blueprint-tracker {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0;
  overflow: hidden;
}

.blueprint-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
  flex-shrink: 0;
}

.stats {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--color-text-secondary);
}

.stat-label {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  color: var(--color-accent);
  font-weight: 700;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  font-size: 12px;
}

.blueprint-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow-y: auto;
}

.blueprint-item {
  border-bottom: 1px solid var(--color-border);
  padding: 10px 12px;
  background: var(--color-bg-primary);
  transition: background 0.2s;
}

.blueprint-item:hover {
  background: var(--color-bg-secondary);
}

.blueprint-item.collected {
  opacity: 0.6;
}

.blueprint-item.collected .blueprint-name {
  text-decoration: line-through;
}

.blueprint-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.blueprint-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.blueprint-name {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  font-family: "Barlow", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.blueprint-description {
  font-size: 10px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.3;
}

.collect-button {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  width: 28px;
  height: 28px;
  padding: 0;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.collect-button:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.collect-button.collected {
  background: var(--color-accent);
  color: var(--color-bg-primary);
  border-color: var(--color-accent);
}
</style>
