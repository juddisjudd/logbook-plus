/**
 * Item data types - matches Arc Raiders item structure
 */

export interface LocalizedString {
  en: string;
  [key: string]: string;
}

export interface Item {
  id: string;
  name: LocalizedString;
  description?: LocalizedString;
  type: string;
  value: number;
  weightKg: number;
  rarity: string;
  imageFilename: string;
  updatedAt: string;
}

export interface ItemTracker {
  itemId: string;
  isCollected: boolean;
  collectedAt?: number;
}
