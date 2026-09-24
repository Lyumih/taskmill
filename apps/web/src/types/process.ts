export type ProcessStage = {
  title: string
  detail: string
  status: 'done' | 'current' | 'pending'
}

export type ProcessBlock = {
  id: string
  pluginId: string
  enabled: boolean
}

export type ProcessDefinition = {
  id: string
  name: string
  summary: string
  taskType: string
  trigger: string
  agent: string
  enabled: boolean
  placeholder: boolean
  stages: ProcessStage[]
  blocks: ProcessBlock[]
}

export type ProcessOverride = Partial<Omit<ProcessDefinition, 'id' | 'stages' | 'blocks'>> & {
  id: ProcessDefinition['id']
  stages?: ProcessStage[]
  blocks?: ProcessBlock[]
}

export type TaskProcessOverride = Partial<Omit<ProcessDefinition, 'id'>>
