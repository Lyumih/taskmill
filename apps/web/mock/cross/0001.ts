import type { TaskData } from '../../src/types/task'

export const taskMock: TaskData = {
  id: '0001',
  title: 'Крестики-нолики',
  status: 'Новая',
  project: {
    name: 'cross',
  },
  description:
    'Создать игру в крестики-нолики на React для двух игроков на одном устройстве.',
  plan: {
    progress: 0,
    summary:
      'Подготовить игровое поле, реализовать ход игры для двух локальных игроков, определить победу и ничью и проверить основные сценарии.',
    steps: [
      {
        title: 'Определить место игры в React-проекте',
        detail:
          'Проверить целевой проект, его структуру и доступные команды запуска и проверки.',
        expectedResult: 'Выбрано место реализации и подтверждены команды проекта.',
        verification: 'Проверить существующую структуру и package scripts.',
        status: 'pending',
      },
      {
        title: 'Создать игровое поле и состояние партии',
        detail:
          'Отобразить поле 3×3, текущий символ и состояние партии для двух игроков на одном устройстве.',
        actions: [
          'Чередовать ходы X и O.',
          'Не разрешать менять уже занятую клетку.',
        ],
        expectedResult: 'Игроки могут выполнять ходы по очереди на одном поле.',
        verification: 'Проверить чередование символов и поведение занятой клетки.',
        status: 'pending',
      },
      {
        title: 'Обработать победу и ничью',
        detail:
          'Проверять выигрышные комбинации по строкам, столбцам и диагоналям, а также заполнение всего поля без победителя.',
        expectedResult: 'Игра корректно показывает победителя или ничью и завершает партию.',
        verification: 'Проверить победу каждого игрока по разным линиям и сценарий ничьей.',
        status: 'pending',
      },
      {
        title: 'Добавить начало новой партии и завершить интерфейс',
        detail:
          'Дать возможность сбросить поле и начать заново; обеспечить адаптивное и доступное управление.',
        expectedResult: 'После сброса начинается чистая партия, интерфейс доступен на узком и широком экранах.',
        verification: 'Проверить сброс после победы и ничьей, клавиатурное управление и узкий экран.',
        status: 'pending',
      },
      {
        title: 'Запустить проверки проекта',
        detail:
          'Использовать команды lint, build и тестов, доступные в целевом React-проекте.',
        expectedResult: 'Доступные проверки проходят успешно.',
        verification: 'Запустить настроенные проверки и зафиксировать фактические результаты.',
        status: 'pending',
      },
    ],
  },
  expectedComponents: {
    confidence: 'low',
    basis:
      'Оценка выведена из шагов плана. Репозиторий и существующий каркас проекта cross не указаны; Ant Design API проверен для Taskmill dashboard, но зависимость целевого проекта не подтверждена.',
    files: {
      min: 3,
      max: 5,
    },
    libraryComponents: [
      {
        name: 'Button',
        estimatedInstances: 10,
        purpose: '9 игровых клеток и кнопка начала новой партии.',
        documentationUrl: 'https://ant.design/components/button',
        apiAvailability: 'needsVerification',
        apiEvidence:
          'В Ant Design 6.6.5 доступны onClick, disabled и htmlType; проверь наличие этой версии в целевом проекте cross.',
      },
      {
        name: 'Card',
        estimatedInstances: 1,
        purpose: 'Контейнер игрового поля.',
        documentationUrl: 'https://ant.design/components/card',
        apiAvailability: 'needsVerification',
        apiEvidence:
          'Компонент и API title/children доступны в Ant Design dashboard; зависимость целевого проекта не подтверждена.',
      },
      {
        name: 'Alert',
        estimatedInstances: 1,
        purpose: 'Показ результата партии: победа или ничья.',
        documentationUrl: 'https://ant.design/components/alert',
        apiAvailability: 'needsVerification',
        apiEvidence:
          'В Ant Design 6.6.5 доступны title, description, type и showIcon; проверь наличие этой версии в целевом проекте cross.',
      },
      {
        name: 'Typography.Title',
        estimatedInstances: 1,
        purpose: 'Заголовок игры.',
        documentationUrl: 'https://ant.design/components/typography',
        apiAvailability: 'needsVerification',
        apiEvidence:
          'Компонент доступен в Ant Design dashboard; проверь наличие зависимости в целевом проекте cross.',
      },
      {
        name: 'Typography.Text',
        estimatedInstances: 2,
        purpose: 'Текущий ход и вспомогательный статус партии.',
        documentationUrl: 'https://ant.design/components/typography',
        apiAvailability: 'needsVerification',
        apiEvidence:
          'Компонент доступен в Ant Design dashboard; проверь наличие зависимости в целевом проекте cross.',
      },
    ],
    customComponents: [
      {
        name: 'CrossGamePage',
        purpose: 'Собирает экран игры и связывает состояние партии с интерфейсом.',
        placement: 'module',
        placementReason:
          'Компонент относится только к проекту cross; оснований выносить его в общую библиотеку нет.',
      },
      {
        name: 'GameBoard',
        purpose: 'Отображает сетку 3×3 и игровые клетки.',
        placement: 'module',
        placementReason:
          'Логика и визуальное представление специфичны для крестиков-ноликов и пока не переиспользуются другими модулями.',
      },
    ],
  },
  workflow: {
    name: 'Создание игры',
    currentStep: 1,
    totalSteps: 5,
    questions: [
      {
        question: 'Для кого предназначена игра?',
        answer: 'Для двух игроков на одном устройстве.',
        status: 'answered',
      },
      {
        question: 'Где находится целевой React-проект для реализации?',
        answer: 'Путь к репозиторию или рабочей директории проекта cross не указан.',
        status: 'current',
      },
    ],
  },
  references: [
    { name: 'Файл задачи', value: 'tasks/0001/task0001.md' },
    { name: 'Taskmill TaskData', value: 'apps/web/src/types/task.ts' },
  ],
}
