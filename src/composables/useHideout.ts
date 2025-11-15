import { ref } from "vue";
import type { Hideout, HideoutTracker } from "../types/hideout";

// Import all hideout files
const hideoutModules = import.meta.glob<{ default: Hideout }>(
  "../data/hideout/*.json",
  { eager: true }
);

export function useHideout() {
  const hideouts = ref<Map<string, Hideout>>(new Map());
  const hideoutTrackers = ref<Map<string, HideoutTracker>>(new Map());

  // Load all hideouts from JSON files
  const loadHideouts = () => {
    const hideoutMap = new Map<string, Hideout>();

    Object.values(hideoutModules).forEach((module) => {
      const hideout = module.default;
      hideoutMap.set(hideout.id, hideout);
    });

    hideouts.value = hideoutMap;
  };

  // Get hideout by ID
  const getHideout = (hideoutId: string) => {
    return hideouts.value.get(hideoutId);
  };

  // Get all hideouts as array
  const getAllHideouts = () => {
    return Array.from(hideouts.value.values());
  };

  // Get hideout tracker
  const getHideoutTracker = (hideoutId: string) => {
    return hideoutTrackers.value.get(hideoutId) || {
      hideoutId,
      currentLevel: 0,
    };
  };

  // Update hideout tracker level
  const setHideoutLevel = (hideoutId: string, level: number) => {
    const hideout = getHideout(hideoutId);
    if (!hideout || level < 0 || level > hideout.maxLevel) return;

    hideoutTrackers.value.set(hideoutId, {
      hideoutId,
      currentLevel: level,
    });
  };

  // Get current level details
  const getCurrentLevelDetails = (hideoutId: string) => {
    const hideout = getHideout(hideoutId);
    const tracker = getHideoutTracker(hideoutId);

    if (!hideout || tracker.currentLevel === 0) return null;

    return hideout.levels.find((l) => l.level === tracker.currentLevel);
  };

  // Get next level details
  const getNextLevelDetails = (hideoutId: string) => {
    const hideout = getHideout(hideoutId);
    const tracker = getHideoutTracker(hideoutId);

    if (!hideout || tracker.currentLevel >= hideout.maxLevel) return null;

    return hideout.levels.find((l) => l.level === tracker.currentLevel + 1);
  };

  // Check if hideout is maxed out
  const isMaxLevel = (hideoutId: string) => {
    const hideout = getHideout(hideoutId);
    const tracker = getHideoutTracker(hideoutId);

    return tracker.currentLevel === hideout?.maxLevel;
  };

  // Get progress percentage
  const getProgressPercentage = (hideoutId: string) => {
    const hideout = getHideout(hideoutId);
    const tracker = getHideoutTracker(hideoutId);

    if (!hideout || hideout.maxLevel === 0) return 0;

    return Math.round((tracker.currentLevel / hideout.maxLevel) * 100);
  };

  // Initialize on first use
  loadHideouts();

  return {
    hideouts,
    hideoutTrackers,
    loadHideouts,
    getHideout,
    getAllHideouts,
    getHideoutTracker,
    setHideoutLevel,
    getCurrentLevelDetails,
    getNextLevelDetails,
    isMaxLevel,
    getProgressPercentage,
  };
}
