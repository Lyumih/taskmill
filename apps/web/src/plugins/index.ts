import { developmentRulesPlugin } from './development-rules'
import { errorCatalogPlugin } from './error-catalog'
import { projectContextPlugin } from './project-context'
import { taskTemplatePlugin } from './task-template'
import type { PluginValues } from './types'

export { developmentRulesPlugin, errorCatalogPlugin, projectContextPlugin, taskTemplatePlugin }
export type { PluginDefinition, PluginError, PluginField, PluginFieldValue, PluginValues } from './types'

export const pluginDefinitions = [
  projectContextPlugin,
  developmentRulesPlugin,
  taskTemplatePlugin,
  errorCatalogPlugin,
]

export function getPluginDefinition(pluginId: string) {
  return pluginDefinitions.find((plugin) => plugin.id === pluginId)
}

export function getPluginDefaultValues(pluginId: string): PluginValues {
  const plugin = getPluginDefinition(pluginId)
  if (!plugin) return {}

  return Object.fromEntries(plugin.fields.map((field) => [field.id, JSON.parse(JSON.stringify(field.value))]))
}

export function mergePluginValues(base: PluginValues, overrides?: Partial<PluginValues>): PluginValues {
  return {
    ...base,
    ...Object.fromEntries(Object.entries(overrides ?? {}).filter(([, value]) => value !== undefined)) as PluginValues,
  }
}
