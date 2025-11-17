<script setup lang="ts">
import { ref, onMounted } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { useOpacity } from "../composables/useOpacity";

const hotkeyDisplay = ref("");
const hotkeyStatus = ref("");
const isCapturing = ref(false);
const isSaving = ref(false);
let capturedHotkey = "";

const { opacity } = useOpacity();

const isCheckingForUpdates = ref(false);
const updateStatus = ref("");

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

  // Add modifier keys
  if (event.ctrlKey) keys.push("ctrl");
  if (event.altKey) keys.push("alt");
  if (event.shiftKey) keys.push("shift");

  // Get the main key
  let mainKey = "";

  // Handle F-keys (F1-F24)
  if (event.code.startsWith("F")) {
    mainKey = event.code.toLowerCase(); // "F10" -> "f10"
  }
  // Handle number keys from top row (handle Digit prefix)
  else if (event.code.startsWith("Digit")) {
    mainKey = event.code.replace("Digit", "").toLowerCase();
  }
  // Handle letter keys (handle Key prefix)
  else if (event.code.startsWith("Key")) {
    mainKey = event.code.replace("Key", "").toLowerCase();
  }
  // Handle special keys
  else if (event.code === "Enter") {
    mainKey = "enter";
  } else if (event.code === "Space") {
    mainKey = "space";
  } else if (event.code === "Tab") {
    mainKey = "tab";
  } else if (event.code === "Backspace") {
    mainKey = "backspace";
  } else if (event.code === "Delete") {
    mainKey = "delete";
  } else if (event.code === "Escape") {
    mainKey = "escape";
  }
  // Use event.key as fallback for other keys
  else {
    mainKey = event.key.toLowerCase();
  }

  // Don't capture if only modifier keys were pressed
  if (mainKey && !["control", "alt", "shift", "meta"].includes(mainKey)) {
    keys.push(mainKey);
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
    // Save hotkey preference to backend
    const registerResult = await invoke<{ success: boolean; message: string }>(
      "register_hotkey",
      { hotkey: capturedHotkey }
    );

    if (!registerResult.success) {
      hotkeyStatus.value = registerResult.message || "Failed to save hotkey";
      isSaving.value = false;
      return;
    }

    // Initialize the hotkey immediately (don't wait for restart)
    const initResult = await invoke<{ success: boolean; message: string }>(
      "init_hotkey",
      { hotkey: capturedHotkey }
    );

    if (initResult.success) {
      localStorage.setItem("hotkey", capturedHotkey);
      hotkeyDisplay.value = capturedHotkey;
      hotkeyStatus.value = "Hotkey saved and activated!";
      capturedHotkey = "";
      setTimeout(() => {
        hotkeyStatus.value = "";
      }, 3000);
    } else {
      hotkeyStatus.value = initResult.message || "Failed to activate hotkey";
    }
  } catch (error) {
    console.error("Error setting hotkey:", error);
    hotkeyStatus.value = "Error setting hotkey";
  } finally {
    isSaving.value = false;
  }
};

const resetToDefault = async () => {
  try {
    capturedHotkey = "";
    hotkeyDisplay.value = "F10";
    localStorage.setItem("hotkey", "F10");

    // Register the default hotkey
    const registerResult = await invoke<{ success: boolean; message: string }>(
      "register_hotkey",
      { hotkey: "F10" }
    );

    // Initialize the hotkey immediately
    if (registerResult.success) {
      const initResult = await invoke<{ success: boolean; message: string }>(
        "init_hotkey",
        { hotkey: "F10" }
      );
      hotkeyStatus.value = initResult.success
        ? "Reset to default hotkey (F10). Hotkey activated!"
        : "Reset but failed to activate: " + initResult.message;
    } else {
      hotkeyStatus.value = "Failed to reset: " + registerResult.message;
    }

    setTimeout(() => {
      hotkeyStatus.value = "";
    }, 3000);
  } catch (error) {
    console.error("Error resetting hotkey:", error);
    hotkeyStatus.value = "Error resetting hotkey";
  }
};

const checkForUpdates = async () => {
  updateStatus.value = "Update functionality is currently disabled. Redownload the installer to get the latest version.";
  setTimeout(() => {
    updateStatus.value = "";
  }, 5000);
};

const installUpdate = async () => {
  // Update functionality disabled - see checkForUpdates() above
};

const openKoFi = async () => {
  try {
    const { openUrl } = await import("@tauri-apps/plugin-opener");
    await openUrl("https://ko-fi.com/ohitsjudd");
  } catch (error) {
    console.error("Error opening Ko-fi link:", error);
  }
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

        <div class="setting-item">
          <label class="setting-label">App Opacity</label>
          <div class="opacity-control">
            <input
              v-model.number="opacity"
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              class="opacity-slider"
            />
            <div class="opacity-value">{{ Math.round(opacity * 100) }}%</div>
          </div>
          <p class="setting-hint">
            Adjust the transparency of the entire application window.
          </p>
        </div>

        <div class="setting-item">
          <label class="setting-label">Updates</label>
          <div class="update-control">
            <button
              class="check-update-btn"
              :disabled="isCheckingForUpdates"
              @click="checkForUpdates"
            >
              {{ isCheckingForUpdates ? "Checking..." : "Check for Updates" }}
            </button>
            <button
              v-if="updateStatus.includes('Update available')"
              class="install-update-btn"
              @click="installUpdate"
            >
              Install Update
            </button>
          </div>
          <p v-if="updateStatus" class="setting-hint" :class="{ 'update-available': updateStatus.includes('available') }">
            {{ updateStatus }}
          </p>
        </div>

        <div class="setting-item">
          <label class="setting-label">Support</label>
          <button
            class="support-button"
            @click="openKoFi"
          >
            ❤️ Support this Project
          </button>
          <p class="setting-hint">
            If you enjoy using Logbook+, consider supporting the project on Ko-fi!
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

.opacity-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.opacity-slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

.opacity-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--color-accent);
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.opacity-slider::-webkit-slider-thumb:hover {
  background: var(--color-accent-dark);
}

.opacity-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--color-accent);
  cursor: pointer;
  border: none;
  transition: background 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.opacity-slider::-moz-range-thumb:hover {
  background: var(--color-accent-dark);
}

.opacity-slider::-moz-range-track {
  background: transparent;
  border: none;
}

.opacity-slider::-moz-range-progress {
  background: var(--color-accent);
  border-radius: 3px;
  height: 6px;
}

.opacity-value {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  font-family: "Barlow", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  min-width: 35px;
  text-align: right;
}

.update-control {
  display: flex;
  gap: 6px;
}

.check-update-btn,
.install-update-btn {
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
  flex: 1;
}

.check-update-btn:hover:not(:disabled) {
  background: var(--color-accent-dark);
}

.check-update-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.install-update-btn {
  background: #4caf50;
}

.install-update-btn:hover {
  background: #45a049;
}

.setting-hint.update-available {
  color: var(--color-accent);
  font-weight: 500;
}

.support-button {
  padding: 8px 12px;
  background: linear-gradient(135deg, #ff6b9d 0%, #ff9a9e 100%);
  color: white;
  border: none;
  border-radius: 2px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: "Barlow", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.support-button:hover {
  background: linear-gradient(135deg, #ff5b8d 0%, #ff8a8e 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 157, 0.3);
}

.support-button:active {
  transform: translateY(0);
}
</style>
