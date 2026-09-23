import { useState } from 'react'
import { AppstoreOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Row,
  Space,
  Switch,
  Tag,
  Typography,
} from 'antd'
import type { MockProject } from '../../../mock'

const { Text, Title } = Typography
const { TextArea } = Input

type BlockElement = {
  id: string
  title: string
  detail: string
}

type ProjectBlock = {
  id: string
  title: string
  description: string
  enabled: boolean
  elements: BlockElement[]
}

type Editor = {
  kind: 'block' | 'element'
  blockId?: string
  elementId?: string
}

type BlocksPageProps = {
  project: MockProject
}

const initialBlocks: ProjectBlock[] = [
  {
    id: 'project-context',
    title: 'Контекст проекта',
    description: 'Краткое описание продукта, его аудитории и ключевых ограничений.',
    enabled: true,
    elements: [
      { id: 'product', title: 'Продукт', detail: 'Taskmill помогает команде разбирать задачи и готовить работу для ИИ-агентов.' },
      { id: 'stack', title: 'Технологический стек', detail: 'React, TypeScript, Vite и Ant Design.' },
    ],
  },
  {
    id: 'development-rules',
    title: 'Правила разработки',
    description: 'Общие договорённости, которые агент учитывает при изменении кода.',
    enabled: true,
    elements: [
      { id: 'small-diffs', title: 'Небольшие изменения', detail: 'Сначала ищи минимальное решение и не меняй несвязанные файлы.' },
      { id: 'verify', title: 'Проверка результата', detail: 'Запускай релевантные проверки и сообщай об ограничениях.' },
    ],
  },
  {
    id: 'task-template',
    title: 'Шаблон задачи',
    description: 'Структурирует контекст перед стартом агента.',
    enabled: false,
    elements: [
      { id: 'acceptance', title: 'Критерии готовности', detail: 'Перечисли ожидаемое поведение и условия приёмки.' },
    ],
  },
]

export function BlocksPage({ project }: BlocksPageProps) {
  const [blocks, setBlocks] = useState(initialBlocks)
  const [editor, setEditor] = useState<Editor | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm<{ name: string; detail: string }>()
  const [messageApi, contextHolder] = message.useMessage()
  const enabledCount = blocks.filter((block) => block.enabled).length
  const elementCount = blocks.reduce((total, block) => total + block.elements.length, 0)

  const openEditor = (nextEditor: Editor, initialValues = { name: '', detail: '' }) => {
    setEditor(nextEditor)
    form.setFieldsValue(initialValues)
    setModalOpen(true)
  }

  const saveEditor = (values: { name: string; detail: string }) => {
    if (!editor) return

    if (editor.kind === 'block') {
      if (editor.blockId) {
        setBlocks((current) => current.map((block) => block.id === editor.blockId
          ? { ...block, title: values.name, description: values.detail }
          : block))
      } else {
        setBlocks((current) => [...current, {
          id: `block-${Date.now()}`,
          title: values.name,
          description: values.detail,
          enabled: true,
          elements: [],
        }])
      }
    } else if (editor.blockId) {
      setBlocks((current) => current.map((block) => {
        if (block.id !== editor.blockId) return block
        const elements = editor.elementId
          ? block.elements.map((element) => element.id === editor.elementId
            ? { ...element, title: values.name, detail: values.detail }
            : element)
          : [...block.elements, { id: `element-${Date.now()}`, title: values.name, detail: values.detail }]
        return { ...block, elements }
      }))
    }

    setModalOpen(false)
    messageApi.success('Изменение сохранено в локальном прототипе')
  }

  return (
    <main>
      {contextHolder}
      <Flex vertical gap="large">
        <Flex align="flex-start" justify="space-between" gap="middle" wrap="wrap">
          <Flex vertical gap="small">
            <Title level={2} style={{ margin: 0 }}>Блоки проекта</Title>
            <Text type="secondary">Соберите контекст и инструкции, которые Taskmill передаёт агентам проекта {project.name}.</Text>
          </Flex>
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => openEditor({ kind: 'block' })}
          >
            Добавить блок
          </Button>
        </Flex>

        <Flex gap="small" wrap="wrap">
          <Tag icon={<AppstoreOutlined />} color="blue">{blocks.length} блока</Tag>
          <Tag color="success">{enabledCount} активны</Tag>
          <Tag>{elementCount} элементов</Tag>
          <Tag color="default">Источник: локальная конфигурация</Tag>
        </Flex>

        <Row gutter={[16, 16]}>
          {blocks.map((block) => (
            <Col key={block.id} xs={24} xl={12}>
              <Card
                title={<Flex vertical><Text strong>{block.title}</Text><Text type="secondary">{block.description}</Text></Flex>}
                extra={<Switch aria-label={`Активность блока ${block.title}`} checked={block.enabled} onChange={(enabled) => setBlocks((current) => current.map((item) => item.id === block.id ? { ...item, enabled } : item))} />}
              >
                <Flex vertical gap="middle">
                  <Flex justify="space-between" align="center" wrap="wrap" gap="small">
                    <Tag color={block.enabled ? 'success' : 'default'}>{block.enabled ? 'Передаётся агенту' : 'Выключен'}</Tag>
                    <Space wrap>
                      <Button
                        icon={<EditOutlined />}
                        aria-label={`Редактировать блок ${block.title}`}
                        onClick={() => openEditor(
                          { kind: 'block', blockId: block.id },
                          { name: block.title, detail: block.description },
                        )}
                      >
                        Редактировать
                      </Button>
                      <Button
                        icon={<PlusOutlined />}
                        onClick={() => openEditor({ kind: 'element', blockId: block.id })}
                      >
                        Элемент
                      </Button>
                    </Space>
                  </Flex>
                  {block.elements.length ? (
                    <Flex vertical gap="small">
                      {block.elements.map((element) => (
                        <Card key={element.id} size="small">
                          <Flex align="flex-start" justify="space-between" gap="middle">
                            <Flex vertical gap="small">
                              <Text strong>{element.title}</Text>
                              <Text type="secondary">{element.detail}</Text>
                            </Flex>
                            <Button
                              aria-label={`Редактировать элемент ${element.title}`}
                              icon={<EditOutlined />}
                              type="text"
                              onClick={() => openEditor(
                                { kind: 'element', blockId: block.id, elementId: element.id },
                                { name: element.title, detail: element.detail },
                              )}
                            />
                          </Flex>
                        </Card>
                      ))}
                    </Flex>
                  ) : (
                    <Text type="secondary">В этом блоке пока нет элементов.</Text>
                  )}
                </Flex>
              </Card>
            </Col>
          ))}
        </Row>
      </Flex>

      <Modal
        open={modalOpen}
        title={editor?.kind === 'block' ? (editor.blockId ? 'Редактировать блок' : 'Новый блок') : (editor?.elementId ? 'Редактировать элемент' : 'Новый элемент')}
        okText="Сохранить"
        cancelText="Отмена"
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={saveEditor}>
          <Form.Item
            label={editor?.kind === 'block' ? 'Название блока' : 'Название элемента'}
            name="name"
            rules={[{ required: true, whitespace: true, message: 'Укажите название' }]}
          >
            <Input autoFocus />
          </Form.Item>
          <Form.Item
            label={editor?.kind === 'block' ? 'Назначение блока' : 'Инструкция для агента'}
            name="detail"
            rules={[{ required: true, whitespace: true, message: 'Добавьте описание' }]}
          >
            <TextArea autoSize={{ minRows: 3, maxRows: 6 }} />
          </Form.Item>
        </Form>
      </Modal>
    </main>
  )
}
