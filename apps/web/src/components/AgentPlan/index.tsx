import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { Collapse, Flex, Progress, Tag, Typography } from 'antd'
import type { TaskData } from '../../types/task'

const { Text } = Typography

type AgentPlanProps = {
  plan?: TaskData['plan']
}

export function AgentPlan({ plan }: AgentPlanProps) {
  const steps = plan?.steps ?? []

  return (
    <Collapse
      defaultActiveKey={['agent-plan']}
      items={[
        {
          key: 'agent-plan',
          label: 'Подробный пошаговый план агента',
          extra: plan?.progress !== undefined && (
            <Progress percent={plan.progress} size="small" />
          ),
          children: (
            <Flex vertical gap="middle">
              {plan?.summary && <Text type="secondary">{plan.summary}</Text>}
              {steps.length ? (
                <Collapse
                  defaultActiveKey={steps.map((_, index) => `step-${index}`)}
                  items={steps.map((step, index) => ({
                    key: `step-${index}`,
                    label: `Шаг ${index + 1}. ${step.title ?? 'Без названия'}`,
                    extra: step.status === 'done' ? (
                      <Tag color="success" icon={<CheckCircleOutlined />}>Готово</Tag>
                    ) : step.status === 'inProgress' ? (
                      <Tag color="processing" icon={<ClockCircleOutlined />}>В работе</Tag>
                    ) : step.status === 'pending' ? (
                      <Tag>В очереди</Tag>
                    ) : undefined,
                    children: (
                      <Flex vertical gap="middle">
                        {step.detail && <Text>{step.detail}</Text>}
                        {step.actions?.length ? (
                          <Flex vertical gap="small">
                            <Text strong>Действия</Text>
                            {step.actions.map((action, actionIndex) => (
                              <Text key={`action-${actionIndex}`}>• {action}</Text>
                            ))}
                          </Flex>
                        ) : null}
                        {step.expectedResult && (
                          <Flex vertical>
                            <Text strong>Ожидаемый результат</Text>
                            <Text type="secondary">{step.expectedResult}</Text>
                          </Flex>
                        )}
                        {step.verification && (
                          <Flex vertical>
                            <Text strong>Проверка</Text>
                            <Text type="secondary">{step.verification}</Text>
                          </Flex>
                        )}
                      </Flex>
                    ),
                  }))}
                />
              ) : (
                <Text type="secondary">Шаги плана пока не добавлены.</Text>
              )}
            </Flex>
          ),
        },
      ]}
    />
  )
}
