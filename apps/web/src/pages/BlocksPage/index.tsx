import { useState } from 'react'
import { AppstoreOutlined, CommentOutlined, CopyOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Col, Flex, Input, message, Row, Space, Switch, Tag, Typography } from 'antd'
import { PluginFieldsEditor } from '../../components/PluginFieldsEditor'
import { getPluginDefaultValues, pluginDefinitions } from '../../plugins'
import type { PluginDefinition, PluginFieldValue } from '../../plugins/types'
import type { Project, ProjectPluginConfig } from '../../types/project'

const { Text, Title } = Typography

type BlocksPageProps = {
  project: Project
  originalProject: Project
  onUpdatePlugin: (pluginId: string, patch: Partial<ProjectPluginConfig>) => void
}

function buildPluginEditPrompt(project: Project, originalProject: Project, plugin: PluginDefinition, config: ProjectPluginConfig) {
  const changes: string[] = []
  const originalConfig = originalProject.plugins.find((item) => item.pluginId === plugin.id)
  const originalValues = originalConfig?.values ?? getPluginDefaultValues(plugin.id)

  if (config.enabled !== (originalConfig?.enabled ?? true)) {
    changes.push(`Доступность плагина: ${originalConfig?.enabled ? 'включён' : 'выключен'} → ${config.enabled ? 'включён' : 'выключен'}`)
  }

  for (const field of plugin.fields) {
    const value = Object.hasOwn(config.values, field.id) ? config.values[field.id] : field.value
    const originalValue = Object.hasOwn(originalValues, field.id) ? originalValues[field.id] : field.value
    if (JSON.stringify(value) !== JSON.stringify(originalValue)) {
      changes.push(`Поле «${field.label}» (${field.id}):\nБыло:\n${JSON.stringify(originalValue, null, 2)}\nСтало:\n${JSON.stringify(value, null, 2)}`)
    }
  }

  if (config.comment !== (originalConfig?.comment ?? '')) {
    changes.push(`Комментарий к плагину: ${JSON.stringify(originalConfig?.comment ?? '')} → ${JSON.stringify(config.comment)}`)
  }
  if (changes.length === 0) return null

  const rootPath = project.tasks.find((task) => task.project?.rootPath)?.project?.rootPath
  return [
    'Используй скилл `taskmill-edit`, чтобы изменить файл конфигурации Taskmill.',
    `Проект: ${project.name} (${project.id})${rootPath ? `, ${rootPath}` : ''}.`,
    `Блок-элемент: «${plugin.title}» (pluginId: ${plugin.id}).`,
    'Примени только перечисленные изменения к настройкам этого плагина, сохранив остальные настройки и процессы.',
    'Изменения:',
    ...changes.map((change, index) => `${index + 1}. ${change}`),
  ].join('\n\n')
}

export function BlocksPage({ project, originalProject, onUpdatePlugin }: BlocksPageProps) {
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({})
  const [messageApi, contextHolder] = message.useMessage()
  const enabledCount = project.plugins.filter((item) => item.enabled).length
  const linkedProcessCount = project.processes.filter((process) =>
    process.enabled && process.blocks.some((block) =>
      block.enabled && project.plugins.some((item) => item.pluginId === block.pluginId && item.enabled),
    ),
  ).length

  const getConfig = (pluginId: string): ProjectPluginConfig => project.plugins.find((item) => item.pluginId === pluginId) ?? {
    pluginId,
    enabled: true,
    values: getPluginDefaultValues(pluginId),
    comment: '',
  }

  const copyEditPrompt = async (plugin: PluginDefinition, config: ProjectPluginConfig) => {
    const prompt = buildPluginEditPrompt(project, originalProject, plugin, config)
    if (!prompt) return

    try {
      await navigator.clipboard.writeText(prompt)
      messageApi.success('Промпт для taskmill-edit скопирован')
    } catch {
      messageApi.error('Не удалось скопировать промпт. Проверьте разрешение браузера на доступ к буферу обмена.')
    }
  }

  return (
    <main>
      {contextHolder}
      <Flex vertical gap="large">
        <Flex align="flex-start" justify="space-between" gap="middle" wrap="wrap">
          <Flex vertical gap="small">
            <Title level={2} style={{ margin: 0 }}>Блоки-элементы</Title>
            <Text type="secondary">Переиспользуемые плагины проекта {project.name}. Процессы собираются из этих блоков.</Text>
          </Flex>
          <Tag icon={<AppstoreOutlined />} color="blue">{pluginDefinitions.length} плагина</Tag>
        </Flex>

        <Alert
          type="info"
          showIcon
          message="Каталог плагинов"
          description="Логика и схема каждого блока находятся в src/plugins. Здесь настраиваются значения и доступность плагинов для выбранного проекта."
        />

        <Flex gap="small" wrap="wrap">
          <Tag color="success">{enabledCount} доступны</Tag>
          <Tag>{linkedProcessCount} процессов используют блоки проекта</Tag>
          <Tag color="default">Изменения хранятся в workspace до перезагрузки</Tag>
        </Flex>

        <Row gutter={[16, 16]}>
          {pluginDefinitions.map((plugin) => {
            const config = getConfig(plugin.id)
            const prompt = buildPluginEditPrompt(project, originalProject, plugin, config)
            return (
              <Col key={plugin.id} xs={24} xl={12}>
                <Card
                  title={<Flex vertical><Text strong>{plugin.title}</Text><Text type="secondary">{plugin.description}</Text></Flex>}
                  extra={<Switch aria-label={`Доступность плагина ${plugin.title}`} checked={config.enabled} onChange={(enabled) => onUpdatePlugin(plugin.id, { enabled })} />}
                >
                  <Flex vertical gap="middle">
                    <Flex align="center" justify="space-between" gap="small" wrap="wrap">
                      <Tag color={config.enabled ? 'success' : 'default'}>{config.enabled ? 'Доступен процессам' : 'Выключен для проекта'}</Tag>
                      <Space wrap>
                        <Button
                          icon={<CommentOutlined />}
                          aria-label={`${openComments[plugin.id] ? 'Скрыть' : 'Показать'} комментарий к плагину ${plugin.title}`}
                          aria-expanded={Boolean(openComments[plugin.id])}
                          onClick={() => setOpenComments((current) => ({ ...current, [plugin.id]: !current[plugin.id] }))}
                        >
                          Комментарий
                        </Button>
                        <Button
                          icon={<CopyOutlined />}
                          type={prompt ? 'primary' : 'default'}
                          disabled={!prompt}
                          onClick={() => void copyEditPrompt(plugin, config)}
                        >
                          Исправить
                        </Button>
                      </Space>
                    </Flex>

                    <PluginFieldsEditor
                      plugin={plugin}
                      values={config.values}
                      onChange={(fieldId: string, value: PluginFieldValue) => onUpdatePlugin(plugin.id, {
                        values: { ...config.values, [fieldId]: value },
                      })}
                    />

                    {openComments[plugin.id] && (
                      <Flex vertical gap="small">
                        <Text strong>Комментарий к плагину</Text>
                        <Input.TextArea
                          aria-label={`Комментарий к плагину ${plugin.title}`}
                          value={config.comment}
                          placeholder="Добавьте контекст для правки"
                          autoSize={{ minRows: 2, maxRows: 5 }}
                          onChange={(event) => onUpdatePlugin(plugin.id, { comment: event.target.value })}
                        />
                      </Flex>
                    )}
                  </Flex>
                </Card>
              </Col>
            )
          })}
        </Row>
      </Flex>
    </main>
  )
}
