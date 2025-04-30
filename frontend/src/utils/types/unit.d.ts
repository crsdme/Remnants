interface Unit {
  _id: string
  names: LanguageString
  symbols: LanguageString
  active: boolean
  createdAt: string
  updatedAt: string
}

interface UnitsResponse {
  status: string
  units: Unit[]
  unitsCount: number
}
