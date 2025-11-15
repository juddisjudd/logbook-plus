<script setup lang="ts">
import { computed, ref, watch } from "vue";
import SearchInput from "../SearchInput.vue";
import { useQuests } from "../../composables/useQuests";

const { getAllQuests, getQuestTracker, updateQuestTracker } = useQuests();
const selectedQuestId = ref<string | null>(null);
const searchQuery = ref("");

const getLocalizedText = (localized: Record<string, string>) => {
  return localized.en || Object.values(localized)[0] || "";
};

const quests = computed(() => {
  let filtered = getAllQuests();

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter((quest) => {
      const questName = getLocalizedText(quest.name).toLowerCase();
      const traderName = quest.trader.toLowerCase();
      return questName.includes(query) || traderName.includes(query);
    });
  }

  // Sort: active quests first, then completed
  filtered.sort((a, b) => {
    const aCompleted = getQuestTracker(a.id)?.isCompleted ?? false;
    const bCompleted = getQuestTracker(b.id)?.isCompleted ?? false;
    if (aCompleted === bCompleted) return 0;
    return aCompleted ? 1 : -1;
  });

  return filtered;
});

const selectedQuest = computed(() => {
  if (!selectedQuestId.value) return null;
  // Get from all quests, not filtered list, so it stays visible even if completion status changes
  return getAllQuests().find((q) => q.id === selectedQuestId.value);
});

const questTracker = computed(() => {
  if (!selectedQuestId.value) return null;
  return getQuestTracker(selectedQuestId.value);
});

// Auto-select first quest
watch(quests, (newQuests) => {
  if (newQuests.length > 0 && !selectedQuestId.value) {
    selectedQuestId.value = newQuests[0].id;
  }
}, { immediate: true });

const toggleQuestCompletion = (questId: string) => {
  const tracker = getQuestTracker(questId);
  const isCompleted = tracker?.isCompleted ?? false;
  updateQuestTracker(questId, { isCompleted: !isCompleted });
};
</script>

<template>
  <div class="quest-tracker">
    <div class="quest-list">
      <div class="quest-controls">
        <SearchInput
          v-model="searchQuery"
          placeholder="Search quests..."
        />
      </div>

      <div v-if="quests.length === 0" class="empty-state">
        <p>No quests available</p>
      </div>

      <div v-else class="quest-items">
        <button
          v-for="quest in quests"
          :key="quest.id"
          class="quest-item"
          :class="{
            active: selectedQuestId === quest.id,
            completed: getQuestTracker(quest.id)?.isCompleted
          }"
          @click="selectedQuestId = quest.id"
        >
          <div class="quest-item-header">
            <span class="quest-name">{{ getLocalizedText(quest.name) }}</span>
            <span class="quest-trader">{{ quest.trader }}</span>
          </div>
          <span v-if="getQuestTracker(quest.id)?.isCompleted" class="completed-badge">✓</span>
        </button>
      </div>
    </div>

    <div class="quest-detail">
      <div v-if="selectedQuest" class="detail-content">
        <div class="detail-header">
          <h3>{{ getLocalizedText(selectedQuest.name) }}</h3>
          <button
            class="completion-btn"
            :class="{ completed: questTracker?.isCompleted }"
            @click="toggleQuestCompletion(selectedQuest.id)"
          >
            {{ questTracker?.isCompleted ? "↺ Undo" : "Mark Complete" }}
          </button>
        </div>

        <div class="detail-trader">
          <strong>Trader:</strong> {{ selectedQuest.trader }}
        </div>

        <div v-if="selectedQuest.objectives.length > 0" class="detail-objectives">
          <strong>Objectives:</strong>
          <ul>
            <li v-for="(objective, idx) in selectedQuest.objectives" :key="idx">
              {{ getLocalizedText(objective) }}
            </li>
          </ul>
        </div>

        <div v-if="selectedQuest.rewardItemIds.length > 0" class="detail-rewards">
          <strong>Rewards:</strong>
          <ul>
            <li v-for="(reward, idx) in selectedQuest.rewardItemIds" :key="idx">
              {{ reward.itemId }} × {{ reward.quantity }}
            </li>
          </ul>
        </div>

        <div v-if="selectedQuest.xp > 0" class="detail-xp">
          <strong>XP:</strong> {{ selectedQuest.xp }}
        </div>
      </div>

      <div v-else class="empty-detail">
        <p>Select a quest to view details</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quest-tracker {
  display: flex;
  height: 100%;
  gap: 0;
  overflow: hidden;
}

.quest-list {
  width: 45%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
}

.quest-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.quest-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  font-size: 12px;
}

.quest-items {
  display: flex;
  flex-direction: column;
}

.quest-item {
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--color-border);
  padding: 10px 12px;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quest-item:hover {
  background: var(--color-bg-tertiary);
}

.quest-item.active {
  background: var(--color-bg-tertiary);
  border-left: 3px solid var(--color-accent);
  padding-left: 9px;
}

.quest-item.completed {
  opacity: 0.6;
}

.quest-item.completed .quest-name {
  text-decoration: line-through;
  color: var(--color-text-secondary);
}

.quest-item-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.quest-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: all 0.2s;
}

.quest-trader {
  font-size: 10px;
  color: var(--color-text-secondary);
}

.completed-badge {
  color: #4da6ff;
  font-size: 14px;
  font-weight: bold;
  margin-left: 8px;
}

.detail-content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.detail-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-primary);
  flex: 1;
}

.completion-btn {
  background: var(--color-accent);
  border: none;
  color: var(--color-bg-primary);
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.2s;
  white-space: nowrap;
}

.completion-btn:hover {
  background: #5db3ff;
}

.completion-btn.completed {
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  opacity: 1;
}

.completion-btn.completed:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.detail-trader,
.detail-rewards,
.detail-xp {
  font-size: 11px;
  color: var(--color-text-primary);
}

.detail-trader strong,
.detail-rewards strong,
.detail-xp strong {
  color: var(--color-text-secondary);
  font-weight: 500;
}

.detail-objectives {
  font-size: 11px;
  color: var(--color-text-primary);
}

.detail-objectives strong {
  color: var(--color-text-secondary);
  font-weight: 500;
  display: block;
  margin-bottom: 6px;
}

.detail-objectives ul,
.detail-rewards ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-objectives li,
.detail-rewards li {
  margin-left: 0;
  color: var(--color-text-secondary);
}

.empty-detail {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  font-size: 12px;
}
</style>
