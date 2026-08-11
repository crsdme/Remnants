import type { ProductPopulatedDTO } from '@remnant/shared'
import type { ProductDBPopulated } from '@/types/'
import path from 'node:path'
import { STORAGE_URLS } from '@/config'
import { fromMinor } from '@/utils/money'

export function mapProductPopulatedRepoToDTO(product: ProductDBPopulated): ProductPopulatedDTO {
  const {
    minorPrice,
    minorPurchasePrice,
    currency,
    purchaseCurrency,
    images,
    ...rest
  } = product

  return {
    id: product._id,
    ...rest,
    price: Number.parseFloat(fromMinor(minorPrice, currency.scale)),
    currency: {
      id: currency.id,
      names: currency.names,
      symbols: currency.symbols,
      scale: currency.scale,
    },
    ...(minorPurchasePrice !== undefined && purchaseCurrency !== undefined
      ? {
          purchasePrice: Number.parseFloat(fromMinor(minorPurchasePrice, purchaseCurrency.scale)),
          purchaseCurrency: {
            id: purchaseCurrency.id,
            names: purchaseCurrency.names,
            symbols: purchaseCurrency.symbols,
            scale: purchaseCurrency.scale,
          },
        }
      : {}),
    images: images.map(image => ({
      id: path.parse(image.filename).name,
      path: `${STORAGE_URLS.productImages}/${image.filename}`,
      filename: image.filename,
      name: image.name,
      type: image.type,
    })),
  }
}
