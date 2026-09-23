import { Collapse, Flex, Statistic, Tag, Typography } from 'antd'
import type { MockProject } from '../../../mock'

const { Text } = Typography

type ProjectContextProps = {
  project: MockProject
}

export function ProjectContext({ project }: ProjectContextProps) {
  const { analytics, mockData, server, testing } = project

  return (
    <Collapse
      defaultActiveKey={['analytics', 'testing', 'mock-data', 'server']}
      items={[
        {
          key: 'analytics',
          label: 'Matomo (Аналитика)',
          extra: (
            <Tag color={analytics.state === 'mock' ? 'gold' : 'default'}>
              {analytics.state === 'mock' ? 'Демо-данные' : 'Не подключена'}
            </Tag>
          ),
          children: (
            <Flex vertical gap="middle">
              <Text type="secondary">Источник: {analytics.provider}</Text>
              {analytics.period && <Text>Период: {analytics.period}</Text>}
              {analytics.visits !== undefined ? (
                <Statistic title="Визиты" value={analytics.visits} />
              ) : (
                <Text type="secondary">Метрики пока недоступны.</Text>
              )}
              <Text type="secondary">{analytics.note}</Text>
            </Flex>
          ),
        },
        {
          key: 'testing',
          label: 'Тестирование',
          children: (
            <Flex vertical gap="middle">
              {testing.checks.map((check, index) => (
                <Flex key={`${check.name}-${index}`} vertical gap="small">
                  <Flex align="center" gap="small" wrap="wrap">
                    <Text strong>{check.name}</Text>
                    <Tag color={check.state === 'passed' ? 'success' : 'default'}>
                      {check.state === 'passed' ? 'Пройдено' : check.state === 'notConfigured' ? 'Не настроено' : 'Не запускалось'}
                    </Tag>
                  </Flex>
                  {check.command && <Text code>{check.command}</Text>}
                  <Text type="secondary">{check.details}</Text>
                </Flex>
              ))}
            </Flex>
          ),
        },
        {
          key: 'mock-data',
          label: 'Моковые данные',
          children: (
            <Flex vertical gap="middle">
              <Flex justify="space-between" gap="middle" wrap="wrap">
                <Text type="secondary">Каталог</Text>
                <Text code>{mockData.directory}</Text>
              </Flex>
              <Flex justify="space-between" gap="middle" wrap="wrap">
                <Text type="secondary">Задач в проекте</Text>
                <Text strong>{project.tasks.length}</Text>
              </Flex>
              <Text type="secondary">{mockData.note}</Text>
              <Flex vertical gap="small">
                {project.tasks.map((task, index) => (
                  <Flex key={task.id ?? `mock-task-${index}`} gap="small">
                    <Tag>{task.id ?? '—'}</Tag>
                    <Text>{task.title ?? 'Задача без названия'}</Text>
                  </Flex>
                ))}
              </Flex>
            </Flex>
          ),
        },
        {
          key: 'server',
          label: 'Сервер',
          extra: <Tag>Не реализован</Tag>,
          children: (
            <Flex vertical gap="middle">
              <Text>{server.description}</Text>
              <Text strong>Планируемые обязанности</Text>
              {server.plannedResponsibilities.map((responsibility, index) => (
                <Text key={`server-responsibility-${index}`}>• {responsibility}</Text>
              ))}
            </Flex>
          ),
        },
      ]}
    />
  )
}
