import type {
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

export async function create({ payload }: { payload: CreateCurrencyPayload }): Promise<CreateCurrencyResponse> {
  const currencies = await CurrencyModel.find({})

  const currency = await CurrencyModel.create(payload)

  const exchangeRates = []

  for (const other of currencies) {
    exchangeRates.push(
      {
        fromCurrency: currency._id,
        toCurrency: other._id,
        rate: 1,
        comment: 'Auto-created on currency creation',
      },
      {
        fromCurrency: other._id,
        toCurrency: currency._id,
        rate: 1,
        comment: 'Auto-created on currency creation',
      },
    )
  }

  if (exchangeRates.length > 0)
    await ExchangeRateModel.insertMany(exchangeRates)

  return {
    status: 'success',
    code: 'CURRENCY_CREATED',
    message: 'Currency created',
    data: mapCurrencyToDTO(currency),
  }
}

export async function edit({ payload }: { payload: EditCurrencyPayload }): Promise<EditCurrencyResponse> {
  const { id } = payload

  const currency = await CurrencyModel.findOneAndUpdate({ _id: id }, payload)

  if (!currency) {
    throw new HttpError(400, 'Currency not edited', 'CURRENCY_NOT_EDITED')
  }

  return {
    status: 'success',
    code: 'CURRENCY_EDITED',
    message: 'Currency edited',
    data: mapCurrencyToDTO(currency),
  }
}

export async function remove({ payload }: { payload: RemoveCurrencyPayload }): Promise<RemoveCurrenciesResponse> {
  const { ids } = payload

  const currencies = await CurrencyModel.updateMany(
    { _id: { $in: ids } },
    { $set: { removed: true } },
  )

  await ExchangeRateModel.updateMany(
    {
      $or: [
        { fromCurrency: { $in: ids } },
        { toCurrency: { $in: ids } },
      ],
    },
    { $set: { removed: true } },
  )

  if (currencies.modifiedCount === 0) {
    throw new HttpError(400, 'Currencies not removed', 'CURRENCIES_NOT_REMOVED')
  }

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
