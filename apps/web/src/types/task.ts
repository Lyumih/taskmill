export interface Task {
  id: string
  title: string
  type: string
  status: string
  priority: string
  project: {
    name: string
    repository: string
    branch: string
    rootPath: string
  }
  description: string
  startedAt: string
  expiresAt: string
  lastActivityAt: string
  plan: {
    progress: number
    summary: string
    steps: Array<{
      title: string
      detail: string
      actions?: string[]
      expectedResult?: string
      verification?: string
      status: 'done' | 'inProgress' | 'pending'
    }>
  }
  workflow: {
    name: string
    currentStep: number
    totalSteps: number
    questions: Array<{
      question: string
      answer: string
      status: 'answered' | 'current'
    }>
  }
  references: Array<{
    name: string
    value: string
  }>
  changes: {
    filesAdded: number
    filesChanged: number
    componentsAdded: number
    stylesAdded: number
    files: Array<{
      path: string
      change: string
    }>
  }
  estimates: {
    jiraHours: number
    aiHours: number
    aiRange: string
    spentHours: number
  }
  agents: Array<{
    name: string
    role: string
    status: string
    result: string
  }>
  feedback: {
    summary: string
    items: string[]
  }
}

export type DeepPartial<T> = T extends readonly (infer Item)[]
  ? DeepPartial<Item>[]
  : T extends object
    ? { [Key in keyof T]?: DeepPartial<T[Key]> }
    : T

export type TaskData = DeepPartial<Task>
