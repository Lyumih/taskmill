import type { PluginValues } from '../plugins/types'
import type { ProcessDefinition } from './process'
import type { TaskData } from './task'

export type ProjectPluginConfig = {
  pluginId: string
  enabled: boolean
  values: PluginValues
  comment: string
}

export type Project = {
  id: string
  name: string
  tasks: TaskData[]
  plugins: ProjectPluginConfig[]
  processes: ProcessDefinition[]
  analytics: {
    provider: 'Matomo'
    state: 'mock' | 'notConnected'
    period?: string
    visits?: number
    note: string
  }
  testing: {
    checks: Array<{
      name: string
      command?: string
      state: 'passed' | 'notConfigured' | 'notRun'
      details: string
    }>
  }
  mockData: {
    directory: string
    note: string
  }
  server: {
    state: 'notImplemented'
    description: string
    plannedResponsibilities: string[]
  }
}
