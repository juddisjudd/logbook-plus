<script setup lang="ts">
import { ref, onMounted } from "vue";
import { invoke } from "@tauri-apps/api/core";

const hotkeyInput = ref("");
const hotkeyStatus = ref("");
const isSaving = ref(false);

onMounted(async () => {
  // Load the current hotkey from localStorage or use default
  const saved = localStorage.getItem("hotkey");
  if (saved) {
    hotkeyInput.value = saved;
  } else {
    hotkeyInput.value = "F10";
  }
});

const saveHotkey = async () => {
  isSaving.value = true;
  hotkeyStatus.value = "";

  try {
    const newHotkey = hotkeyInput.value.trim().toLowerCase();

    if (!newHotkey) {
      hotkeyStatus.value = "Hotkey cannot be empty";
      isSaving.value = false;
      return;
    }

    // Send to backend to register the hotkey
    const result = await invoke<{ success: boolean; message: string }>(
      "register_hotkey",
      { hotkey: newHotkey }
    );

    if (result.success) {
      localStorage.setItem("hotkey", newHotkey);
      hotkeyStatus.value = result.message;
      setTimeout(() => {
        hotkeyStatus.value = "";
      }, 4000);
    } else {
      hotkeyStatus.value = result.message || "Invalid hotkey format";
    }
  } catch (error) {
    console.error("Error setting hotkey:", error);
    hotkeyStatus.value = "Error setting hotkey. Using default: ctrl+shift+l";
  } finally {
    isSaving.value = false;
  }
};

const resetToDefault = () => {
  hotkeyInput.value = "F10";
  localStorage.removeItem("hotkey");
  hotkeyStatus.value = "Reset to default hotkey (F10)";
  setTimeout(() => {
    hotkeyStatus.value = "";
  }, 2000);
};
</script>

<template>
  <div class="settings-panel">
    <div class="settings-content">
      <div class="settings-section">
        <h2 class="settings-title">Settings</h2>

        <div class="setting-item">
          <label for="hotkey-input" class="setting-label">Toggle Hotkey</label>
          <div class="hotkey-input-group">
            <input
              id="hotkey-input"
              v-model="hotkeyInput"
              type="text"
              class="hotkey-input"
              placeholder="e.g., ctrl+shift+l"
              @keyup.enter="saveHotkey"
            />
            <button class="save-button" :disabled="isSaving" @click="saveHotkey">
              {{ isSaving ? "Saving..." : "Save" }}
            </button>
            <button class="reset-button" @click="resetToDefault">
              Reset
            </button>
          </div>
          <p class="setting-hint">
            Use format: ctrl+shift+l, alt+k, etc.
          </p>
          <p v-if="hotkeyStatus" class="status-message" :class="{ error: hotkeyStatus.includes('Error') }">
            {{ hotkeyStatus }}
          </p>
        </div>

        <div class="setting-item">
          <p class="setting-description">
            Press the hotkey to toggle the Logbook+ window visibility.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-bg-primary);
  overflow-y: auto;
}

.settings-content {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  font-family: "Barlow", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: "Barlow", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.hotkey-input-group {
  display: flex;
  gap: 6px;
}

.hotkey-input {
  flex: 1;
  padding: 8px 12px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  font-size: 12px;
  border-radius: 2px;
  font-family: "Barlow", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  transition: border-color 0.2s;
}

.hotkey-input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px rgba(242, 164, 19, 0.1);
}

.save-button,
.reset-button {
  padding: 8px 12px;
  background: var(--color-accent);
  color: var(--color-bg-primary);
  border: none;
  border-radius: 2px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  font-family: "Barlow", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.save-button:hover:not(:disabled) {
  background: var(--color-accent-dark);
}

.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.reset-button {
  background: var(--color-text-secondary);
  color: var(--color-bg-primary);
  font-weight: 500;
}

.reset-button:hover {
  background: var(--color-text-primary);
}

.setting-hint {
  font-size: 10px;
  color: var(--color-text-secondary);
  margin: 0;
}

.setting-description {
  font-size: 11px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
}

.status-message {
  font-size: 11px;
  color: var(--color-accent);
  margin: 0;
  font-weight: 500;
}

.status-message.error {
  color: #ff6b6b;
}
</style>
