/**
 * Blueprint data types - matches Arc Raiders blueprint structure
 */

export interface LocalizedString {
  en: string;
  [key: string]: string;
}

export interface Blueprint {
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

export interface BlueprintTracker {
  blueprintId: string;
  isCollected: boolean;
  collectedAt?: number;
}
