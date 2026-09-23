import type { ReactNode } from 'react'
import { Alert, Card, Col, Collapse, Flex, Row, Statistic, Tag, Tree, Typography } from 'antd'
import type { TaskData } from '../../types/task'

const { Link, Text } = Typography

type ExpectedComponentsProps = {
  estimate?: TaskData['expectedComponents']
}

type FileTreeNode = {
  key: string
  title: ReactNode
  children?: FileTreeNode[]
}

function buildFileTree(files: NonNullable<TaskData['expectedComponents']>['fileStructure'] = []) {
  const roots: FileTreeNode[] = []
  const nodesByPath = new Map<string, FileTreeNode>()

  for (const file of files) {
    if (!file.path) continue

    const segments = file.path.split('/').filter(Boolean)
    let parentPath = ''
    let children = roots

    segments.forEach((segment, index) => {
      parentPath = parentPath ? `${parentPath}/${segment}` : segment
      const isFile = index === segments.length - 1
      let node = nodesByPath.get(parentPath)

      if (!node) {
        node = { key: parentPath, title: segment }
        if (!isFile) node.children = []
        nodesByPath.set(parentPath, node)
        children.push(node)
      }

      if (isFile) {
        node.title = (
          <Flex align="center" gap="small" wrap="wrap">
            <Text code>{segment}</Text>
            <Tag color={file.change === 'new' ? 'success' : 'processing'}>
              {file.change === 'new' ? 'Создать' : file.change === 'modify' ? 'Изменить' : 'Тип не указан'}
            </Tag>
            {file.purpose && <Text type="secondary">{file.purpose}</Text>}
          </Flex>
        )
      } else {
        node.children ??= []
        children = node.children
      }
    })
  }

  return roots
}

export function ExpectedComponents({ estimate }: ExpectedComponentsProps) {
  const libraryComponents = estimate?.libraryComponents ?? []
  const customComponents = estimate?.customComponents ?? []
  const fileStructure = estimate?.fileStructure ?? []
  const fileTree = buildFileTree(fileStructure)
  const totalLibraryInstances = libraryComponents.reduce(
    (total, component) => total + (component.estimatedInstances ?? 0),
    0,
  )
  const fileRange = estimate?.files?.min !== undefined && estimate.files.max !== undefined
    ? estimate.files.min === estimate.files.max
      ? estimate.files.min
      : `${estimate.files.min}–${estimate.files.max}`
    : '—'

  return (
    <Collapse
      defaultActiveKey={['expected-components']}
      items={[
        {
          key: 'expected-components',
          label: 'Ожидаемое количество компонентов',
          extra: estimate?.confidence === 'high' ? (
            <Tag color="success">Высокая уверенность</Tag>
          ) : estimate?.confidence === 'medium' ? (
            <Tag color="processing">Средняя уверенность</Tag>
          ) : estimate?.confidence === 'low' ? (
            <Tag color="warning">Низкая уверенность</Tag>
          ) : undefined,
          children: estimate ? (
            <Flex vertical gap="middle">
              <Alert
                description={estimate.basis}
                showIcon
                title="Предварительная оценка по шагам плана"
                type={estimate.confidence === 'low' ? 'warning' : 'info'}
              />

              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} xl={8}>
                  <Statistic title="Ожидаемые файлы" value={fileRange} />
                </Col>
                <Col xs={24} sm={12} xl={8}>
                  <Statistic title="Новые кастомные компоненты" value={customComponents.length} />
                </Col>
                <Col xs={24} sm={12} xl={8}>
                  <Statistic title="Использования компонентов библиотеки" value={totalLibraryInstances} />
                </Col>
              </Row>

              <Flex vertical gap="small">
                <Text strong>Примерная структура новых/изменённых файлов</Text>
                {fileTree.length ? (
                  <Tree defaultExpandAll selectable={false} showLine treeData={fileTree} />
                ) : (
                  <Text type="secondary">Структура файлов пока не оценена.</Text>
                )}
              </Flex>

              <Flex vertical gap="small">
                <Text strong>Компоненты библиотеки</Text>
                {libraryComponents.length ? (
                  <Row gutter={[12, 12]}>
                    {libraryComponents.map((component, index) => (
                      <Col key={component.name ?? `library-component-${index}`} xs={24} md={12}>
                        <Card size="small">
                          <Flex vertical gap="small">
                            <Flex align="center" justify="space-between" gap="small" wrap="wrap">
                              {component.documentationUrl ? (
                                <Link href={component.documentationUrl} rel="noopener noreferrer" target="_blank">
                                  {component.name ?? 'Документация компонента'}
                                </Link>
                              ) : (
                                <Text code>{component.name ?? 'Компонент'}</Text>
                              )}
                              {component.apiAvailability === 'available' ? (
                                <Tag color="success">API проверен</Tag>
                              ) : component.apiAvailability === 'unavailable' ? (
                                <Tag color="error">API недоступен</Tag>
                              ) : (
                                <Tag color="warning">Нужно проверить</Tag>
                              )}
                            </Flex>
                            <Text type="secondary">
                              Примерно {component.estimatedInstances ?? '—'} использований
                            </Text>
                            {component.purpose && <Text>{component.purpose}</Text>}
                            {component.apiEvidence && (
                              <Text type="secondary">{component.apiEvidence}</Text>
                            )}
                          </Flex>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Text type="secondary">Компоненты библиотеки пока не оценены.</Text>
                )}
              </Flex>

              <Flex vertical gap="small">
                <Text strong>Кастомные компоненты</Text>
                {customComponents.length ? (
                  <Row gutter={[12, 12]}>
                    {customComponents.map((component, index) => (
                      <Col key={component.name ?? `custom-component-${index}`} xs={24} md={12}>
                        <Card size="small">
                          <Flex vertical gap="small">
                            <Flex align="center" justify="space-between" gap="small" wrap="wrap">
                              <Text strong>{component.name ?? 'Новый компонент'}</Text>
                              <Tag>{component.placement === 'shared-library' ? 'Общая библиотека' : 'Локально в модуле'}</Tag>
                            </Flex>
                            {component.purpose && <Text>{component.purpose}</Text>}
                            {component.placementReason && (
                              <Text type="secondary">{component.placementReason}</Text>
                            )}
                          </Flex>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Text type="secondary">Новые кастомные компоненты не ожидаются.</Text>
                )}
              </Flex>
            </Flex>
          ) : (
            <Text type="secondary">Оценка по шагам плана пока не добавлена.</Text>
          ),
        },
      ]}
    />
  )
}
