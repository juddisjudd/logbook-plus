<script setup lang="ts">
import { computed } from "vue";
import SearchInput from "../SearchInput.vue";
import ItemImage from "../ItemImage.vue";
import { useProjects } from "../../composables/useProjects";
import { useItems } from "../../composables/useItems";
import { ref } from "vue";

const { getAllProjects, getProjectProgress, updateProjectProgress, getProjectCompletion } = useProjects();
const { getItem } = useItems();
const searchQuery = ref("");

const getLocalizedText = (localized: Record<string, string>) => {
  return localized.en || Object.values(localized)[0] || "";
};

const projects = computed(() => {
  let filtered = getAllProjects();

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter((project) => {
      const name = getLocalizedText(project.name).toLowerCase();
      return name.includes(query);
    });
  }

  return filtered;
});

const handlePhaseChange = (projectId: string, completedPhases: number) => {
  updateProjectProgress(projectId, completedPhases);
};

const getCurrentPhase = (projectId: string) => {
  const progress = getProjectProgress(projectId);
  return progress.completedPhases;
};

const getMaxPhases = (projectId: string) => {
  const projects = getAllProjects();
  const project = projects.find((p) => p.id === projectId);
  return project ? project.phases.length : 0;
};
</script>

<template>
  <div class="project-tracker">
    <div class="project-controls">
      <SearchInput
        v-model="searchQuery"
        placeholder="Search projects..."
      />
    </div>

    <div v-if="projects.length === 0" class="empty-state">
      <p>No projects available</p>
    </div>

    <div v-else class="project-list">
      <div
        v-for="project in projects"
        :key="project.id"
        class="project-item"
      >
        <div class="project-header">
          <h3 class="project-name">{{ getLocalizedText(project.name) }}</h3>
          <span class="project-progress">
            Phase {{ getCurrentPhase(project.id) }}/{{ getMaxPhases(project.id) }}
          </span>
        </div>

        <div class="project-content">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: getProjectCompletion(project.id) + '%' }"
            />
          </div>

          <div class="phase-controls">
            <button
              class="phase-button reset-button"
              :class="{ active: getCurrentPhase(project.id) === 0 }"
              @click="handlePhaseChange(project.id, 0)"
            >
              0
            </button>
            <button
              v-for="phaseNum in getMaxPhases(project.id)"
              :key="phaseNum"
              class="phase-button"
              :class="{ active: getCurrentPhase(project.id) === phaseNum }"
              @click="handlePhaseChange(project.id, phaseNum)"
            >
              {{ phaseNum }}
            </button>
          </div>

          <div v-if="getCurrentPhase(project.id) < getMaxPhases(project.id)" class="current-phase-details">
            <div class="phase-info">
              <strong class="phase-name">
                {{ getLocalizedText(project.phases[getCurrentPhase(project.id)].name) }}
              </strong>
              <p v-if="project.phases[getCurrentPhase(project.id)].description" class="phase-description">
                {{ getLocalizedText(project.phases[getCurrentPhase(project.id)].description || {}) }}
              </p>
            </div>

            <div v-if="project.phases[getCurrentPhase(project.id)].requirementItemIds.length > 0" class="phase-requirements">
              <strong>Requirements:</strong>
              <div class="requirements-grid">
                <div v-for="(requirement, idx) in project.phases[getCurrentPhase(project.id)].requirementItemIds" :key="idx" class="requirement-item">
                  <ItemImage
                    :item-id="requirement.itemId"
                    :item-name="getItem(requirement.itemId)?.name?.en"
                    size="small"
                    show-label
                  />
                  <span class="requirement-quantity">×{{ requirement.quantity }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="getCurrentPhase(project.id) === getMaxPhases(project.id)" class="completed">
            <p>✓ Project completed</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.project-tracker {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0;
  overflow: hidden;
}

.project-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
  flex-shrink: 0;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  font-size: 12px;
}

.project-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow-y: auto;
}

.project-item {
  border-bottom: 1px solid var(--color-border);
  padding: 12px;
  background: var(--color-bg-primary);
  transition: background 0.2s;
}

.project-item:hover {
  background: var(--color-bg-secondary);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.project-name {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  font-family: "Barlow", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.project-progress {
  font-size: 10px;
  color: var(--color-text-secondary);
  background: var(--color-bg-secondary);
  padding: 2px 6px;
  border-radius: 2px;
}

.project-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.progress-bar {
  height: 6px;
  background: var(--color-bg-secondary);
  border-radius: 2px;
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.progress-fill {
  height: 100%;
  background: var(--color-accent);
  transition: width 0.3s ease;
}

.phase-controls {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.phase-button {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  padding: 4px 8px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.2s;
  min-width: 28px;
  text-align: center;
}

.phase-button:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.phase-button.active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-bg-primary);
  font-weight: 700;
}

.phase-button.reset-button {
  min-width: 32px;
}

.current-phase-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--color-border);
}

.phase-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.phase-name {
  font-size: 11px;
  color: var(--color-accent);
  font-weight: 600;
}

.phase-description {
  font-size: 10px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.3;
}

.phase-requirements {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.phase-requirements strong {
  font-size: 10px;
  color: var(--color-text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.requirements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 6px;
}

.requirement-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  position: relative;
}

.requirement-quantity {
  font-size: 9px;
  color: var(--color-text-secondary);
  background: var(--color-bg-secondary);
  padding: 1px 3px;
  border-radius: 2px;
  min-width: 20px;
  text-align: center;
}

.completed {
  text-align: center;
  padding: 8px;
  background: rgba(114, 190, 86, 0.1);
  border-radius: 2px;
}

.completed p {
  margin: 0;
  font-size: 11px;
  color: var(--color-accent);
  font-weight: 600;
}
</style>
