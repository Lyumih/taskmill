import { Card, Collapse, Flex, Row, Col, Tag, Typography } from 'antd'
import type { TaskData } from '../../types/task'

const { Text } = Typography

type ApiErrorHandlingProps = {
  requests?: TaskData['apiRequests']
}

const statePresentationLabels: Record<string, string> = {
  none: 'Ничего не показывать',
  empty: 'Пустое состояние',
  skeleton: 'Skeleton',
  spinner: 'Индикатор загрузки',
  inline: 'Встроенный индикатор',
  content: 'Показать данные',
  'empty-state': 'Пустое состояние',
}

const errorPresentationLabels: Record<string, string> = {
  inline: 'В блоке запроса',
  'global-banner': 'Глобальный баннер',
  toast: 'Уведомление',
  custom: 'Кастомная обработка',
  hidden: 'Не показывать',
}

export function ApiErrorHandling({ requests }: ApiErrorHandlingProps) {
  const content = requests === undefined ? (
    <Text type="secondary">Сценарии API-запросов ещё не описаны.</Text>
  ) : requests.length ? (
    <Flex vertical gap="middle">
      {requests.map((request, requestIndex) => {
        const errorScenarios = request.statuses?.error?.scenarios ?? []

        return (
          <Card
            key={request.name ?? `api-request-${requestIndex}`}
            size="small"
            title={request.name ?? 'API-запрос'}
          >
            <Flex vertical gap="middle">
              {(request.method || request.endpoint) && (
                <Text code>{[request.method, request.endpoint].filter(Boolean).join(' ')}</Text>
              )}
              {request.purpose && <Text>{request.purpose}</Text>}

              <Row gutter={[12, 12]}>
                <Col xs={24} md={8}>
                  <Card size="small" title="Init">
                    <Flex vertical gap="small">
                      {request.statuses?.init?.presentation && (
                        <Tag>{statePresentationLabels[request.statuses.init.presentation] ?? request.statuses.init.presentation}</Tag>
                      )}
                      {request.statuses?.init?.description && <Text>{request.statuses.init.description}</Text>}
                    </Flex>
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card size="small" title="Pending">
                    <Flex vertical gap="small">
                      {request.statuses?.pending?.presentation && (
                        <Tag color="processing">
                          {statePresentationLabels[request.statuses.pending.presentation] ?? request.statuses.pending.presentation}
                        </Tag>
                      )}
                      {request.statuses?.pending?.description && <Text>{request.statuses.pending.description}</Text>}
                    </Flex>
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card size="small" title="Data">
                    <Flex vertical gap="small">
                      {request.statuses?.data?.presentation && (
                        <Tag color="success">
                          {statePresentationLabels[request.statuses.data.presentation] ?? request.statuses.data.presentation}
                        </Tag>
                      )}
                      {request.statuses?.data?.description && <Text>{request.statuses.data.description}</Text>}
                    </Flex>
                  </Card>
                </Col>
              </Row>

              <Card size="small" title="Error">
                {errorScenarios.length ? (
                  <Flex vertical gap="small">
                    {errorScenarios.map((scenario, scenarioIndex) => (
                      <Card key={`${scenario.kind ?? 'error'}-${scenarioIndex}`} size="small">
                        <Flex vertical gap="small">
                          <Flex align="center" gap="small" wrap="wrap">
                            <Text strong>{scenario.kind ?? 'Ошибка'}</Text>
                            <Tag color={scenario.visible ? 'warning' : 'default'}>
                              {scenario.visible ? 'Отображается' : 'Скрыта'}
                            </Tag>
                            <Tag>{scenario.scope === 'global' ? 'Глобальная' : 'Локальная'}</Tag>
                            {scenario.presentation && (
                              <Tag>{errorPresentationLabels[scenario.presentation] ?? scenario.presentation}</Tag>
                            )}
                            {scenario.retryable !== undefined && (
                              <Tag color={scenario.retryable ? 'blue' : 'default'}>
                                {scenario.retryable ? 'Повтор разрешён' : 'Без повтора'}
                              </Tag>
                            )}
                          </Flex>
                          {scenario.userMessage && <Text>{scenario.userMessage}</Text>}
                          {scenario.customBehavior && (
                            <Text type="secondary">Кастомное поведение: {scenario.customBehavior}</Text>
                          )}
                        </Flex>
                      </Card>
                    ))}
                  </Flex>
                ) : (
                  <Text type="secondary">Сценарии ошибок для запроса не описаны.</Text>
                )}
              </Card>
            </Flex>
          </Card>
        )
      })}
    </Flex>
  ) : (
    <Text type="secondary">Для задачи API-запросы не предусмотрены.</Text>
  )

  return (
    <Collapse
      items={[{ key: 'api-errors', label: 'Обработка ошибок API', children: content }]}
    />
  )
}
