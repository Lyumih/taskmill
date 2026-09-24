import type { TaskData } from '../../src/types/task'

export const taskMock: TaskData = {
  id: '0002',
  title: 'Добавить переключение между задачами в веб-клиенте',
  type: 'Новая функциональность',
  processId: 'feature',
  status: 'Новая',
  priority: 'Средний',
  project: {
    name: 'Taskmill',
    repository: 'Lyumih/taskmill',
    rootPath: 'C:/sites/taskmill',
  },
  description:
    'Реализовать выбор задачи в веб-клиенте и отображение её данных без полной перезагрузки страницы.',
  plan: {
    progress: 0,
    summary:
      'Добавить список задач и связывать выбранную задачу с загружаемым содержимым страницы.',
    steps: [
      {
        title: 'Определить модель выбора задачи',
        detail: 'Уточнить, как выбираются задачи проекта и где хранится выбранный ID.',
        status: 'pending',
      },
      {
        title: 'Добавить навигацию по доступным задачам',
        detail: 'Показывать список задач и визуально выделять выбранную.',
        status: 'pending',
      },
      {
        title: 'Загружать данные выбранной задачи',
        detail: 'Использовать ID выбранной задачи для получения данных через API.',
        status: 'pending',
      },
      {
        title: 'Обработать состояния загрузки и отсутствия данных',
        detail: 'Проверить загрузку, пустой список, неизвестный ID и ошибку API.',
        status: 'pending',
      },
    ],
  },
  workflow: {
    name: 'Новая функциональность',
    currentStep: 1,
    totalSteps: 4,
    questions: [
      {
        question: 'Где пользователь выбирает задачу?',
        answer: 'Уточнить: в боковой панели, списке или выпадающем меню.',
        status: 'current',
      },
      {
        question: 'Должен ли выбор задачи сохраняться в URL?',
        answer: 'Решить, нужна ли прямая ссылка на выбранную задачу.',
        status: 'current',
      },
      {
        question: 'Какие состояния должна показывать навигация?',
        answer: 'Загрузка, пустой список, выбранная задача и ошибка загрузки.',
        status: 'answered',
      },
    ],
  },
  references: [
    { name: 'Repository', value: 'Lyumih/taskmill' },
    { name: 'Project rules', value: 'AGENTS.md · инструкции проекта' },
  ],
  changes: {
    filesAdded: 0,
    filesChanged: 0,
    componentsAdded: 0,
    stylesAdded: 0,
    files: [],
  },
  agents: [],
  feedback: {
    summary: 'Открытые решения',
    items: [
      'Определить, переключаются ли задачи только внутри активного проекта или между несколькими проектами.',
      'Решить, синхронизировать ли выбранную задачу с URL и историей браузера.',
    ],
  },
}
