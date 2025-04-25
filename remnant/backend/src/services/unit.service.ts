import mongoose, { ObjectId, Schema } from 'mongoose'
import UnitModel, { UnitInterface } from '../models/unit'

interface getUnitsResult {
  units: any[]
  unitsCount: number
}

interface getUnitsParams {
  filters: any[]
  sorters: any[]
  pagination: {
    current: number
    pageSize: number
  }
}

export async function get(payload: getUnitsParams): Promise<getUnitsResult> {
  const { current = 1, pageSize = 10 } = payload.pagination
  const query = { removed: false }

  const pipeline = [
    {
      $match: query,
    },  
  ]

  const unitsCount = await UnitModel.countDocuments(query)

  let unitsQuery = UnitModel.aggregate(pipeline)

  unitsQuery = unitsQuery.skip((current - 1) * pageSize).limit(pageSize)

  const units = await unitsQuery.exec()

  if (!units) {
    throw new Error('Units not found')
  }

  return { units, unitsCount }
}

interface createUnitResult {
  unit: any
}

interface createUnitParams {
  names: object
  symbols: object
  priority: number
  active?: boolean
}

export async function create(payload: createUnitParams): Promise<createUnitResult> {
  const unit = await UnitModel.create(payload)

  if (!unit) {
    throw new Error('Unit not created')
  }

  return { unit }
}

interface editUnitsResult {
  unit: any
}

interface editUnitParams {
  _id: string
  name: string
  code: string
  main?: boolean
  active?: boolean
}

export async function edit(payload: editUnitParams): Promise<editUnitsResult> {
  const { _id } = payload

  if (!_id) {
    throw new Error('Need _ID')
  }

  const unit = await UnitModel.updateOne({ _id }, payload)

  if (!unit) {
    throw new Error('unit not edited')
  }

  return { unit }
}

interface removeUnitResult {
  unit: any
}

interface removeUnitParams {
  _id: string
}

export async function remove(payload: removeUnitParams): Promise<removeUnitResult> {
  const { _id } = payload

  if (!_id) {
    throw new Error('Need _ID')
  }

  const unit = await UnitModel.updateOne({ _id }, { $set: { removed: true } })

  if (!unit) {
    throw new Error('unit not removed')
  }

  return { unit }
}
