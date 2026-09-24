import {
  BranchesOutlined,
  CalendarOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  RobotOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import { useState } from 'react'
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Collapse,
  Flex,
  Input,
  message,
  Progress,
  Row,
  Select,
  Space,
  Steps,
  Statistic,
  Tag,
  Typography,
} from 'antd'
import { AgentPlan } from '../../components/AgentPlan'
import { ApiErrorHandling } from '../../components/ApiErrorHandling'
import { ExpectedComponents } from '../../components/ExpectedComponents'
import { PermissionsFlags } from '../../components/PermissionsFlags'
import { PluginFieldsEditor } from '../../components/PluginFieldsEditor'
import { ProjectContext } from '../../components/ProjectContext'
import { getPluginDefinition, getPluginDefaultValues, mergePluginValues } from '../../plugins'
import type { PluginFieldValue } from '../../plugins/types'
import type { Project } from '../../types/project'
import type { TaskData } from '../../types/task'
import { buildTaskContext } from '../../utils/buildTaskContext'

const { Paragraph, Text, Title } = Typography
const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

function formatDate(value?: string) {
  if (!value) return '—'

  return dateFormatter.format(new Date(`${value}T00:00:00`))
}

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

  const selectProcess = (processId: string) => {
    const nextProcess = project.processes.find((item) => item.id === processId)
    if (!nextProcess) return
    onUpdateTask({
      processId,
      type: nextProcess.taskType,
      workflow: {
        name: nextProcess.name,
        currentStep: 1,
        totalSteps: nextProcess.stages.length,
        questions: [],
      },
    })
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

  const workflow = task.workflow
  const taskContext = buildTaskContext(project, task)

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
                current={Math.max(0, Math.min((task.workflow?.currentStep ?? 1) - 1, process.stages.length - 1))}
                items={process.stages.map((stage) => ({ title: stage.title, description: stage.detail }))}
              />
              <Flex vertical gap="middle">
                {process.blocks.filter((block) => block.enabled).map((block) => {
                  const plugin = getPluginDefinition(block.pluginId)
                  const projectPlugin = project.plugins.find((item) => item.pluginId === block.pluginId)
                  if (!plugin) return <Alert key={block.id} type="error" showIcon message={`Плагин ${block.pluginId} не найден`} />
                  if (!projectPlugin?.enabled) {
                    return <Alert key={block.id} type="warning" showIcon message={`${plugin.title} выключен в настройках проекта`} />
                  }

                  return (
                    <Card key={block.id} size="small" title={plugin.title}>
                      <PluginFieldsEditor
                        plugin={plugin}
                        values={mergePluginValues(
                          projectPlugin.values ?? getPluginDefaultValues(plugin.id),
                          task.pluginData?.[process.id]?.[block.id],
                        )}
                        onChange={(fieldId, value) => updatePluginValue(process.id, block.id, fieldId, value)}
                      />
                    </Card>
                  )
                })}
                {!process.blocks.some((block) => block.enabled) && <Text type="secondary">В выбранном процессе нет активных блоков.</Text>}
              </Flex>
            </Flex>
          ) : (
            <Text type="secondary">Выберите один из процессов проекта, чтобы заполнить его блоки.</Text>
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

        <Row gutter={[16, 16]}>
          <Col xs={24} xl={16}>
            <Flex vertical gap="large">
              <AgentPlan plan={task.plan} />
              <ExpectedComponents estimate={task.expectedComponents} />
              <ApiErrorHandling requests={task.apiRequests} />
              <PermissionsFlags rules={task.permissionsFlags} />

              <Collapse
                defaultActiveKey={['workflow', 'references', 'changes']}
                items={[
                  {
                    key: 'workflow',
                    label: `Workflow${workflow?.name ? `: ${workflow.name}` : ''}`,
                    extra: workflow?.currentStep !== undefined && workflow.totalSteps !== undefined && (
                      <Tag color="processing">
                        Шаг {workflow.currentStep} из {workflow.totalSteps}
                      </Tag>
                    ),
                    children: (
                      <Flex vertical gap="middle">
                        {workflow?.currentStep !== undefined && workflow.totalSteps ? (
                          <Progress
                            percent={Math.round((workflow.currentStep / workflow.totalSteps) * 100)}
                            size="small"
                          />
                        ) : null}
                        {workflow?.questions?.length ? workflow.questions.map((item, index) => (
                          <Card key={item.question ?? `question-${index}`} size="small">
                            <Flex align="flex-start" justify="space-between" gap="middle" wrap="wrap">
                              <Flex vertical>
                                <Text strong>{item.question ?? 'Вопрос без названия'}</Text>
                                {item.answer && <Text type="secondary">{item.answer}</Text>}
                              </Flex>
                              {item.status === 'answered' ? (
                                <Tag color="success">Отвечено</Tag>
                              ) : item.status === 'current' ? (
                                <Tag color="processing">Текущий вопрос</Tag>
                              ) : null}
                            </Flex>
                          </Card>
                        )) : <Text type="secondary">Вопросы workflow пока не добавлены.</Text>}
                      </Flex>
                    ),
                  },
                  {
                    key: 'references',
                    label: 'Связанные источники',
                    children: (
                      <Flex vertical gap="middle">
                        {task.references?.length ? task.references.map((reference, index) => (
                          <Flex key={reference.name ?? `reference-${index}`} justify="space-between" gap="middle" wrap="wrap">
                            <Text type="secondary">{reference.name ?? 'Источник'}</Text>
                            <Text strong>{reference.value ?? '—'}</Text>
                          </Flex>
                        )) : <Text type="secondary">Источники пока не добавлены.</Text>}
                      </Flex>
                    ),
                  },
                  {
                    key: 'changes',
                    label: 'Изменения в ветке',
                    children: (
                      <Flex vertical gap="middle">
                        <Row gutter={[16, 16]}>
                          <Col span={12}><Statistic title="Файлов добавлено" value={task.changes?.filesAdded ?? '—'} /></Col>
                          <Col span={12}><Statistic title="Файлов изменено" value={task.changes?.filesChanged ?? '—'} /></Col>
                          <Col span={12}><Statistic title="Компонентов" value={task.changes?.componentsAdded ?? '—'} /></Col>
                          <Col span={12}><Statistic title="Стилей" value={task.changes?.stylesAdded ?? '—'} /></Col>
                        </Row>
                        {task.changes?.files?.length ? (
                          <Flex vertical gap="small">
                            {task.changes.files.map((file, index) => (
                              <Flex key={file.path ?? `file-${index}`} align="flex-start" gap="small">
                                <FileTextOutlined />
                                <Flex vertical>
                                  {file.path && <Text code>{file.path}</Text>}
                                  {file.change && <Text type="secondary">{file.change}</Text>}
                                </Flex>
                              </Flex>
                            ))}
                          </Flex>
                        ) : <Text type="secondary">Файлы пока не изменялись.</Text>}
                      </Flex>
                    ),
                  },
                ]}
              />
            </Flex>
          </Col>

          <Col xs={24} xl={8}>
            <Flex vertical gap="large">
              <ProjectContext project={project} />

              <Collapse
                defaultActiveKey={['estimates', 'agents', 'dates', 'feedback']}
                items={[
                  {
                    key: 'estimates',
                    label: 'Оценка времени',
                    children: (
                      <Row gutter={[16, 16]}>
                        <Col span={12}>
                          <Statistic title="Jira" value={task.estimates?.jiraHours ?? '—'} suffix={task.estimates?.jiraHours !== undefined ? 'ч' : undefined} />
                        </Col>
                        <Col span={12}>
                          <Statistic title="Оценка ИИ" value={task.estimates?.aiHours ?? '—'} suffix={task.estimates?.aiHours !== undefined ? 'ч' : undefined} />
                        </Col>
                        <Col span={12}>
                          <Statistic title="Фактически" value={task.estimates?.spentHours ?? '—'} suffix={task.estimates?.spentHours !== undefined ? 'ч' : undefined} />
                        </Col>
                        <Col span={12}>
                          <Flex vertical>
                            <Text type="secondary">Диапазон ИИ</Text>
                            <Text strong>{task.estimates?.aiRange ?? '—'}</Text>
                          </Flex>
                        </Col>
                      </Row>
                    ),
                  },
                  {
                    key: 'agents',
                    label: 'Агенты',
                    children: (
                      <Flex vertical gap="middle">
                        {task.agents?.length ? task.agents.map((agent, index) => (
                          <Flex key={agent.name ?? `agent-${index}`} align="flex-start" gap="middle">
                            <Avatar icon={<RobotOutlined />} />
                            <Flex flex={1} vertical>
                              <Flex justify="space-between" gap="small" wrap="wrap">
                                <Text strong>{agent.name ?? 'Агент'}</Text>
                                {agent.status && (
                                  <Tag color={agent.status === 'Завершён' ? 'success' : agent.status === 'В работе' ? 'processing' : 'default'}>
                                    {agent.status}
                                  </Tag>
                                )}
                              </Flex>
                              {agent.role && <Text type="secondary">{agent.role}</Text>}
                              {agent.result && <Text>{agent.result}</Text>}
                            </Flex>
                          </Flex>
                        )) : <Text type="secondary">Агенты пока не назначены.</Text>}
                      </Flex>
                    ),
                  },
                  {
                    key: 'dates',
                    label: 'Сроки',
                    children: (
                      <Flex vertical gap="middle">
                        {task.startedAt && (
                          <Flex justify="space-between" gap="middle">
                            <Text type="secondary"><CalendarOutlined /> Начало</Text>
                            <Text>{formatDate(task.startedAt)}</Text>
                          </Flex>
                        )}
                        {task.expiresAt && (
                          <Flex justify="space-between" gap="middle">
                            <Text type="secondary"><ClockCircleOutlined /> Пересмотреть после</Text>
                            <Text>{formatDate(task.expiresAt)}</Text>
                          </Flex>
                        )}
                        {task.lastActivityAt && (
                          <Flex justify="space-between" gap="middle">
                            <Text type="secondary">Последняя активность</Text>
                            <Text>{formatDate(task.lastActivityAt)}</Text>
                          </Flex>
                        )}
                        {!task.startedAt && !task.expiresAt && !task.lastActivityAt && (
                          <Text type="secondary">Даты ещё не указаны.</Text>
                        )}
                      </Flex>
                    ),
                  },
                  {
                    key: 'feedback',
                    label: task.feedback?.summary ?? 'Обратная связь',
                    children: (
                      <Flex vertical gap="middle">
                        {task.feedback?.items?.length ? task.feedback.items.map((item, index) => (
                          <Text key={item ?? `feedback-${index}`}>{item}</Text>
                        )) : <Text type="secondary">Обратной связи пока нет.</Text>}
                        <Button disabled>Отправить обратную связь</Button>
                      </Flex>
                    ),
                  },
                ]}
              />
            </Flex>
          </Col>
        </Row>
      </Flex>
    </main>
  )
}
