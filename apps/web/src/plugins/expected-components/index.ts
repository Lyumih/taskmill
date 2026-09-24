import type { PluginDefinition } from '../types'

export const expectedComponentsPlugin: PluginDefinition = {
  id: 'expected-components',
  title: 'Ожидаемые компоненты',
  description: 'Оценка объёма, структуры файлов и необходимых библиотечных и кастомных компонентов.',
  category: 'planning',
  taskSource: 'expectedComponents',
  fields: [
    { id: 'confidence', label: 'Уверенность', type: 'choice', value: null, options: [
      { value: 'low', label: 'Низкая' }, { value: 'medium', label: 'Средняя' }, { value: 'high', label: 'Высокая' },
    ] },
    { id: 'basis', label: 'Основание оценки', type: 'textarea', value: '' },
    { id: 'files', label: 'Диапазон файлов', type: 'object', value: {}, fields: [
      { id: 'min', label: 'Минимум', type: 'number', value: null, min: 0, unit: 'файлов' },
      { id: 'max', label: 'Максимум', type: 'number', value: null, min: 0, unit: 'файлов' },
    ] },
    { id: 'fileStructure', label: 'Структура файлов', type: 'object-list', value: [], addLabel: 'Добавить файл', fields: [
      { id: 'path', label: 'Путь', type: 'text', value: '' },
      { id: 'change', label: 'Изменение', type: 'choice', value: 'new', options: [
        { value: 'new', label: 'Создать' }, { value: 'modify', label: 'Изменить' },
      ] },
      { id: 'purpose', label: 'Назначение', type: 'textarea', value: '' },
    ] },
    { id: 'libraryComponents', label: 'Компоненты библиотек', type: 'object-list', value: [], addLabel: 'Добавить библиотечный компонент', fields: [
      { id: 'name', label: 'Название', type: 'text', value: '' },
      { id: 'estimatedInstances', label: 'Использований', type: 'number', value: 1, min: 0 },
      { id: 'purpose', label: 'Назначение', type: 'textarea', value: '' },
      { id: 'documentationUrl', label: 'Документация URL', type: 'url', value: '' },
      { id: 'apiAvailability', label: 'Доступность API', type: 'choice', value: 'needsVerification', options: [
        { value: 'available', label: 'Доступен' }, { value: 'needsVerification', label: 'Проверить' }, { value: 'unavailable', label: 'Недоступен' },
      ] },
      { id: 'apiEvidence', label: 'Подтверждение API', type: 'textarea', value: '' },
    ] },
    { id: 'customComponents', label: 'Кастомные компоненты', type: 'object-list', value: [], addLabel: 'Добавить кастомный компонент', fields: [
      { id: 'name', label: 'Название', type: 'text', value: '' },
      { id: 'purpose', label: 'Назначение', type: 'textarea', value: '' },
      { id: 'placement', label: 'Размещение', type: 'choice', value: 'module', options: [
        { value: 'module', label: 'В модуле' }, { value: 'shared-library', label: 'В общей библиотеке' },
      ] },
      { id: 'placementReason', label: 'Почему здесь', type: 'textarea', value: '' },
    ] },
  ],
}
