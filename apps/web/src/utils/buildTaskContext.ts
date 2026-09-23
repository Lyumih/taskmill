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

  if (task.apiRequests !== undefined) {
    const requests = task.apiRequests ?? []
    lines.push(
      requests.length
        ? `API-запросы и обработка ошибок:\n${requests.map((request) => {
            const requestTarget = [request.method, request.endpoint].filter(Boolean).join(' ')
            const states = (['init', 'pending', 'data'] as const)
              .map((state) => {
                const handling = request.statuses?.[state]
                return handling
                  ? `  ${state}: ${handling.presentation ?? 'не задано'} — ${handling.description ?? ''}`
                  : undefined
              })
              .filter(Boolean)
            const errors = request.statuses?.error?.scenarios?.map((error) =>
              `  error/${error.kind ?? 'неизвестная'}: ${error.visible ? 'показывается' : 'скрыта'}, ${error.scope ?? 'область не задана'}, ${error.presentation ?? 'тип показа не задан'}${error.customBehavior ? `; ${error.customBehavior}` : ''}`,
            ) ?? []

            return `- ${request.name ?? 'Запрос'}${requestTarget ? ` (${requestTarget})` : ''}${request.purpose ? `: ${request.purpose}` : ''}\n${[...states, ...errors].join('\n')}`
          }).join('\n')}`
        : 'API-запросы: не предусмотрены.',
    )
  }

  if (task.permissionsFlags !== undefined) {
    const flags = task.permissionsFlags?.featureFlags ?? []
    const permissions = task.permissionsFlags?.permissions ?? []
    const accessRules = [
      ...flags.map((flag) => `- Flag ${flag.key ?? 'без ключа'} для ${flag.controlsBlock ?? 'блока не указан'}: включён — ${flag.whenEnabled ?? 'не задано'}; выключен — ${flag.whenDisabled ?? 'не задано'}`),
      ...permissions.map((permission) => `- Permission ${permission.key ?? 'без ключа'} для ${permission.controlsBlock ?? 'блока не указан'}: разрешён — ${permission.whenGranted ?? 'не задано'}; запрещён — ${permission.whenDenied ?? 'не задано'}`),
    ]

    lines.push(
      accessRules.length
        ? `Permissions / Flags:\n${accessRules.join('\n')}`
        : 'Permissions / Flags: не предусмотрены.',
    )
  }

  return lines.join('\n\n')
}
