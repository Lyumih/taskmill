import type { PluginDefinition } from '../types'

export const projectTestingPlugin: PluginDefinition = {
  id: 'project-testing',
  title: 'Проверки проекта',
  description: 'Команды и результаты проверок проекта.',
  projectView: true,
  fields: [
    { id: 'checks', label: 'Проверки', type: 'object-list', value: [], addLabel: 'Добавить проверку', fields: [
      { id: 'name', label: 'Название', type: 'text', value: '' },
      { id: 'command', label: 'Команда', type: 'text', value: '' },
      { id: 'state', label: 'Состояние', type: 'choice', value: 'notRun', options: [
        { value: 'passed', label: 'Пройдена' }, { value: 'notConfigured', label: 'Не настроена' }, { value: 'notRun', label: 'Не запускалась' },
      ] },
      { id: 'details', label: 'Детали', type: 'textarea', value: '' },
    ] },
  ],
}
