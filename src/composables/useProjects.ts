import { ref } from "vue";
import type { Project, ProjectProgress } from "../types/project";
import projectsData from "../data/projects.json";

export function useProjects() {
  const projects = ref<Map<string, Project>>(new Map());
  const projectProgress = ref<Map<string, ProjectProgress>>(new Map());

  // Load all projects from JSON
  const loadProjects = () => {
    const projectMap = new Map<string, Project>();

    try {
      (projectsData as Project[]).forEach((project) => {
        if (project && project.id) {
          projectMap.set(project.id, project);
          // Initialize progress tracking
          if (!projectProgress.value.has(project.id)) {
            projectProgress.value.set(project.id, {
              projectId: project.id,
              completedPhases: 0,
            });
          }
        }
      });
      console.log(`Loaded ${projectMap.size} projects`);
    } catch (error) {
      console.error("Error loading projects:", error);
    }

    projects.value = projectMap;
  };

  // Get project by ID
  const getProject = (projectId: string) => {
    return projects.value.get(projectId);
  };

  // Get all projects as array
  const getAllProjects = () => {
    return Array.from(projects.value.values());
  };

  // Get project progress
  const getProjectProgress = (projectId: string) => {
    return projectProgress.value.get(projectId) || {
      projectId,
      completedPhases: 0,
    };
  };

  // Update project progress (set completed phases)
  const updateProjectProgress = (projectId: string, completedPhases: number) => {
    const project = getProject(projectId);
    if (!project) return;

    const maxPhases = project.phases.length;
    const clampedPhases = Math.max(0, Math.min(completedPhases, maxPhases));

    projectProgress.value.set(projectId, {
      projectId,
      completedPhases: clampedPhases,
    });
  };

  // Complete next phase
  const completeNextPhase = (projectId: string) => {
    const progress = getProjectProgress(projectId);
    const project = getProject(projectId);
    if (!project) return;

    const maxPhases = project.phases.length;
    if (progress.completedPhases < maxPhases) {
      updateProjectProgress(projectId, progress.completedPhases + 1);
    }
  };

  // Revert to previous phase
  const revertPhase = (projectId: string) => {
    const progress = getProjectProgress(projectId);
    if (progress.completedPhases > 0) {
      updateProjectProgress(projectId, progress.completedPhases - 1);
    }
  };

  // Get completion percentage
  const getProjectCompletion = (projectId: string) => {
    const project = getProject(projectId);
    const progress = getProjectProgress(projectId);
    if (!project || project.phases.length === 0) return 0;
    return Math.round((progress.completedPhases / project.phases.length) * 100);
  };

  // Initialize on first use
  loadProjects();

  return {
    projects,
    projectProgress,
    loadProjects,
    getProject,
    getAllProjects,
    getProjectProgress,
    updateProjectProgress,
    completeNextPhase,
    revertPhase,
    getProjectCompletion,
  };
}
