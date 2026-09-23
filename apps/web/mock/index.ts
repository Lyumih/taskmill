import { taskMock as taskmillTask0001 } from './taskmill/0001'
import { taskMock as taskmillTask0002 } from './taskmill/0002'
import { taskMock as exampleTask0001 } from './example/0001'
import type { TaskData } from '../src/types/task'

export type MockProject = {
  id: string
  name: string
  tasks: TaskData[]
}

export const mockProjects: MockProject[] = [
  {
    id: 'taskmill',
    name: 'Taskmill',
    tasks: [taskmillTask0001, taskmillTask0002],
  },
  {
    id: 'example',
    name: 'Example',
    tasks: [exampleTask0001],
  },
]

export async function getTaskMock(projectId: string, taskId: string) {
  const project = mockProjects.find((item) => item.id === projectId)
  const task = project?.tasks.find((item) => item.id === taskId)

  if (!task) {
    throw new Error(`Задача ${taskId} не найдена в проекте ${projectId}`)
  }

  return task
}
