import type { BarcodeDTO } from '@remnant/shared'
import type { BarcodeDB } from '@/types'

export function mapBarcodeToDTO(barcode: BarcodeDB): BarcodeDTO {
  return {
    id: barcode._id,
    code: barcode.code,
    products: barcode.products.map(product => ({
      id: product._id,
      names: product.names,
      categories: product.categories.map(category => ({
        id: category._id,
        names: category.names,
      })),
      productProperties: product.productProperties.map(property => ({
        id: property._id,
        names: property.names,
        options: property.options,
        value: property.value,
        optionData: property.optionData.map(option => ({
          id: option._id,
          names: option.names,
        })),
      })),
      quantity: product.quantity,
      images: product.images.map(image => ({
        id: image._id,
        path: image.path,
        filename: image.filename,
        name: image.name,
        type: image.type,
      })),
    })),
    active: barcode.active,
    createdAt: barcode.createdAt,
    updatedAt: barcode.updatedAt,
  }
}
