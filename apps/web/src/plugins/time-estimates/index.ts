import type { PluginDefinition } from '../types'

export const timeEstimatesPlugin: PluginDefinition = {
  id: 'time-estimates',
  title: 'Оценка времени',
  description: 'Оценка Jira, оценка агента, диапазон и фактически затраченное время.',
  taskSource: 'estimates',
  fields: [
    { id: 'jiraHours', label: 'Оценка Jira', type: 'number', value: null, min: 0, unit: 'ч' },
    { id: 'aiHours', label: 'Оценка агента', type: 'number', value: null, min: 0, unit: 'ч' },
    { id: 'aiRange', label: 'Диапазон оценки агента', type: 'text', value: '' },
    { id: 'spentHours', label: 'Фактически затрачено', type: 'number', value: null, min: 0, unit: 'ч' },
    { id: 'confidenceScore', label: 'Уверенность в оценке', type: 'rating', value: null, max: 5 },
  ],
}
