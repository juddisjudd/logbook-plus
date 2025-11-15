import { ref, computed } from "vue";
import type { Quest, QuestTracker } from "../types/quest";

// Import all quest files
const questModules = import.meta.glob<{ default: Quest }>(
  "../data/quests/*.json",
  { eager: true }
);

export function useQuests() {
  const quests = ref<Map<string, Quest>>(new Map());
  const questTrackers = ref<Map<string, QuestTracker>>(new Map());
  const selectedQuestId = ref<string | null>(null);

  // Load all quests from JSON files
  const loadQuests = () => {
    const questMap = new Map<string, Quest>();

    Object.values(questModules).forEach((module) => {
      const quest = module.default;
      questMap.set(quest.id, quest);
    });

    quests.value = questMap;
  };

  // Get quest by ID
  const getQuest = (questId: string) => {
    return quests.value.get(questId);
  };

  // Get all quests as array
  const getAllQuests = () => {
    return Array.from(quests.value.values());
  };

  // Get quest by trader name
  const getQuestsByTrader = (traderName: string) => {
    return Array.from(quests.value.values()).filter(
      (quest) => quest.trader === traderName
    );
  };

  // Get next quests for a given quest
  const getNextQuests = (questId: string) => {
    const quest = getQuest(questId);
    if (!quest) return [];

    return quest.nextQuestIds
      .map((id) => getQuest(id))
      .filter((q) => q !== undefined) as Quest[];
  };

  // Get previous quests for a given quest
  const getPreviousQuests = (questId: string) => {
    const quest = getQuest(questId);
    if (!quest) return [];

    return quest.previousQuestIds
      .map((id) => getQuest(id))
      .filter((q) => q !== undefined) as Quest[];
  };

  // Update quest tracker
  const updateQuestTracker = (questId: string, tracker: Partial<QuestTracker>) => {
    const existing = questTrackers.value.get(questId) || {
      questId,
      isCompleted: false,
      objectivesCompleted: [],
    };

    questTrackers.value.set(questId, {
      ...existing,
      ...tracker,
    });
  };

  // Get quest tracker
  const getQuestTracker = (questId: string) => {
    return questTrackers.value.get(questId);
  };

  // Get all active (incomplete) quests
  const activeQuests = computed(() => {
    return Array.from(quests.value.values()).filter((quest) => {
      const tracker = getQuestTracker(quest.id);
      return !tracker?.isCompleted;
    });
  });

  // Get all completed quests
  const completedQuests = computed(() => {
    return Array.from(quests.value.values()).filter((quest) => {
      const tracker = getQuestTracker(quest.id);
      return tracker?.isCompleted;
    });
  });

  // Initialize on first use
  loadQuests();

  return {
    quests,
    questTrackers,
    selectedQuestId,
    loadQuests,
    getQuest,
    getAllQuests,
    getQuestsByTrader,
    getNextQuests,
    getPreviousQuests,
    updateQuestTracker,
    getQuestTracker,
    activeQuests,
    completedQuests,
  };
}
