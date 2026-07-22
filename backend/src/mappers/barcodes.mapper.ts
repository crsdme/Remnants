import type { BarcodeDTOPopulated } from '@remnant/shared'
import type { BarcodeDBPopulated } from '@/types'
import { STORAGE_URLS } from '@/config'
import { fromMinor } from '@/utils/money'

export function mapBarcodeToDTO(barcode: BarcodeDBPopulated): BarcodeDTOPopulated {
  return {
    id: barcode.id,
    code: barcode.code,
    products: barcode.products.map((product) => {
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
        id: product.id,
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
          id: image.filename,
          path: `${STORAGE_URLS.productImages}/${image.filename}`,
          filename: image.filename,
          name: image.name,
          type: image.type,
        })),
      }
    }),
    active: barcode.active,
    createdAt: barcode.createdAt,
    updatedAt: barcode.updatedAt,
  }
}
