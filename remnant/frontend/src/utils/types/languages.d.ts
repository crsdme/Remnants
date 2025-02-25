interface Language {
  _id: string;
  name: string;
  code: string;
  main: boolean;
  disabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type LanguagesResponse = {
  status: string;
  languages: Language[];
  languagesCount: number;
};
