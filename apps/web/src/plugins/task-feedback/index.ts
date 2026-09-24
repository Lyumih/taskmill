import type { PluginDefinition } from '../types'

export const taskFeedbackPlugin: PluginDefinition = {
  id: 'task-feedback',
  title: 'Обратная связь',
  description: 'Итог и замечания по workflow и работе задачи.',
  taskSource: 'feedback',
  fields: [
    { id: 'summary', label: 'Тема обратной связи', type: 'text', value: '' },
    { id: 'items', label: 'Замечания и предложения', type: 'string-list', value: [], placeholder: 'Добавить замечание' },
  ],
}
