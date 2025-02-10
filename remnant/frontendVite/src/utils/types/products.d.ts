interface Currency {
  _id: string;
  symbol: string;
}

interface ImageFile {
  name: string;
  path: string;
}

interface ImageItem {
  main: ImageFile;
  preview: ImageFile;
  _id: string;
}

interface Category {
  _id: string;
  names: Names;
}

interface CustomFields {
  [key: string]: string | string[];
}

interface Product {
  _id: string;
  names: Names;
  price: number;
  currency: Currency;
  discount: number;
  wholesalePrice: number;
  wholesaleCurrency: Currency;
  disabled: boolean;
  attributes: Record<string, string>[];
  images: ImageItem[];
  reserve: string[];
  barcode: string[];
  category: string[];
  createdAt: string;
  updatedAt: string;
  categories: Category[];
  customFields: CustomFields;
  customFieldsGroup: string;
  unit: Unit;
  removed: boolean;
}

type ProductsResponse = {
  status: string;
  products: Product[];
  productsCount: number;
};
