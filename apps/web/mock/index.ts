import { taskMock as taskmillTask0001 } from './taskmill/0001'
import { taskMock as taskmillTask0002 } from './taskmill/0002'
import { taskMock as crossTask0001 } from './cross/0001'
import { taskMock as exampleTask0001 } from './example/0001'
import { getPluginDefaultValues, pluginDefinitions } from '../src/plugins'
import { migrateLegacyTask } from '../src/plugins/migrateLegacyTask'
import type { PluginValues } from '../src/plugins/types'
import type { Project, ProjectPluginConfig } from '../src/types/project'
import type { TaskMockSeed } from '../src/types/task'
import { createDefaultProcesses } from './processes'

export type MockProject = Project

type ProjectPluginSeeds = Record<string, PluginValues>

function createDefaultPlugins(projectId: string, seededValues: ProjectPluginSeeds): ProjectPluginConfig[] {
  return pluginDefinitions.map((plugin) => {
    const values = { ...getPluginDefaultValues(plugin.id), ...seededValues[plugin.id] }
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

function createProject(id: string, name: string, tasks: TaskMockSeed[], pluginSeeds: ProjectPluginSeeds): Project {
  const processes = createDefaultProcesses()
  return {
    id,
    name,
    tasks: tasks.map((task) => migrateLegacyTask(task, processes)),
    plugins: createDefaultPlugins(id, pluginSeeds),
    processes,
  }
}

export const mockProjects: Project[] = [
  createProject('taskmill', 'Taskmill', [taskmillTask0001, taskmillTask0002], {
    'project-analytics': {
      provider: 'Matomo', state: 'mock', period: 'Последние 30 дней', visits: 2430,
      note: 'Демонстрационные значения, интеграция с Matomo не подключена.',
    },
    'project-testing': { checks: [
      { id: 'production-build', name: 'Production build', command: 'npm run build --workspace apps/web', state: 'passed', details: 'Последняя локальная сборка прошла успешно.' },
      { id: 'lint', name: 'Lint', command: 'npm run lint --workspace apps/web', state: 'passed', details: 'Проверка Oxlint прошла успешно.' },
      { id: 'automated-tests', name: 'Automated tests', command: 'npm test', state: 'notConfigured', details: 'Корневой test-скрипт пока содержит заглушку.' },
    ] },
    'project-mock-data': { directory: 'apps/web/mock/taskmill', note: 'Файлы задач служат демонстрационными данными для web-клиента.' },
    'local-server': { state: 'notImplemented', description: 'Локальный сервер ещё не реализован.', plannedResponsibilities: [
      'Читать и валидировать описание проекта и задачи.',
      'Отдавать данные web-клиенту через API.',
      'Сохранять разрешённые изменения в файлы проекта или внешней папки.',
    ] },
  }),
  createProject('cross', 'cross', [crossTask0001], {
    'project-analytics': { provider: 'Matomo', state: 'notConnected', note: 'Для проекта cross источник аналитики не указан.' },
    'project-testing': { checks: [
      { id: 'cross-checks', name: 'Проверки проекта cross', state: 'notRun', details: 'Целевой репозиторий и команды проверки не указаны.' },
    ] },
    'project-mock-data': { directory: 'apps/web/mock/cross', note: 'Содержит демонстрационные данные задач проекта cross.' },
    'local-server': { state: 'notImplemented', description: 'Локальный сервер Taskmill ещё не реализован.', plannedResponsibilities: [] },
  }),
  createProject('example', 'Example', [exampleTask0001], {
    'project-analytics': { provider: 'Matomo', state: 'notConnected', note: 'Для этого проекта источник аналитики не настроен.' },
    'project-testing': { checks: [
      { id: 'hello-world-check', name: 'Проверка Hello World приложения', state: 'notRun', details: 'Сначала нужно выбрать платформу и создать приложение.' },
    ] },
    'project-mock-data': { directory: 'apps/web/mock/example', note: 'Содержит план задачи для демонстрационного проекта Example.' },
    'local-server': { state: 'notImplemented', description: 'Данные проекта пока загружаются из web mock-реестра.', plannedResponsibilities: [
      'Читать описание проекта после того, как будет согласован формат.',
      'Предоставлять проект и его задачи web-клиенту.',
    ] },
  }),
]

export async function getTaskMock(projectId: string, taskId: string) {
  const project = mockProjects.find((item) => item.id === projectId)
  const task = project?.tasks.find((item) => item.id === taskId)

  if (!task) {
    throw new Error(`Задача ${taskId} не найдена в проекте ${projectId}`)
  }

  return task
}
