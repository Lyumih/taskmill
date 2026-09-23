import {
  BranchesOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  RobotOutlined,
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Flex,
  Progress,
  Row,
  Space,
  Spin,
  Statistic,
  Tag,
  Typography,
} from 'antd'
import { taskMock } from '../../../mock/0001'

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

export function OverviewPage() {
  const taskQuery = useQuery({
    queryKey: ['task', taskMock.id],
    queryFn: async () => taskMock,
  })

  if (taskQuery.isPending) {
    return <Flex justify="center"><Spin size="large" /></Flex>
  }

  if (taskQuery.isError) {
    return <Alert message="Не удалось загрузить задачу" type="error" />
  }

  const task = taskQuery.data

  return (
    <main>
      <Flex vertical gap="large">
        <Card>
          <Flex vertical gap="middle">
            <Flex align="center" justify="space-between" wrap="wrap">
              <Space wrap>
                <Text type="secondary">Задача {task.id ?? '—'}</Text>
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
              <Card
                title="План агента"
                extra={task.plan?.progress !== undefined && (
                  <Progress percent={task.plan.progress} size="small" />
                )}
              >
                <Flex vertical gap="middle">
                  {task.plan?.summary && <Paragraph>{task.plan.summary}</Paragraph>}
                  {task.plan?.steps?.length ? task.plan.steps.map((step, index) => (
                    <Flex key={step.title ?? `step-${index}`} align="flex-start" gap="middle">
                      <Avatar size="small">{index + 1}</Avatar>
                      <Flex flex={1} justify="space-between" wrap="wrap" gap="small">
                        <Flex vertical>
                          <Text strong>{step.title ?? 'Шаг без названия'}</Text>
                          {step.detail && <Text type="secondary">{step.detail}</Text>}
                        </Flex>
                        {step.status === 'done' ? (
                          <Tag color="success" icon={<CheckCircleOutlined />}>Готово</Tag>
                        ) : step.status === 'inProgress' ? (
                          <Tag color="processing" icon={<ClockCircleOutlined />}>В работе</Tag>
                        ) : step.status === 'pending' ? (
                          <Tag>В очереди</Tag>
                        ) : null}
                      </Flex>
                    </Flex>
                  )) : <Text type="secondary">План пока не добавлен.</Text>}
                </Flex>
              </Card>

              <Card
                title={`Workflow${task.workflow?.name ? `: ${task.workflow.name}` : ''}`}
                extra={task.workflow?.currentStep !== undefined && task.workflow.totalSteps !== undefined && (
                  <Tag color="processing">
                    Шаг {task.workflow.currentStep} из {task.workflow.totalSteps}
                  </Tag>
                )}
              >
                <Flex vertical gap="middle">
                  {task.workflow?.currentStep !== undefined && task.workflow.totalSteps ? (
                    <Progress
                      percent={Math.round((task.workflow.currentStep / task.workflow.totalSteps) * 100)}
                      size="small"
                    />
                  ) : null}
                  {task.workflow?.questions?.length ? task.workflow.questions.map((item, index) => (
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
                  )) : <Text type="secondary">Workflow пока не добавлен.</Text>}
                </Flex>
              </Card>

              <Card title="Связанные источники">
                <Flex vertical gap="middle">
                  {task.references?.length ? task.references.map((reference, index) => (
                    <Flex key={reference.name ?? `reference-${index}`} justify="space-between" gap="middle" wrap="wrap">
                      <Text type="secondary">{reference.name ?? 'Источник'}</Text>
                      <Text strong>{reference.value ?? '—'}</Text>
                    </Flex>
                  )) : <Text type="secondary">Источники пока не добавлены.</Text>}
                </Flex>
              </Card>
            </Flex>
          </Col>

          <Col xs={24} xl={8}>
            <Flex vertical gap="large">
              <Card title="Оценка времени">
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
              </Card>

              <Card title="Изменения в ветке">
                <Row gutter={[16, 16]}>
                  <Col span={12}><Statistic title="Файлов добавлено" value={task.changes?.filesAdded ?? '—'} /></Col>
                  <Col span={12}><Statistic title="Файлов изменено" value={task.changes?.filesChanged ?? '—'} /></Col>
                  <Col span={12}><Statistic title="Компонентов" value={task.changes?.componentsAdded ?? '—'} /></Col>
                  <Col span={12}><Statistic title="Стилей" value={task.changes?.stylesAdded ?? '—'} /></Col>
                </Row>
                <Flex vertical gap="small">
                  {task.changes?.files?.map((file, index) => (
                    <Flex key={file.path ?? `file-${index}`} align="flex-start" gap="small">
                      <FileTextOutlined />
                      <Flex vertical>
                        {file.path && <Text code>{file.path}</Text>}
                        {file.change && <Text type="secondary">{file.change}</Text>}
                      </Flex>
                    </Flex>
                  ))}
                </Flex>
              </Card>

              <Card title="Агенты">
                <Flex vertical gap="middle">
                  {task.agents?.map((agent, index) => (
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
                  ))}
                </Flex>
              </Card>

              <Card title="Сроки">
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
              </Card>

              <Card title={task.feedback?.summary ?? 'Обратная связь'}>
                <Flex vertical gap="middle">
                  {task.feedback?.items?.length ? task.feedback.items.map((item, index) => (
                    <Text key={item ?? `feedback-${index}`}>{item}</Text>
                  )) : <Text type="secondary">Обратной связи пока нет.</Text>}
                  <Button disabled>Отправить обратную связь</Button>
                </Flex>
              </Card>
            </Flex>
          </Col>
        </Row>
      </Flex>
    </main>
  )
}
