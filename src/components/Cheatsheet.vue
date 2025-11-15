<script setup lang="ts">
import { ref } from "vue";
import SearchInput from "./SearchInput.vue";
import ItemImage from "./ItemImage.vue";
import { useCheatsheet } from "../composables/useCheatsheet";

const { getCheatsheetCategories, getTotalUniqueItems, getTotalItems } = useCheatsheet();
const searchQuery = ref("");

const filteredCategories = () => {
  if (!searchQuery.value.trim()) {
    return getCheatsheetCategories.value;
  }

  const query = searchQuery.value.toLowerCase().trim();
  return getCheatsheetCategories.value
    .map((category) => ({
      ...category,
      items: category.items.filter((item) => {
        const itemName = item.item?.name?.en || item.itemId;
        return itemName.toLowerCase().includes(query);
      }),
    }))
    .filter((category) => category.items.length > 0);
};
</script>

<template>
  <div class="cheatsheet-container">
    <div class="cheatsheet-header">
      <h2 class="cheatsheet-title">The What to Keep Guide</h2>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-number">{{ getTotalUniqueItems }}</div>
          <div class="stat-label">TOTAL ITEMS</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ getTotalItems }}</div>
          <div class="stat-label">TOTAL QUANTITIES</div>
        </div>
      </div>
    </div>

    <div class="cheatsheet-controls">
      <SearchInput
        v-model="searchQuery"
        placeholder="Search items..."
      />
    </div>

    <div class="cheatsheet-content">
      <div v-if="filteredCategories().length === 0" class="empty-state">
        <p>No items found matching your search</p>
      </div>

      <div v-else class="categories-list">
        <div
          v-for="category in filteredCategories()"
          :key="category.name"
          class="category-section"
        >
          <div class="category-header">
            <h3 class="category-title">{{ category.name }}</h3>
            <span class="category-count">{{ category.items.length }} items</span>
          </div>

          <div class="items-grid">
            <div
              v-for="item in category.items"
              :key="item.itemId"
              class="item-card"
            >
              <ItemImage
                :item-id="item.itemId"
                :item-name="item.item?.name?.en"
                size="medium"
              />
              <div class="item-info">
                <div class="item-name">{{ item.item?.name?.en || item.itemId }}</div>
                <div v-if="item.totalQuantity > 0" class="item-quantity">
                  ×{{ item.totalQuantity }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cheatsheet-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0;
  overflow: hidden;
}

.cheatsheet-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.cheatsheet-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
  font-family: "Barlow", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  letter-spacing: 0.5px;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  background: var(--color-bg-primary);
  border-radius: 4px;
  border: 1px solid var(--color-border);
}

.stat-number {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-accent);
  font-family: "Barlow", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.stat-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cheatsheet-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 12px;
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.cheatsheet-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-secondary);
  font-size: 12px;
  padding: 16px;
  text-align: center;
}

.categories-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.category-section {
  border-bottom: 2px solid var(--color-border);
  padding: 16px;
  background: var(--color-bg-primary);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border);
}

.category-title {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-accent);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: "Barlow", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.category-count {
  font-size: 10px;
  color: var(--color-text-secondary);
  background: var(--color-bg-secondary);
  padding: 2px 6px;
  border-radius: 2px;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
}

.item-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px;
  background: var(--color-bg-secondary);
  border-radius: 4px;
  border: 1px solid var(--color-border);
  transition: all 0.2s;
}

.item-card:hover {
  border-color: var(--color-accent);
  background: var(--color-bg-tertiary);
}

.item-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  width: 100%;
  text-align: center;
}

.item-name {
  font-size: 9px;
  color: var(--color-text-primary);
  font-weight: 500;
  line-height: 1.2;
  word-break: break-word;
}

.item-quantity {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-accent);
  background: rgba(242, 164, 19, 0.1);
  padding: 2px 4px;
  border-radius: 2px;
  min-width: 24px;
  text-align: center;
}
</style>
