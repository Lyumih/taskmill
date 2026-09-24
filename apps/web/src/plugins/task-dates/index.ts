import type { PluginDefinition } from '../types'

export const taskDatesPlugin: PluginDefinition = {
  id: 'task-dates',
  title: 'Сроки задачи',
  description: 'Дата начала, плановый пересмотр и последняя активность.',
  category: 'delivery',
  taskFieldSources: {
    startedAt: 'startedAt',
    expiresAt: 'expiresAt',
    lastActivityAt: 'lastActivityAt',
  },
  fields: [
    { id: 'startedAt', label: 'Начало', type: 'date', value: null },
    { id: 'expiresAt', label: 'Пересмотреть после', type: 'date', value: null },
    { id: 'lastActivityAt', label: 'Последняя активность', type: 'date', value: null },
  ],
}
