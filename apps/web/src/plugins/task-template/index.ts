import type { PluginDefinition } from '../types'

export const taskTemplatePlugin: PluginDefinition = {
  id: 'task-template',
  title: 'Шаблон задачи',
  description: 'Значения, которые помогают структурировать контекст новой задачи.',
  fields: [
    { id: 'acceptance', label: 'Критерии готовности', type: 'textarea', value: '' },
    { id: 'due-date', label: 'Целевая дата', type: 'date', value: null },
    { id: 'estimate', label: 'Оценка трудоёмкости', type: 'number', value: null, min: 0, unit: 'ч' },
    { id: 'confidence', label: 'Уверенность в оценке', type: 'rating', value: null, max: 5 },
  ],
}
