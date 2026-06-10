import type { ProductDTO, ProductPopulatedDTO } from '@remnant/shared'
import type { ProductDB, ProductPopulated } from '@/types/'
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
    productPropertiesGroup: product.productPropertiesGroup,
    productProperties: product.productProperties.map(property => property._id),
    quantityIds: product.quantityIds,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }
}

export function mapProductPopulatedToDTO(product: ProductPopulated): ProductPopulatedDTO {
  return {
    id: product._id,
    seq: product.seq,
    names: product.names,
    price: product.price,
    currency: {
      id: product.currency._id,
      names: product.currency.names,
      symbols: product.currency.symbols,
    },
    purchasePrice: product.purchasePrice,
    purchaseCurrency: {
      id: product.purchaseCurrency._id,
      names: product.purchaseCurrency.names,
      symbols: product.purchaseCurrency.symbols,
    },
    barcodes: product.barcodes.map(barcode => ({
      id: barcode._id,
      code: barcode.code,
    })),
    categories: product.categories.map(category => ({
      id: category._id,
      names: category.names,
    })),
    unit: {
      id: product.unit._id,
      names: product.unit.names,
      symbols: product.unit.symbols,
    },
    images: product.images.map(image => ({
      id: image._id,
      path: `${STORAGE_URLS.productImages}/${image.filename}`,
      filename: image.filename,
      name: image.name,
      type: image.type,
    })),
    productPropertiesGroup: {
      id: product.productPropertiesGroup._id,
      names: product.productPropertiesGroup.names,
    },
    productProperties: product.productProperties.map(property => ({
      id: property._id,
      options: property.options.map(option => ({
        id: option._id,
        names: option.names,
      })),
      value: property.value,
    })),
    warehouseStock: product.warehouseStock.map(row => ({
      warehouse: row.warehouse,
      count: row.count,
    })),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }
}
