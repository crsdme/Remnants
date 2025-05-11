interface Category {
  id: string
  names: LanguageString
  active: boolean
  parent: Category
  createdAt: string
  updatedAt: string
}

interface CategoriesResponse {
  status: string
  categories: Category[]
  categoriesCount: number
}
