interface Language {
  _id: string
  name: string
  code: string
  main: boolean
  priority: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}

interface LanguagesResponse {
  status: string
  languages: Language[]
  languagesCount: number
}
