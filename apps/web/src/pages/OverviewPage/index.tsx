import { FolderOpenOutlined } from '@ant-design/icons'
import { Button, Card, Col, Empty, Flex, Row, Tag, Typography } from 'antd'

const { Paragraph, Text, Title } = Typography

export function OverviewPage() {
  return (
    <main>
      <Flex vertical gap="large">
        <Flex vertical gap="small">
          <Text type="secondary">УПРАВЛЕНИЕ РАБОТОЙ</Text>
          <Title level={1}>Задачи с понятным процессом</Title>
          <Paragraph>
            Контекст, шаги и решения по задачам проекта в одном месте.
          </Paragraph>
        </Flex>

        <Card>
          <Flex vertical gap="large">
            <Flex align="flex-start" gap="middle" justify="space-between" wrap="wrap">
              <Flex vertical gap="small">
                <Text type="secondary">НАЧАЛО РАБОТЫ</Text>
                <Title level={3}>Подключите папку проекта</Title>
                <Paragraph>
                  Taskmill покажет задачи и workflow, сохранённые в выбранном
                  проекте. Подключение станет доступно после настройки локального
                  сервера.
                </Paragraph>
              </Flex>
              <Tag color="blue">Шаг 1 из 2</Tag>
            </Flex>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card size="small">
                  <Flex align="center" gap="middle">
                    <Tag color="blue">01</Tag>
                    <Flex vertical>
                      <Text strong>Выберите рабочую папку</Text>
                      <Text type="secondary">
                        Укажите проект, с которым будете работать.
                      </Text>
                    </Flex>
                  </Flex>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card size="small">
                  <Flex align="center" gap="middle">
                    <Tag>02</Tag>
                    <Flex vertical>
                      <Text strong>Откройте список задач</Text>
                      <Text type="secondary">
                        Просматривайте контекст и проходите workflow.
                      </Text>
                    </Flex>
                  </Flex>
                </Card>
              </Col>
            </Row>

            <Button disabled icon={<FolderOpenOutlined />} type="primary">
              Подключение папки появится позже
            </Button>
          </Flex>
        </Card>

        <section>
          <Flex align="baseline" justify="space-between" wrap="wrap">
            <Title level={2}>Задачи</Title>
            <Text type="secondary">Рабочая папка не выбрана</Text>
          </Flex>
          <Card>
            <Empty description="Подключите папку проекта, чтобы увидеть задачи" />
          </Card>
        </section>
      </Flex>
    </main>
  )
}
