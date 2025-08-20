import { Abi } from '@/service/evm-analyzer/abi/types';
import { Address } from '@/service/evm-analyzer/utils/address';

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Contract Configuration
  contractAddress?: Address;
  constructorBytecode: string;
  abi: Abi;
  ownerAddress?: Address;
  totalSupply: bigint;
  decimals: number;
  
  // EVM State Reference
  evmStateId: string;
}

export interface ProjectState {
  projects: Record<string, Project>;
  currentProjectId: string | null;
  isLoading: boolean;
}

export type CreateProjectPayload = {
  name: string;
  description?: string;
  contractAddress: string;
  constructorBytecode: string;
  abi: Abi;
  ownerAddress: string;
}

export interface ProjectActions {
  // Project Management
  createProject: (config: CreateProjectPayload) => Promise<Project>;
  deleteProject: (projectId: string) => Promise<void>;
  switchProject: (projectId: string) => Promise<void>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
  
  // Project List
  getAllProjects: () => Project[];
  getCurrentProject: () => Project | null;
}
