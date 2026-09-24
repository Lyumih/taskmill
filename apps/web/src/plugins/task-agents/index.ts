import type { PluginDefinition } from '../types'

export const taskAgentsPlugin: PluginDefinition = {
  id: 'task-agents',
  title: 'Агенты задачи',
  description: 'Назначенные агенты, роли, статусы и результаты.',
  taskFieldSources: { agents: 'agents' },
  fields: [
    { id: 'agents', label: 'Агенты', type: 'object-list', value: [], addLabel: 'Добавить агента', fields: [
      { id: 'name', label: 'Имя агента', type: 'text', value: '' },
      { id: 'role', label: 'Роль', type: 'text', value: '' },
      { id: 'status', label: 'Статус', type: 'choice', value: 'Ожидает', options: [
        { value: 'Ожидает', label: 'Ожидает' }, { value: 'В работе', label: 'В работе' }, { value: 'Завершён', label: 'Завершён' },
      ] },
      { id: 'result', label: 'Результат', type: 'textarea', value: '' },
    ] },
  ],
}
