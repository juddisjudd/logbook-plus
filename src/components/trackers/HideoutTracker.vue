<script setup lang="ts">
import { computed } from "vue";
import SearchInput from "../SearchInput.vue";
import ItemImage from "../ItemImage.vue";
import { useHideout } from "../../composables/useHideout";
import { useItems } from "../../composables/useItems";
import { ref } from "vue";

const { getAllHideouts, getHideoutTracker, setHideoutLevel, getNextLevelDetails, isMaxLevel } = useHideout();
const { getItem } = useItems();
const searchQuery = ref("");

const getLocalizedText = (localized: Record<string, string>) => {
  return localized.en || Object.values(localized)[0] || "";
};

const hideouts = computed(() => {
  let filtered = getAllHideouts();

  // Filter out hideouts with no requirements
  filtered = filtered.filter((hideout) => {
    // Include hideouts that have upgradeable levels with requirements
    return hideout.maxLevel > 0 && hideout.levels.some((level) => level.requirementItemIds.length > 0);
  });

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter((hideout) => {
      const name = getLocalizedText(hideout.name).toLowerCase();
      return name.includes(query);
    });
  }

  return filtered;
});

const handleLevelChange = (hideoutId: string, newLevel: number) => {
  setHideoutLevel(hideoutId, newLevel);
};

const getProgressPercentage = (hideoutId: string) => {
  const hideout = hideouts.value.find((h) => h.id === hideoutId);
  const tracker = getHideoutTracker(hideoutId);

  if (!hideout || hideout.maxLevel === 0) return 0;

  return Math.round((tracker.currentLevel / hideout.maxLevel) * 100);
};
</script>

<template>
  <div class="hideout-tracker">
    <div class="hideout-controls">
      <SearchInput
        v-model="searchQuery"
        placeholder="Search hideout..."
      />
    </div>

    <div v-if="hideouts.length === 0" class="empty-state">
      <p>No hideout facilities available</p>
    </div>

    <div v-else class="hideout-list">
      <div
        v-for="hideout in hideouts"
        :key="hideout.id"
        class="hideout-item"
      >
        <div class="hideout-header">
          <h3 class="hideout-name">{{ getLocalizedText(hideout.name) }}</h3>
          <span class="hideout-level">
            Level {{ getHideoutTracker(hideout.id).currentLevel }}/{{ hideout.maxLevel }}
          </span>
        </div>

        <div v-if="hideout.maxLevel > 0" class="hideout-content">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: getProgressPercentage(hideout.id) + '%' }"
            />
          </div>

          <div class="level-controls">
            <button
              class="level-button reset-button"
              :class="{ active: getHideoutTracker(hideout.id).currentLevel === 0 }"
              @click="handleLevelChange(hideout.id, 0)"
            >
              0
            </button>
            <button
              v-for="level in hideout.maxLevel"
              :key="level"
              class="level-button"
              :class="{ active: getHideoutTracker(hideout.id).currentLevel === level }"
              @click="handleLevelChange(hideout.id, level)"
            >
              {{ level }}
            </button>
          </div>

          <div v-if="!isMaxLevel(hideout.id) && getNextLevelDetails(hideout.id) && getNextLevelDetails(hideout.id)!.requirementItemIds.length > 0" class="next-requirements">
            <strong>Next Level Requirements:</strong>
            <div class="requirements-grid">
              <div v-for="(requirement, idx) in getNextLevelDetails(hideout.id)!.requirementItemIds" :key="idx" class="requirement-item">
                <ItemImage
                  :item-id="requirement.itemId"
                  :item-name="getItem(requirement.itemId)?.name?.en"
                  size="small"
                  show-label
                />
                <span class="requirement-quantity">×{{ requirement.quantity }}</span>
              </div>
            </div>
          </div>

          <div v-if="isMaxLevel(hideout.id)" class="maxed-out">
            <p>✓ Facility fully upgraded</p>
          </div>
        </div>

        <div v-else class="no-levels">
          <p>No upgrades available</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hideout-tracker {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0;
  overflow: hidden;
}

.hideout-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
  flex-shrink: 0;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  font-size: 12px;
}

.hideout-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow-y: auto;
}

.hideout-item {
  border-bottom: 1px solid var(--color-border);
  padding: 12px;
  background: var(--color-bg-primary);
  transition: background 0.2s;
}

.hideout-item:hover {
  background: var(--color-bg-secondary);
}

.hideout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.hideout-name {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  font-family: "Barlow", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.hideout-level {
  font-size: 10px;
  color: var(--color-text-secondary);
  background: var(--color-bg-secondary);
  padding: 2px 6px;
  border-radius: 2px;
}

.hideout-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.progress-bar {
  height: 6px;
  background: var(--color-bg-secondary);
  border-radius: 2px;
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.progress-fill {
  height: 100%;
  background: var(--color-accent);
  transition: width 0.3s ease;
}

.level-controls {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.level-button {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  padding: 4px 8px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.2s;
  min-width: 28px;
  text-align: center;
}

.level-button:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.level-button.active {
  background: var(--color-accent);
  color: var(--color-bg-primary);
  border-color: var(--color-accent);
}

.reset-button {
  margin-right: 4px;
  opacity: 0.7;
}

.reset-button:hover {
  opacity: 1;
}

.next-requirements {
  font-size: 10px;
  color: var(--color-text-primary);
  padding: 8px;
  background: var(--color-bg-secondary);
  border-left: 2px solid var(--color-accent);
  border-radius: 2px;
}

.next-requirements strong {
  display: block;
  color: var(--color-text-secondary);
  font-weight: 500;
  margin-bottom: 10px;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.requirements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 8px;
}

.requirement-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px;
  background: var(--color-bg-primary);
  border-radius: 2px;
  border: 1px solid var(--color-border);
  position: relative;
}

.requirement-quantity {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-accent);
  position: absolute;
  top: 2px;
  right: 2px;
  background: var(--color-bg-secondary);
  padding: 2px 4px;
  border-radius: 2px;
}

.maxed-out {
  font-size: 11px;
  color: var(--color-accent);
  text-align: center;
  padding: 8px;
  background: var(--color-bg-secondary);
  border-radius: 2px;
  font-weight: 600;
}

.no-levels {
  font-size: 11px;
  color: var(--color-text-secondary);
  text-align: center;
  padding: 8px;
}
</style>
