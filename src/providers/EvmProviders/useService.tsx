import EVMAnalyzer from "@/service/evm-analyzer";
import { useEffect, useRef, useState, useCallback } from "react";
import ActionRecorder from "@/store/evm/action-recorder";
import useEVMStore from "@/store/evm";
import { PlaygroundStorage, Project } from './types';
import { toast } from 'sonner';

const PLAYGROUNDS = "evm-lens-playground"

const useService = () => {
  const evmRef = useRef<EVMAnalyzer | null>(null);
  const [isReplayComplete, setIsReplayComplete] = useState(false);
  const [projects, setProjects] = useState<Project[]>([])
  const [activeProject, setActiveProject] = useState<Project>(projects[0])

  const evmStore = useEVMStore();

  const replayActions = useCallback(async (project: string) => {
    try {
      const actionRecorder = ActionRecorder.getInstance(project);
      evmStore.setActionRecorder(actionRecorder)
      const replayableActions = actionRecorder.getReplayableActions();

      if (replayableActions.length === 0) {
        console.log("[EvmProviders] No actions to replay");
        return;
      }

      console.log(
        `[EvmProviders] Replaying ${replayableActions.length} actions...`,
      );

      // Enable replay mode to prevent recording during replay
      actionRecorder.setReplayMode(true);

      try {
        for (let i = 0; i < replayableActions.length; i++) {
          const action = replayableActions[i];

          try {
            console.log(
              `[EvmProviders] Replaying action ${i + 1}/${replayableActions.length}: ${action.type}`,
            );

            // Execute the action
            const result = await action.execute(action.payload, evmStore);

            console.log(
              `[EvmProviders] Successfully replayed action: ${action.type}`,
              result,
            );
          } catch (error) {
            console.error(
              `[EvmProviders] Failed to replay action: ${action.type}`,
              error,
            );
            // Continue with next action even if one fails
          }
        }
      } finally {
        // Always disable replay mode when done
        actionRecorder.setReplayMode(false);
      }

      console.log("[EvmProviders] Action replay completed");
    } catch (error) {
      console.error("[EvmProviders] Failed to replay actions:", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const loadActiveProjects = () => {
    const stored = localStorage.getItem(PLAYGROUNDS);
    if(stored) {
      const playgroundStorage = JSON.parse(stored) as PlaygroundStorage
      setProjects(playgroundStorage.projects)
      setActiveProject(playgroundStorage.lastActive)

      return playgroundStorage.lastActive.id
    }
    return ""
  }

  const switchProject = (project: string) => {
    const selectedProject = projects.find(p => p.id === project)
    if(selectedProject) {
      const lastActive = selectedProject
      const playground: PlaygroundStorage = {
        lastActive,
        projects
      }

      localStorage.setItem(PLAYGROUNDS, JSON.stringify(playground))
      window.location.href = "/"
    } else {
      toast.error("no project found")
    }
  }

  /**
   * Will create new project
   * @param projectName string
   */
  const createNewProject = (projectName: string) => {
    const project: Project = {
      createdAt: new Date().toISOString(),
      id: crypto.randomUUID(),
      name: projectName
    }

    const newProjects = [...projects, project]
    const playground: PlaygroundStorage = {
      lastActive: activeProject,
      projects: newProjects
    }
    setProjects(newProjects)
    localStorage.setItem(PLAYGROUNDS, JSON.stringify(playground))

  }

  useEffect(() => {
    (async () => {
      const evm = await EVMAnalyzer.create();
      evmRef.current = evm;

      // Initialize EVM in store
      await evmStore.initializeEVM();

      const activeProject = loadActiveProjects()
      // Replay actions if any exist
      await replayActions(activeProject);
      setIsReplayComplete(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    // EVM basics
    evm: evmRef.current,
    isReplayComplete,
    replayActions,
    projects,
    switchProject,
    createNewProject
  };
};

export default useService;
