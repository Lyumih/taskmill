import type { PluginDefinition } from '../types'

export const taskTemplatePlugin: PluginDefinition = {
  id: 'task-template',
  title: 'Шаблон задачи',
  description: 'Значения, которые помогают структурировать контекст новой задачи.',
  fields: [
    { id: 'acceptance', label: 'Критерии готовности', type: 'textarea', value: '' },
  ],
}
