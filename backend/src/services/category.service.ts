import type * as CategoryTypes from '../types/category.type'
import fs from 'node:fs'
import path from 'node:path'
import ExcelJS from 'exceljs'
import { v4 as uuidv4 } from 'uuid'
import { PUBLIC_PATHS, STORAGE_PATHS } from '../config/constants'
import { LanguageModel } from '../models'
import { CategoryModel } from '../models/category.model'
import { HttpError } from '../utils/httpError'
import {
  extractLangMap,
  getId,
  parseFile,
  toBoolean,
  toNumber,
} from '../utils/parseTools'
import { buildQuery, buildSortQuery } from '../utils/queryBuilder'

interface Node {
  id: string
  parent?: string
  children: Node[]
  [key: string]: any
}

function buildHierarchy(items: Node[]): Node[] {
  const byId: Record<string, Node> = {}
  const roots: Node[] = []

  items.forEach((item) => {
    byId[item.id] = { ...item, children: [], level: 0 }
  })

  items.forEach((item) => {
    const node = byId[item.id]
    if (item.parent && byId[item.parent]) {
      node.level = byId[item.parent].level + 1
      byId[item.parent].children.push(node)
    }
    else {
      node.level = 0
      roots.push(node)
    }
  })

  return roots
}

export async function get(payload: CategoryTypes.getCategoriesParams): Promise<CategoryTypes.getCategoriesResult> {
  const { current = 1, pageSize = 10 } = payload.pagination

  const {
    names = '',
    language = 'en',
    active = undefined,
    priority = undefined,
    createdAt = {
      from: undefined,
      to: undefined,
    },
    updatedAt = {
      from: undefined,
      to: undefined,
    },
  } = payload.filters

  const sorters = buildSortQuery(payload.sorters)

  const filterRules = {
    names: { type: 'string', langAware: true },
    active: { type: 'array' },
    priority: { type: 'exact' },
    createdAt: { type: 'dateRange' },
    updatedAt: { type: 'dateRange' },
  } as const

  const query = buildQuery({
    filters: { names, active, priority, createdAt, updatedAt },
    rules: filterRules,
    language,
  })

  const pipeline = [
    {
      $match: query,
    },
    {
      $sort: sorters,
    },
    {
      $facet: {
        categories: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        totalCount: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const categoriesRaw = await CategoryModel.aggregate(pipeline).exec()

  let categories = categoriesRaw[0].categories.map((doc: any) => CategoryModel.hydrate(doc))
  const categoriesCount = categoriesRaw[0].totalCount[0]?.count || 0

  if (payload.isTree) {
    categories = buildHierarchy(categories.map((category: any) => category.toJSON()))
  }

  return { status: 'success', code: 'CATEGORIES_FETCHED', message: 'Categories fetched', categories, categoriesCount }
}

export async function create(payload: CategoryTypes.createCategoryParams): Promise<CategoryTypes.createCategoryResult> {
  const category = await CategoryModel.create(payload)

  return { status: 'success', code: 'CATEGORY_CREATED', message: 'Category created', category }
}

export async function edit(payload: CategoryTypes.editCategoryParams): Promise<CategoryTypes.editCategoryResult> {
  const { id } = payload

  const category = await CategoryModel.findOneAndUpdate({ _id: id }, payload)

  if (!category) {
    throw new HttpError(400, 'Category not edited', 'CATEGORY_NOT_EDITED')
  }

  return { status: 'success', code: 'CATEGORY_EDITED', message: 'Category edited', category }
}

export async function remove(payload: CategoryTypes.removeCategoriesParams): Promise<CategoryTypes.removeCategoriesResult> {
  const { ids } = payload

  const categories = await CategoryModel.updateMany(
    { _id: { $in: ids } },
    { $set: { removed: true } },
  )

  if (!categories) {
    throw new HttpError(400, 'Categories not removed', 'CATEGORIES_NOT_REMOVED')
  }

  return { status: 'success', code: 'CATEGORIES_REMOVED', message: 'Categories removed' }
}

export async function batch(payload: CategoryTypes.batchCategoriesParams): Promise<CategoryTypes.batchCategoriesResult> {
  const { ids, filters, params } = payload

  const {
    names = '',
    language = 'en',
    active = undefined,
    priority = undefined,
    createdAt = {
      from: undefined,
      to: undefined,
    },
    updatedAt = {
      from: undefined,
      to: undefined,
    },
  } = filters || {}

  const allowedParams = ['names', 'priority', 'active', 'parent']

  const batchParams = params
    .filter(item => item.column && item.value && allowedParams.includes(item.column))
    .map(item => ({ [`${item.column}`]: item.value }))

  const mergedBatchParams = Object.assign({}, ...batchParams)

  const filterRules = {
    names: { type: 'string', langAware: true },
    active: { type: 'array' },
    priority: { type: 'exact' },
    createdAt: { type: 'dateRange' },
    updatedAt: { type: 'dateRange' },
  } as const

  const query = buildQuery({
    filters: { names, active, priority, createdAt, updatedAt },
    rules: filterRules,
    language,
    batch: { ids: ids.map(id => id.toString()) },
  })

  const categories = await CategoryModel.updateMany(
    query,
    { $set: mergedBatchParams },
  )

  if (!categories) {
    throw new HttpError(400, 'Categories not batch edited', 'CATEGORIES_NOT_BATCH_EDITED')
  }

  return { status: 'success', code: 'CATEGORIES_BATCH_EDITED', message: 'Categories batch edited' }
}

export async function duplicate(payload: CategoryTypes.duplicateCategoryParams): Promise<CategoryTypes.duplicateCategoryResult> {
  const { ids } = payload

  const categories = await CategoryModel.find({ _id: { $in: ids } })

  const parsedCategories = categories.map(category => ({
    names: category.names,
    priority: category.priority,
    parent: category.parent,
    active: category.active,
  }))

  await CategoryModel.create(parsedCategories)

  return { status: 'success', code: 'CATEGORIES_DUPLICATED', message: 'Categories duplicated' }
}

export async function importHandler(payload: CategoryTypes.importCategoriesParams): Promise<CategoryTypes.importCategoriesResult> {
  const { file } = payload

  const storedFile = await parseFile(file.path)

  const parsedCategories = storedFile.map(row => ({
    _id: row.id || undefined,
    names: extractLangMap(row, 'name'),
    priority: toNumber(row.priority),
    parent: getId(row.parent),
    active: toBoolean(row.active),
  }))

  const categoriesForEdit = parsedCategories.filter(category => category._id)
  const categoriesForCreate = parsedCategories.filter(category => !category._id)

  if (categoriesForEdit.length > 0) {
    const bulkCategories = categoriesForEdit.map(category => ({
      updateOne: {
        filter: { _id: category._id },
        update: {
          $set: {
            names: category.names,
            priority: category.priority,
            parent: category.parent || null,
            active: category.active,
          },
        },
      },
    }))

    await CategoryModel.bulkWrite(bulkCategories)
  }
  if (categoriesForCreate.length > 0) {
    await CategoryModel.create(categoriesForCreate)
  }

  const categoryIds = [...categoriesForEdit, ...categoriesForCreate].map(category => category?._id)

  return { status: 'success', code: 'CATEGORIES_IMPORTED', message: 'Categories imported', categoryIds }
}

export async function exportHandler(payload: CategoryTypes.exportCategoriesParams): Promise<CategoryTypes.exportCategoriesResult> {
  const { ids } = payload

  const userLanguage = 'ru'

  const languages = await LanguageModel.find({ active: true, removed: false })
  const categories = await CategoryModel.find({ active: true, removed: false })

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Categories')

  sheet.columns = [
    { header: 'id', key: 'id' },
    ...languages.map(lang => ({
      header: `name_${lang.code}`,
      key: `name_${lang.code}`,
    })),
    { header: 'parent', key: 'parent' },
    { header: 'priority', key: 'priority' },
    { header: 'active', key: 'active' },
  ]

  if ((ids || []).length > 0) {
    const selectedCategories = await CategoryModel.find({ _id: { $in: ids } })
    selectedCategories.forEach((cat) => {
      const row: Record<string, any> = {}

      row.id = cat._id
      for (const lang of languages) {
        row[`name_${lang.code}`] = (cat.names as Map<string, string>).get(lang.code) || ''
      }

      const parentCategory = categories.find(c => c._id.toString() === cat.parent?.toString())
      const parentName = parentCategory
        ? `${parentCategory.names.get(userLanguage) || 'NO_NAME'} (${parentCategory._id})`
        : ''
      row.parent = parentName

      row.priority = cat.priority
      row.active = cat.active

      sheet.addRow(row)
    })
  }
  else {
    sheet.addRow({
      ...languages.map(lang => ({
        [`name_${lang.code}`]: `name.${lang.code}`,
      })),
      parent: '1',
      priority: 1,
      active: true,
    })
  }

  const parentOptions = categories.map((cat) => {
    const name = cat.names.get(userLanguage) || 'NO_NAME'
    return `${name} (${cat._id})`
  })

  const hiddenSheet = workbook.addWorksheet('ParentOptions')
  hiddenSheet.state = 'veryHidden'

  parentOptions.forEach((value, index) => {
    hiddenSheet.getCell(`A${index + 1}`).value = value
  })

  const formulaRange = `ParentOptions!$A$1:$A$${parentOptions.length}`
  const parentCol = sheet.columns.findIndex(col => col.key === 'parent') + 1

  for (let i = 2; i <= sheet.rowCount; i++) {
    sheet.getCell(i, parentCol).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [formulaRange],
    }
  }

  const fileName = `${uuidv4()}.xlsx`
  const storagePath = path.join(STORAGE_PATHS.exportCategories, fileName)
  await workbook.xlsx.writeFile(storagePath)
  const publicPath = `${PUBLIC_PATHS.exportCategories}/${fileName}`

  return { status: 'success', code: 'CATEGORIES_EXPORTED', message: 'Categories exported', fullPath: publicPath }
}
