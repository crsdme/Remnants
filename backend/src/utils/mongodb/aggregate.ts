import type { AggregateResult } from '@remnant/shared'
import type { PipelineStage } from 'mongoose'

export function listFacet(
  itemsPipeline: PipelineStage[],
  skip: number,
  limit: number,
) {
  return {
    $facet: {
      items: [{ $skip: skip }, { $limit: limit }, ...itemsPipeline],
      count: [{ $count: 'count' }],
    },
  } as const
}

export function unwrapAggregate<T>(data: AggregateResult<T>[]) {
  if (data.length === 0)
    return { items: [], total: 0 }

  return {
    items: data[0]?.items ?? [],
    total: data[0]?.count[0]?.count ?? 0,
  }
}
