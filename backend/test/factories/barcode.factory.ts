import type { CreateBarcodeRequest, EditBarcodeRequest, GetBarcodesRequest, RemoveBarcodesRequest } from '@remnant/shared'
import request from 'supertest'
import app from '@/index'
import { BarcodeModel } from '../../src/models/barcode.model'

export async function create(params: CreateBarcodeRequest): Promise<unknown> {
  const response = await request(app).post('/api/barcodes/create').send(params)

  return response.body
}

export async function get(params?: GetBarcodesRequest): Promise<unknown> {
  if (!params) {
    params = {
      pagination: {
        current: 1,
        pageSize: 10,
      },
    }
  }

  const response = await request(app).get('/api/barcodes/get').query(params)

  return response.body
}

export async function edit(params: EditBarcodeRequest): Promise<unknown> {
  const response = await request(app).post('/api/barcodes/edit').send(params)

  return response.body
}

export async function remove(params: RemoveBarcodesRequest): Promise<unknown> {
  const response = await request(app).post('/api/barcodes/remove').send(params)

  return response.body
}

export async function removeAll(): Promise<unknown> {
  const response = await BarcodeModel.deleteMany({})

  return response
}
