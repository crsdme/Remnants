interface Currency {
  id: string
  symbol: string
}

interface ImageFile {
  name: string
  path: string
}

interface ImageItem {
  main: ImageFile
  preview: ImageFile
  id: string
}

interface Category {
  id: string
  names: LanguageString
}

interface CustomFields {
  [key: string]: string | string[]
}

// interface Product {
//   id: string
//   names: LanguageString
//   price: number
//   currency: Currency
//   discount: number
//   wholesalePrice: number
//   wholesaleCurrency: Currency
//   disabled: boolean
//   attributes: Record<string, string>[]
//   images: ImageItem[]
//   reserve: string[]
//   barcode: string[]
//   category: string[]
//   createdAt: string
//   updatedAt: string
//   categories: Category[]
//   customFields: CustomFields
//   customFieldsGroup: string
//   unit: Unit
//   removed: boolean
// }

// interface ProductsResponse {
//   status: string
//   products: Product[]
//   productsCount: number
// }
