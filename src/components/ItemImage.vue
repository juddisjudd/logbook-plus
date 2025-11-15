<script setup lang="ts">
import { computed } from "vue";

interface Props {
  itemId: string;
  itemName?: string;
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: "medium",
  showLabel: false,
});

const imagePath = computed(() => {
  return new URL(`../assets/items/${props.itemId}.webp`, import.meta.url).href;
});

const sizeClass = computed(() => `item-image--${props.size}`);

const displayName = computed(() => {
  if (!props.itemName) return "";
  // Convert snake_case to Title Case
  return props.itemName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
});

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.display = "none";
};
</script>

<template>
  <div class="item-image-container" :class="sizeClass">
    <div class="image-wrapper">
      <img
        :src="imagePath"
        :alt="`${itemId} item image`"
        class="item-image"
        @error="handleImageError"
      />
      <div class="fallback-icon">M</div>
    </div>
    <p v-if="showLabel" class="item-label">{{ displayName }}</p>
  </div>
</template>

<style scoped>
.item-image-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.image-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 2px;
  background: var(--color-bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: var(--color-bg-secondary);
}

/* Fallback icon that shows when image is missing */
.fallback-icon {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e600b8, #c600a0);
  color: white;
  font-weight: 700;
  font-size: 1em;
  border: 1px solid #a00080;
}

.image-wrapper:has(img[style*="display: none"]) .fallback-icon {
  display: flex;
}

.image-wrapper:not(:has(img[style*="display: none"])) .fallback-icon {
  display: none;
}

/* Size variants */
.item-image-container.item-image--small .image-wrapper {
  width: 32px;
  height: 32px;
}

.item-image-container.item-image--small .fallback-icon {
  font-size: 12px;
}

.item-image-container.item-image--medium .image-wrapper {
  width: 48px;
  height: 48px;
}

.item-image-container.item-image--medium .fallback-icon {
  font-size: 16px;
}

.item-image-container.item-image--large .image-wrapper {
  width: 64px;
  height: 64px;
}

.item-image-container.item-image--large .fallback-icon {
  font-size: 20px;
}

.item-label {
  font-size: 9px;
  color: var(--color-text-secondary);
  margin: 0;
  text-align: center;
  max-width: 70px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
