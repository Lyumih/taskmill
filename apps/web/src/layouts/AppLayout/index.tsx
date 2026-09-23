import type { PropsWithChildren } from 'react'
import { AppstoreOutlined } from '@ant-design/icons'
import { Avatar, Flex, Layout, Menu, Tag, Typography } from 'antd'

const { Content, Header, Sider } = Layout
const { Text } = Typography

type AppLayoutProps = PropsWithChildren

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <Layout>
      <Sider
        breakpoint="md"
        collapsedWidth={0}
        theme="light"
        trigger={null}
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

          <Menu
            mode="inline"
            selectedKeys={['overview']}
            items={[
              {
                key: 'overview',
                icon: <AppstoreOutlined />,
                label: 'Обзор',
              },
            ]}
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
        <Header style={{ display: 'flex' }}>
          <Flex align="center" justify="space-between" gap={16}>
            <Text>Taskmill / Обзор</Text>
            <Tag>Папка не подключена</Tag>
          </Flex>
        </Header>
        <Content style={{ padding: 16}}>{children}</Content>
      </Layout>
    </Layout>
  )
}
