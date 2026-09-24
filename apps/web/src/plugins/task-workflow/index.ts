import type { PluginDefinition } from '../types'

export const taskWorkflowPlugin: PluginDefinition = {
  id: 'task-workflow',
  title: 'Вопросы workflow',
  description: 'Текущий этап выбранного процесса и вопросы workflow с ответами.',
  category: 'planning',
  taskSource: 'workflow',
  fields: [
    { id: 'currentStep', label: 'Текущий шаг', type: 'number', value: 1, min: 1 },
    { id: 'questions', label: 'Вопросы', type: 'object-list', value: [], addLabel: 'Добавить вопрос', fields: [
      { id: 'question', label: 'Вопрос', type: 'textarea', value: '' },
      { id: 'answer', label: 'Ответ', type: 'textarea', value: '' },
      { id: 'status', label: 'Статус', type: 'choice', value: 'current', options: [
        { value: 'answered', label: 'Отвечен' }, { value: 'current', label: 'Текущий' },
      ] },
    ] },
  ],
}
