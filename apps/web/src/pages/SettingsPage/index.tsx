import { useState } from 'react'
import { CheckCircleOutlined, RobotOutlined, SettingOutlined } from '@ant-design/icons'
import {
  Alert,
  Button,
  Card,
  Col,
  Flex,
  Input,
  InputNumber,
  message,
  Row,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
} from 'antd'
import type { MockProject } from '../../../mock'

const { Text, Title } = Typography

type SettingsPageProps = {
  project: MockProject
}

export function SettingsPage({ project }: SettingsPageProps) {
  const [branch, setBranch] = useState('main')
  const [agentModel, setAgentModel] = useState('Claude Sonnet 4.5')
  const [parallelAgents, setParallelAgents] = useState(2)
  const [requireReview, setRequireReview] = useState(true)
  const [allowFileChanges, setAllowFileChanges] = useState(true)
  const [allowTestRuns, setAllowTestRuns] = useState(true)
  const [allowNetwork, setAllowNetwork] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()

  const saveSettings = () => messageApi.success('Настройки сохранены в локальном прототипе')

  return (
    <main>
      {contextHolder}
      <Flex vertical gap="large">
        <Flex align="flex-start" justify="space-between" gap="middle" wrap="wrap">
          <Flex vertical gap="small">
            <Title level={2} style={{ margin: 0 }}>Настройки проекта</Title>
            <Text type="secondary">Управляйте окружением и правилами работы агентов для {project.name}.</Text>
          </Flex>
          <Button type="primary" onClick={saveSettings}>Сохранить изменения</Button>
        </Flex>

        <Alert
          message="Это демонстрационная конфигурация"
          description="Изменения пока хранятся только в состоянии страницы и не записываются в файлы проекта."
          showIcon
          type="info"
        />

        <Row gutter={[16, 16]}>
          <Col xs={24} xl={12}>
            <Card title={<Space><SettingOutlined /><span>Общие</span></Space>}>
              <Flex vertical gap="middle">
                <Flex vertical gap="small">
                  <Text strong>Название проекта</Text>
                  <Input aria-label="Название проекта" value={project.name} readOnly />
                </Flex>
                <Flex vertical gap="small">
                  <Text strong>Рабочая папка</Text>
                  <Input aria-label="Рабочая папка" value={project.mockData.directory} readOnly />
                </Flex>
                <Flex vertical gap="small">
                  <Text strong>Основная ветка</Text>
                  <Select
                    aria-label="Основная ветка"
                    value={branch}
                    onChange={setBranch}
                    options={[
                      { value: 'main', label: 'main' },
                      { value: 'develop', label: 'develop' },
                    ]}
                  />
                </Flex>
              </Flex>
            </Card>
          </Col>

          <Col xs={24} xl={12}>
            <Card title={<Space><RobotOutlined /><span>Рабочая среда агента</span></Space>}>
              <Flex vertical gap="middle">
                <Flex vertical gap="small">
                  <Text strong>Модель по умолчанию</Text>
                  <Select
                    aria-label="Модель по умолчанию"
                    value={agentModel}
                    onChange={setAgentModel}
                    options={[
                      { value: 'Claude Sonnet 4.5', label: 'Claude Sonnet 4.5' },
                      { value: 'GPT-5', label: 'GPT-5' },
                      { value: 'Локальная модель', label: 'Локальная модель' },
                    ]}
                  />
                </Flex>
                <Flex align="center" justify="space-between" gap="middle" wrap="wrap">
                  <Flex vertical>
                    <Text strong>Параллельные агенты</Text>
                    <Text type="secondary">Максимум одновременно активных агентов</Text>
                  </Flex>
                  <InputNumber
                    aria-label="Максимум параллельных агентов"
                    min={1}
                    max={8}
                    value={parallelAgents}
                    onChange={(value) => setParallelAgents(value ?? 1)}
                  />
                </Flex>
                <Flex align="center" justify="space-between" gap="middle">
                  <Flex vertical>
                    <Text strong>Проверка перед завершением</Text>
                    <Text type="secondary">Агент должен проверить результат перед передачей</Text>
                  </Flex>
                  <Switch aria-label="Требовать проверку перед завершением" checked={requireReview} onChange={setRequireReview} />
                </Flex>
              </Flex>
            </Card>
          </Col>

          <Col xs={24} xl={12}>
            <Card title="Разрешения агента">
              <Flex vertical gap="middle">
                {[
                  { title: 'Изменять файлы проекта', detail: 'Создание и редактирование файлов в рабочей папке', checked: allowFileChanges, onChange: setAllowFileChanges },
                  { title: 'Запускать тесты и команды', detail: 'Выполнение настроенных проверок проекта', checked: allowTestRuns, onChange: setAllowTestRuns },
                  { title: 'Использовать сеть', detail: 'Доступ к внешним ресурсам и API', checked: allowNetwork, onChange: setAllowNetwork },
                ].map((permission) => (
                  <Flex key={permission.title} align="center" justify="space-between" gap="middle">
                    <Flex vertical>
                      <Text strong>{permission.title}</Text>
                      <Text type="secondary">{permission.detail}</Text>
                    </Flex>
                    <Switch aria-label={permission.title} checked={permission.checked} onChange={permission.onChange} />
                  </Flex>
                ))}
              </Flex>
            </Card>
          </Col>

          <Col xs={24} xl={12}>
            <Card title="Подключения">
              <Flex vertical gap="middle">
                <Flex align="center" justify="space-between" gap="middle" wrap="wrap">
                  <Flex vertical>
                    <Text strong>Jira</Text>
                    <Text type="secondary">Задачи, статусы и оценки</Text>
                  </Flex>
                  <Tag color="default">Не подключена</Tag>
                </Flex>
                <Flex align="center" justify="space-between" gap="middle" wrap="wrap">
                  <Flex vertical>
                    <Text strong>Git</Text>
                    <Text type="secondary">Ветки и история изменений</Text>
                  </Flex>
                  <Tag color="processing">Локальный режим</Tag>
                </Flex>
                <Flex align="center" gap="small">
                  <CheckCircleOutlined />
                  <Text type="secondary">Управление секретами будет доступно после подключения сервера.</Text>
                </Flex>
              </Flex>
            </Card>
          </Col>
        </Row>
      </Flex>
    </main>
  )
}
