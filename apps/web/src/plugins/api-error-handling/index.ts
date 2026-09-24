import type { PluginDefinition } from '../types'

const errorPresentations = [
  { value: 'inline', label: 'В блоке запроса' },
  { value: 'global-banner', label: 'Глобальный баннер' },
  { value: 'toast', label: 'Уведомление' },
  { value: 'custom', label: 'Кастомная обработка' },
  { value: 'hidden', label: 'Не показывать' },
]

export const apiErrorHandlingPlugin: PluginDefinition = {
  id: 'api-error-handling',
  title: 'API-запросы и обработка ошибок',
  description: 'Запросы, состояния загрузки и сценарии ошибок.',
  taskFieldSources: { requests: 'apiRequests' },
  fields: [
    { id: 'requests', label: 'API-запросы', type: 'object-list', value: [], addLabel: 'Добавить API-запрос', fields: [
      { id: 'name', label: 'Название', type: 'text', value: '' },
      { id: 'method', label: 'HTTP-метод', type: 'choice', value: 'GET', options: [
        { value: 'GET', label: 'GET' }, { value: 'POST', label: 'POST' }, { value: 'PUT', label: 'PUT' }, { value: 'PATCH', label: 'PATCH' }, { value: 'DELETE', label: 'DELETE' },
      ] },
      { id: 'endpoint', label: 'Endpoint', type: 'text', value: '' },
      { id: 'purpose', label: 'Назначение', type: 'textarea', value: '' },
      { id: 'statuses', label: 'Состояния запроса', type: 'object', value: {}, fields: [
        { id: 'init', label: 'Начальное состояние', type: 'object', value: {}, fields: [
          { id: 'presentation', label: 'Отображение', type: 'choice', value: 'none', options: [
            { value: 'none', label: 'Не показывать' }, { value: 'empty', label: 'Пустое состояние' }, { value: 'skeleton', label: 'Skeleton' },
          ] },
          { id: 'description', label: 'Описание', type: 'textarea', value: '' },
        ] },
        { id: 'pending', label: 'Загрузка', type: 'object', value: {}, fields: [
          { id: 'presentation', label: 'Отображение', type: 'choice', value: 'inline', options: [
            { value: 'spinner', label: 'Индикатор' }, { value: 'skeleton', label: 'Skeleton' }, { value: 'inline', label: 'Встроенный индикатор' },
          ] },
          { id: 'description', label: 'Описание', type: 'textarea', value: '' },
        ] },
        { id: 'data', label: 'Успешный ответ', type: 'object', value: {}, fields: [
          { id: 'presentation', label: 'Отображение', type: 'choice', value: 'content', options: [
            { value: 'content', label: 'Показать данные' }, { value: 'empty-state', label: 'Пустое состояние' },
          ] },
          { id: 'description', label: 'Описание', type: 'textarea', value: '' },
        ] },
        { id: 'error', label: 'Обработка ошибок', type: 'object', value: {}, fields: [
          { id: 'scenarios', label: 'Сценарии ошибок', type: 'object-list', value: [], addLabel: 'Добавить сценарий', fields: [
            { id: 'kind', label: 'Тип', type: 'text', value: '' },
            { id: 'visible', label: 'Показывать', type: 'boolean', value: true },
            { id: 'scope', label: 'Область', type: 'choice', value: 'local', options: [
              { value: 'local', label: 'Локальная' }, { value: 'global', label: 'Глобальная' },
            ] },
            { id: 'presentation', label: 'Отображение', type: 'choice', value: 'inline', options: errorPresentations },
            { id: 'userMessage', label: 'Сообщение пользователю', type: 'textarea', value: '' },
            { id: 'retryable', label: 'Можно повторить запрос', type: 'boolean', value: false },
            { id: 'customBehavior', label: 'Особое поведение', type: 'textarea', value: '' },
          ] },
        ] },
      ] },
    ] },
  ],
}
