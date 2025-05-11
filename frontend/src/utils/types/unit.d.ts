interface Unit {
  _id: string
  names: LanguageString
  symbols: LanguageString
  active: boolean
  priority: number
  createdAt: Date
  updatedAt: Date
}

interface UnitsResponse {
  status: string
  code: string
  message: string
  description: string
  units: Unit[]
  unitsCount: number
}
