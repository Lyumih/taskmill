import { Card, Collapse, Flex, Tag, Typography } from 'antd'
import type { TaskData } from '../../types/task'

const { Text } = Typography

type PermissionsFlagsProps = {
  rules?: TaskData['permissionsFlags']
}

export function PermissionsFlags({ rules }: PermissionsFlagsProps) {
  const flags = rules?.featureFlags ?? []
  const permissions = rules?.permissions ?? []

  const content = rules === undefined ? (
    <Text type="secondary">Правила feature flags и permissions ещё не описаны.</Text>
  ) : flags.length || permissions.length ? (
    <Flex vertical gap="middle">
      <Flex vertical gap="small">
        <Text strong>Feature flags</Text>
        {flags.length ? flags.map((flag, index) => (
          <Card key={flag.key ?? `feature-flag-${index}`} size="small">
            <Flex vertical gap="small">
              <Flex align="center" gap="small" wrap="wrap">
                <Text code>{flag.key ?? 'Flag без ключа'}</Text>
                <Tag color="processing">Feature flag</Tag>
              </Flex>
              {flag.controlsBlock && <Text>Управляет блоком: {flag.controlsBlock}</Text>}
              {flag.whenEnabled && <Text type="secondary">Включён: {flag.whenEnabled}</Text>}
              {flag.whenDisabled && <Text type="secondary">Выключен: {flag.whenDisabled}</Text>}
            </Flex>
          </Card>
        )) : <Text type="secondary">Feature flags не используются.</Text>}
      </Flex>

      <Flex vertical gap="small">
        <Text strong>Permissions</Text>
        {permissions.length ? permissions.map((permission, index) => (
          <Card key={permission.key ?? `permission-${index}`} size="small">
            <Flex vertical gap="small">
              <Flex align="center" gap="small" wrap="wrap">
                <Text code>{permission.key ?? 'Permission без ключа'}</Text>
                <Tag color="blue">Permission</Tag>
              </Flex>
              {permission.controlsBlock && <Text>Управляет блоком: {permission.controlsBlock}</Text>}
              {permission.whenGranted && <Text type="secondary">Доступ разрешён: {permission.whenGranted}</Text>}
              {permission.whenDenied && <Text type="secondary">Доступ запрещён: {permission.whenDenied}</Text>}
            </Flex>
          </Card>
        )) : <Text type="secondary">Permissions не используются.</Text>}
      </Flex>
    </Flex>
  ) : (
    <Text type="secondary">Для задачи feature flags и permissions не предусмотрены.</Text>
  )

  return (
    <Collapse
      items={[{ key: 'permissions-flags', label: 'Permissions / Flags', children: content }]}
    />
  )
}
