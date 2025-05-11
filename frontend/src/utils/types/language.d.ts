interface Language {
  id: string
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
  code: string
  message: string
  description: string
  languages: Language[]
  languagesCount: number
}
