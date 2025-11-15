<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import AppHeader from "./components/AppHeader.vue";
import TrackerSection from "./components/TrackerSection.vue";
import SettingsPanel from "./components/SettingsPanel.vue";

const showSettings = ref(false);
const appVersion = import.meta.env.PACKAGE_VERSION || "0.1.0";
let unlistenShortcut: UnlistenFn | null = null;

const trackers = [
  { id: "quests", title: "QUESTS" },
  { id: "hideout", title: "HIDEOUT" },
  { id: "blueprints", title: "BLUEPRINTS" },
  { id: "items", title: "ITEM LIST" },
];

onMounted(async () => {
  const appWindow = getCurrentWindow();
  await appWindow.setTitle("Logbook+");

  // Listen for global shortcut event from Rust backend
  unlistenShortcut = await listen<string>("tauri://global-shortcut", async (event) => {
    const payload = (event.payload as unknown as string) || "";
    // Handle any hotkey trigger (F10 or custom hotkey)
    if (payload.length > 0) {
      const window = getCurrentWindow();
      if ((await window.isVisible())) {
        await window.hide();
      } else {
        await window.show();
        await window.setFocus();
      }
    }
  });
});

onUnmounted(async () => {
  if (unlistenShortcut) {
    unlistenShortcut();
  }
});

const handleClose = async () => {
  const appWindow = getCurrentWindow();
  await appWindow.close();
};

const handleSettingsToggle = () => {
  showSettings.value = !showSettings.value;
};
</script>

<template>
  <div class="app-root">
    <AppHeader
      :version="appVersion"
      @close="handleClose"
      @settings="handleSettingsToggle"
    />

    <div class="content-container">
      <SettingsPanel v-if="showSettings" />
      <div v-else class="trackers-container">
        <TrackerSection
          v-for="tracker in trackers"
          :key="tracker.id"
          :id="tracker.id"
          :title="tracker.title"
        />
      </div>
    </div>
  </div>
</template>

<style>
@import "./styles/base.css";
</style>

<style scoped>
.app-root {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: var(--color-bg-primary);
}

.content-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow: hidden;
}

.trackers-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>