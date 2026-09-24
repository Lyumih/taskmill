import type { PluginDefinition } from '../types'

const ruleFields = [
  { id: 'key', label: 'Ключ', type: 'text' as const, value: '' },
  { id: 'controlsBlock', label: 'Управляемый блок', type: 'text' as const, value: '' },
  { id: 'whenEnabled', label: 'Когда включено', type: 'textarea' as const, value: '' },
  { id: 'whenDisabled', label: 'Когда выключено', type: 'textarea' as const, value: '' },
]

export const permissionsFlagsPlugin: PluginDefinition = {
  id: 'permissions-flags',
  title: 'Permissions и feature flags',
  description: 'Правила включения функций и контроля доступа.',
  category: 'technical',
  taskSource: 'permissionsFlags',
  fields: [
    { id: 'featureFlags', label: 'Feature flags', type: 'object-list', value: [], addLabel: 'Добавить feature flag', fields: ruleFields },
    { id: 'permissions', label: 'Permissions', type: 'object-list', value: [], addLabel: 'Добавить permission', fields: [
      ruleFields[0], ruleFields[1],
      { id: 'whenGranted', label: 'Когда разрешено', type: 'textarea', value: '' },
      { id: 'whenDenied', label: 'Когда запрещено', type: 'textarea', value: '' },
    ] },
  ],
}
