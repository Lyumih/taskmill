import type { TaskMockSeed } from '../../src/types/task'

export const taskMock: TaskMockSeed = {
  id: '0001',
  title: 'Создать Hello World приложение',
  type: 'Создание проекта',
  processId: 'feature',
  status: 'Новая',
  priority: 'Средний',
  project: {
    name: 'Example',
    repository: 'example/hello-world',
  },
  description:
    'Создать минимальное запускаемое приложение, которое выводит Hello, world! и содержит понятные команды запуска и проверки.',
  plan: {
    progress: 0,
    summary:
      'Согласовать целевую платформу и стек, создать минимальную структуру приложения, реализовать Hello World и проверить запуск.',
    steps: [
      {
        title: 'Уточнить платформу и технологический стек',
        detail: 'Определить тип приложения, целевую среду и требуемые команды запуска.',
        status: 'pending',
      },
      {
        title: 'Создать минимальный каркас проекта',
        detail: 'Добавить необходимые файлы и конфигурацию без лишних зависимостей.',
        status: 'pending',
      },
      {
        title: 'Реализовать Hello World',
        detail: 'Вывести приветствие в основном сценарии приложения.',
        status: 'pending',
      },
      {
        title: 'Проверить запуск и описать команды',
        detail: 'Запустить приложение, выполнить доступные проверки и записать команды в README.',
        status: 'pending',
      },
    ],
  },
  workflow: {
    name: 'Создание проекта',
    currentStep: 1,
    totalSteps: 4,
    questions: [
      {
        question: 'Для какой платформы создаётся приложение?',
        answer: 'Нужно уточнить до выбора шаблона.',
        status: 'current',
      },
      {
        question: 'Какой стек и способ запуска использовать?',
        answer: 'Не заданы; выбрать после уточнения платформы.',
        status: 'current',
      },
      {
        question: 'Что считать готовым результатом?',
        answer: 'Приложение запускается и выводит Hello, world!; команды запуска описаны.',
        status: 'answered',
      },
    ],
  },
  references: [],
  changes: {
    filesAdded: 0,
    filesChanged: 0,
    componentsAdded: 0,
    stylesAdded: 0,
    files: [],
  },
  agents: [],
  feedback: {
    summary: 'Уточнения перед стартом',
    items: [
      'Согласовать платформу и стек до генерации файлов проекта.',
      'Оставить пример минимальным, чтобы его можно было использовать как стартовый шаблон.',
    ],
  },
}
