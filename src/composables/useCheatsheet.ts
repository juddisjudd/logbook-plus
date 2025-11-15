import { computed } from "vue";
import { useHideout } from "./useHideout";
import { useProjects } from "./useProjects";
import { useItems } from "./useItems";
import type { Item } from "../types/item";

export interface CategoryItem {
  itemId: string;
  item: Item | undefined;
  totalQuantity: number;
}

export interface ItemCategory {
  name: string;
  items: CategoryItem[];
}

export function useCheatsheet() {
  const { getAllHideouts } = useHideout();
  const { getAllProjects } = useProjects();
  const { getItem } = useItems();

  // Note: Quests don't require items - they require completing objectives
  // So we don't include quest items in the cheatsheet

  // Gather all unique item IDs and their total quantities from hideout
  const getHideoutItems = () => {
    const itemMap = new Map<string, number>();
    const hideouts = getAllHideouts();

    hideouts.forEach((hideout) => {
      hideout.levels.forEach((level) => {
        level.requirementItemIds.forEach((req) => {
          const current = itemMap.get(req.itemId) || 0;
          itemMap.set(req.itemId, current + req.quantity);
        });
      });
    });

    return itemMap;
  };

  // Gather all unique item IDs and their total quantities from projects
  const getProjectItems = () => {
    const itemMap = new Map<string, number>();
    const projects = getAllProjects();

    projects.forEach((project) => {
      project.phases.forEach((phase) => {
        phase.requirementItemIds.forEach((req) => {
          const current = itemMap.get(req.itemId) || 0;
          itemMap.set(req.itemId, current + req.quantity);
        });
      });
    });

    return itemMap;
  };

  // Convert item map to sorted category items
  const mapToCategory = (itemMap: Map<string, number>): CategoryItem[] => {
    const items: CategoryItem[] = Array.from(itemMap.entries()).map(
      ([itemId, totalQuantity]) => ({
        itemId,
        item: getItem(itemId),
        totalQuantity,
      })
    );

    // Sort by item name (English) for consistency
    items.sort((a, b) => {
      const nameA = a.item?.name?.en || a.itemId;
      const nameB = b.item?.name?.en || b.itemId;
      return nameA.localeCompare(nameB);
    });

    return items;
  };

  // Get all categories
  const getCheatsheetCategories = computed(() => {
    return [
      {
        name: "Hideout Items",
        items: mapToCategory(getHideoutItems()),
      },
      {
        name: "Project Items",
        items: mapToCategory(getProjectItems()),
      },
    ].filter((category) => category.items.length > 0); // Only show categories with items
  });

  // Get total unique items across all categories
  const getTotalUniqueItems = computed(() => {
    const allItemIds = new Set<string>();
    getCheatsheetCategories.value.forEach((category) => {
      category.items.forEach((item) => {
        allItemIds.add(item.itemId);
      });
    });
    return allItemIds.size;
  });

  // Get total items across all categories (with duplicates)
  const getTotalItems = computed(() => {
    let total = 0;
    getCheatsheetCategories.value.forEach((category) => {
      category.items.forEach((item) => {
        total += item.totalQuantity;
      });
    });
    return total;
  });

  return {
    getCheatsheetCategories,
    getTotalUniqueItems,
    getTotalItems,
  };
}
