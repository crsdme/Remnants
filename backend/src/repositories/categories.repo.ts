import type { AggregateResult, CategoryDTO } from '@remnant/shared'
import type { PipelineStage } from 'mongoose'
import type {
  CreateCategoriesRepoPayload,
  EditCategoriesRepoPayload,
  GetCategoriesRepoPayload,
  GetCategoriesRepoResult,
} from '@/types'
import { CategoryModel } from '@/models'
import { buildQuery, buildSortQuery, unwrapAggregate } from '@/utils'

// interface Node {
//   id: string
//   parent?: string
//   children: Node[]
//   [key: string]: any
// }

// function buildHierarchy(items: Node[]): Node[] {
//   const byId: Record<string, Node> = {}
//   const roots: Node[] = []

//   items.forEach((item) => {
//     byId[item.id] = { ...item, children: [], level: 0 }
//   })

//   items.forEach((item) => {
//     const node = byId[item.id]
//     if (item.parent && byId[item.parent]) {
//       node.level = byId[item.parent].level + 1
//       byId[item.parent].children.push(node)
//     }
//     else {
//       node.level = 0
//       roots.push(node)
//     }
//   })

//   return roots
// }

export async function list(payload: GetCategoriesRepoPayload): Promise<GetCategoriesRepoResult> {
  const {
    current = 1,
    pageSize = 10,
  } = payload.pagination

  const {
    ids,
    names,
    language,
    active,
    parent,
    priority,
    createdAt,
    updatedAt,
  } = payload.filters

  const query = buildQuery({
    filters: { _id: ids, names, active, priority, createdAt, updatedAt, parent },
    rules: {
      _id: { type: 'array' },
      names: { type: 'string', langAware: true },
      active: { type: 'array' },
      priority: { type: 'exact' },
      parent: { type: 'exact' },
      createdAt: { type: 'dateRange' },
      updatedAt: { type: 'dateRange' },
    },
    language,
  })

  const sorters = buildSortQuery(payload.sorters, { level: 1, priority: 1 })

  const pipeline: PipelineStage[] = [
    {
      $match: query,
    },
    {
      $sort: sorters,
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        seq: 1,
        names: 1,
        priority: 1,
        parent: 1,
        active: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
    {
      $facet: {
        items: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        count: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const raw = await CategoryModel.aggregate<AggregateResult<CategoryDTO>>(pipeline).exec()
  const { items, total } = unwrapAggregate(raw)

  // if (payload.isTree) {
  //   categories = buildHierarchy(categories.map((category: any) => category.toJSON()))
  // }

  return { items, total, page: current, pageSize }
}

export async function createOne(payload: CreateCategoriesRepoPayload) {
  return CategoryModel.create(payload)
}

export async function updateById(id: string, payload: EditCategoriesRepoPayload) {
  return CategoryModel.findOneAndUpdate(
    { _id: id },
    { $set: payload as unknown as Record<string, unknown> },
    { new: true, runValidators: true },
  ).exec()
}

export async function removeById(id: string) {
  return CategoryModel.findOneAndUpdate(
    { _id: id },
    { $set: { removed: true } },
    { new: true, runValidators: true },
  ).exec()
}
