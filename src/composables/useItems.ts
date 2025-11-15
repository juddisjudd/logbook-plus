import { ref } from "vue";
import type { Item, ItemTracker } from "../types/item";

// Import only item files (non-blueprints)
const itemModules = import.meta.glob<{ default: Item }>(
  "../data/items/*.json",
  { eager: true }
);

const moduleCount = Object.keys(itemModules).length;
console.log("itemModules glob result:", {
  count: moduleCount,
  keys: Object.keys(itemModules).slice(0, 5), // Show first 5 keys
});

export function useItems() {
  const items = ref<Map<string, Item>>(new Map());
  const itemTrackers = ref<Map<string, ItemTracker>>(new Map());

  // Load all items from JSON files
  const loadItems = () => {
    const itemMap = new Map<string, Item>();

    try {
      Object.values(itemModules).forEach((module) => {
        const item = module.default;
        if (item && item.id) {
          itemMap.set(item.id, item);
        }
      });
      console.log(`Loaded ${itemMap.size} items`);
    } catch (error) {
      console.error("Error loading items:", error);
    }

    items.value = itemMap;
  };

  // Get item by ID
  const getItem = (itemId: string) => {
    return items.value.get(itemId);
  };

  // Get all items as array
  const getAllItems = () => {
    return Array.from(items.value.values());
  };

  // Get item tracker
  const getItemTracker = (itemId: string) => {
    return itemTrackers.value.get(itemId) || {
      itemId,
      isCollected: false,
    };
  };

  // Update item tracker (mark as collected/uncollected)
  const updateItemTracker = (itemId: string, isCollected: boolean) => {
    const item = getItem(itemId);
    if (!item) return;

    itemTrackers.value.set(itemId, {
      itemId,
      isCollected,
      collectedAt: isCollected ? Date.now() : undefined,
    });
  };

  // Toggle item collected status
  const toggleItemCollection = (itemId: string) => {
    const tracker = getItemTracker(itemId);
    updateItemTracker(itemId, !tracker.isCollected);
  };

  // Initialize on first use
  loadItems();

  return {
    items,
    itemTrackers,
    loadItems,
    getItem,
    getAllItems,
    getItemTracker,
    updateItemTracker,
    toggleItemCollection,
  };
}
