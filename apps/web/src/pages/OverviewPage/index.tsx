import { FolderOpenOutlined } from '@ant-design/icons'
import { Button, Card, Empty, Flex, Tag, Typography } from 'antd'
import { createStyles } from 'antd-style'

const { Paragraph, Text, Title } = Typography

const useStyles = createStyles(({ token, css }) => ({
  page: css`
    width: 100%;
    max-width: 1120px;
    margin-inline: auto;
    padding: 48px 48px 64px;

    @media (max-width: 760px) {
      padding: 34px 20px 48px;
    }
  `,
  pageHeading: {
    marginBottom: 30,
  },
  eyebrow: {
    color: token.colorPrimary,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.1em',
  },
  pageTitle: {
    margin: '10px 0',
    color: token.colorText,
    fontSize: 'clamp(28px, 4vw, 38px)',
    fontWeight: 650,
    letterSpacing: '-0.04em',
  },
  pageDescription: {
    maxWidth: 600,
    margin: 0,
    color: token.colorTextSecondary,
    fontSize: 15,
  },
  setupCard: {
    borderColor: token.colorBorderSecondary,
    borderRadius: 16,
    boxShadow: '0 8px 28px rgb(31 48 85 / 4%)',
  },
  setupTitle: {
    margin: '8px 0',
    color: token.colorText,
    fontSize: 21,
    letterSpacing: '-0.02em',
  },
  setupDescription: {
    maxWidth: 620,
    margin: 0,
    color: token.colorTextSecondary,
    lineHeight: 1.65,
  },
  steps: css`
    margin-block: 28px 22px;
  `,
  stepCard: {
    flex: '1 1 300px',
    minHeight: 78,
    borderColor: token.colorBorderSecondary,
    borderRadius: 12,
  },
  currentStep: {
    borderColor: token.colorPrimaryBorder,
    background: token.colorPrimaryBg,
  },
  stepNumber: {
    color: token.colorPrimary,
    fontSize: 12,
    fontWeight: 700,
  },
  stepDescription: {
    color: token.colorTextTertiary,
    fontSize: 12,
  },
  connectButton: {
    height: 40,
    paddingInline: 16,
    borderRadius: 9,
  },
  tasksSection: {
    marginTop: 40,
  },
  sectionTitle: {
    margin: 0,
    color: token.colorText,
    fontSize: 19,
  },
  sectionStatus: {
    fontSize: 12,
  },
  emptyCard: {
    display: 'grid',
    minHeight: 220,
    alignItems: 'center',
    marginTop: 14,
    borderColor: token.colorBorderSecondary,
    borderRadius: 16,
    boxShadow: '0 8px 28px rgb(31 48 85 / 4%)',
  },
}))

export function OverviewPage() {
  const { styles } = useStyles()

  return (
    <main className={styles.page}>
      <Flex className={styles.pageHeading} vertical gap={4}>
        <Text className={styles.eyebrow}>УПРАВЛЕНИЕ РАБОТОЙ</Text>
        <Title className={styles.pageTitle} level={1}>
          Задачи с понятным процессом
        </Title>
        <Paragraph className={styles.pageDescription}>
          Контекст, шаги и решения по задачам проекта в одном месте.
        </Paragraph>
      </Flex>

      <Card className={styles.setupCard}>
        <Flex align="flex-start" gap={20} justify="space-between" wrap="wrap">
          <Flex vertical gap={4}>
            <Text className={styles.eyebrow}>НАЧАЛО РАБОТЫ</Text>
            <Title className={styles.setupTitle} level={3}>
              Подключите папку проекта
            </Title>
            <Paragraph className={styles.setupDescription}>
              Taskmill покажет задачи и workflow, сохранённые в выбранном
              проекте. Подключение станет доступно после настройки локального
              сервера.
            </Paragraph>
          </Flex>
          <Tag color="blue">Шаг 1 из 2</Tag>
        </Flex>

        <Flex className={styles.steps} gap={12} wrap="wrap">
          <Card className={`${styles.stepCard} ${styles.currentStep}`} size="small">
            <Flex align="center" gap={14}>
              <Text className={styles.stepNumber}>01</Text>
              <Flex vertical gap={4}>
                <Text strong>Выберите рабочую папку</Text>
                <Text className={styles.stepDescription}>
                  Укажите проект, с которым будете работать.
                </Text>
              </Flex>
            </Flex>
          </Card>
          <Card className={styles.stepCard} size="small">
            <Flex align="center" gap={14}>
              <Text className={styles.stepNumber}>02</Text>
              <Flex vertical gap={4}>
                <Text strong>Откройте список задач</Text>
                <Text className={styles.stepDescription}>
                  Просматривайте контекст и проходите workflow.
                </Text>
              </Flex>
            </Flex>
          </Card>
        </Flex>

        <Button
          className={styles.connectButton}
          disabled
          icon={<FolderOpenOutlined />}
          type="primary"
        >
          Подключение папки появится позже
        </Button>
      </Card>

      <section className={styles.tasksSection}>
        <Flex align="baseline" justify="space-between" wrap="wrap">
          <Title className={styles.sectionTitle} level={2}>Задачи</Title>
          <Text className={styles.sectionStatus} type="secondary">
            Рабочая папка не выбрана
          </Text>
        </Flex>
        <Card className={styles.emptyCard}>
          <Flex align="center" justify="center" style={{ minHeight: 180 }}>
            <Empty description="Подключите папку проекта, чтобы увидеть задачи" />
          </Flex>
        </Card>
      </section>
    </main>
  )
}
