import type {
  AuthUser,
  CreateCurrencyResponse,
  EditCurrencyResponse,
  EditExchangeRateResponse,
  GetCurrenciesResponse,
  GetExchangeRatesResponse,
  RemoveCurrenciesResponse,
} from '@remnant/shared'
import type {
  CreateCurrencyPayload,
  EditCurrencyPayload,
  EditExchangeRatePayload,
  GetCurrencyPayload,
  GetExchangeRatesPayload,
  RemoveCurrencyPayload,
} from '@/types'
import { mapCurrencyToDTO, mapExchangeRateToDTO } from '@/mappers/'
import { CurrencyModel, ExchangeRateModel } from '@/models/'
import * as currenciesRepo from '@/repositories/currencies.repo'
import * as AuditLogsService from '@/services/audit-logs.service'
import { HttpError } from '@/utils/'

export async function get({ payload }: { payload: GetCurrencyPayload }): Promise<GetCurrenciesResponse> {
  const { items, total, page, pageSize } = await currenciesRepo.list(payload)

  return {
    status: 'success',
    code: 'CURRENCIES_FETCHED',
    message: 'Currencies fetched',
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

export async function create({ payload, user }: { payload: CreateCurrencyPayload, user?: AuthUser }): Promise<CreateCurrencyResponse> {
  const currencies = await CurrencyModel.find({})

  const currency = await CurrencyModel.create(payload)

  const exchangeRates = []

  for (const other of currencies) {
    exchangeRates.push(
      {
        fromCurrencyId: currency._id,
        toCurrencyId: other._id,
        rate: 1,
        comment: 'Auto-created on currency creation',
      },
      {
        fromCurrencyId: other._id,
        toCurrencyId: currency._id,
        rate: 1,
        comment: 'Auto-created on currency creation',
      },
    )
  }

  if (exchangeRates.length > 0)
    await ExchangeRateModel.insertMany(exchangeRates)

  await AuditLogsService.record({
    resourceType: 'currency',
    resourceId: currency._id.toString(),
    action: 'create',
    before: null,
    after: currency,
    createdBy: user?.id,
  })

  return {
    status: 'success',
    code: 'CURRENCY_CREATED',
    message: 'Currency created',
    data: mapCurrencyToDTO(currency),
  }
}

export async function edit({ payload, user }: { payload: EditCurrencyPayload, user?: AuthUser }): Promise<EditCurrencyResponse> {
  const { id } = payload

  const before = await CurrencyModel.findById(id).exec()
  const currency = await CurrencyModel.findOneAndUpdate({ _id: id }, payload, { new: true })

  if (!currency) {
    throw new HttpError(400, 'Currency not edited', 'CURRENCY_NOT_EDITED')
  }

  await AuditLogsService.record({
    resourceType: 'currency',
    resourceId: currency._id.toString(),
    action: 'edit',
    before,
    after: currency,
    createdBy: user?.id,
  })

  return {
    status: 'success',
    code: 'CURRENCY_EDITED',
    message: 'Currency edited',
    data: mapCurrencyToDTO(currency),
  }
}

export async function remove({ payload, user }: { payload: RemoveCurrencyPayload, user?: AuthUser }): Promise<RemoveCurrenciesResponse> {
  const { ids } = payload
  let removedCount = 0

  for (const id of ids) {
    const currency = await CurrencyModel.findOneAndUpdate(
      { _id: id },
      { $set: { removed: true } },
      { new: true },
    ).exec()

    if (!currency)
      continue

    removedCount += 1
    await AuditLogsService.record({
      resourceType: 'currency',
      resourceId: id,
      action: 'remove',
      before: currency,
      after: null,
      createdBy: user?.id,
    })
  }

  if (removedCount === 0) {
    throw new HttpError(400, 'Currencies not removed', 'CURRENCIES_NOT_REMOVED')
  }

  await ExchangeRateModel.updateMany(
    {
      $or: [
        { fromCurrencyId: { $in: ids } },
        { toCurrencyId: { $in: ids } },
      ],
    },
    { $set: { removed: true } },
  )

  return {
    status: 'success',
    code: 'CURRENCIES_REMOVED',
    message: 'Currencies removed',
  }
}

export async function getExchangeRates({ payload }: { payload: GetExchangeRatesPayload }): Promise<GetExchangeRatesResponse> {
  const { items, total, page, pageSize } = await currenciesRepo.listExchangeRates(payload)

  return {
    status: 'success',
    code: 'EXCHANGE_RATES_FETCHED',
    message: 'Exchange rates fetched',
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

export async function editExchangeRate({ payload }: { payload: EditExchangeRatePayload }): Promise<EditExchangeRateResponse> {
  const { id } = payload

  const exchangeRate = await currenciesRepo.updateExchangeRateById(id, payload)

  if (!exchangeRate) {
    throw new HttpError(400, 'Exchange rate not edited', 'EXCHANGE_RATE_NOT_EDITED')
  }

  return {
    status: 'success',
    code: 'EXCHANGE_RATE_EDITED',
    message: 'Exchange rate edited',
    data: mapExchangeRateToDTO(exchangeRate),
  }
}
