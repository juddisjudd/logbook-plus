<script setup lang="ts">
import { ref, computed } from "vue";
import { useItems } from "../../composables/useItems";
import { useLootFocuser } from "../../composables/useLootFocuser";
import type { Item } from "../../types/item";
import ItemImage from "../ItemImage.vue";

const { getAllItems } = useItems();
const { focusedItems, addFocusedItem, removeFocusedItem, updateQuantity, clearAllFocused, isFocused } = useLootFocuser();

const searchQuery = ref("");
const selectedQuantity = ref(1);

// Get all available items
const allItems = computed(() => getAllItems());

// Filter and sort items based on search
const filteredItems = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();

  // Filter items, ensuring they have valid names
  let items = allItems.value.filter((item) => item?.name?.en);

  if (query) {
    items = items.filter((item) =>
      item.name.en.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query)
    );
  }

  // Sort by name
  return items.sort((a, b) => {
    const nameA = a.name?.en || '';
    const nameB = b.name?.en || '';
    return nameA.localeCompare(nameB);
  });
});

// Get focused items as array
const focusedItemsList = computed(() => {
  return Array.from(focusedItems.value.values());
});

const handleAddItem = (item: Item) => {
  addFocusedItem(item, selectedQuantity.value);
  selectedQuantity.value = 1;
  searchQuery.value = "";
};

const handleRemoveItem = (itemId: string) => {
  removeFocusedItem(itemId);
};

const handleQuantityChange = (itemId: string, quantity: string) => {
  const num = Math.max(1, parseInt(quantity) || 1);
  updateQuantity(itemId, num);
};

const getLocalizedText = (record: Record<string, string> | undefined): string => {
  if (!record) return "";
  return record.en || Object.values(record)[0] || "";
};
</script>

<template>
  <div class="loot-focuser">
    <!-- Focused Items List -->
    <div class="focused-section">
      <div class="section-header">
        <h3 class="section-title">Your Focus</h3>
        <button
          v-if="focusedItemsList.length > 0"
          class="clear-btn"
          @click="clearAllFocused"
          title="Clear all focused items"
        >
          Clear All
        </button>
      </div>

      <div v-if="focusedItemsList.length === 0" class="empty-state">
        <p>No items focused yet. Search below to add items to focus on.</p>
      </div>

      <div v-else class="focused-items-list">
        <div v-for="item in focusedItemsList" :key="item.itemId" class="focused-item">
          <div class="item-info">
            <ItemImage :item-id="item.itemId" size="small" />
            <div class="item-details">
              <span class="item-name">{{ item.name }}</span>
              <div class="quantity-control">
                <label>Qty:</label>
                <input
                  type="number"
                  min="1"
                  :value="item.quantity"
                  @change="(e) => handleQuantityChange(item.itemId, (e.target as HTMLInputElement).value)"
                  class="quantity-input"
                />
              </div>
            </div>
          </div>
          <button
            class="remove-btn"
            @click="handleRemoveItem(item.itemId)"
            title="Remove from focus"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

    <!-- Search and Add Section -->
    <div class="search-section">
      <div class="search-header">
        <h4 class="search-title">Add Items</h4>
      </div>

      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search items..."
        class="search-input"
      />

      <div v-if="!searchQuery" class="empty-search">
        <p>Start typing to search for items...</p>
      </div>

      <div v-else-if="filteredItems.length === 0" class="no-results">
        No items found matching "{{ searchQuery }}"
      </div>

      <div v-else class="items-grid">
        <div
          v-for="item in filteredItems.slice(0, 12)"
          :key="item.id"
          class="item-card"
          :class="{ focused: isFocused(item.id) }"
          @click="handleAddItem(item)"
        >
          <ItemImage :item-id="item.id" size="medium" />
          <span class="item-card-name">{{ getLocalizedText(item.name) }}</span>
          <div v-if="isFocused(item.id)" class="focused-badge">✓</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loot-focuser {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px;
  width: 100%;
}

.focused-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 2px;
  padding: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.section-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: "Barlow", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.clear-btn {
  padding: 4px 8px;
  background: transparent;
  border: 1px solid var(--color-text-secondary);
  color: var(--color-text-secondary);
  border-radius: 2px;
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: "Barlow", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.clear-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-primary);
  border-color: var(--color-text-primary);
}

.empty-state {
  padding: 12px;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 11px;
  line-height: 1.5;
}

.focused-items-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.focused-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 2px;
  gap: 8px;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-primary);
  font-family: "Barlow", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 4px;
}

.quantity-control label {
  font-size: 9px;
  color: var(--color-text-secondary);
  font-family: "Barlow", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.quantity-input {
  width: 40px;
  padding: 3px 4px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 2px;
  color: var(--color-text-primary);
  font-size: 10px;
  font-family: "Barlow", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

/* Hide number input spinners */
.quantity-input::-webkit-outer-spin-button,
.quantity-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.quantity-input[type="number"] {
  -moz-appearance: textfield;
}

.quantity-input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.remove-btn {
  padding: 4px 6px;
  background: transparent;
  border: 1px solid #ff6b6b;
  color: #ff6b6b;
  border-radius: 2px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.remove-btn:hover {
  background: rgba(255, 107, 107, 0.1);
  color: #ff5252;
}

.search-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
}

.search-header {
  padding: 0 4px;
}

.search-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: "Barlow", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.search-input {
  padding: 8px 10px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 2px;
  color: var(--color-text-primary);
  font-size: 11px;
  font-family: "Barlow", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.search-input::placeholder {
  color: var(--color-text-secondary);
}

.empty-search {
  padding: 12px;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 11px;
}

.empty-search p {
  margin: 0;
}

.no-results {
  padding: 12px;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 11px;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 6px;
  max-height: 200px;
  overflow-y: auto;
}

.item-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  text-align: center;
}

.item-card:hover {
  border-color: var(--color-accent);
  background: rgba(242, 164, 19, 0.05);
  transform: translateY(-2px);
}

.item-card.focused {
  border-color: var(--color-accent);
  background: rgba(242, 164, 19, 0.1);
}

.item-card-name {
  font-size: 8px;
  color: var(--color-text-secondary);
  font-family: "Barlow", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  width: 100%;
}

.focused-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-accent);
  color: var(--color-bg-primary);
  border-radius: 50%;
  font-size: 10px;
  font-weight: 700;
}
</style>
