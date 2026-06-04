import type {
  CreateDeliveryServiceResponse,
  EditDeliveryServiceResponse,
  GetDeliveryServicesResponse,
  RemoveDeliveryServicesResponse,
} from '@remnant/shared'
import type {
  CreateDeliveryServicesPayload,
  EditDeliveryServicesPayload,
  GetDeliveryServicesPayload,
  RemoveDeliveryServicesPayload,
} from '@/types/delivery-services.type'
import { mapDeliveryServiceToDTO } from '@/mappers/'
import { DeliveryServiceModel } from '@/models/'
import * as DeliveryServicesRepo from '@/repositories/delivery-services.repo'
import { HttpError } from '@/utils/'

export async function get({ payload }: { payload: GetDeliveryServicesPayload }): Promise<GetDeliveryServicesResponse> {
  const { items, total, page, pageSize } = await DeliveryServicesRepo.list(payload)

  return {
    status: 'success',
    code: 'DELIVERY_SERVICES_FETCHED',
    message: 'Delivery services fetched',
    data: {
      items,
      pagination: {
        page,
        pageSize,
        total,
      },
    },
  }
}

export async function create({ payload }: { payload: CreateDeliveryServicesPayload }): Promise<CreateDeliveryServiceResponse> {
  const deliveryService = await DeliveryServicesRepo.createOne(payload)

  return {
    status: 'success',
    code: 'DELIVERY_SERVICE_CREATED',
    message: 'Delivery service created',
    data: mapDeliveryServiceToDTO(deliveryService),
  }
}

export async function edit({ payload }: { payload: EditDeliveryServicesPayload }): Promise<EditDeliveryServiceResponse> {
  const { id } = payload

  const deliveryService = await DeliveryServiceModel.findOneAndUpdate({ _id: id }, payload)

  if (!deliveryService) {
    throw new HttpError(400, 'Delivery service not edited', 'DELIVERY_SERVICE_NOT_EDITED')
  }

  return {
    status: 'success',
    code: 'DELIVERY_SERVICE_EDITED',
    message: 'Delivery service edited',
    data: mapDeliveryServiceToDTO(deliveryService),
  }
}

export async function remove({ payload }: { payload: RemoveDeliveryServicesPayload }): Promise<RemoveDeliveryServicesResponse> {
  const { ids } = payload

  const deliveryServices = await DeliveryServiceModel.updateMany(
    { _id: { $in: ids } },
    { $set: { removed: true } },
  )

  if (deliveryServices.modifiedCount === 0) {
    throw new HttpError(400, 'Delivery services not removed', 'DELIVERY_SERVICES_NOT_REMOVED')
  }

  return {
    status: 'success',
    code: 'DELIVERY_SERVICES_REMOVED',
    message: 'Delivery services removed',
  }
}
