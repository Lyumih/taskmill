import { useState } from 'react'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Card, DatePicker, Flex, Input, InputNumber, Select, Switch, Typography } from 'antd'
import dayjs from 'dayjs'
import type { PluginError, PluginField, PluginFieldValue } from '../../plugins/types'

const { TextArea } = Input
const { Text } = Typography
const unsetValue = '__unset__'

type BlockFieldEditorProps = {
  field: PluginField
  onChange: (value: PluginFieldValue) => void
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function BlockFieldEditor({ field, onChange }: BlockFieldEditorProps) {
  const [newValue, setNewValue] = useState('')

  if (field.type === 'text') {
    return <Input aria-label={field.label} value={field.value} onChange={(event) => onChange(event.target.value)} />
  }

  if (field.type === 'textarea') {
    return <TextArea aria-label={field.label} value={field.value} autoSize={{ minRows: 2, maxRows: 6 }} onChange={(event) => onChange(event.target.value)} />
  }

  if (field.type === 'date') {
    return (
      <DatePicker
        aria-label={field.label}
        value={field.value ? dayjs(field.value) : null}
        format="YYYY-MM-DD"
        onChange={(date) => onChange(date?.format('YYYY-MM-DD') ?? null)}
        style={{ width: '100%' }}
      />
    )
  }

  if (field.type === 'rating') {
    return (
      <Select
        aria-label={field.label}
        value={field.value ?? unsetValue}
        onChange={(value: number | string) => onChange(value === unsetValue ? null : Number(value))}
        options={[
          { value: unsetValue, label: 'Не задано' },
          ...Array.from({ length: field.max + 1 }, (_, score) => ({ value: score, label: `${score} / ${field.max}` })),
        ]}
        style={{ width: '100%' }}
      />
    )
  }

  if (field.type === 'number') {
    return (
      <Flex align="center" gap="small">
        <InputNumber
          aria-label={field.label}
          value={field.value}
          min={field.min}
          max={field.max}
          onChange={(value) => onChange(value)}
          style={{ width: '100%' }}
        />
        {field.unit && <Text type="secondary">{field.unit}</Text>}
      </Flex>
    )
  }

  if (field.type === 'choice') {
    return (
      <Select
        aria-label={field.label}
        value={field.value ?? unsetValue}
        onChange={(value: string) => onChange(value === unsetValue ? null : value)}
        options={[{ value: unsetValue, label: 'Не задано' }, ...field.options]}
        style={{ width: '100%' }}
      />
    )
  }

  if (field.type === 'boolean') {
    return <Switch aria-label={field.label} checked={field.value} onChange={onChange} />
  }

  if (field.type === 'url-list' || field.type === 'string-list') {
    const inputType = field.type === 'url-list' ? 'url' : 'text'
    return (
      <Flex vertical gap="small">
        {field.value.map((value, index) => (
          <Flex key={`${field.id}-${index}`} align="flex-start" gap="small">
            <Input
              aria-label={`${field.label}, строка ${index + 1}`}
              type={inputType}
              value={value}
              placeholder={field.placeholder}
              onChange={(event) => onChange(field.value.map((item, itemIndex) => itemIndex === index ? event.target.value : item))}
            />
            <Button
              aria-label={`Удалить строку ${index + 1} из поля ${field.label}`}
              icon={<DeleteOutlined />}
              onClick={() => onChange(field.value.filter((_, itemIndex) => itemIndex !== index))}
            />
          </Flex>
        ))}
        <Flex gap="small">
          <Input
            aria-label={`Новое значение для поля ${field.label}`}
            type={inputType}
            value={newValue}
            placeholder={field.placeholder}
            onChange={(event) => setNewValue(event.target.value)}
            onPressEnter={(event) => {
              event.preventDefault()
              if (!newValue.trim()) return
              onChange([...field.value, newValue.trim()])
              setNewValue('')
            }}
          />
          <Button
            aria-label={`Добавить строку в поле ${field.label}`}
            icon={<PlusOutlined />}
            onClick={() => {
              if (!newValue.trim()) return
              onChange([...field.value, newValue.trim()])
              setNewValue('')
            }}
          >
            Добавить
          </Button>
        </Flex>
      </Flex>
    )
  }

  if (field.type !== 'errors') return null

  const updateError = (errorId: string, patch: Partial<PluginError>) => {
    onChange(field.value.map((error) => error.id === errorId ? { ...error, ...patch } : error))
  }

  return (
    <Flex vertical gap="middle">
      {field.value.map((error, index) => (
        <Card key={error.id} size="small">
          <Flex vertical gap="small">
            <Flex align="center" gap="small">
              <Select
                aria-label={`Тип ошибки ${index + 1}`}
                value={error.type}
                options={field.options}
                onChange={(type) => updateError(error.id, { type, customType: type === 'other' ? error.customType : '' })}
                style={{ flex: 1 }}
              />
              <Button
                aria-label={`Удалить ошибку ${index + 1}`}
                icon={<DeleteOutlined />}
                onClick={() => onChange(field.value.filter((item) => item.id !== error.id))}
              />
            </Flex>
            {error.type === 'other' && (
              <Input
                aria-label={`Свой тип ошибки ${index + 1}`}
                value={error.customType}
                placeholder="Укажите тип ошибки"
                onChange={(event) => updateError(error.id, { customType: event.target.value })}
              />
            )}
            <TextArea
              aria-label={`Описание ошибки ${index + 1}`}
              value={error.description}
              placeholder="Опишите ошибку"
              autoSize={{ minRows: 2, maxRows: 5 }}
              onChange={(event) => updateError(error.id, { description: event.target.value })}
            />
          </Flex>
        </Card>
      ))}
      <Button
        icon={<PlusOutlined />}
        onClick={() => onChange([...field.value, { id: createId('error'), type: field.options[0]?.value ?? 'other', customType: '', description: '' }])}
      >
        Добавить ошибку
      </Button>
    </Flex>
  )
}
