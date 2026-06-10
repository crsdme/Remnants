import type { UserRoleDTO } from '@remnant/shared'
import type { UserRoleDB } from '@/types/'

export function mapUserRoleToDTO(userRole: UserRoleDB): UserRoleDTO {
  return {
    id: userRole._id,
    names: userRole.names,
    permissions: userRole.permissions,
    priority: userRole.priority,
    active: userRole.active,
    removed: userRole.removed,
    createdAt: userRole.createdAt,
    updatedAt: userRole.updatedAt,
  }
}
