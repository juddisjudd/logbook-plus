import { ref, watch } from "vue";
import { loadFromStorage, saveToStorage } from "../utils/storage";

const opacity = ref<number>(1);

export function useOpacity() {
  // Load opacity from storage on first use
  const savedOpacity = loadFromStorage<number>("app_opacity", 1);
  opacity.value = savedOpacity;

  // Auto-save opacity changes
  watch(opacity, (newOpacity) => {
    saveToStorage("app_opacity", newOpacity);
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
