<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import AppHeader from "./components/AppHeader.vue";
import TrackerSection from "./components/TrackerSection.vue";
import SettingsPanel from "./components/SettingsPanel.vue";
import UpdateNotification from "./components/UpdateNotification.vue";

const showSettings = ref(false);
const appVersion = import.meta.env.PACKAGE_VERSION || "0.1.0";
let unlistenShortcut: UnlistenFn | null = null;

const trackers = [
  { id: "quests", title: "QUESTS" },
  { id: "hideout", title: "HIDEOUT" },
  { id: "blueprints", title: "BLUEPRINTS" },
  { id: "items", title: "ITEM LIST" },
];

const toggleWindowVisibility = async () => {
  const window = getCurrentWindow();
  if ((await window.isVisible())) {
    await window.hide();
  } else {
    await window.show();
    await window.setFocus();
  }
};

onMounted(async () => {
  const appWindow = getCurrentWindow();
  await appWindow.setTitle("Logbook+");

  // Load and initialize the saved hotkey
  const savedHotkey = localStorage.getItem("hotkey") || "F10";
  try {
    await invoke("init_hotkey", { hotkey: savedHotkey });
  } catch (error) {
    console.error("Failed to initialize hotkey:", error);
  }

  // Listen for global shortcut events from Rust backend
  unlistenShortcut = await listen("tauri://global-shortcut", async () => {
    await toggleWindowVisibility();
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
    <UpdateNotification />
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