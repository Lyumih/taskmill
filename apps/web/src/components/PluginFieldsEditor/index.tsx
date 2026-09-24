import { Alert, Flex } from 'antd'
import { BlockFieldEditor } from '../BlockFieldEditor'
import type { PluginDefinition, PluginField, PluginFieldValue, PluginValues } from '../../plugins/types'

type PluginFieldsEditorProps = {
  plugin: PluginDefinition
  values: PluginValues
  onChange: (fieldId: string, value: PluginFieldValue) => void
  notes?: Record<string, string>
  onNoteChange?: (fieldPath: string, value: string) => void
  onNotesRemovePrefix?: (fieldPathPrefix: string) => void
}

export function PluginFieldsEditor({ plugin, values, onChange, notes, onNoteChange, onNotesRemovePrefix }: PluginFieldsEditorProps) {
  const errors = plugin.validate?.(values) ?? []

  return (
    <Flex vertical gap="middle">
      {plugin.fields.map((definition) => {
        const field = {
          ...definition,
          value: Object.hasOwn(values, definition.id) ? values[definition.id] : definition.value,
        } as PluginField

        return (
          <BlockFieldEditor
            key={field.id}
            field={field}
            fieldPath={field.id}
            notes={notes}
            onNoteChange={onNoteChange}
            onNotesRemovePrefix={onNotesRemovePrefix}
            onChange={(value) => onChange(field.id, value)}
          />
        )
      })}
      {errors.length > 0 && <Alert type="warning" showIcon message={errors.join(' ')} />}
    </Flex>
  )
}
