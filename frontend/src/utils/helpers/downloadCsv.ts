import Papa from 'papaparse'

export function downloadCsv(data: any[] | string, filename: string, parse = false) {
  const csv = parse ? Papa.unparse(data) : data
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })

  const link = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob),
    download: filename,
  })

  link.click()
  URL.revokeObjectURL(link.href)
}
