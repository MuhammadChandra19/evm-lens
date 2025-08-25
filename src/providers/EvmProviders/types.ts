export type PlaygroundStorage = {
  lastActive: Project;
  projects: Project[];
}

export type Project = {
  id: string
  name: string
  createdAt: string
}
