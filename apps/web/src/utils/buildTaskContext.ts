import { getPluginDefinition, getPluginDefaultValues, mergePluginValues } from '../plugins'
import type { Project } from '../types/project'
import type { TaskData } from '../types/task'

export function buildTaskContext(project: Project, task: TaskData) {
  const lines = [
    `Проект: ${project.name} (${project.id})`,
    `Задача: ${task.id ?? 'без ID'} — ${task.title ?? 'без названия'}`,
  ]

  if (task.type) lines.push(`Тип: ${task.type}`)
  if (task.status) lines.push(`Статус: ${task.status}`)
  if (task.description) lines.push(`Описание: ${task.description}`)
  if (task.project?.repository) lines.push(`Репозиторий: ${task.project.repository}`)
  if (task.project?.branch) lines.push(`Ветка: ${task.project.branch}`)

  const process = project.processes.find((item) => item.id === task.processId)
  if (process) {
    lines.push(`Процесс: ${process.name} (${process.taskType})`)
    lines.push(`Агент процесса: ${process.agent}`)
    lines.push(`Этапы процесса:\n${process.stages.map((stage, index) => `${index + 1}. ${stage.title} — ${stage.detail}`).join('\n')}`)

    const processBlocks = process.blocks.filter((block) => {
      const projectPlugin = project.plugins.find((item) => item.pluginId === block.pluginId)
      return block.enabled && projectPlugin?.enabled
    }).flatMap((block) => {
      const plugin = getPluginDefinition(block.pluginId)
      if (!plugin) return []

      const projectPlugin = project.plugins.find((item) => item.pluginId === block.pluginId)
      const values = mergePluginValues(
        projectPlugin?.values ?? getPluginDefaultValues(block.pluginId),
        task.pluginData?.[process.id]?.[block.id],
      )
      const fields = plugin.fields.map((field) => {
        const value = Object.hasOwn(values, field.id) ? values[field.id] : field.value
        return `  - ${field.label}: ${JSON.stringify(value)}`
      })
      const notes = Object.entries(task.pluginNotes?.[process.id]?.[block.id] ?? {})
        .map(([fieldPath, note]) => `  - Заметка к полю ${fieldPath}: ${note}`)
      return [`- ${plugin.title}\n${[...fields, ...notes].join('\n')}`]
    })

    if (processBlocks.length) lines.push(`Блоки выбранного процесса:\n${processBlocks.join('\n')}`)
  }

  return lines.join('\n\n')
}
