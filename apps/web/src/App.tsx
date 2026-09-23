import { Button, Card, Empty, Layout, Menu, Tag, Typography } from 'antd'

const { Content, Header, Sider } = Layout
const { Paragraph, Text, Title } = Typography

function App() {
  return (
    <Layout className="app-shell">
      <Sider className="app-sidebar" theme="light" width={240}>
        <div className="brand">
          <span className="brand-mark">T</span>
          <div>
            <Text strong className="brand-name">taskmill</Text>
            <Text className="brand-caption">РАБОЧЕЕ ПРОСТРАНСТВО</Text>
          </div>
        </div>
        <Menu
          className="main-menu"
          mode="inline"
          selectedKeys={['overview']}
          items={[{ key: 'overview', label: 'Обзор' }]}
        />
        <div className="sidebar-note">
          <Text className="sidebar-note-label">ЛОКАЛЬНЫЙ РЕЖИМ</Text>
          <Text className="sidebar-note-copy">
            Данные проекта будут читаться с этого компьютера.
          </Text>
        </div>
      </Sider>

      <Layout>
        <Header className="app-header">
          <Text className="header-label">Taskmill / Обзор</Text>
          <Tag className="connection-tag">Папка не подключена</Tag>
        </Header>

        <Content className="page-content">
          <div className="page-heading">
            <Text className="eyebrow">УПРАВЛЕНИЕ РАБОТОЙ</Text>
            <Title level={1}>Задачи с понятным процессом</Title>
            <Paragraph>
              Контекст, шаги и решения по задачам проекта в одном месте.
            </Paragraph>
          </div>

          <Card className="workspace-card" bordered={false}>
            <div className="workspace-card-top">
              <div>
                <Text className="eyebrow">НАЧАЛО РАБОТЫ</Text>
                <Title level={3}>Подключите папку проекта</Title>
                <Paragraph>
                  Taskmill покажет задачи и workflow, сохранённые в выбранном
                  проекте. Подключение станет доступно после настройки локального
                  сервера.
                </Paragraph>
              </div>
              <Tag color="blue">Шаг 1 из 2</Tag>
            </div>

            <div className="setup-steps">
              <div className="setup-step setup-step-current">
                <span className="step-number">01</span>
                <div>
                  <Text strong>Выберите рабочую папку</Text>
                  <Text className="step-description">
                    Укажите проект, с которым будете работать.
                  </Text>
                </div>
              </div>
              <div className="setup-step">
                <span className="step-number">02</span>
                <div>
                  <Text strong>Откройте список задач</Text>
                  <Text className="step-description">
                    Просматривайте контекст и проходите workflow.
                  </Text>
                </div>
              </div>
            </div>

            <Button className="connect-button" type="primary" disabled>
              Подключение папки появится позже
            </Button>
          </Card>

          <section className="tasks-section">
            <div className="section-heading">
              <Title level={2}>Задачи</Title>
              <Text type="secondary">Рабочая папка не выбрана</Text>
            </div>
            <Card className="empty-card" bordered={false}>
              <Empty description="Подключите папку проекта, чтобы увидеть задачи" />
            </Card>
          </section>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
