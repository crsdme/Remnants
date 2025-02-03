interface NameTranslations {
  ru: string;
  en: string;
}

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
  names: NameTranslations;
}

interface Unit {
  _id: string;
  names: NameTranslations;
  symbol: string;
  active: boolean;
  priority: number;
  disabled: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface CustomFields {
  [key: string]: string | string[];
}

interface Product {
  _id: string;
  names: NameTranslations;
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
