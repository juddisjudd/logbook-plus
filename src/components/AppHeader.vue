<script setup lang="ts">
import { getCurrentWindow } from "@tauri-apps/api/window";

defineProps<{
  version: string;
}>();

defineEmits<{
  close: [];
  settings: [];
}>();

const handleMouseDown = async () => {
  const appWindow = getCurrentWindow();
  await appWindow.startDragging();
};
</script>

<template>
  <header class="app-header">
    <div class="header-left" @mousedown="handleMouseDown">
      <h1 class="title">Logbook+</h1>
      <span class="version">v{{ version }}</span>
    </div>

    <div class="header-right">
      <button
        class="icon-button"
        title="Settings"
        @click="$emit('settings')"
      >
        ⚙
      </button>
      <button
        class="icon-button close-button"
        title="Close"
        @click="$emit('close')"
      >
        ✕
      </button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
  user-select: none;
  height: 40px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  -webkit-app-region: drag;
  flex: 1;
}

.title {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  letter-spacing: 0.5px;
  font-family: "Barlow", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.version {
  font-size: 10px;
  color: var(--color-text-secondary);
  font-family: "Barlow", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-weight: 400;
}

.header-right {
  display: flex;
  gap: 4px;
}

.icon-button {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 16px;
  padding: 4px 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
  min-width: 24px;
  height: 24px;
  font-family: "Barlow", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.icon-button:hover {
  color: var(--color-accent);
}

.icon-button:active {
  color: var(--color-accent-dark);
}

.close-button:hover {
  color: #ff6b6b;
}

.close-button:active {
  color: #cc5555;
}
</style>
