<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { invoke } from "@tauri-apps/api/core";

const showUpdate = ref(false);
const isInstalling = ref(false);
const checkIntervalId = ref<number | null>(null);

const checkForUpdates = async () => {
  // Updater plugin has been disabled - updates will be available in a future release
  // when code signing is properly configured
  showUpdate.value = false;
};

const installUpdate = async () => {
  try {
    isInstalling.value = true;
    await invoke("install_update");
    // App will restart automatically
  } catch (error) {
    console.error("Failed to install update:", error);
    isInstalling.value = false;
  }
};

const dismissUpdate = () => {
  showUpdate.value = false;
};

onMounted(() => {
  // Check for updates on app startup
  checkForUpdates();

  // Check for updates every hour
  checkIntervalId.value = window.setInterval(() => {
    checkForUpdates();
  }, 3600000); // 1 hour in milliseconds
});

onUnmounted(() => {
  if (checkIntervalId.value !== null) {
    clearInterval(checkIntervalId.value);
  }
});
</script>

<template>
  <div v-if="showUpdate" class="update-notification">
    <div class="update-content">
      <div class="update-message">
        <span class="update-icon">⬇</span>
        <span class="update-text">A new version is available</span>
      </div>
      <div class="update-actions">
        <button
          class="update-btn install"
          @click="installUpdate"
          :disabled="isInstalling"
        >
          {{ isInstalling ? "Installing..." : "Update Now" }}
        </button>
        <button
          class="update-btn dismiss"
          @click="dismissUpdate"
          :disabled="isInstalling"
        >
          Dismiss
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.update-notification {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--color-accent);
  border-bottom: 2px solid var(--color-accent-dark);
  z-index: 9999;
  padding: 12px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.update-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  max-width: 100%;
}

.update-message {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-bg-primary);
  font-weight: 600;
  font-size: 14px;
}

.update-icon {
  font-size: 18px;
  display: inline-block;
}

.update-text {
  flex-shrink: 0;
}

.update-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.update-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.update-btn.install {
  background: var(--color-bg-primary);
  color: var(--color-accent);
}

.update-btn.install:hover:not(:disabled) {
  background: var(--color-bg-secondary);
  transform: translateY(-1px);
}

.update-btn.dismiss {
  background: rgba(15, 21, 38, 0.3);
  color: var(--color-bg-primary);
}

.update-btn.dismiss:hover:not(:disabled) {
  background: rgba(15, 21, 38, 0.5);
}

.update-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
