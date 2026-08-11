import type { CategoryDTO } from '@remnant/shared'
import type { CategoryDB } from '@/types'

export function mapCategoryToDTO(category: CategoryDB): CategoryDTO {
  return {
    id: category._id,
    seq: category.seq,
    names: category.names,
    priority: category.priority,
    parentId: category.parentId,
    active: category.active,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  }
}
