interface Category {
  _id: string;
  names: Names;
  active: boolean;
  parent: Category;
  createdAt: string;
  updatedAt: string;
}

type CategoriesResponse = {
  status: string;
  categories: Category[];
  categoriesCount: number;
};
