import type { MockProject } from '../../mock'
import type { TaskData } from '../types/task'

export function buildTaskContext(project: MockProject, task: TaskData) {
  const lines = [
    `Проект: ${project.name} (${project.id})`,
    `Задача: ${task.id ?? 'без ID'} — ${task.title ?? 'без названия'}`,
  ]

  if (task.type) lines.push(`Тип: ${task.type}`)
  if (task.status) lines.push(`Статус: ${task.status}`)
  if (task.description) lines.push(`Описание: ${task.description}`)
  if (task.project?.repository) lines.push(`Репозиторий: ${task.project.repository}`)
  if (task.project?.branch) lines.push(`Ветка: ${task.project.branch}`)
  if (task.plan?.summary) lines.push(`План: ${task.plan.summary}`)

  if (task.plan?.steps?.length) {
    lines.push(
      `Шаги плана:\n${task.plan.steps
        .map((step, index) => `${index + 1}. ${step.title ?? 'Шаг'}${step.detail ? ` — ${step.detail}` : ''}`)
        .join('\n')}`,
    )
  }

  if (task.workflow?.questions?.length) {
    lines.push(
      `Вопросы workflow:\n${task.workflow.questions
        .map((item) => `- ${item.question ?? 'Вопрос'}${item.answer ? ` Ответ: ${item.answer}` : ''}`)
        .join('\n')}`,
    )
  }

  return lines.join('\n\n')
}
