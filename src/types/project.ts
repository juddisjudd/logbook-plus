/**
 * Project data types - matches Arc Raiders project structure
 */

export interface LocalizedString {
  en: string;
  [key: string]: string;
}

export interface RequirementItem {
  itemId: string;
  quantity: number;
}

export interface ProjectPhase {
  phase: number;
  name: LocalizedString;
  description?: LocalizedString;
  requirementItemIds: RequirementItem[];
}

export interface Project {
  id: string;
  name: LocalizedString;
  description?: LocalizedString;
  phases: ProjectPhase[];
}

export interface ProjectProgress {
  projectId: string;
  completedPhases: number;
}
