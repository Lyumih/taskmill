import type { ReactNode } from 'react'
import { Card, Flex, Tag, Typography } from 'antd'
import type { PluginDefinition, PluginError, PluginField, PluginFieldValue, PluginRecord, PluginValues } from '../../plugins/types'

const { Link, Text } = Typography

type PluginFieldsViewProps = {
  plugin: PluginDefinition
  values: PluginValues
}

function renderRecord(fields: PluginField[], values: PluginRecord): ReactNode {
  return (
    <Flex vertical gap="small">
      {fields.filter((field) => !field.visibleWhen || values[field.visibleWhen.fieldId] === field.visibleWhen.equals).map((field) => {
        const configuredValue = Object.hasOwn(values, field.id) ? values[field.id] : field.value
        const value = configuredValue === undefined ? field.value : configuredValue
        return (
          <Flex key={field.id} vertical gap="small">
            <Text type="secondary">{field.label}</Text>
            {renderValue(field, value)}
          </Flex>
        )
      })}
    </Flex>
  )
}

function renderValue(field: PluginField, value: PluginFieldValue): ReactNode {
  if (field.type === 'url') {
    return value ? <Link href={String(value)} target="_blank" rel="noopener noreferrer">{String(value)}</Link> : <Text type="secondary">Не задано</Text>
  }

  if (field.type === 'text' || field.type === 'textarea') {
    return value ? <Text style={{ whiteSpace: 'pre-wrap' }}>{String(value)}</Text> : <Text type="secondary">Не задано</Text>
  }

  if (field.type === 'url-list') {
    return Array.isArray(value) && value.length ? (
      <Flex vertical gap="small">
        {value.filter((item): item is string => typeof item === 'string').map((url) => (
          <Link key={url} href={url} target="_blank" rel="noopener noreferrer">{url}</Link>
        ))}
      </Flex>
    ) : <Text type="secondary">Ссылок нет</Text>
  }

  if (field.type === 'string-list') {
    return Array.isArray(value) && value.length ? (
      <Flex gap="small" wrap="wrap">{value.filter((item): item is string => typeof item === 'string').map((item) => <Tag key={item}>{item}</Tag>)}</Flex>
    ) : <Text type="secondary">Список пуст</Text>
  }

  if (field.type === 'date') return value ? <Text>{String(value)}</Text> : <Text type="secondary">Не задано</Text>

  if (field.type === 'rating') {
    return typeof value === 'number' ? <Tag color="blue">{value} / {field.max}</Tag> : <Text type="secondary">Не задано</Text>
  }

  if (field.type === 'number') {
    return typeof value === 'number' ? <Text>{value}{field.unit ? ` ${field.unit}` : ''}</Text> : <Text type="secondary">Не задано</Text>
  }

  if (field.type === 'choice') {
    const option = field.options.find((item) => item.value === value)
    return option ? <Tag>{option.label}</Tag> : <Text type="secondary">Не задано</Text>
  }

  if (field.type === 'boolean') return <Tag color={value ? 'success' : 'default'}>{value ? 'Да' : 'Нет'}</Tag>

  if (field.type === 'object') {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
      ? renderRecord(field.fields, value as PluginRecord)
      : <Text type="secondary">Не задано</Text>
  }

  if (field.type === 'object-list') {
    return Array.isArray(value) && value.length ? (
      <Flex vertical gap="small">
        {value.filter((item): item is PluginRecord => typeof item === 'object' && item !== null && !Array.isArray(item)).map((record, index) => (
          <Card key={record.id ?? `${field.id}-${index}`} size="small" title={`${field.label} ${index + 1}`}>
            {renderRecord(field.fields, record)}
          </Card>
        ))}
      </Flex>
    ) : <Text type="secondary">Список пуст</Text>
  }

  if (field.type === 'errors') {
    const errors = Array.isArray(value) ? value as PluginError[] : []
    return errors.length ? (
      <Flex vertical gap="small">
        {errors.map((error) => (
          <Card key={error.id} size="small" title={error.type === 'other' ? error.customType : field.options.find((item) => item.value === error.type)?.label ?? error.type}>
            <Text>{error.description}</Text>
          </Card>
        ))}
      </Flex>
    ) : <Text type="secondary">Список ошибок пуст</Text>
  }

  return null
}

export function PluginFieldsView({ plugin, values }: PluginFieldsViewProps) {
  return <Flex vertical gap="middle">{renderRecord(plugin.fields, values)}</Flex>
}
