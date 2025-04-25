import fs from 'node:fs'
import { parse } from 'fast-csv'

export function parseCSV(filePath: string): Promise<any[]> {
  const results: any[] = []

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(parse({ headers: true }))
      .on('error', reject)
      .on('data', (row: any) => results.push(row))
      .on('end', () => resolve(results))
  })
}

export function toBoolean(value?: string): boolean {
  return value?.toLowerCase() === 'true'
}

export const toNumber = (value?: string): number => Number(value ?? 0) || 0

export function extractLangMap(row: Record<string, string>, prefix: string): Record<string, string> {
  const result: Record<string, string> = {}

  for (const [key, value] of Object.entries(row)) {
    if (key.startsWith(`${prefix}_`)) {
      const lang = key.replace(`${prefix}_`, '')
      result[lang] = value
    }
  }

  return result
}

// Usage
// const rows = await parseCSV('./uploads/my-table.csv');
