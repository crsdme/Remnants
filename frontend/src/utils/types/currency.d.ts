interface Currency {
  _id: string
  names: LanguageString
  symbols: LanguageString
  active: boolean
  priority: number
  disabled: boolean
  createdAt: Date
  updatedAt: Date
}

interface CurrenciesResponse {
  status: string
  currencies: Currency[]
  currenciesCount: number
}
