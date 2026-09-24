import type { PluginDefinition } from '../types'

export const branchChangesPlugin: PluginDefinition = {
  id: 'branch-changes',
  title: 'Изменения в ветке',
  description: 'Счётчики и список изменённых файлов.',
  taskSource: 'changes',
  fields: [
    { id: 'filesAdded', label: 'Добавлено файлов', type: 'number', value: 0, min: 0 },
    { id: 'filesChanged', label: 'Изменено файлов', type: 'number', value: 0, min: 0 },
    { id: 'componentsAdded', label: 'Добавлено компонентов', type: 'number', value: 0, min: 0 },
    { id: 'stylesAdded', label: 'Добавлено стилей', type: 'number', value: 0, min: 0 },
    { id: 'files', label: 'Файлы', type: 'object-list', value: [], addLabel: 'Добавить файл', fields: [
      { id: 'path', label: 'Путь', type: 'text', value: '' },
      { id: 'change', label: 'Описание изменения', type: 'textarea', value: '' },
    ] },
  ],
}
