import Papa from 'papaparse'

export function downloadCsv(data: any, filename: string, parse = false) {
  const csv = parse ? Papa.unparse(data) : data
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })

  const link = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob),
    download: filename,
  })

  link.click()
  URL.revokeObjectURL(link.href)
}

export function downloadFile(href: string, filename: string) {
  const link = Object.assign(document.createElement('a'), {
    href,
    download: filename,
  })

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
