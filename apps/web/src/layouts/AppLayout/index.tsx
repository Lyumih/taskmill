import type { PropsWithChildren } from 'react'
import { AppstoreOutlined } from '@ant-design/icons'
import { Avatar, Flex, Layout, Menu, Tag, Typography } from 'antd'
import { createStyles } from 'antd-style'

const { Content, Header, Sider } = Layout
const { Text } = Typography

const useStyles = createStyles(({ token, css }) => ({
  shell: {
    minHeight: '100vh',
    background: token.colorBgLayout,
  },
  sider: css`
    min-height: 100vh;
    border-inline-end: 1px solid ${token.colorBorderSecondary};
    background: ${token.colorBgContainer};

    @media (max-width: 760px) {
      display: none;
    }
  `,
  sidebarContent: {
    minHeight: '100vh',
    padding: '20px 12px 24px',
  },
  brand: {
    padding: '4px 12px 20px',
    borderBottom: `1px solid ${token.colorBorderSecondary}`,
  },
  brandMark: {
    borderRadius: 11,
    backgroundColor: token.colorPrimary,
    fontWeight: 700,
  },
  brandName: {
    color: token.colorText,
    fontSize: 17,
    lineHeight: 1.2,
  },
  brandCaption: {
    color: token.colorTextTertiary,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.1em',
  },
  menu: css`
    margin-block-start: 20px;
    border-inline-end: 0 !important;

    .ant-menu-item {
      width: 100%;
      margin-inline: 0;
    }
  `,
  sidebarNote: {
    marginTop: 'auto',
    padding: '16px 12px 0',
    borderTop: `1px solid ${token.colorBorderSecondary}`,
  },
  noteLabel: {
    color: token.colorTextTertiary,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.1em',
  },
  noteCopy: {
    color: token.colorTextSecondary,
    fontSize: 12,
    lineHeight: 1.55,
  },
  header: {
    height: 64,
    paddingInline: 36,
    borderBottom: `1px solid ${token.colorBorderSecondary}`,
    background: token.colorBgContainer,
    '@media (max-width: 760px)': {
      height: 58,
      paddingInline: 20,
    },
  },
  headerLabel: {
    color: token.colorTextSecondary,
    fontSize: 13,
  },
  connectionTag: {
    marginInlineEnd: 0,
    borderRadius: 20,
  },
}))

type AppLayoutProps = PropsWithChildren

export function AppLayout({ children }: AppLayoutProps) {
  const { styles } = useStyles()

  return (
    <Layout className={styles.shell}>
      <Sider className={styles.sider} theme="light" width={240}>
        <Flex vertical className={styles.sidebarContent}>
          <Flex align="center" className={styles.brand} gap={12}>
            <Avatar
              className={styles.brandMark}
              shape="square"
              size={36}
            >
              T
            </Avatar>
            <Flex vertical gap={3}>
              <Text strong className={styles.brandName}>taskmill</Text>
              <Text className={styles.brandCaption}>РАБОЧЕЕ ПРОСТРАНСТВО</Text>
            </Flex>
          </Flex>

          <Menu
            className={styles.menu}
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

          <Flex className={styles.sidebarNote} vertical gap={6}>
            <Text className={styles.noteLabel}>ЛОКАЛЬНЫЙ РЕЖИМ</Text>
            <Text className={styles.noteCopy}>
              Данные проекта будут читаться с этого компьютера.
            </Text>
          </Flex>
        </Flex>
      </Sider>

      <Layout>
        <Header className={styles.header}>
          <Flex align="center" justify="space-between">
            <Text className={styles.headerLabel}>Taskmill / Обзор</Text>
            <Tag className={styles.connectionTag}>Папка не подключена</Tag>
          </Flex>
        </Header>
        <Content>{children}</Content>
      </Layout>
    </Layout>
  )
}
