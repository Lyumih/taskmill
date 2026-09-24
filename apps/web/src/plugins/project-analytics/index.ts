import type { PluginDefinition } from '../types'

export const projectAnalyticsPlugin: PluginDefinition = {
  id: 'project-analytics',
  title: 'Аналитика проекта',
  description: 'Источник, период, метрики и примечание по аналитике.',
  projectView: true,
  fields: [
    { id: 'provider', label: 'Источник', type: 'choice', value: 'Matomo', options: [{ value: 'Matomo', label: 'Matomo' }] },
    { id: 'state', label: 'Подключение', type: 'choice', value: 'notConnected', options: [
      { value: 'mock', label: 'Демо-данные' }, { value: 'notConnected', label: 'Не подключена' },
    ] },
    { id: 'period', label: 'Период', type: 'text', value: '' },
    { id: 'visits', label: 'Визиты', type: 'number', value: null, min: 0 },
    { id: 'note', label: 'Примечание', type: 'textarea', value: '' },
  ],
}
