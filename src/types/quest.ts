/**
 * Quest data types - matches Arc Raiders quest structure
 */

export interface LocalizedString {
  en: string;
  [key: string]: string;
}

export interface RewardItem {
  itemId: string;
  quantity: number;
}

export interface Quest {
  id: string;
  updatedAt: string;
  name: LocalizedString;
  trader: string;
  objectives: LocalizedString[];
  rewardItemIds: RewardItem[];
  xp: number;
  previousQuestIds: string[];
  nextQuestIds: string[];
}

export interface QuestTracker {
  questId: string;
  isCompleted: boolean;
  objectivesCompleted: boolean[];
  startedAt?: number;
  completedAt?: number;
}

export enum QuestLanguage {
  EN = "en",
  DE = "de",
  FR = "fr",
  ES = "es",
  PT = "pt",
  PL = "pl",
  NO = "no",
  DA = "da",
  IT = "it",
  UK = "uk",
  KR = "kr",
  RU = "ru",
  ZH_CN = "zh-CN",
  JA = "ja",
  TR = "tr",
  ZH_TW = "zh-TW",
  SR = "sr",
  HR = "hr",
}
