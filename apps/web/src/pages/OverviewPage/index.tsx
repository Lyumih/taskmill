import { BranchesOutlined, FolderOpenOutlined } from '@ant-design/icons'
import { useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Collapse,
  Flex,
  Input,
  message,
  Select,
  Space,
  Steps,
  Tabs,
  Tag,
  Typography,
} from 'antd'
import { PluginFieldsEditor } from '../../components/PluginFieldsEditor'
import { ProjectContext } from '../../components/ProjectContext'
import { getPluginDefinition, getPluginDefaultValues, mergePluginValues } from '../../plugins'
import type { PluginCategory, PluginFieldValue } from '../../plugins/types'
import type { Project } from '../../types/project'
import type { TaskData } from '../../types/task'
import { buildTaskContext } from '../../utils/buildTaskContext'

const { Paragraph, Text, Title } = Typography

const pluginGroups: Array<{ key: PluginCategory; label: string }> = [
  { key: 'planning', label: 'Планирование' },
  { key: 'delivery', label: 'Реализация' },
  { key: 'context', label: 'Контекст' },
  { key: 'technical', label: 'Технические детали' },
]

type OverviewPageProps = {
  project: Project
  projectId: string
  taskId: string
  task: TaskData
  persisted: boolean
  onUpdateTask: (patch: Partial<TaskData>) => void
}

export function OverviewPage({ project, projectId, taskId, task, persisted, onUpdateTask }: OverviewPageProps) {
  const taskKey = `${projectId}:${taskId}`
  const [editDraft, setEditDraft] = useState({ taskKey, value: '' })
  const [allBlocksExpanded, setAllBlocksExpanded] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()
  const editContext = editDraft.taskKey === taskKey ? editDraft.value : ''
  const process = project.processes.find((item) => item.id === task.processId)
  const workflowBlock = process?.blocks.find((block) => block.pluginId === 'task-workflow' && block.enabled)
  const workflowValues = workflowBlock && process
    ? mergePluginValues(
        project.plugins.find((item) => item.pluginId === workflowBlock.pluginId)?.values ?? getPluginDefaultValues(workflowBlock.pluginId),
        task.pluginData?.[process.id]?.[workflowBlock.id],
      )
    : undefined
  const currentStep = typeof workflowValues?.currentStep === 'number' ? workflowValues.currentStep : 1
  const taskContext = buildTaskContext(project, task)
  const processBlocks = process?.blocks.flatMap((block) => {
    if (!block.enabled) return []
    const plugin = getPluginDefinition(block.pluginId)
    return plugin?.projectView ? [] : [{ block, plugin }]
  }) ?? []
  const groupedBlocks = pluginGroups.map((group) => ({
    group,
    entries: processBlocks.filter(({ plugin }) => (plugin?.category ?? 'technical') === group.key),
  })).filter(({ entries }) => entries.length > 0)

  const renderBlockEditor = (blockId: string, pluginId: string, plugin?: ReturnType<typeof getPluginDefinition>) => {
    const projectPlugin = project.plugins.find((item) => item.pluginId === pluginId)
    if (!plugin) return <Alert type="error" showIcon message={`Плагин ${pluginId} не найден`} />
    if (!projectPlugin?.enabled) return <Alert type="warning" showIcon message={`${plugin.title} выключен в настройках проекта`} />
    if (!process) return null

    return (
      <PluginFieldsEditor
        key={`${taskKey}:${process.id}:${blockId}`}
        plugin={plugin}
        values={mergePluginValues(
          projectPlugin.values ?? getPluginDefaultValues(plugin.id),
          task.pluginData?.[process.id]?.[blockId],
        )}
        notes={task.pluginNotes?.[process.id]?.[blockId]}
        onChange={(fieldId, value) => updatePluginValue(process.id, blockId, fieldId, value)}
        onNoteChange={(fieldPath, value) => updatePluginNote(process.id, blockId, fieldPath, value)}
        onNotesRemovePrefix={(prefix) => removePluginNotesPrefix(process.id, blockId, prefix)}
      />
    )
  }

  const tabs = groupedBlocks.map(({ group, entries }) => ({
    key: group.key,
    label: (
      <Flex align="center" gap="small">
        <Text>{group.label}</Text>
        <Text type="secondary">{entries.length}</Text>
      </Flex>
    ),
    children: (
      <Collapse
        key={`${process?.id}-${group.key}`}
        accordion
        size="small"
        items={entries.map(({ block, plugin }) => ({
          key: block.id,
          label: plugin?.title ?? `Неизвестный плагин: ${block.pluginId}`,
          children: renderBlockEditor(block.id, block.pluginId, plugin),
        }))}
      />
    ),
  }))

  const selectProcess = (processId: string) => {
    const nextProcess = project.processes.find((item) => item.id === processId)
    if (nextProcess) onUpdateTask({ processId, type: nextProcess.taskType })
  }

  const updatePluginValue = (processId: string, blockId: string, fieldId: string, value: PluginFieldValue) => {
    onUpdateTask({
      pluginData: {
        ...task.pluginData,
        [processId]: {
          ...task.pluginData?.[processId],
          [blockId]: { ...task.pluginData?.[processId]?.[blockId], [fieldId]: value },
        },
      },
    })
  }

  const updatePluginNote = (processId: string, blockId: string, fieldPath: string, value: string) => {
    const pluginNotes = { ...task.pluginNotes }
    const processNotes = { ...pluginNotes[processId] }
    const blockNotes = { ...processNotes[blockId] }

    if (value.trim()) blockNotes[fieldPath] = value
    else delete blockNotes[fieldPath]

    if (Object.keys(blockNotes).length) processNotes[blockId] = blockNotes
    else delete processNotes[blockId]

    if (Object.keys(processNotes).length) pluginNotes[processId] = processNotes
    else delete pluginNotes[processId]

    onUpdateTask({ pluginNotes })
  }

  const removePluginNotesPrefix = (processId: string, blockId: string, prefix: string) => {
    const pluginNotes = { ...task.pluginNotes }
    const processNotes = { ...pluginNotes[processId] }
    const blockNotes = Object.fromEntries(
      Object.entries(processNotes[blockId] ?? {}).filter(([fieldPath]) => !fieldPath.startsWith(prefix)),
    )

    if (Object.keys(blockNotes).length) processNotes[blockId] = blockNotes
    else delete processNotes[blockId]

    if (Object.keys(processNotes).length) pluginNotes[processId] = processNotes
    else delete pluginNotes[processId]

    onUpdateTask({ pluginNotes })
  }

  const copyPrompt = async (prompt: string, description: string) => {
    try {
      await navigator.clipboard.writeText(prompt)
      messageApi.success(`${description} скопирован в буфер обмена`)
    } catch {
      messageApi.error('Не удалось скопировать текст. Проверьте разрешение браузера на буфер обмена.')
    }
  }

  return (
    <main>
      {contextHolder}
      <Flex vertical gap="middle">
        <Card size="small">
          <Flex vertical gap="small">
            <Flex align="center" justify="space-between" gap="small" wrap="wrap">
              <Space wrap>
                <Text type="secondary">{project.name} / задача {task.id ?? '—'}</Text>
                <Tag color={persisted ? 'green' : 'gold'}>{persisted ? 'JSON .taskmill' : 'Демо'}</Tag>
              </Space>
              <Space wrap>
                {task.status && <Tag color="processing">{task.status}</Tag>}
                {task.type && <Tag color="blue">{task.type}</Tag>}
                {task.priority && <Tag color="volcano">{task.priority}</Tag>}
              </Space>
            </Flex>
            <Title level={3}>{task.title ?? 'Новая задача'}</Title>
            {task.description && <Paragraph>{task.description}</Paragraph>}
            <Space wrap>
              {task.project?.name && <Text><FolderOpenOutlined /> {task.project.name}</Text>}
              {task.project?.branch && <Text><BranchesOutlined /> {task.project.branch}</Text>}
              {task.project?.rootPath && <Text type="secondary">{task.project.rootPath}</Text>}
            </Space>
          </Flex>
        </Card>

        <Flex vertical gap="middle">
          <Card size="small" title="Процесс задачи">
            {process ? (
              <Flex vertical gap="middle">
                <Flex align="center" justify="space-between" gap="middle" wrap="wrap">
                  <Flex vertical gap="small">
                    <Flex align="center" gap="small" wrap="wrap">
                      <Text strong>{process.name}</Text>
                      <Tag>{process.taskType}</Tag>
                      {process.placeholder && <Tag color="warning">Заглушка</Tag>}
                    </Flex>
                    <Text type="secondary">{process.summary}</Text>
                  </Flex>
                  <Select
                    aria-label="Выбрать процесс для задачи"
                    value={process.id}
                    options={project.processes.map((item) => ({
                      value: item.id,
                      label: `${item.name}${item.placeholder ? ' · заглушка' : ''}`,
                      disabled: !item.enabled,
                    }))}
                    onChange={selectProcess}
                  />
                </Flex>
                <Steps
                  size="small"
                  current={Math.max(0, Math.min(currentStep - 1, process.stages.length - 1))}
                  items={process.stages.map((stage) => ({ title: stage.title, description: stage.detail }))}
                />
              </Flex>
            ) : (
              <Flex align="center" gap="middle" wrap="wrap">
                <Text type="secondary">У задачи пока не выбран процесс.</Text>
                <Select
                  aria-label="Выбрать процесс для задачи"
                  placeholder="Выберите процесс"
                  options={project.processes.filter((item) => item.enabled).map((item) => ({ value: item.id, label: item.name }))}
                  onChange={selectProcess}
                />
              </Flex>
            )}
          </Card>

          <Card
            size="small"
            title="Блоки задачи"
            extra={(
              <Button
                size="small"
                disabled={!processBlocks.length}
                onClick={() => setAllBlocksExpanded((expanded) => !expanded)}
              >
                {allBlocksExpanded ? 'Свернуть все' : 'Развернуть все'}
              </Button>
            )}
          >
            {groupedBlocks.length ? allBlocksExpanded ? (
              <Flex vertical gap="large">
                {groupedBlocks.map(({ group, entries }) => (
                  <Flex key={group.key} vertical gap="small">
                    <Flex align="center" gap="small">
                      <Text strong>{group.label}</Text>
                      <Text type="secondary">{entries.length}</Text>
                    </Flex>
                    {entries.map(({ block, plugin }) => (
                      <Card key={block.id} size="small" title={plugin?.title ?? `Неизвестный плагин: ${block.pluginId}`}>
                        {renderBlockEditor(block.id, block.pluginId, plugin)}
                      </Card>
                    ))}
                  </Flex>
                ))}
              </Flex>
            ) : (
              <Tabs items={tabs} />
            ) : <Text type="secondary">У выбранного процесса пока нет блоков задачи.</Text>}
          </Card>

          <Collapse
            size="small"
            items={[{
              key: 'agent-commands',
              label: 'Команды для агента',
              children: (
                <Flex vertical gap="small">
                  <Input.TextArea
                    aria-label="Изменения для команды исправления"
                    autoSize={{ minRows: 1, maxRows: 3 }}
                    onChange={(event) => setEditDraft({ taskKey, value: event.target.value })}
                    placeholder="Что нужно изменить?"
                    value={editContext}
                  />
                  <Flex justify="space-between" align="center" gap="small" wrap="wrap">
                    <Text type="secondary">Скопировать команду или контекст задачи</Text>
                    <Space wrap size="small">
                      <Button size="small" onClick={() => void copyPrompt('/taskmill update', 'Команда обновления')}>
                        Обновить
                      </Button>
                      <Button
                        size="small"
                        disabled={!editContext.trim()}
                        onClick={() => void copyPrompt(`/taskmill edit ${editContext.trim()}`, 'Команда исправления')}
                        type="primary"
                      >
                        Исправить
                      </Button>
                      <Button size="small" onClick={() => void copyPrompt(taskContext, 'Контекст задачи')}>
                        Контекст
                      </Button>
                    </Space>
                  </Flex>
                </Flex>
              ),
            }]}
          />
        </Flex>

        <Card size="small" title="Контекст проекта">
          <ProjectContext project={project} />
        </Card>
      </Flex>
    </main>
  )
}
