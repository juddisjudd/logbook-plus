<script setup lang="ts">
import { ref, onMounted } from "vue";
import { invoke } from "@tauri-apps/api/core";

const hotkeyDisplay = ref("");
const hotkeyStatus = ref("");
const isCapturing = ref(false);
const isSaving = ref(false);
let capturedHotkey = "";

onMounted(async () => {
  // Load the current hotkey from localStorage or use default
  const saved = localStorage.getItem("hotkey");
  hotkeyDisplay.value = saved || "F10";
});

const startCapture = () => {
  isCapturing.value = true;
  capturedHotkey = "";
  hotkeyStatus.value = "Press any key combination...";
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (!isCapturing.value) return;

  event.preventDefault();
  event.stopPropagation();

  const keys: string[] = [];

  if (event.ctrlKey) keys.push("ctrl");
  if (event.altKey) keys.push("alt");
  if (event.shiftKey) keys.push("shift");

  // Get the key name
  const keyName = event.key.length === 1 ? event.key : event.code;
  const normalizedKey = keyName
    .replace(/Key/, "") // Remove 'Key' prefix (e.g., KeyA -> A)
    .replace(/Digit/, "") // Remove 'Digit' prefix (e.g., Digit0 -> 0)
    .toLowerCase();

  // Don't capture just modifier keys
  if (!["control", "alt", "shift"].includes(normalizedKey)) {
    keys.push(normalizedKey);
  }

  if (keys.length > 0) {
    capturedHotkey = keys.join("+");
    hotkeyStatus.value = `Captured: ${capturedHotkey}. Click Save to confirm.`;
    isCapturing.value = false;
  }
};

const saveHotkey = async () => {
  if (!capturedHotkey) {
    hotkeyStatus.value = "No hotkey captured. Click the input field and press a key.";
    return;
  }

  isSaving.value = true;

  try {
    // Send to backend to register the hotkey
    const result = await invoke<{ success: boolean; message: string }>(
      "register_hotkey",
      { hotkey: capturedHotkey }
    );

    if (result.success) {
      localStorage.setItem("hotkey", capturedHotkey);
      hotkeyDisplay.value = capturedHotkey;
      hotkeyStatus.value = "Hotkey saved! Restart the app to apply changes.";
      capturedHotkey = "";
      setTimeout(() => {
        hotkeyStatus.value = "";
      }, 4000);
    } else {
      hotkeyStatus.value = result.message || "Failed to save hotkey";
    }
  } catch (error) {
    console.error("Error setting hotkey:", error);
    hotkeyStatus.value = "Error setting hotkey";
  } finally {
    isSaving.value = false;
  }
};

const resetToDefault = () => {
  capturedHotkey = "";
  hotkeyDisplay.value = "F10";
  localStorage.setItem("hotkey", "F10");
  hotkeyStatus.value = "Reset to default hotkey (F10). Restart the app to apply.";
  setTimeout(() => {
    hotkeyStatus.value = "";
  }, 3000);
};
</script>

<template>
  <div class="settings-panel">
    <div class="settings-content">
      <div class="settings-section">
        <h2 class="settings-title">Settings</h2>

        <div class="setting-item">
          <label class="setting-label">Toggle Hotkey</label>
          <div class="hotkey-input-group">
            <button
              class="hotkey-capture-btn"
              :class="{ capturing: isCapturing, active: capturedHotkey }"
              @click="startCapture"
              @keydown="handleKeyDown"
            >
              <span v-if="isCapturing" class="capture-label">Press a key...</span>
              <span v-else-if="capturedHotkey" class="hotkey-value">{{ capturedHotkey }}</span>
              <span v-else class="hotkey-value">{{ hotkeyDisplay }}</span>
            </button>
            <button
              class="save-button"
              :disabled="!capturedHotkey || isSaving"
              @click="saveHotkey"
            >
              {{ isSaving ? "Saving..." : "Save" }}
            </button>
            <button class="reset-button" @click="resetToDefault">
              Reset
            </button>
          </div>
          <p class="setting-hint">
            Click the box above and press any key combination to set your hotkey.
          </p>
          <p v-if="hotkeyStatus" class="status-message" :class="{ error: hotkeyStatus.includes('Error') }">
            {{ hotkeyStatus }}
          </p>
        </div>

        <div class="setting-item">
          <p class="setting-description">
            Press the hotkey to toggle the Logbook+ window visibility (minimize to tray).
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

.hotkey-capture-btn {
  flex: 1;
  padding: 8px 12px;
  background: var(--color-bg-secondary);
  border: 2px solid var(--color-border);
  color: var(--color-text-primary);
  font-size: 12px;
  border-radius: 2px;
  font-family: "Barlow", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  min-height: 36px;
  display: flex;
  align-items: center;
}

.hotkey-capture-btn:hover {
  border-color: var(--color-accent);
  background: rgba(242, 164, 19, 0.05);
}

.hotkey-capture-btn.capturing {
  border-color: var(--color-accent);
  background: rgba(242, 164, 19, 0.1);
  animation: pulse 0.6s ease-in-out infinite;
}

.hotkey-capture-btn.active {
  border-color: var(--color-accent);
  color: var(--color-accent);
  font-weight: 600;
}

.hotkey-value {
  font-family: monospace;
  letter-spacing: 0.05em;
}

.capture-label {
  color: var(--color-accent);
  font-weight: 600;
  animation: blink 0.8s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(242, 164, 19, 0.4);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(242, 164, 19, 0);
  }
}

@keyframes blink {
  0%, 49%, 100% {
    opacity: 1;
  }
  50%, 99% {
    opacity: 0.5;
  }
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
