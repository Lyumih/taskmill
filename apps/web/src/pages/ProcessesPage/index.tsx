import { useState } from 'react'
import { ArrowDownOutlined, ArrowUpOutlined, BranchesOutlined, DeleteOutlined, PlusOutlined, RobotOutlined } from '@ant-design/icons'
import {
  Alert,
  Button,
  Card,
  Empty,
  Flex,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Steps,
  Switch,
  Tabs,
  Tag,
  Typography,
} from 'antd'
import { getPluginDefinition } from '../../plugins'
import type { ProcessBlock, ProcessDefinition } from '../../types/process'
import type { Project } from '../../types/project'

const { Text, Title } = Typography
const { TextArea } = Input

type ProcessesPageProps = {
  project: Project
  onUpdateProcess: (processId: string, patch: Partial<ProcessDefinition>) => void
}

function createId() {
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function ProcessesPage({ project, onUpdateProcess }: ProcessesPageProps) {
  const [activeProcessId, setActiveProcessId] = useState(project.processes[0]?.id ?? '')
  const [selectedPluginIds, setSelectedPluginIds] = useState<Record<string, string | undefined>>({})
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm<{ title: string; detail: string }>()
  const activeProcess = project.processes.find((process) => process.id === activeProcessId) ?? project.processes[0]
  const availablePlugins = project.plugins.filter((item) => item.enabled)

  const updateProcessBlocks = (process: ProcessDefinition, blocks: ProcessBlock[]) => {
    onUpdateProcess(process.id, { blocks })
  }

  const movePluginBlock = (process: ProcessDefinition, index: number, offset: number) => {
    const targetIndex = index + offset
    if (targetIndex < 0 || targetIndex >= process.blocks.length) return
    const blocks = [...process.blocks]
    const currentBlock = blocks[index]
    blocks[index] = blocks[targetIndex]
    blocks[targetIndex] = currentBlock
    updateProcessBlocks(process, blocks)
  }

  const addPlugin = (process: ProcessDefinition) => {
    const pluginId = selectedPluginIds[process.id]
    if (!pluginId) return
    const block: ProcessBlock = { id: createId(), pluginId, enabled: true }
    updateProcessBlocks(process, [...process.blocks, block])
    setSelectedPluginIds((current) => ({ ...current, [process.id]: undefined }))
  }

  const addStage = (values: { title: string; detail: string }) => {
    if (!activeProcess) return
    onUpdateProcess(activeProcess.id, {
      stages: [...activeProcess.stages, { ...values, status: 'pending' }],
    })
    setModalOpen(false)
    form.resetFields()
  }

  if (!activeProcess) {
    return <Empty description="Для проекта пока нет процессов." />
  }

  return (
    <main>
      <Flex vertical gap="large">
        <Flex align="flex-start" justify="space-between" gap="middle" wrap="wrap">
          <Flex vertical gap="small">
            <Title level={2} style={{ margin: 0 }}>Процессы проекта</Title>
            <Text type="secondary">Комбинируйте блоки-элементы в workflow проекта {project.name}.</Text>
          </Flex>
          <Tag icon={<BranchesOutlined />} color="blue">{project.processes.length} процесса</Tag>
        </Flex>

        <Card>
          <Tabs
            activeKey={activeProcess.id}
            onChange={setActiveProcessId}
            items={project.processes.map((process) => ({
              key: process.id,
              label: process.name,
              children: (
                <Flex vertical gap="large">
                  {process.placeholder && (
                    <Alert
                      type="warning"
                      showIcon
                      message="Процесс пока заглушка"
                      description="Его тип и состав блоков настроены, содержание этапов предстоит определить."
                    />
                  )}

                  <Flex align="flex-start" justify="space-between" gap="middle" wrap="wrap">
                    <Flex vertical gap="small">
                      <Flex align="center" gap="small" wrap="wrap">
                        <Title level={4} style={{ margin: 0 }}>{process.name}</Title>
                        <Tag color={process.enabled ? 'success' : 'default'}>{process.enabled ? 'Доступен задачам' : 'Выключен'}</Tag>
                        <Tag>{process.taskType}</Tag>
                      </Flex>
                      <Text type="secondary">{process.summary}</Text>
                    </Flex>
                    <Flex align="center" gap="small">
                      <Text>{process.enabled ? 'Включён' : 'Выключен'}</Text>
                      <Switch
                        aria-label={`Включить процесс «${process.name}»`}
                        checked={process.enabled}
                        onChange={(enabled) => onUpdateProcess(process.id, { enabled })}
                      />
                    </Flex>
                  </Flex>

                  <Flex gap="small" wrap="wrap">
                    <Tag>Запуск: {process.trigger}</Tag>
                    <Tag icon={<RobotOutlined />}>Агент: {process.agent}</Tag>
                    <Tag>{process.stages.length} этапа</Tag>
                  </Flex>

                  <Card
                    size="small"
                    title="Состав процесса"
                    extra={(
                      <Space.Compact>
                        <Select
                          aria-label={`Плагин для процесса ${process.name}`}
                          placeholder="Выберите блок"
                          value={selectedPluginIds[process.id]}
                          options={availablePlugins.map((item) => ({
                            value: item.pluginId,
                            label: getPluginDefinition(item.pluginId)?.title ?? item.pluginId,
                          }))}
                          onChange={(pluginId) => setSelectedPluginIds((current) => ({ ...current, [process.id]: pluginId }))}
                          style={{ minWidth: 180 }}
                        />
                        <Button
                          aria-label={`Добавить блок в процесс ${process.name}`}
                          icon={<PlusOutlined />}
                          disabled={!selectedPluginIds[process.id]}
                          onClick={() => addPlugin(process)}
                        />
                      </Space.Compact>
                    )}
                  >
                    <Flex vertical gap="small">
                      {process.blocks.map((block, index) => {
                        const plugin = getPluginDefinition(block.pluginId)
                        return (
                          <Flex key={block.id} align="center" justify="space-between" gap="middle" wrap="wrap">
                            <Flex align="center" gap="small" wrap="wrap">
                              <Tag>{index + 1}</Tag>
                              <Text strong>{plugin?.title ?? `Неизвестный плагин: ${block.pluginId}`}</Text>
                              {!project.plugins.find((item) => item.pluginId === block.pluginId)?.enabled && (
                                <Tag color="warning">Плагин выключен в проекте</Tag>
                              )}
                            </Flex>
                            <Space>
                              <Button
                                aria-label={`Переместить блок ${plugin?.title ?? block.pluginId} выше`}
                                icon={<ArrowUpOutlined />}
                                disabled={index === 0}
                                onClick={() => movePluginBlock(process, index, -1)}
                              />
                              <Button
                                aria-label={`Переместить блок ${plugin?.title ?? block.pluginId} ниже`}
                                icon={<ArrowDownOutlined />}
                                disabled={index === process.blocks.length - 1}
                                onClick={() => movePluginBlock(process, index, 1)}
                              />
                              <Switch
                                aria-label={`Использовать блок ${plugin?.title ?? block.pluginId} в процессе ${process.name}`}
                                checked={block.enabled}
                                onChange={(enabled) => updateProcessBlocks(process, process.blocks.map((item) => item.id === block.id ? { ...item, enabled } : item))}
                              />
                              <Button
                                aria-label={`Удалить блок ${plugin?.title ?? block.pluginId} из процесса ${process.name}`}
                                icon={<DeleteOutlined />}
                                onClick={() => updateProcessBlocks(process, process.blocks.filter((item) => item.id !== block.id))}
                              />
                            </Space>
                          </Flex>
                        )
                      })}
                      {!process.blocks.length && <Text type="secondary">Добавьте плагины, чтобы составить процесс.</Text>}
                    </Flex>
                  </Card>

                  <Card
                    size="small"
                    title="Этапы процесса"
                    extra={<Button icon={<PlusOutlined />} onClick={() => { form.resetFields(); setActiveProcessId(process.id); setModalOpen(true) }}>Добавить этап</Button>}
                  >
                    <Steps
                      orientation="vertical"
                      current={Math.max(0, process.stages.findIndex((stage) => stage.status === 'current'))}
                      items={process.stages.map((stage) => ({
                        title: stage.title,
                        description: stage.detail,
                        status: stage.status === 'done' ? 'finish' : stage.status === 'current' ? 'process' : 'wait',
                      }))}
                    />
                  </Card>

                  <Flex align="center" gap="small" wrap="wrap">
                    <Text type="secondary">Задачи выбирают один включённый процесс и получают его активные блоки.</Text>
                    <Tag color="processing">{process.placeholder ? 'Заглушка' : 'Feature workflow'}</Tag>
                  </Flex>
                </Flex>
              ),
            }))}
          />
        </Card>
      </Flex>

      <Modal
        open={modalOpen}
        title={`Новый этап: ${activeProcess.name}`}
        okText="Добавить этап"
        cancelText="Отмена"
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={addStage}>
          <Form.Item label="Название этапа" name="title" rules={[{ required: true, whitespace: true, message: 'Укажите название этапа' }]}>
            <Input autoFocus />
          </Form.Item>
          <Form.Item label="Что делает агент" name="detail" rules={[{ required: true, whitespace: true, message: 'Опишите действия агента' }]}>
            <TextArea autoSize={{ minRows: 3, maxRows: 6 }} />
          </Form.Item>
        </Form>
      </Modal>
    </main>
  )
}
