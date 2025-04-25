interface Category {
  _id: string
  names: Names
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
