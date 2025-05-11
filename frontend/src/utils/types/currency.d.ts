interface Currency {
  id: string
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
  code: string
  message: string
  description: string
  currencies: Currency[]
  currenciesCount: number
}
