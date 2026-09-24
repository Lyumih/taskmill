import { Collapse, Flex, Tag, Typography } from 'antd'
import { PluginFieldsView } from '../PluginFieldsView'
import { getPluginDefinition } from '../../plugins'
import type { Project } from '../../types/project'

const { Text } = Typography

type ProjectContextProps = {
  project: Project
}

export function ProjectContext({ project }: ProjectContextProps) {
  const projectPlugins = project.plugins.flatMap((config) => {
    const plugin = getPluginDefinition(config.pluginId)
    return plugin?.projectView ? [{ plugin, config }] : []
  })

  return (
    <Collapse
      defaultActiveKey={['project-context']}
      size="small"
      items={[
        {
          key: 'processes',
          label: 'Процессы и блоки',
          extra: <Tag color="blue">{project.processes.filter((process) => process.enabled).length} активны</Tag>,
          children: (
            <Flex vertical gap="middle">
              {project.processes.map((process) => (
                <Flex key={process.id} vertical gap="small">
                  <Flex align="center" justify="space-between" gap="small" wrap="wrap">
                    <Text strong>{process.name}</Text>
                    <Tag color={process.enabled ? 'success' : 'default'}>{process.enabled ? 'Включён' : 'Выключен'}</Tag>
                  </Flex>
                  <Text type="secondary">{process.taskType} · задач: {project.tasks.filter((task) => task.processId === process.id).length}</Text>
                  <Flex gap="small" wrap="wrap">
                    {process.blocks.filter((block) => block.enabled).map((block) => (
                      <Tag key={block.id}>{getPluginDefinition(block.pluginId)?.title ?? block.pluginId}</Tag>
                    ))}
                  </Flex>
                </Flex>
              ))}
            </Flex>
          ),
        },
        ...projectPlugins.map(({ plugin, config }) => ({
          key: plugin.id,
          label: plugin.title,
          extra: <Tag color={config.enabled ? 'success' : 'default'}>{config.enabled ? 'Доступен' : 'Выключен'}</Tag>,
          children: config.enabled ? (
            <Flex vertical gap="middle">
              <PluginFieldsView plugin={plugin} values={config.values} />
              {plugin.id === 'project-mock-data' && (
                <Flex vertical gap="small">
                  <Text type="secondary">Задач в проекте</Text>
                  <Flex gap="small" wrap="wrap">
                    {project.tasks.map((task, index) => (
                      <Tag key={task.id ?? `task-${index}`}>{task.id ?? '—'} · {task.title ?? 'Задача без названия'}</Tag>
                    ))}
                  </Flex>
                </Flex>
              )}
            </Flex>
          ) : <Text type="secondary">Плагин выключен в настройках проекта.</Text>,
        })),
      ]}
    />
  )
}
