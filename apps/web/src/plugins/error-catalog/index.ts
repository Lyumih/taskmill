import type { PluginDefinition, PluginError } from '../types'

export const errorCatalogPlugin: PluginDefinition = {
  id: 'error-catalog',
  title: 'Ошибки и замечания',
  description: 'Типизированные записи для классификации ошибок проекта.',
  fields: [
    {
      id: 'errors',
      label: 'Список ошибок',
      type: 'errors',
      value: [],
      options: [
        { value: 'major', label: 'Большая ошибка' },
        { value: 'minor', label: 'Маленькая ошибка' },
        { value: 'section', label: 'Ошибка секции' },
        { value: 'other', label: 'Другое' },
      ],
    },
  ],
  validate(values) {
    const errors = values.errors
    if (!Array.isArray(errors) || !errors.every((error): error is PluginError =>
      typeof error === 'object' && error !== null && 'description' in error && 'type' in error && 'customType' in error,
    )) return []

    return errors.flatMap((error, index) => [
      ...(error.type === 'other' && !error.customType.trim() ? [`Укажите тип для ошибки ${index + 1}.`] : []),
      ...(!error.description.trim() ? [`Добавьте описание ошибки ${index + 1}.`] : []),
    ])
  },
}
