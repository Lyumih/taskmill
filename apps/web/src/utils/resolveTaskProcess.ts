import type { ProcessDefinition, TaskProcessOverride } from '../types/process'
import type { Project } from '../types/project'
import type { TaskData } from '../types/task'

export function resolveTaskProcess(project: Project, task: TaskData): ProcessDefinition | undefined {
  const projectProcess = project.processes.find((process) => process.id === task.processId)
  if (!projectProcess) return undefined

  const override = task.processOverride as TaskProcessOverride | undefined
  if (!override) return projectProcess

  return {
    ...projectProcess,
    ...override,
    stages: override.stages ?? projectProcess.stages,
    blocks: override.blocks ?? projectProcess.blocks,
  }
}
