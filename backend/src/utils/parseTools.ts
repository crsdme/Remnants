import fs, { readFile } from 'node:fs'
import path from 'node:path'
import { parse as parseCSVFile } from 'fast-csv'
import xlsx from 'xlsx'
import { HttpError } from './httpError'

export async function parseFile(filePath: string): Promise<any[]> {
  const ext = path.extname(filePath).toLowerCase()

  switch (ext) {
    case '.csv':
      return parseCSV(filePath)
    case '.json':
      return parseJSON(filePath)
    case '.tsv':
      return parseCSV(filePath, '\t')
    case '.xlsx':
      return parseXLSX(filePath)
    default:
      throw new HttpError(400, `Unsupported file format: ${ext}`, 'UNSUPPORTED_FILE_FORMAT')
  }
}

function parseCSV(filePath: string, delimiter = ','): Promise<any[]> {
  const results: any[] = []

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(parseCSVFile({ headers: true, delimiter }))
      .on('error', reject)
      .on('data', (row: any) => results.push(row))
      .on('end', () => resolve(results))
  })
}

function parseXLSX(filePath: string): any[] {
  const workbook = xlsx.readFile(filePath)
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  return xlsx.utils.sheet_to_json(sheet)
}

function parseJSON(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        reject(err)
      }
      else {
        const parsed = JSON.parse(data)
        resolve(Array.isArray(parsed) ? parsed : [parsed])
      }
    })
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
