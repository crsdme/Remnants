import type { ProductDTO } from '@remnant/shared'
import type { ProductDB } from '@/types/'
import { STORAGE_URLS } from '@/config'

export function mapProductToDTO(product: ProductDB): ProductDTO {
  return {
    id: product._id,
    seq: product.seq,
    names: product.names,
    price: product.price,
    currency: product.currency,
    purchasePrice: product.purchasePrice,
    purchaseCurrency: product.purchaseCurrency,
    barcodes: product.barcodes,
    categories: product.categories,
    unit: product.unit,
    images: product.images.map(image => ({
      id: image._id,
      path: `${STORAGE_URLS.productImages}/${image.filename}`,
      filename: image.filename,
      name: image.name,
      type: image.type,
    })),
  }
}

// products = products.map((product: any) => ({
//   ...product,
//   images: product.images.map((image: any) => ({
//     id: image._id,
//     path: `${STORAGE_URLS.productImages}/${image.filename}`,
//     filename: image.filename,
//     name: image.name,
//     type: image.type,
//   })),
// }))
