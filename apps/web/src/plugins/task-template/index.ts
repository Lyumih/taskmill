import type { PluginDefinition } from '../types'

export const taskTemplatePlugin: PluginDefinition = {
  id: 'task-template',
  title: 'Шаблон задачи',
  description: 'Значения, которые помогают структурировать контекст новой задачи.',
  category: 'context',
  fields: [
    { id: 'acceptance', label: 'Критерии готовности', type: 'textarea', value: '' },
  ],
}
