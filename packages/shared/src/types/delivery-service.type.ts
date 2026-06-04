import type {
  IdType,
  LanguageString,
  Response,
  ResponseItem,
  ResponseList,
} from './common.type'

export interface DeliveryServiceDTO {
  id: IdType
  names: LanguageString
  priority: number
  color: string
  type: 'novaposhta' | 'selfpickup'
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export type GetDeliveryServicesResponse = ResponseList<DeliveryServiceDTO>

export type CreateDeliveryServiceResponse = ResponseItem<DeliveryServiceDTO>

export type EditDeliveryServiceResponse = ResponseItem<DeliveryServiceDTO>

export type RemoveDeliveryServicesResponse = Response
