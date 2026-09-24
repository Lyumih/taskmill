import { taskMock as taskmillTask0001 } from './taskmill/0001'
import { taskMock as taskmillTask0002 } from './taskmill/0002'
import { taskMock as crossTask0001 } from './cross/0001'
import { taskMock as exampleTask0001 } from './example/0001'
import { getPluginDefaultValues, pluginDefinitions } from '../src/plugins'
import type { Project, ProjectPluginConfig } from '../src/types/project'
import { createDefaultProcesses } from './processes'

export type MockProject = Project

function createDefaultPlugins(projectId: string): ProjectPluginConfig[] {
  return pluginDefinitions.map((plugin) => {
    const values = getPluginDefaultValues(plugin.id)
    if (plugin.id === 'project-context') {
      if (projectId === 'taskmill') {
        values.product = 'Taskmill помогает команде разбирать задачи и готовить работу для ИИ-агентов.'
        values.stack = ['React', 'TypeScript', 'Vite', 'Ant Design']
        values.references = ['https://github.com/Lyumih/taskmill']
      } else if (projectId === 'cross') {
        values.product = 'Создать игру в крестики-нолики на React для двух игроков на одном устройстве.'
        values.stack = ['React']
      } else if (projectId === 'example') {
        values.product = 'Создать минимальное приложение, которое выводит Hello, world!'
      }
    }

    return { pluginId: plugin.id, enabled: true, values, comment: '' }
  })
}

export const mockProjects: Project[] = [
  {
    id: 'taskmill',
    name: 'Taskmill',
    tasks: [taskmillTask0001, taskmillTask0002],
    plugins: createDefaultPlugins('taskmill'),
    processes: createDefaultProcesses(),
    analytics: {
      provider: 'Matomo',
      state: 'mock',
      period: 'Последние 30 дней',
      visits: 2430,
      note: 'Демонстрационные значения, интеграция с Matomo не подключена.',
    },
    testing: {
      checks: [
        {
          name: 'Production build',
          command: 'npm run build --workspace apps/web',
          state: 'passed',
          details: 'Последняя локальная сборка прошла успешно.',
        },
        {
          name: 'Lint',
          command: 'npm run lint --workspace apps/web',
          state: 'passed',
          details: 'Проверка Oxlint прошла успешно.',
        },
        {
          name: 'Automated tests',
          command: 'npm test',
          state: 'notConfigured',
          details: 'Корневой test-скрипт пока содержит заглушку.',
        },
      ],
    },
    mockData: {
      directory: 'apps/web/mock/taskmill',
      note: 'Файлы задач служат демонстрационными данными для web-клиента.',
    },
    server: {
      state: 'notImplemented',
      description: 'Локальный сервер ещё не реализован.',
      plannedResponsibilities: [
        'Читать и валидировать описание проекта и задачи.',
        'Отдавать данные web-клиенту через API.',
        'Сохранять разрешённые изменения в файлы проекта или внешней папки.',
      ],
    },
  },
  {
    id: 'cross',
    name: 'cross',
    tasks: [crossTask0001],
    plugins: createDefaultPlugins('cross'),
    processes: createDefaultProcesses(),
    analytics: {
      provider: 'Matomo',
      state: 'notConnected',
      note: 'Для проекта cross источник аналитики не указан.',
    },
    testing: {
      checks: [
        {
          name: 'Проверки проекта cross',
          state: 'notRun',
          details: 'Целевой репозиторий и команды проверки не указаны.',
        },
      ],
    },
    mockData: {
      directory: 'apps/web/mock/cross',
      note: 'Содержит демонстрационные данные задач проекта cross.',
    },
    server: {
      state: 'notImplemented',
      description: 'Локальный сервер Taskmill ещё не реализован.',
      plannedResponsibilities: [],
    },
  },
  {
    id: 'example',
    name: 'Example',
    tasks: [exampleTask0001],
    plugins: createDefaultPlugins('example'),
    processes: createDefaultProcesses(),
    analytics: {
      provider: 'Matomo',
      state: 'notConnected',
      note: 'Для этого проекта источник аналитики не настроен.',
    },
    testing: {
      checks: [
        {
          name: 'Проверка Hello World приложения',
          state: 'notRun',
          details: 'Сначала нужно выбрать платформу и создать приложение.',
        },
      ],
    },
    mockData: {
      directory: 'apps/web/mock/example',
      note: 'Содержит план задачи для демонстрационного проекта Example.',
    },
    server: {
      state: 'notImplemented',
      description: 'Данные проекта пока загружаются из web mock-реестра.',
      plannedResponsibilities: [
        'Читать описание проекта после того, как будет согласован формат.',
        'Предоставлять проект и его задачи web-клиенту.',
      ],
    },
  },
]

export async function getTaskMock(projectId: string, taskId: string) {
  const project = mockProjects.find((item) => item.id === projectId)
  const task = project?.tasks.find((item) => item.id === taskId)

  if (!task) {
    throw new Error(`Задача ${taskId} не найдена в проекте ${projectId}`)
  }

  return task
}
