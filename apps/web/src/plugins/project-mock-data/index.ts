import type { PluginDefinition } from '../types'

export const projectMockDataPlugin: PluginDefinition = {
  id: 'project-mock-data',
  title: 'Моковые данные проекта',
  description: 'Расположение и назначение демонстрационных данных.',
  projectView: true,
  fields: [
    { id: 'directory', label: 'Каталог', type: 'text', value: '' },
    { id: 'note', label: 'Описание', type: 'textarea', value: '' },
  ],
}
