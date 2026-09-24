import { Alert, Flex, Typography } from 'antd'
import { BlockFieldEditor } from '../BlockFieldEditor'
import type { PluginDefinition, PluginField, PluginFieldValue, PluginValues } from '../../plugins/types'

const { Text } = Typography

type PluginFieldsEditorProps = {
  plugin: PluginDefinition
  values: PluginValues
  onChange: (fieldId: string, value: PluginFieldValue) => void
}

export function PluginFieldsEditor({ plugin, values, onChange }: PluginFieldsEditorProps) {
  const errors = plugin.validate?.(values) ?? []

  return (
    <Flex vertical gap="middle">
      {plugin.fields.map((definition) => {
        const field = {
          ...definition,
          value: Object.hasOwn(values, definition.id) ? values[definition.id] : definition.value,
        } as PluginField

        return (
          <Flex key={field.id} vertical gap="small">
            <Text strong>{field.label}</Text>
            <BlockFieldEditor field={field} onChange={(value) => onChange(field.id, value)} />
          </Flex>
        )
      })}
      {errors.length > 0 && <Alert type="warning" showIcon message={errors.join(' ')} />}
    </Flex>
  )
}
