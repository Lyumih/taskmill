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
  expectedComponents: {
    confidence: 'low' | 'medium' | 'high'
    basis: string
    files: {
      min: number
      max: number
    }
    fileStructure: Array<{
      path: string
      change: 'new' | 'modify'
      purpose: string
    }>
    libraryComponents: Array<{
      name: string
      estimatedInstances: number
      purpose: string
      documentationUrl?: string
      apiAvailability: 'available' | 'needsVerification' | 'unavailable'
      apiEvidence: string
    }>
    customComponents: Array<{
      name: string
      purpose: string
      placement: 'module' | 'shared-library'
      placementReason: string
    }>
  }
  apiRequests: Array<{
    name: string
    method: string
    endpoint: string
    purpose: string
    statuses: {
      init: {
        presentation: 'none' | 'empty' | 'skeleton'
        description: string
      }
      pending: {
        presentation: 'spinner' | 'skeleton' | 'inline'
        description: string
      }
      data: {
        presentation: 'content' | 'empty-state'
        description: string
      }
      error: {
        scenarios: Array<{
          kind: string
          visible: boolean
          scope: 'global' | 'local'
          presentation: 'inline' | 'global-banner' | 'toast' | 'custom' | 'hidden'
          userMessage?: string
          retryable?: boolean
          customBehavior?: string
        }>
      }
    }
  }>
  permissionsFlags: {
    featureFlags: Array<{
      key: string
      controlsBlock: string
      whenEnabled: string
      whenDisabled: string
    }>
    permissions: Array<{
      key: string
      controlsBlock: string
      whenGranted: string
      whenDenied: string
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
