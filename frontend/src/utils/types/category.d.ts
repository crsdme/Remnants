interface Category {
  id: string
  names: LanguageString
  priority: number
  parent: string
  active: boolean
  children: Category[]
  createdAt: Date
  updatedAt: Date
}

interface CategoriesResponse {
  status: string
  code: string
  message: string
  description: string
  categories: Category[]
  categoriesCount: number
  fullPath: string
}
