/**
 * Utility for managing localStorage persistence
 */

const STORAGE_PREFIX = "logbook_";

export function createStorageKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

export function saveToStorage<T>(key: string, data: T): void {
  try {
    const storageKey = createStorageKey(key);
    const serialized = JSON.stringify(data);
    localStorage.setItem(storageKey, serialized);
  } catch (error) {
    console.error(`Failed to save to storage (key: ${key}):`, error);
  }
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const storageKey = createStorageKey(key);
    const item = localStorage.getItem(storageKey);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Failed to load from storage (key: ${key}):`, error);
    return defaultValue;
  }
}

export function removeFromStorage(key: string): void {
  try {
    const storageKey = createStorageKey(key);
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error(`Failed to remove from storage (key: ${key}):`, error);
  }
}

/**
 * Serialize a Map to an array of [key, value] pairs for JSON storage
 */
export function serializeMap<K extends string, V>(map: Map<K, V>): Array<[K, V]> {
  return Array.from(map.entries());
}

/**
 * Deserialize an array of [key, value] pairs back into a Map
 */
export function deserializeMap<K extends string, V>(
  data: Array<[K, V]> | undefined
): Map<K, V> {
  return new Map(data || []);
}
