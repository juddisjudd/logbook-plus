/**
 * Item data types - matches Arc Raiders item structure
 */

export interface LocalizedString {
  en: string;
  [key: string]: string;
}

export interface Effect {
  [key: string]: string | object;
}

export interface Item {
  id: string;
  name: LocalizedString;
  description?: LocalizedString;
  type: string;
  value: number;
  weightKg: number;
  rarity: string;
  stackSize?: number;
  imageFilename: string;
  updatedAt: string;
  effects?: Record<string, Effect | string>;
  recyclesInto?: Record<string, number>;
  foundIn?: string;
}

export interface ItemTracker {
  itemId: string;
  isCollected: boolean;
  collectedAt?: number;
}
