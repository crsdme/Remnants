import type { LanguageDTO } from '@remnant/shared'
import type { LanguageDB } from '@/types/'

export function mapLanguageToDTO(language: LanguageDB): LanguageDTO {
  return {
    id: language._id,
    seq: language.seq,
    name: language.name,
    code: language.code,
    main: language.main,
    priority: language.priority,
    active: language.active,
    createdAt: language.createdAt,
    updatedAt: language.updatedAt,
  }
}
