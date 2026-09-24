import type { ProcessDefinition } from '../src/types/process'

function processBlock(id: string, pluginId: string) {
  return { id, pluginId, enabled: true }
}

export function createDefaultProcesses(): ProcessDefinition[] {
  return [
    {
      id: 'feature',
      name: 'Новая функциональность',
      summary: 'От идеи до готового изменения с проверкой результата.',
      taskType: 'Новая функциональность',
      trigger: 'Тип задачи: Feature',
      agent: 'Feature Agent',
      enabled: true,
      placeholder: false,
      stages: [
        { title: 'Разобрать требования', detail: 'Уточнить цель, ограничения и критерии приёмки.', status: 'done' },
        { title: 'Составить план', detail: 'Определить затрагиваемые модули и последовательность изменений.', status: 'current' },
        { title: 'Реализовать', detail: 'Внести минимальные изменения и покрыть сценарии.', status: 'pending' },
        { title: 'Проверить и подготовить итог', detail: 'Запустить проверки, описать результат и риски.', status: 'pending' },
      ],
      blocks: [
        processBlock('context', 'project-context'),
        processBlock('rules', 'development-rules'),
        processBlock('task-template', 'task-template'),
      ],
    },
    {
      id: 'bugfix',
      name: 'Исправление ошибки',
      summary: 'Заглушка процесса: комбинация блоков для диагностики и исправления ошибки.',
      taskType: 'Исправление ошибки',
      trigger: 'Тип задачи: Bug',
      agent: 'Bugfix Agent',
      enabled: true,
      placeholder: true,
      stages: [{ title: 'Процесс не настроен', detail: 'Этапы обработки ошибки будут определены позже.', status: 'pending' }],
      blocks: [
        processBlock('context', 'project-context'),
        processBlock('errors', 'error-catalog'),
        processBlock('rules', 'development-rules'),
      ],
    },
    {
      id: 'support',
      name: 'Обращение в поддержку',
      summary: 'Заглушка процесса: контекст обращения и сбор информации для поддержки.',
      taskType: 'Обращение в поддержку',
      trigger: 'Тип задачи: Support',
      agent: 'Support Agent',
      enabled: true,
      placeholder: true,
      stages: [{ title: 'Процесс не настроен', detail: 'Вопросы и этапы поддержки будут определены позже.', status: 'pending' }],
      blocks: [
        processBlock('context', 'project-context'),
        processBlock('request', 'task-template'),
      ],
    },
    {
      id: 'review',
      name: 'Ревью изменений',
      summary: 'Заглушка процесса независимой проверки изменений.',
      taskType: 'Ревью изменений',
      trigger: 'Команда: /taskmill review',
      agent: 'Review Agent',
      enabled: true,
      placeholder: true,
      stages: [{ title: 'Процесс не настроен', detail: 'Этапы ревью будут определены позже.', status: 'pending' }],
      blocks: [
        processBlock('rules', 'development-rules'),
        processBlock('errors', 'error-catalog'),
      ],
    },
  ]
}
