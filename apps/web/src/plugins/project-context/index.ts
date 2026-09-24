import type { PluginDefinition } from '../types'

export const projectContextPlugin: PluginDefinition = {
  id: 'project-context',
  title: 'Контекст проекта',
  description: 'Краткое описание продукта, стека и полезных ссылок.',
  fields: [
    { id: 'product', label: 'Продукт', type: 'textarea', value: '' },
    { id: 'stack', label: 'Технологический стек', type: 'string-list', value: [], placeholder: 'Добавьте технологию' },
    { id: 'references', label: 'Ссылки проекта', type: 'url-list', value: [], placeholder: 'https://example.com' },
  ],
}
