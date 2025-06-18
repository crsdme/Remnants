interface Rule {
  type: 'string' | 'array' | 'exact' | 'dateRange' | 'multiFieldSearch'
  field?: string
  langAware?: boolean
  multiFields?: { field: string, langAware?: boolean }[]
}

interface BuildQueryOptions {
  filters: Record<string, any>
  rules: Record<string, Rule>
  language?: string
  removed?: boolean
  batch?: {
    ids: string[]
  }
}

export function buildQuery({ filters, rules, language = 'en', removed = true, batch }: BuildQueryOptions): Record<string, any> {
  let query: Record<string, any> = {}

  if (removed) {
    query.removed = false
  }

  for (const [key, rule] of Object.entries(rules)) {
    const value = filters[key]
    const field = rule.field || key

    if (value === undefined || value === '')
      continue

    switch (rule.type) {
      case 'string':
        query[rule.langAware ? `${field}.${language}` : field] = {
          $regex: `^${value}`,
          $options: 'i',
        }
        break

      case 'array':
        if (Array.isArray(value) && value.length > 0) {
          query[field] = { $in: value }
        }
        break

      case 'exact':
        query[field] = value
        break

      case 'multiFieldSearch': {
        const terms = String(value).trim().toLowerCase().split(/\s+/)

        const searchConditions = terms.map(term => ({
          $or: rule.multiFields!.map(({ field, langAware = false }) => ({
            [langAware ? `${field}.${language}` : field]: { $regex: term, $options: 'i' },
          })),
        }))

        query.$and = query.$and || []
        query.$and.push(...searchConditions)
        break
      }

      case 'dateRange':
        if (value.from && value.to) {
          query[field] = { $gte: value.from, $lte: value.to }
        }
        break
    }
  }

  if (batch?.ids) {
    query = { _id: { $in: batch.ids } }
  }

  return query
}

export function buildSortQuery(sort: Record<string, string>, defaultSorters: Record<string, any> = { _id: 1, id: 1 }): Record<string, any> {
  let sortersQuery: Record<string, any> = defaultSorters

  if (!sort)
    return sortersQuery

  if (Object.entries(sort).length > 0) {
    sortersQuery = Object.fromEntries(
      Object.entries(sort).map(([key, value]) => [
        key,
        value === 'asc' ? 1 : -1,
      ]),
    )
  }

  return sortersQuery
}
