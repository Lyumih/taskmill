import type { PluginDefinition } from '../types'

export const taskReferencesPlugin: PluginDefinition = {
  id: 'task-references',
  title: 'Связанные источники задачи',
  description: 'Ссылки на задачи, документацию, репозитории и другие источники.',
  taskFieldSources: { references: 'references' },
  fields: [
    { id: 'references', label: 'Источники', type: 'object-list', value: [], addLabel: 'Добавить источник', fields: [
      { id: 'name', label: 'Название источника', type: 'text', value: '' },
      { id: 'value', label: 'URL или описание', type: 'text', value: '' },
    ] },
  ],
}
