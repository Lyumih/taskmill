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
}
