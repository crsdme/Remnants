interface Currency {
  _id: string;
  names: Names;
  symbols: Names;
  active: boolean;
  priority: number;
  disabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type CurrenciesResponse = {
  status: string;
  currencies: Currency[];
  currenciesCount: number;
};
