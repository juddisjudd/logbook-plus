import { ref, watch } from "vue";
import type { Blueprint, BlueprintTracker } from "../types/blueprint";
import { saveToStorage, loadFromStorage, serializeMap, deserializeMap } from "../utils/storage";

// Import only blueprint files
const blueprintModules = import.meta.glob<{ default: Blueprint }>(
  "../data/blueprints/*.json",
  { eager: true }
);

const moduleCount = Object.keys(blueprintModules).length;
console.log("blueprintModules glob result:", {
  count: moduleCount,
  keys: Object.keys(blueprintModules).slice(0, 5), // Show first 5 keys
});

export function useBlueprints() {
  const blueprints = ref<Map<string, Blueprint>>(new Map());
  const blueprintTrackers = ref<Map<string, BlueprintTracker>>(new Map());

  // Load all blueprints from JSON files
  const loadBlueprints = () => {
    const blueprintMap = new Map<string, Blueprint>();

    try {
      Object.values(blueprintModules).forEach((module) => {
        const blueprint = module.default;
        if (blueprint && blueprint.id) {
          blueprintMap.set(blueprint.id, blueprint);
        }
      });
      console.log(`Loaded ${blueprintMap.size} blueprints`);
    } catch (error) {
      console.error("Error loading blueprints:", error);
    }

    blueprints.value = blueprintMap;
  };

  // Load blueprint trackers from localStorage
  const loadBlueprintTrackers = () => {
    const saved = loadFromStorage<Array<[string, BlueprintTracker]>>("blueprint_trackers", []);
    blueprintTrackers.value = deserializeMap(saved);
  };

  // Get blueprint by ID
  const getBlueprint = (blueprintId: string) => {
    return blueprints.value.get(blueprintId);
  };

  // Get all blueprints as array
  const getAllBlueprints = () => {
    return Array.from(blueprints.value.values());
  };

  // Get blueprint tracker
  const getBlueprintTracker = (blueprintId: string) => {
    return blueprintTrackers.value.get(blueprintId) || {
      blueprintId,
      isCollected: false,
    };
  };

  // Update blueprint tracker (mark as collected/uncollected)
  const updateBlueprintTracker = (blueprintId: string, isCollected: boolean) => {
    const blueprint = getBlueprint(blueprintId);
    if (!blueprint) return;

    blueprintTrackers.value.set(blueprintId, {
      blueprintId,
      isCollected,
      collectedAt: isCollected ? Date.now() : undefined,
    });
  };

  // Toggle blueprint collected status
  const toggleBlueprintCollection = (blueprintId: string) => {
    const tracker = getBlueprintTracker(blueprintId);
    updateBlueprintTracker(blueprintId, !tracker.isCollected);
  };

  // Initialize on first use
  loadBlueprints();
  loadBlueprintTrackers();

  // Watch for changes to blueprint trackers and save to localStorage
  watch(
    () => serializeMap(blueprintTrackers.value),
    (newValue) => {
      saveToStorage("blueprint_trackers", newValue);
    },
    { deep: true }
  );

  return {
    blueprints,
    blueprintTrackers,
    loadBlueprints,
    loadBlueprintTrackers,
    getBlueprint,
    getAllBlueprints,
    getBlueprintTracker,
    updateBlueprintTracker,
    toggleBlueprintCollection,
  };
}
