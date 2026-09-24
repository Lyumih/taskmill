import type { PluginDefinition } from '../types'

export const agentPlanPlugin: PluginDefinition = {
  id: 'agent-plan',
  title: 'Подробный пошаговый план агента',
  description: 'Прогресс, этапы, действия, ожидаемые результаты и проверки.',
  taskSource: 'plan',
  fields: [
    { id: 'summary', label: 'Сводка плана', type: 'textarea', value: '' },
    { id: 'progress', label: 'Выполнено', type: 'number', value: 0, min: 0, max: 100, unit: '%' },
    {
      id: 'steps', label: 'Шаги плана', type: 'object-list', value: [], addLabel: 'Добавить шаг', fields: [
        { id: 'title', label: 'Название', type: 'text', value: '' },
        { id: 'detail', label: 'Описание', type: 'textarea', value: '' },
        { id: 'actions', label: 'Действия', type: 'string-list', value: [], placeholder: 'Добавить действие' },
        { id: 'expectedResult', label: 'Ожидаемый результат', type: 'textarea', value: '' },
        { id: 'verification', label: 'Проверка', type: 'textarea', value: '' },
        { id: 'status', label: 'Статус', type: 'choice', value: 'pending', options: [
          { value: 'done', label: 'Готово' }, { value: 'inProgress', label: 'В работе' }, { value: 'pending', label: 'Ожидает' },
        ] },
      ],
    },
  ],
}
