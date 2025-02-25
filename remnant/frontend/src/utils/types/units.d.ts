interface Unit {
  _id: string;
  names: Names;
  symbols: Names;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

type UnitsResponse = {
  status: string;
  units: Language[];
  unitsCount: number;
};
