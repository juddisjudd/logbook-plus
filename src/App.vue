<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
import { useOpacity } from "./composables/useOpacity";
import AppHeader from "./components/AppHeader.vue";
import TrackerSection from "./components/TrackerSection.vue";
import SettingsPanel from "./components/SettingsPanel.vue";
import Cheatsheet from "./components/Cheatsheet.vue";
import AppFooter from "./components/AppFooter.vue";
import UpdateNotification from "./components/UpdateNotification.vue";

const showSettings = ref(false);
const showCheatsheet = ref(false);
const appVersion = import.meta.env.PACKAGE_VERSION || "0.1.0";
const expandedSectionId = ref<string | null>(null);

// Initialize opacity on mount
useOpacity();

const trackers = [
  { id: "loot-focuser", title: "LOOT FOCUSER" },
  { id: "quests", title: "QUESTS" },
  { id: "hideout", title: "HIDEOUT" },
  { id: "projects", title: "PROJECTS" },
  { id: "blueprints", title: "BLUEPRINTS" },
  { id: "items", title: "ITEM LIST" },
];

onMounted(async () => {
  const appWindow = getCurrentWindow();
  await appWindow.setTitle("Logbook+");

  // Load and initialize the saved hotkey
  const savedHotkey = localStorage.getItem("hotkey") || "F10";
  try {
    await invoke("init_hotkey", { hotkey: savedHotkey });
    console.log(`Hotkey '${savedHotkey}' initialized successfully`);
  } catch (error) {
    console.error(`Failed to initialize hotkey '${savedHotkey}':`, error);
  }
});

const handleClose = async () => {
  const appWindow = getCurrentWindow();
  await appWindow.close();
};

const handleSettingsToggle = () => {
  showSettings.value = !showSettings.value;
  showCheatsheet.value = false;
};

const handleCheatsheetToggle = () => {
  showCheatsheet.value = !showCheatsheet.value;
  showSettings.value = false;
};

const handleSectionToggle = (sectionId: string) => {
  if (expandedSectionId.value === sectionId) {
    // Toggle off if same section clicked
    expandedSectionId.value = null;
  } else {
    // Expand new section and collapse others
    expandedSectionId.value = sectionId;
  }
};
</script>

<template>
  <div class="app-root">
    <UpdateNotification />
    <AppHeader
      :version="appVersion"
      @close="handleClose"
      @settings="handleSettingsToggle"
      @cheatsheet="handleCheatsheetToggle"
    />

    <div class="content-container">
      <SettingsPanel v-if="showSettings" />
      <Cheatsheet v-else-if="showCheatsheet" />
      <div v-else class="trackers-container">
        <TrackerSection
          v-for="tracker in trackers"
          :key="tracker.id"
          :id="tracker.id"
          :title="tracker.title"
          :is-expanded="expandedSectionId === tracker.id"
          @toggle="handleSectionToggle(tracker.id)"
        />
      </div>
    </div>

    <AppFooter />
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