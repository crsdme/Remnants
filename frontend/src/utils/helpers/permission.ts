import { USER_ROLE_PERMISSIONS } from '@/utils/constants'

const ALL_PERMISSIONS = new Set<string>(
  USER_ROLE_PERMISSIONS.flatMap(section => section.groups.flatMap(group => [...group.permissions])),
)

const GROUP_BY_PERMISSION = new Map<string, (typeof USER_ROLE_PERMISSIONS)[number]['groups'][number]>(
  USER_ROLE_PERMISSIONS.flatMap(section =>
    section.groups.flatMap(group => group.permissions.map(permission => [permission, group])),
  ),
)

function intraGroupDeps(permission: string): string[] {
  const dot = permission.lastIndexOf('.')
  if (dot < 0)
    return []

  const entity = permission.slice(0, dot)
  const action = permission.slice(dot + 1)
  if (!action || action === 'read')
    return []

  const deps: string[] = []
  if (action !== 'page' && ALL_PERMISSIONS.has(`${entity}.page`))
    deps.push(`${entity}.page`)
  if (ALL_PERMISSIONS.has(`${entity}.read`))
    deps.push(`${entity}.read`)
  return deps
}

function collectDeps(permission: string, into: Set<string>, visiting = new Set<string>()) {
  if (visiting.has(permission))
    return
  visiting.add(permission)
  into.add(permission)

  for (const dep of intraGroupDeps(permission))
    collectDeps(dep, into, visiting)

  const group = GROUP_BY_PERMISSION.get(permission)
  const deps = group && 'dependencies' in group ? group.dependencies : undefined
  for (const dep of deps ?? [])
    collectDeps(dep, into, visiting)
}

/** Adds a permission plus intra-group and cross-group dependencies. */
export function addPermissionWithDeps(selected: string[], permission: string): string[] {
  const next = new Set(selected)
  collectDeps(permission, next)
  return [...next]
}

export function hasPermission(permissions: string[] = [], required: string | string[]) {
  if (permissions.includes('other.admin'))
    return true

  if (Array.isArray(required))
    return required.some(permission => permissions.includes(permission))

  return permissions.includes(required)
}
