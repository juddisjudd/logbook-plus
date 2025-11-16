import { ref, watch } from "vue";
import type { Item } from "../types/item";
import { saveToStorage, loadFromStorage } from "../utils/storage";

export interface FocusedLootItem {
  itemId: string;
  name: string;
  quantity: number;
}

const focusedItems = ref<Map<string, FocusedLootItem>>(new Map());

export function useLootFocuser() {
  // Load focused items from localStorage
  const loadFocusedItems = () => {
    const saved = loadFromStorage<Array<[string, FocusedLootItem]>>("loot_focuser_items", []);
    focusedItems.value = new Map(saved);
  };

  // Add item to loot focuser
  const addFocusedItem = (item: Item, quantity: number = 1) => {
    if (quantity <= 0) return;

    focusedItems.value.set(item.id, {
      itemId: item.id,
      name: item.name.en,
      quantity: Math.max(1, quantity),
    });
  };

  // Remove item from loot focuser
  const removeFocusedItem = (itemId: string) => {
    focusedItems.value.delete(itemId);
  };

  // Update quantity of focused item
  const updateQuantity = (itemId: string, quantity: number) => {
    const item = focusedItems.value.get(itemId);
    if (item) {
      if (quantity <= 0) {
        removeFocusedItem(itemId);
      } else {
        item.quantity = quantity;
      }
    }
  };

  // Clear all focused items
  const clearAllFocused = () => {
    focusedItems.value.clear();
  };

  // Get focused items as array
  const getFocusedItemsArray = () => {
    return Array.from(focusedItems.value.values());
  };

  // Check if item is focused
  const isFocused = (itemId: string) => {
    return focusedItems.value.has(itemId);
  };

  // Initialize on first use
  loadFocusedItems();

  // Watch for changes and save to localStorage
  watch(
    () => Array.from(focusedItems.value.entries()),
    (newValue) => {
      saveToStorage("loot_focuser_items", newValue);
    },
    { deep: true }
  );

  return {
    focusedItems,
    addFocusedItem,
    removeFocusedItem,
    updateQuantity,
    clearAllFocused,
    getFocusedItemsArray,
    isFocused,
    loadFocusedItems,
  };
}
