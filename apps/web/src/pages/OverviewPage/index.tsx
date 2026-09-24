import { BranchesOutlined, FolderOpenOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { Alert, Button, Card, Collapse, Flex, Input, message, Select, Space, Steps, Tag, Typography } from 'antd'
import { PluginFieldsEditor } from '../../components/PluginFieldsEditor'
import { PluginFieldsView } from '../../components/PluginFieldsView'
import { ProjectContext } from '../../components/ProjectContext'
import { getPluginDefinition, getPluginDefaultValues, mergePluginValues } from '../../plugins'
import type { PluginFieldValue } from '../../plugins/types'
import type { Project } from '../../types/project'
import type { TaskData } from '../../types/task'
import { buildTaskContext } from '../../utils/buildTaskContext'

const { Paragraph, Text, Title } = Typography

type OverviewPageProps = {
  project: Project
  projectId: string
  taskId: string
  task: TaskData
  onUpdateTask: (patch: Partial<TaskData>) => void
}

export function OverviewPage({ project, projectId, taskId, task, onUpdateTask }: OverviewPageProps) {
  const taskKey = `${projectId}:${taskId}`
  const [editDraft, setEditDraft] = useState({ taskKey, value: '' })
  const [messageApi, contextHolder] = message.useMessage()
  const editContext = editDraft.taskKey === taskKey ? editDraft.value : ''
  const process = project.processes.find((item) => item.id === task.processId)
  const workflowBlock = process?.blocks.find((block) => block.pluginId === 'task-workflow' && block.enabled)
  const workflowValues = workflowBlock
    ? mergePluginValues(
        project.plugins.find((item) => item.pluginId === workflowBlock.pluginId)?.values ?? getPluginDefaultValues(workflowBlock.pluginId),
        task.pluginData?.[process?.id ?? '']?.[workflowBlock.id],
      )
    : undefined
  const currentStep = typeof workflowValues?.currentStep === 'number' ? workflowValues.currentStep : 1
  const taskContext = buildTaskContext(project, task)

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

  const copyPrompt = async (prompt: string, description: string) => {
    try {
      await navigator.clipboard.writeText(prompt)
      messageApi.success(`${description} скопирован в буфер обмена`)
    } catch {
      messageApi.error('Не удалось скопировать текст. Проверьте разрешение браузера на буфер обмена.')
    }
  }

  const processBlocks = process?.blocks.filter((block) => block.enabled && !getPluginDefinition(block.pluginId)?.projectView) ?? []

  return (
    <main>
      {contextHolder}
      <Flex vertical gap="large">
        <Card
          title="Процесс задачи"
          extra={(
            <Select
              aria-label="Выбрать процесс для задачи"
              placeholder="Выберите процесс"
              value={process?.id}
              options={project.processes.map((item) => ({
                value: item.id,
                label: `${item.name}${item.placeholder ? ' · заглушка' : ''}`,
                disabled: !item.enabled,
              }))}
              onChange={selectProcess}
              style={{ minWidth: 220 }}
            />
          )}
        >
          {process ? (
            <Flex vertical gap="middle">
              <Flex align="center" gap="small" wrap="wrap">
                <Text strong>{process.name}</Text>
                <Tag>{process.taskType}</Tag>
                {process.placeholder && <Tag color="warning">Процесс пока заглушка</Tag>}
                <Text type="secondary">{process.summary}</Text>
              </Flex>
              <Steps
                size="small"
                current={Math.max(0, Math.min(currentStep - 1, process.stages.length - 1))}
                items={process.stages.map((stage) => ({ title: stage.title, description: stage.detail }))}
              />
              <Card size="small" title="Блоки процесса">
                {processBlocks.length ? (
                  <Collapse
                    items={processBlocks.map((block) => {
                      const plugin = getPluginDefinition(block.pluginId)
                      const projectPlugin = project.plugins.find((item) => item.pluginId === block.pluginId)
                      return {
                        key: block.id,
                        label: plugin?.title ?? `Неизвестный плагин: ${block.pluginId}`,
                        children: !plugin ? (
                          <Alert type="error" showIcon message={`Плагин ${block.pluginId} не найден`} />
                        ) : !projectPlugin?.enabled ? (
                          <Alert type="warning" showIcon message={`${plugin.title} выключен в настройках проекта`} />
                        ) : plugin.projectView ? (
                          <PluginFieldsView plugin={plugin} values={projectPlugin.values} />
                        ) : (
                          <PluginFieldsEditor
                            plugin={plugin}
                            values={mergePluginValues(
                              projectPlugin.values ?? getPluginDefaultValues(plugin.id),
                              task.pluginData?.[process.id]?.[block.id],
                            )}
                            onChange={(fieldId, value) => updatePluginValue(process.id, block.id, fieldId, value)}
                          />
                        ),
                      }
                    })}
                  />
                ) : <Text type="secondary">В выбранном процессе пока нет активных блоков.</Text>}
              </Card>
            </Flex>
          ) : (
            <Text type="secondary">Выберите один из процессов проекта, чтобы увидеть его этапы и блоки.</Text>
          )}
        </Card>

        <Card title="Команды для агента">
          <Flex vertical gap="middle">
            <Space wrap>
              <Button onClick={() => void copyPrompt('/taskmill update', 'Команда обновления')}>
                Обновить
              </Button>
              <Button
                disabled={!editContext.trim()}
                onClick={() => void copyPrompt(`/taskmill edit ${editContext.trim()}`, 'Команда исправления')}
                type="primary"
              >
                Исправить
              </Button>
              <Button onClick={() => void copyPrompt(taskContext, 'Контекст задачи')}>
                Скопировать контекст
              </Button>
            </Space>
            <Flex vertical gap="small">
              <Text strong>Изменения для агента</Text>
              <Input.TextArea
                aria-label="Изменения для команды исправления"
                autoSize={{ minRows: 2, maxRows: 6 }}
                onChange={(event) => setEditDraft({ taskKey, value: event.target.value })}
                placeholder="Опишите, что нужно изменить в задаче или проекте. Затем нажмите «Исправить»."
                value={editContext}
              />
            </Flex>
          </Flex>
        </Card>

        <Card>
          <Flex vertical gap="middle">
            <Flex align="center" justify="space-between" wrap="wrap">
              <Space wrap>
                <Text type="secondary">{project.name} / задача {task.id ?? '—'}</Text>
                <Tag color="gold">Демонстрационные данные</Tag>
              </Space>
              <Space wrap>
                {task.status && <Tag color="processing">{task.status}</Tag>}
                {task.type && <Tag color="blue">{task.type}</Tag>}
                {task.priority && <Tag color="volcano">{task.priority}</Tag>}
              </Space>
            </Flex>

            <Title level={2}>{task.title ?? 'Новая задача'}</Title>
            {task.description && <Paragraph>{task.description}</Paragraph>}

            <Space wrap>
              {task.project?.name && <Text><FolderOpenOutlined /> {task.project.name}</Text>}
              {task.project?.branch && <Text><BranchesOutlined /> {task.project.branch}</Text>}
              {task.project?.rootPath && <Text type="secondary">{task.project.rootPath}</Text>}
            </Space>
          </Flex>
        </Card>

        <ProjectContext project={project} />
      </Flex>
    </main>
  )
}
