import type { ProductPopulatedDTO } from '@remnant/shared'
import type { ProductPopulatedRepo } from '@/types/'
import { STORAGE_URLS } from '@/config'
import { fromMinor } from '@/utils/money'

export function mapProductPopulatedRepoToDTO(product: ProductPopulatedRepo): ProductPopulatedDTO {
  const {
    minorPrice,
    minorPurchasePrice,
    currency,
    purchaseCurrency,
    images,
    ...rest
  } = product

  return {
    ...rest,
    price: Number.parseFloat(fromMinor(minorPrice, currency.scale)),
    currency: {
      id: currency.id,
      names: currency.names,
      symbols: currency.symbols,
    },
    ...(minorPurchasePrice !== undefined && purchaseCurrency
      ? {
          purchasePrice: Number.parseFloat(fromMinor(minorPurchasePrice, purchaseCurrency.scale)),
          purchaseCurrency: {
            id: purchaseCurrency.id,
            names: purchaseCurrency.names,
            symbols: purchaseCurrency.symbols,
          },
        }
      : {}),
    images: images.map(image => ({
      id: image.filename,
      path: `${STORAGE_URLS.productImages}/${image.filename}`,
      filename: image.filename,
      name: image.name,
      type: image.type,
    })),
  } as ProductPopulatedDTO
}
