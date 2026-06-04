import type { UserDTO } from '@remnant/shared'
import type { UserDB } from '@/types/'

export function mapUserToDTO(user: UserDB): UserDTO {
  return {
    id: user._id,
    login: user.login,
    name: user.name,
    role: user.role,
    active: user.active,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}
