import type { TaskData } from '../../src/types/task'

export const taskMock: TaskData = {
  id: '0001',
  title: 'Подготовить рабочее пространство Taskmill',
  type: 'Новая функциональность',
  processId: 'feature',
  status: 'В работе',
  priority: 'Высокий',
  project: {
    name: 'Taskmill',
    repository: 'Lyumih/taskmill',
    branch: 'feature/taskmill-workspace',
    rootPath: 'C:/sites/taskmill',
  },
  description:
    'Собрать в клиенте контекст задачи: план агента, workflow, связанные источники, изменения по ветке, оценки и обратную связь.',
  startedAt: '2026-09-23',
  expiresAt: '2026-10-07',
  lastActivityAt: '2026-09-23',
  plan: {
    progress: 75,
    summary:
      'Сначала показать полный рабочий контекст на демонстрационных данных, затем заменить mock на ответ API локального сервера.',
    steps: [
      {
        title: 'Сгруппировать требования из идей',
        detail: 'Выделены задача, workflow, интеграции, метрики и обратная связь.',
        actions: [
          'Отделить постоянный контекст проекта от данных конкретной задачи.',
          'Сгруппировать Jira, Git, Confluence, Figma и Matomo как связанные источники.',
          'Выделить план агента, workflow, изменения, оценки и обратную связь как отдельные блоки.',
        ],
        expectedResult: 'Согласована структура рабочего экрана задачи.',
        verification: 'Каждая идея отображается в соответствующем блоке страницы.',
        status: 'done',
      },
      {
        title: 'Подготовить контракт данных для страницы',
        detail: 'Собрать единый объект с проектом, планом, агентами и источниками.',
        actions: [
          'Определить поля проекта и задачи.',
          'Сделать данные частичными, чтобы источник мог дополнять их постепенно.',
          'Подготовить отдельные mock-файлы для проектов и задач.',
        ],
        expectedResult: 'Mock задачи соответствует TaskData и сгруппирован по проекту.',
        verification: 'TypeScript проверяет mock-файлы при production build.',
        status: 'done',
      },
      {
        title: 'Построить экран на mock-данных',
        detail: 'Подключить объект 0001 и отобразить данные через компоненты Ant Design.',
        actions: [
          'Показывать выбор проекта и список задач проекта.',
          'Загружать задачу по projectId и taskId через TanStack Query.',
          'Сгруппировать длинные разделы в Collapse и раскрывать их при первом показе.',
          'Добавить план, workflow, источники, метрики, проверки, mock-данные и статус сервера.',
        ],
        expectedResult: 'Пользователь видит подробную карточку задачи и контекст выбранного проекта.',
        verification: 'Переключение между Taskmill и Example меняет задачи и проектные блоки без перезагрузки.',
        status: 'inProgress',
      },
      {
        title: 'Подключить API локального сервера',
        detail: 'Заменить mock-функцию запросом к серверу.',
        actions: [
          'Согласовать формат API и runtime-валидацию ответа.',
          'Заменить getTaskMock серверным запросом.',
          'Сохранять изменения в выбранное хранилище проекта.',
        ],
        expectedResult: 'Клиент получает проектные и task-данные с локального сервера.',
        verification: 'Проверить успешные ответы, пустые данные, ошибки и конфликты записи.',
        status: 'pending',
      },
    ],
  },
  workflow: {
    name: 'Новая функциональность',
    currentStep: 3,
    totalSteps: 4,
    questions: [
      { question: 'Кто будет пользоваться инструментом?', answer: 'Индивидуальные разработчики и команды', status: 'answered' },
      { question: 'Где хранить задачи и конфигурации?', answer: 'В проекте или во внешней папке, связанной с проектом', status: 'answered' },
      { question: 'Обязателен ли MCP на первом этапе?', answer: 'Нет, это дополнительный способ интеграции', status: 'answered' },
      { question: 'Какой первый поставляемый результат?', answer: 'Агент формирует описание проекта, которое читает сервер и показывает web-клиент', status: 'current' },
    ],
  },
  references: [
    { name: 'Jira', value: 'TASK-184 · В работе' },
    { name: 'Repository', value: 'Lyumih/taskmill · feature/taskmill-workspace' },
    { name: 'Project rules', value: 'AGENTS.md · инструкции проекта' },
    { name: 'Confluence', value: 'Черновик архитектуры Taskmill' },
    { name: 'Figma', value: 'Taskmill workspace · экран задачи' },
    { name: 'Matomo', value: 'Демо-проект · 2 430 визитов за 30 дней' },
  ],
  changes: {
    filesAdded: 2,
    filesChanged: 3,
    componentsAdded: 1,
    stylesAdded: 0,
    files: [
      { path: 'apps/web/mock/0001.ts', change: 'Добавлен mock объекта задачи' },
      { path: 'apps/web/src/pages/OverviewPage/index.tsx', change: 'Страница подключена к данным задачи' },
      { path: 'apps/web/src/layouts/AppLayout/index.tsx', change: 'Навигация по рабочему пространству' },
    ],
  },
  estimates: {
    jiraHours: 8,
    aiHours: 6,
    aiRange: '5–7 ч',
    spentHours: 2.5,
  },
  agents: [
    {
      name: 'Аналитик проекта',
      role: 'Изучение идей и формирование структуры',
      status: 'Завершён',
      result: 'Сгруппировал функциональность и выделил первый этап.',
    },
    {
      name: 'Web-разработчик',
      role: 'Реализация страницы задачи',
      status: 'В работе',
      result: 'Подключает mock и собирает представление на Ant Design.',
    },
    {
      name: 'Ревьюер',
      role: 'Проверка результата и workflow',
      status: 'Ожидает',
      result: 'Проверит полноту секций и согласованность данных.',
    },
  ],
  feedback: {
    summary: 'Идея по итогам обсуждения',
    items: [
      'Сначала стабилизировать схему документа проекта, затем проектировать плагины.',
      'Изменения workflow сохранять как предложения и подтверждать перед публикацией.',
    ],
  },
}
