import { getPluginDefinition } from './index'
import type { PluginField, PluginFieldValue, PluginRecord, PluginValues } from './types'
import type { ProcessDefinition } from '../types/process'
import type { TaskData, TaskMockSeed } from '../types/task'

function normalizeFieldValue(field: PluginField, source: unknown, rowId: string): PluginFieldValue | undefined {
  if (source === undefined) return undefined

  if (field.type === 'object' && typeof source === 'object' && source !== null && !Array.isArray(source)) {
    return normalizeRecord(field.fields, source as Record<string, unknown>, rowId)
  }

  if (field.type === 'object-list' && Array.isArray(source)) {
    return source.map((item, index) => normalizeRecord(field.fields, item as Record<string, unknown>, `${rowId}-${index + 1}`))
  }

  if (field.type === 'errors' && Array.isArray(source)) {
    return source.map((item, index) => ({ id: `${rowId}-${index + 1}`, ...item })) as PluginFieldValue
  }

  return source as PluginFieldValue
}

function normalizeRecord(fields: PluginField[], source: Record<string, unknown>, rowId: string): PluginRecord {
  const record: PluginRecord = { id: typeof source.id === 'string' ? source.id : rowId }

  for (const field of fields) {
    const value = normalizeFieldValue(field, source[field.id], `${rowId}-${field.id}`)
    if (value !== undefined) record[field.id] = value
  }

  return record
}

export function migrateLegacyTask(task: TaskMockSeed, processes: ProcessDefinition[]): TaskData {
  const {
    startedAt: _startedAt,
    expiresAt: _expiresAt,
    lastActivityAt: _lastActivityAt,
    plan: _plan,
    expectedComponents: _expectedComponents,
    apiRequests: _apiRequests,
    permissionsFlags: _permissionsFlags,
    workflow: _workflow,
    references: _references,
    changes: _changes,
    estimates: _estimates,
    agents: _agents,
    feedback: _feedback,
    ...taskFields
  } = task
  const process = processes.find((item) => item.id === task.processId)
  if (!process || !task.processId) return taskFields

  const legacyTask = task as unknown as Record<string, unknown>
  const pluginData = { ...task.pluginData }
  const processValues = { ...pluginData[process.id] }

  for (const block of process.blocks) {
    const plugin = getPluginDefinition(block.pluginId)
    if (!plugin || (!plugin.taskSource && !plugin.taskFieldSources)) continue

    const sourceObject = plugin.taskSource ? legacyTask[plugin.taskSource] : undefined
    const values: PluginValues = {}

    for (const field of plugin.fields) {
      const sourceKey = plugin.taskFieldSources?.[field.id] ?? (plugin.taskSource ? field.id : undefined)
      if (!sourceKey) continue
      const source = plugin.taskFieldSources?.[field.id]
        ? legacyTask[sourceKey]
        : typeof sourceObject === 'object' && sourceObject !== null
          ? (sourceObject as Record<string, unknown>)[sourceKey]
          : undefined
      const value = normalizeFieldValue(field, source, `${task.id}-${plugin.id}-${field.id}`)
      if (value !== undefined) values[field.id] = value
    }

    if (Object.keys(values).length) {
      processValues[block.id] = { ...values, ...processValues[block.id] }
    }
  }

  return {
    ...taskFields,
    pluginData: { ...pluginData, [process.id]: processValues },
  }
}
