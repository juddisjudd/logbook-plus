<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import SearchInput from "../SearchInput.vue";
import ItemImage from "../ItemImage.vue";
import { useItems } from "../../composables/useItems";

const { getAllItems, getItemTracker, toggleItemCollection } = useItems();
const searchQuery = ref("");

onMounted(() => {
  const allItems = getAllItems();
  console.log("ItemTracker mounted, found items:", allItems.length);
});

const getLocalizedText = (localized?: Record<string, string>) => {
  if (!localized) return "";
  return localized.en || Object.values(localized)[0] || "";
};

const items = computed(() => {
  let filtered = getAllItems().sort((a, b) => {
    const aName = getLocalizedText(a.name).toLowerCase();
    const bName = getLocalizedText(b.name).toLowerCase();
    return aName.localeCompare(bName);
  });

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter((item) => {
      const name = getLocalizedText(item.name).toLowerCase();
      const description = getLocalizedText(item.description).toLowerCase();
      return name.includes(query) || description.includes(query);
    });
  }

  return filtered;
});

const collectedCount = computed(() => {
  return getAllItems().filter((i) => getItemTracker(i.id).isCollected).length;
});

const handleToggleCollection = (itemId: string) => {
  toggleItemCollection(itemId);
};
</script>

<template>
  <div class="item-tracker">
    <div class="item-controls">
      <div class="stats">
        <span class="stat-label">Collected:</span>
        <span class="stat-value">{{ collectedCount }}/{{ getAllItems().length }}</span>
      </div>
      <SearchInput
        v-model="searchQuery"
        placeholder="Search items..."
      />
    </div>

    <div v-if="getAllItems().length === 0" class="empty-state">
      <p>No items loaded</p>
    </div>

    <div v-else-if="items.length === 0" class="empty-state">
      <p v-if="searchQuery">No items found</p>
      <p v-else>No items available</p>
    </div>

    <div v-else class="item-list">
      <div
        v-for="item in items"
        :key="item.id"
        class="item-card"
        :class="{ collected: getItemTracker(item.id).isCollected }"
      >
        <div class="item-visual">
          <ItemImage
            :item-id="item.id"
            :item-name="getLocalizedText(item.name)"
            size="medium"
          />
        </div>
        <div class="item-info">
          <h3 class="item-name">{{ getLocalizedText(item.name) }}</h3>
          <p class="item-description">{{ getLocalizedText(item.description) }}</p>
        </div>
        <button
          class="collect-button"
          :class="{ collected: getItemTracker(item.id).isCollected }"
          @click="handleToggleCollection(item.id)"
        >
          {{ getItemTracker(item.id).isCollected ? "✓" : "○" }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.item-tracker {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0;
  overflow: hidden;
}

.item-controls {
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

.item-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow-y: auto;
}

.item-card {
  display: grid;
  grid-template-columns: 64px 1fr 32px;
  gap: 12px;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  padding: 10px 12px;
  background: var(--color-bg-primary);
  transition: background 0.2s;
}

.item-card:hover {
  background: var(--color-bg-secondary);
}

.item-card.collected {
  opacity: 0.6;
}

.item-card.collected .item-name {
  text-decoration: line-through;
}

.item-visual {
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.item-name {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  font-family: "Barlow", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-description {
  font-size: 10px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

/* Responsive adjustments */
@media (max-width: 700px) {
  .item-card {
    grid-template-columns: 48px 1fr 28px;
  }

  .item-name {
    font-size: 11px;
  }

  .item-description {
    font-size: 9px;
  }
}
</style>
