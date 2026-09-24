import type { PluginDefinition } from '../types'

export const developmentRulesPlugin: PluginDefinition = {
  id: 'development-rules',
  title: 'Правила разработки',
  description: 'Общие договорённости, которые агент учитывает при изменении кода.',
  projectView: true,
  fields: [
    { id: 'rules', label: 'Правила', type: 'string-list', value: ['Сначала ищи минимальное решение.', 'Не меняй несвязанные файлы.'], placeholder: 'Добавьте правило' },
    { id: 'run-checks', label: 'Запускать релевантные проверки', type: 'boolean', value: true },
  ],
}
