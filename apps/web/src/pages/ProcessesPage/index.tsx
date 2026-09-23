import { useState } from 'react'
import { BranchesOutlined, PlusOutlined, RobotOutlined } from '@ant-design/icons'
import {
  Button,
  Card,
  Flex,
  Form,
  Input,
  Modal,
  Steps,
  Switch,
  Tabs,
  Tag,
  Typography,
} from 'antd'
import type { MockProject } from '../../../mock'

const { Text, Title } = Typography
const { TextArea } = Input

type WorkflowStage = {
  title: string
  detail: string
  status: 'done' | 'current' | 'pending'
}

type Workflow = {
  key: string
  name: string
  summary: string
  trigger: string
  agent: string
  enabled: boolean
  stages: WorkflowStage[]
}

type ProcessesPageProps = {
  project: MockProject
}

const initialWorkflows: Workflow[] = [
  {
    key: 'feature',
    name: 'Новая функция',
    summary: 'От идеи до готового изменения с проверкой результата.',
    trigger: 'Тип задачи: Feature',
    agent: 'Feature Agent',
    enabled: true,
    stages: [
      { title: 'Разобрать требования', detail: 'Уточнить цель, ограничения и критерии приёмки.', status: 'done' },
      { title: 'Составить план', detail: 'Определить затрагиваемые модули и последовательность изменений.', status: 'current' },
      { title: 'Реализовать', detail: 'Внести минимальные изменения и покрыть сценарии.', status: 'pending' },
      { title: 'Проверить и подготовить итог', detail: 'Запустить проверки, описать результат и риски.', status: 'pending' },
    ],
  },
  {
    key: 'bugfix',
    name: 'Исправление ошибки',
    summary: 'Сначала подтверждаем причину, затем исправляем и проверяем регрессию.',
    trigger: 'Тип задачи: Bugfix',
    agent: 'Bugfix Agent',
    enabled: true,
    stages: [
      { title: 'Воспроизвести проблему', detail: 'Зафиксировать входные условия и ожидаемое поведение.', status: 'done' },
      { title: 'Найти первопричину', detail: 'Проследить путь данных и локализовать источник ошибки.', status: 'current' },
      { title: 'Исправить и добавить проверку', detail: 'Закрыть причину, не маскируя симптом.', status: 'pending' },
      { title: 'Проверить регрессию', detail: 'Запустить тесты и подтвердить исходный сценарий.', status: 'pending' },
    ],
  },
  {
    key: 'review',
    name: 'Ревью изменений',
    summary: 'Независимая проверка логики, рисков и соответствия договорённостям.',
    trigger: 'Команда: /taskmill review',
    agent: 'Review Agent',
    enabled: true,
    stages: [
      { title: 'Изучить diff и контекст', detail: 'Сопоставить изменения с задачей и существующими контрактами.', status: 'done' },
      { title: 'Проверить риски', detail: 'Найти регрессии, ошибки данных и пробелы тестирования.', status: 'current' },
      { title: 'Сформировать замечания', detail: 'Приоритизировать находки и указать точное место проблемы.', status: 'pending' },
    ],
  },
]

export function ProcessesPage({ project }: ProcessesPageProps) {
  const [workflows, setWorkflows] = useState(initialWorkflows)
  const [activeKey, setActiveKey] = useState('feature')
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm<{ title: string; detail: string }>()
  const activeWorkflow = workflows.find((workflow) => workflow.key === activeKey) ?? workflows[0]

  const addStage = (values: { title: string; detail: string }) => {
    setWorkflows((current) => current.map((workflow) => workflow.key === activeKey
      ? { ...workflow, stages: [...workflow.stages, { ...values, status: 'pending' }] }
      : workflow))
    setModalOpen(false)
    form.resetFields()
  }

  if (!activeWorkflow) return null

  return (
    <main>
      <Flex vertical gap="large">
        <Flex align="flex-start" justify="space-between" gap="middle" wrap="wrap">
          <Flex vertical gap="small">
            <Title level={2} style={{ margin: 0 }}>Процессы агентов</Title>
            <Text type="secondary">Настройте этапы, по которым агенты выполняют задачи проекта {project.name}.</Text>
          </Flex>
          <Tag icon={<BranchesOutlined />} color="blue">3 процесса</Tag>
        </Flex>

        <Card>
          <Tabs
            activeKey={activeKey}
            onChange={setActiveKey}
            items={workflows.map((workflow) => ({
              key: workflow.key,
              label: workflow.name,
              children: (
                <Flex vertical gap="large">
                  <Flex align="flex-start" justify="space-between" gap="middle" wrap="wrap">
                    <Flex vertical gap="small">
                      <Flex align="center" gap="small" wrap="wrap">
                        <Title level={4} style={{ margin: 0 }}>{workflow.name}</Title>
                        <Tag color={workflow.enabled ? 'success' : 'default'}>{workflow.enabled ? 'Активен' : 'На паузе'}</Tag>
                      </Flex>
                      <Text type="secondary">{workflow.summary}</Text>
                    </Flex>
                    <Flex align="center" gap="small">
                      <Text>{workflow.enabled ? 'Включён' : 'Выключен'}</Text>
                      <Switch
                        aria-label={`Включить процесс «${workflow.name}»`}
                        checked={workflow.enabled}
                        onChange={(enabled) => setWorkflows((current) => current.map((item) => item.key === workflow.key ? { ...item, enabled } : item))}
                      />
                    </Flex>
                  </Flex>

                  <Flex gap="small" wrap="wrap">
                    <Tag>Запуск: {workflow.trigger}</Tag>
                    <Tag icon={<RobotOutlined />}>Агент: {workflow.agent}</Tag>
                    <Tag>{workflow.stages.length} этапа</Tag>
                  </Flex>

                  <Card size="small" title="Последовательность этапов" extra={<Button icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true) }}>Добавить этап</Button>}>
                    <Steps
                      orientation="vertical"
                      current={Math.max(0, workflow.stages.findIndex((stage) => stage.status === 'current'))}
                      items={workflow.stages.map((stage) => ({
                        title: stage.title,
                        description: stage.detail,
                        status: stage.status === 'done' ? 'finish' : stage.status === 'current' ? 'process' : 'wait',
                      }))}
                    />
                  </Card>

                  <Flex align="center" gap="small" wrap="wrap">
                    <Text type="secondary">Применяется к задачам в проекте {project.name}</Text>
                    <Tag color="processing">Демонстрационный сценарий</Tag>
                  </Flex>
                </Flex>
              ),
            }))}
          />
        </Card>
      </Flex>

      <Modal
        open={modalOpen}
        title={`Новый этап: ${activeWorkflow.name}`}
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
