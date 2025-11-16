import { ref, watch } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { loadFromStorage, saveToStorage } from "../utils/storage";

const opacity = ref<number>(1);

export function useOpacity() {
  // Load opacity from storage on first use
  const savedOpacity = loadFromStorage<number>("app_opacity", 1);
  opacity.value = savedOpacity;

  // Apply saved opacity to window
  const applyOpacity = async (value: number) => {
    try {
      await invoke<void>("set_window_opacity", { opacity: value });
      console.log(`Window opacity set to ${Math.round(value * 100)}%`);
    } catch (error) {
      console.error("Failed to set window opacity:", error);
    }
  };

  // Apply initial opacity
  applyOpacity(savedOpacity);

  // Auto-save and apply opacity changes
  watch(opacity, (newOpacity) => {
    saveToStorage("app_opacity", newOpacity);
    applyOpacity(newOpacity);
  });

  const setOpacity = (value: number) => {
    // Clamp value between 0.1 and 1
    opacity.value = Math.max(0.1, Math.min(1, value));
  };

  const getOpacity = (): number => {
    return opacity.value;
  };

  return {
    opacity,
    setOpacity,
    getOpacity,
  };
}
