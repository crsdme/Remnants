import type {
  AuthUser,
  CreateDeliveryServiceResponse,
  DeliveryServiceCredentials,
  EditDeliveryServiceResponse,
  GetDeliveryServicesResponse,
  RemoveDeliveryServicesResponse,
} from '@remnant/shared'
import type {
  CreateDeliveryServicesPayload,
  DeliveryServiceDB,
  EditDeliveryServicesPayload,
  GetDeliveryServicesPayload,
  RemoveDeliveryServicesPayload,
} from '@/types/delivery-service.type'
import { DELIVERY_SERVICE_API_KEY_MASK } from '@remnant/shared'
import { mapDeliveryServiceToDTO } from '@/mappers/delivery-services.mapper'
import { DeliveryServiceModel } from '@/models/'
import * as DeliveryServicesRepo from '@/repositories/delivery-services.repo'
import * as UserAccessRepo from '@/repositories/user-access.repo'
import { getScopeIdsForUser, HttpError } from '@/utils/'

function isMaskedApiKey(apiKey: string): boolean {
  return apiKey.length === 0 || apiKey === DELIVERY_SERVICE_API_KEY_MASK
}

function mergeCredentials(params: {
  type: EditDeliveryServicesPayload['type']
  existing?: DeliveryServiceDB['credentials']
  incoming: DeliveryServiceCredentials
}): DeliveryServiceCredentials {
  const { type, existing, incoming } = params

  if (type === 'selfpickup' || incoming.type === 'selfpickup')
    return { type: 'selfpickup' }

  const existingKey = existing?.type === 'novaposhta' ? existing.apiKey : ''
  const apiKey = isMaskedApiKey(incoming.apiKey) ? existingKey : incoming.apiKey

  return {
    type: 'novaposhta',
    apiKey,
    phone: incoming.phone,
    sender: incoming.sender,
  }
}

export async function get({
  payload,
  user,
}: {
  payload: GetDeliveryServicesPayload
  user: AuthUser
}): Promise<GetDeliveryServicesResponse> {
  const access = await UserAccessRepo.getScopesByUserId(user.id)
  const scopeIds = getScopeIdsForUser(access, 'deliveryServiceIds', user)

  const { items, total, page, pageSize } = await DeliveryServicesRepo.list(payload, { scopeIds })

  return {
    status: 'success',
    code: 'DELIVERY_SERVICES_FETCHED',
    message: 'Delivery services fetched',
    data: {
      items: items.map(mapDeliveryServiceToDTO),
      pagination: {
        page,
        pageSize,
        total,
      },
    },
  }
}

export async function create({ payload }: { payload: CreateDeliveryServicesPayload }): Promise<CreateDeliveryServiceResponse> {
  if (payload.type === 'novaposhta' && payload.credentials.type === 'novaposhta') {
    if (isMaskedApiKey(payload.credentials.apiKey)) {
      throw new HttpError(400, 'Nova Poshta API key is required', 'NOVA_POSHTA_API_KEY_REQUIRED')
    }
  }

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

  const existing = await DeliveryServicesRepo.findById(id)
  if (!existing) {
    throw new HttpError(400, 'Delivery service not found', 'DELIVERY_SERVICE_NOT_FOUND')
  }

  const credentials = mergeCredentials({
    type: payload.type,
    existing: existing.credentials,
    incoming: payload.credentials,
  })

  if (payload.type === 'novaposhta' && credentials.type === 'novaposhta' && !credentials.apiKey) {
    throw new HttpError(400, 'Nova Poshta API key is required', 'NOVA_POSHTA_API_KEY_REQUIRED')
  }

  const deliveryService = await DeliveryServicesRepo.updateById(id, {
    ...payload,
    credentials,
  })

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
