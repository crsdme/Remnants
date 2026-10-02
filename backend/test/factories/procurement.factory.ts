import type {
  CancelProcurementPaymentRequest,
  ConfirmProcurementRequest,
  CreateProcurementRequest,
  EditProcurementRequest,
  GetProcurementsRequest,
  PayProcurementRequest,
  PaySupplierRequest,
  RemoveProcurementsRequest,
  UnconfirmProcurementRequest,
} from '@remnant/shared'
import request from 'supertest'
import app from '@/index'
import { ProcurementItemModel, ProcurementModel } from '@/models'

export async function create(params: CreateProcurementRequest): Promise<unknown> {
  const response = await request(app).post('/api/procurements/create').send(params)
  return response.body
}

export async function confirm(params: ConfirmProcurementRequest): Promise<unknown> {
  const response = await request(app).post('/api/procurements/confirm').send(params)
  return response.body
}

export async function unconfirm(params: UnconfirmProcurementRequest): Promise<unknown> {
  const response = await request(app).post('/api/procurements/unconfirm').send(params)
  return response.body
}

export async function pay(params: PayProcurementRequest): Promise<unknown> {
  const response = await request(app).post('/api/procurements/pay').send(params)
  return response.body
}

export async function cancelPayment(params: CancelProcurementPaymentRequest): Promise<unknown> {
  const response = await request(app).post('/api/procurements/pay/cancel').send(params)
  return response.body
}

export async function paySupplier(params: PaySupplierRequest): Promise<unknown> {
  const response = await request(app).post('/api/procurements/pay/supplier').send(params)
  return response.body
}

export async function edit(params: EditProcurementRequest): Promise<unknown> {
  const response = await request(app).post('/api/procurements/edit').send(params)
  return response.body
}

export async function get(params?: GetProcurementsRequest): Promise<unknown> {
  const response = await request(app).get('/api/procurements/get').query(params ?? {
    pagination: { current: 1, pageSize: 10 },
  })
  return response.body
}

export async function remove(params: RemoveProcurementsRequest): Promise<unknown> {
  const response = await request(app).post('/api/procurements/remove').send(params)
  return response.body
}

export async function removeAll(): Promise<unknown> {
  await ProcurementItemModel.deleteMany({})
  return ProcurementModel.deleteMany({})
}
