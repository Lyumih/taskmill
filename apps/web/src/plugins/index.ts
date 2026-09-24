import { agentPlanPlugin } from './agent-plan'
import { apiErrorHandlingPlugin } from './api-error-handling'
import { branchChangesPlugin } from './branch-changes'
import { developmentRulesPlugin } from './development-rules'
import { errorCatalogPlugin } from './error-catalog'
import { expectedComponentsPlugin } from './expected-components'
import { localServerPlugin } from './local-server'
import { permissionsFlagsPlugin } from './permissions-flags'
import { projectAnalyticsPlugin } from './project-analytics'
import { projectContextPlugin } from './project-context'
import { projectMockDataPlugin } from './project-mock-data'
import { projectTestingPlugin } from './project-testing'
import { taskAgentsPlugin } from './task-agents'
import { taskDatesPlugin } from './task-dates'
import { taskFeedbackPlugin } from './task-feedback'
import { taskReferencesPlugin } from './task-references'
import { taskTemplatePlugin } from './task-template'
import { taskWorkflowPlugin } from './task-workflow'
import { timeEstimatesPlugin } from './time-estimates'
import type { PluginValues } from './types'

export type { PluginDefinition, PluginError, PluginField, PluginFieldValue, PluginRecord, PluginValues } from './types'

export const pluginDefinitions = [
  projectContextPlugin,
  developmentRulesPlugin,
  taskTemplatePlugin,
  errorCatalogPlugin,
  projectAnalyticsPlugin,
  projectTestingPlugin,
  projectMockDataPlugin,
  localServerPlugin,
  agentPlanPlugin,
  expectedComponentsPlugin,
  apiErrorHandlingPlugin,
  permissionsFlagsPlugin,
  taskWorkflowPlugin,
  taskReferencesPlugin,
  branchChangesPlugin,
  timeEstimatesPlugin,
  taskAgentsPlugin,
  taskDatesPlugin,
  taskFeedbackPlugin,
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
