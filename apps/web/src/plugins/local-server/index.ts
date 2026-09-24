import type { PluginDefinition } from '../types'

export const localServerPlugin: PluginDefinition = {
  id: 'local-server',
  title: 'Локальный сервер',
  description: 'Состояние, назначение и планируемые обязанности локального сервера.',
  projectView: true,
  fields: [
    { id: 'state', label: 'Состояние', type: 'choice', value: 'notImplemented', options: [
      { value: 'notImplemented', label: 'Не реализован' }, { value: 'implemented', label: 'Реализован' },
    ] },
    { id: 'description', label: 'Описание', type: 'textarea', value: '' },
    { id: 'plannedResponsibilities', label: 'Планируемые обязанности', type: 'string-list', value: [], placeholder: 'Добавить обязанность' },
  ],
}
