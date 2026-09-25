import type { PropsWithChildren } from 'react'
import {
  AppstoreOutlined,
  BranchesOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { Avatar, Button, Flex, Layout, Menu, Select, Tag, Typography, Alert } from 'antd'
import type { Project } from '../../types/project'

const { Content, Header, Sider } = Layout
const { Text } = Typography

export type AppPage = 'task' | 'settings' | 'blocks' | 'processes'

type AppLayoutProps = PropsWithChildren<{
  projects: Project[]
  selectedProjectId: string
  selectedTaskId: string
  activePage: AppPage
  connected: boolean
  resumeAvailable: boolean
  connectionLoading: boolean
  saveStatus: 'idle' | 'pending' | 'saving' | 'saved' | 'error'
  workspaceError?: string
  onConnect: () => void
  onResume: () => void
  onRefresh: () => void
  onSelectProject: (projectId: string) => void
  onSelectTask: (taskId: string) => void
  onSelectPage: (page: AppPage) => void
}>

export function AppLayout({
  projects,
  selectedProjectId,
  selectedTaskId,
  activePage,
  connected,
  resumeAvailable,
  connectionLoading,
  saveStatus,
  workspaceError,
  onConnect,
  onResume,
  onRefresh,
  onSelectProject,
  onSelectTask,
  onSelectPage,
  children,
}: AppLayoutProps) {
  const selectedProject = projects.find((project) => project.id === selectedProjectId)
  const taskMenuItems = (selectedProject?.tasks ?? []).flatMap((task) => {
    if (!task.id) return []

    const title = task.title ?? `Задача ${task.id}`

    return [{
      key: `task:${task.id}`,
      icon: <FileTextOutlined />,
      label: (
        <Flex vertical>
          <Text ellipsis={{ tooltip: title }} strong>{title}</Text>
          <Text type="secondary">{task.status ?? 'Статус не указан'}</Text>
        </Flex>
      ),
    }]
  })

  return (
    <Layout>
      <Sider
        breakpoint="md"
        collapsedWidth={0}
        theme="light"
        width={248}
      >
        <Flex vertical gap="large">
          <Flex align="center" gap="middle">
            <Avatar shape="square" size={36}>
              T
            </Avatar>
            <Flex vertical>
              <Text strong>taskmill</Text>
              <Text ellipsis={{ tooltip: 'Рабочее пространство' }} type="secondary">
                Рабочее пространство
              </Text>
            </Flex>
          </Flex>

          <Flex vertical gap="small">
            <Text type="secondary">Проект</Text>
            <Select
              aria-label="Выбрать проект"
              value={selectedProjectId}
              options={projects.map((project) => ({
                value: project.id,
                label: project.name,
              }))}
              onChange={onSelectProject}
            />
          </Flex>

          <Menu
            mode="inline"
            selectedKeys={[activePage === 'task' ? `task:${selectedTaskId}` : activePage]}
            items={[
              {
                type: 'group',
                label: 'РАБОЧЕЕ ПРОСТРАНСТВО',
                children: [
                  { key: 'task', icon: <FileTextOutlined />, label: 'Разбор задачи', disabled: !taskMenuItems.length },
                ],
              },
              {
                type: 'group',
                label: 'НАСТРОЙКА ПРОЕКТА',
                children: [
                  { key: 'settings', icon: <SettingOutlined />, label: 'Настройки' },
                  { key: 'blocks', icon: <AppstoreOutlined />, label: 'Блоки' },
                  { key: 'processes', icon: <BranchesOutlined />, label: 'Процессы' },
                ],
              },
              {
                type: 'group',
                label: 'ЗАДАЧИ',
                children: taskMenuItems,
              },
            ]}
            onClick={({ key }) => {
              if (key.startsWith('task:')) {
                onSelectTask(key.slice('task:'.length))
                return
              }

              if (key === 'settings' || key === 'blocks' || key === 'processes') {
                onSelectPage(key)
                return
              }

              if (key === 'task') onSelectPage('task')
            }}
          />

          <Flex vertical gap="small">
            <Text strong>Локальный режим</Text>
            <Text type="secondary">
              Данные проекта будут читаться с этого компьютера.
            </Text>
          </Flex>
        </Flex>
      </Sider>

      <Layout>
        <Header style={{ display: 'flex', height: 'auto', minHeight: 64, paddingBlock: 12, paddingInline: 16 }}>
          <Flex align="center" justify="space-between" gap={16} wrap="wrap" style={{ width: '100%' }}>
            <Text>
              {selectedProject?.name ?? 'Проекты'} / {activePage === 'task' ? 'Разбор задачи' : activePage === 'settings' ? 'Настройки' : activePage === 'blocks' ? 'Блоки' : 'Процессы'}
            </Text>
            <Flex align="center" gap="small" wrap="wrap">
              <Tag color={connected ? 'success' : resumeAvailable ? 'warning' : 'default'}>
                {connected ? 'Папка .taskmill подключена' : resumeAvailable ? 'Папка сохранена, нужен доступ' : 'Папка не подключена'}
              </Tag>
              {connected && saveStatus !== 'idle' && (
                <Tag color={saveStatus === 'error' ? 'error' : saveStatus === 'saved' ? 'success' : 'processing'}>
                  {saveStatus === 'pending' ? 'Ожидает сохранения' : saveStatus === 'saving' ? 'Сохранение…' : saveStatus === 'saved' ? 'Сохранено' : 'Ошибка сохранения'}
                </Tag>
              )}
              {resumeAvailable && (
                <Button loading={connectionLoading} onClick={onResume}>
                  Возобновить доступ
                </Button>
              )}
              <Button icon={<FolderOpenOutlined />} loading={connectionLoading} onClick={onConnect}>
                {resumeAvailable ? 'Выбрать другую папку' : 'Выбрать .taskmill'}
              </Button>
              {connected && <Button icon={<ReloadOutlined />} onClick={onRefresh}>Обновить</Button>}
            </Flex>
          </Flex>
        </Header>
        <Content style={{ padding: 16 }}>
          <Flex vertical gap="middle">
            {workspaceError && <Alert type="error" showIcon message={workspaceError} />}
            {children}
          </Flex>
        </Content>
      </Layout>
    </Layout>
  )
}
