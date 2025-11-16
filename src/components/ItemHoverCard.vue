<script setup lang="ts">
import { computed } from "vue";
import type { Item } from "../types/item";

interface Props {
  item: Item;
}

const props = defineProps<Props>();

const getLocalizedText = (record: Record<string, string> | undefined): string => {
  if (!record) return "";
  return record.en || Object.values(record)[0] || "";
};

const rarityClass = computed(() => {
  const rarity = props.item.rarity?.toLowerCase() || "";
  return `rarity-${rarity.replace(/\s+/g, "-")}`;
});

const effectsList = computed(() => {
  if (!props.item.effects) return [];
  return Object.entries(props.item.effects).map(([key, effect]) => {
    let name = key;
    let value = "";

    if (typeof effect === "object" && effect !== null) {
      name = getLocalizedText(effect as Record<string, string>);
      if ("value" in effect) {
        value = String((effect as Record<string, any>).value);
      }
    }

    return { name, value };
  });
});

const recyclesIntoList = computed(() => {
  if (!props.item.recyclesInto) return [];
  return Object.entries(props.item.recyclesInto).map(([item, count]) => ({
    item,
    count
  }));
});
</script>

<template>
  <div class="item-hover-card">
    <!-- Header -->
    <div class="card-header">
      <h2 class="item-title">{{ getLocalizedText(item.name) }}</h2>
      <span v-if="item.rarity" :class="['rarity-badge', rarityClass]">
        {{ item.rarity }}
      </span>
    </div>

    <!-- Description -->
    <p v-if="item.description" class="item-description">
      {{ getLocalizedText(item.description) }}
    </p>

    <!-- Properties Grid -->
    <div class="properties-grid">
      <div v-if="item.type" class="property">
        <span class="property-label">Type:</span>
        <span class="property-value">{{ item.type }}</span>
      </div>
      <div v-if="item.value" class="property">
        <span class="property-label">Value:</span>
        <span class="property-value">{{ item.value }}</span>
      </div>
      <div v-if="item.weightKg" class="property">
        <span class="property-label">Weight:</span>
        <span class="property-value">{{ item.weightKg }}kg</span>
      </div>
      <div v-if="item.stackSize" class="property">
        <span class="property-label">Stack:</span>
        <span class="property-value">{{ item.stackSize }}</span>
      </div>
      <div v-if="item.foundIn" class="property">
        <span class="property-label">Found In:</span>
        <span class="property-value">{{ item.foundIn }}</span>
      </div>
    </div>

    <!-- Effects -->
    <div v-if="effectsList.length > 0" class="section">
      <h4 class="section-title">Effects</h4>
      <div class="effects-list">
        <div v-for="(effect, idx) in effectsList" :key="idx" class="effect-item">
          <span class="effect-name">{{ effect.name }}</span>
          <span v-if="effect.value" class="effect-value">{{ effect.value }}</span>
        </div>
      </div>
    </div>

    <!-- Recycles Into -->
    <div v-if="recyclesIntoList.length > 0" class="section">
      <h4 class="section-title">Recycles Into</h4>
      <div class="recycles-list">
        <div v-for="recycle in recyclesIntoList" :key="recycle.item" class="recycle-item">
          <span class="recycle-name">{{ recycle.item }}</span>
          <span class="recycle-count">×{{ recycle.count }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.item-hover-card {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 12px;
  max-width: 300px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  font-family: "Barlow", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.item-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  flex: 1;
}

.rarity-badge {
  font-size: 9px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 2px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  flex-shrink: 0;
}

.rarity-common {
  background: rgba(128, 128, 128, 0.2);
  color: #a0a0a0;
  border: 1px solid #606060;
}

.rarity-uncommon {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
  border: 1px solid #2e7d32;
}

.rarity-rare {
  background: rgba(33, 150, 243, 0.2);
  color: #2196f3;
  border: 1px solid #1565c0;
}

.rarity-epic {
  background: rgba(156, 39, 176, 0.2);
  color: #9c27b0;
  border: 1px solid #6a1b9a;
}

.rarity-legendary {
  background: rgba(255, 152, 0, 0.2);
  color: #ff9800;
  border: 1px solid #e65100;
}

.item-description {
  font-size: 10px;
  color: var(--color-text-secondary);
  line-height: 1.4;
  margin: 0 0 8px 0;
  padding: 0;
}

.properties-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border);
}

.property {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.property-label {
  font-size: 9px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.property-value {
  font-size: 10px;
  color: var(--color-text-primary);
  font-weight: 500;
}

.section {
  margin-bottom: 8px;
}

.section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 10px;
  font-weight: 700;
  color: var(--color-accent);
  margin: 0 0 4px 0;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.effects-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.effect-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
  font-size: 9px;
}

.effect-name {
  color: var(--color-text-primary);
  flex: 1;
}

.effect-value {
  color: var(--color-accent);
  font-weight: 600;
}

.recycles-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.recycle-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
  font-size: 9px;
}

.recycle-name {
  color: var(--color-text-primary);
  flex: 1;
  text-transform: capitalize;
}

.recycle-count {
  color: var(--color-accent);
  font-weight: 600;
}
</style>
