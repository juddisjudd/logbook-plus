/**
 * Hideout data types - matches Arc Raiders hideout structure
 */

export interface LocalizedString {
  en: string;
  [key: string]: string;
}

export interface RequirementItem {
  itemId: string;
  quantity: number;
}

export interface HideoutLevel {
  level: number;
  requirementItemIds: RequirementItem[];
}

export interface Hideout {
  id: string;
  name: LocalizedString;
  maxLevel: number;
  levels: HideoutLevel[];
}

export interface HideoutTracker {
  hideoutId: string;
  currentLevel: number;
  startedAt?: number;
}
