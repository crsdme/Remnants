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
  if (!value)
    return false

  return value.toString().toLowerCase() === 'true'
}

export const toNumber = (value?: string): number => Number(value ?? 0) || 0

export function getId(value?: string): string {
  if (!value)
    return ''

  const match = value.match(/\(([\w-]{36})\)$/)
  return match ? match[1] : ''
}

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

export function parseFormData(body: Record<string, any>) {
  const obj: Record<string, any> = {}
  for (const [key, value] of Object.entries(body)) {
    try {
      obj[key] = JSON.parse(value)
    }
    catch {
      obj[key] = value
    }
  }
  return obj
}

export function parseId(value?: string): string {
  if (!value)
    return ''

  const match = value.match(/\(\s*([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\s*\)/i)
  return match ? match[1] : ''
}

export function parseCategories(row: Record<string, string>): string[] {
  return Object.entries(row)
    .filter(([key]) => key.toLowerCase().startsWith('categories_'))
    .map(([, val]) => getId(val))
    .filter(Boolean)
}

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i
const PROPERTY_KEY_RE = new RegExp(`\\((${UUID_RE.source})(?:_(\\d+))?\\)\\s*$`, 'i')
const UUID_IN_VALUE_RE = new RegExp(`\\((${UUID_RE.source})\\)`, 'gi')

export function parseProductProperties(
  row: Record<string, string>,
): Array<{ _id: string, value: unknown }> {
  const items: Array<{ id: string, idx: number, value: unknown }> = []

  for (const [rawKey, rawVal] of Object.entries(row)) {
    if (!rawVal)
      continue
    const m = PROPERTY_KEY_RE.exec(rawKey.trim())
    if (!m)
      continue
    const id = m[1]
    const idx = m[2] ? Number(m[2]) : 0
    items.push({ id, idx, value: parseCell(rawVal) })
  }

  if (items.length === 0)
    return []

  items.sort((a, b) => (a.id === b.id ? a.idx - b.idx : a.id.localeCompare(b.id)))

  const map = new Map<string, unknown[]>()
  for (const it of items) {
    if (!map.has(it.id))
      map.set(it.id, [])
    map.get(it.id)!.push(it.value)
  }

  const result: Array<{ _id: string, value: unknown }> = []
  for (const [id, values] of map.entries()) {
    result.push({ _id: id, value: mergeValues(values) })
  }
  return result
}

function mergeValues(values: unknown[]): unknown {
  const flat = values
    .flatMap(v => (Array.isArray(v) ? v : [v]))
    .filter(v => v !== '' && v != null)

  if (flat.every(v => typeof v === 'string' && UUID_RE.test(v as string))) {
    const seen = new Set<string>()
    const uniq: string[] = []
    for (const v of flat as string[]) {
      if (!seen.has(v)) {
        seen.add(v)
        uniq.push(v)
      }
    }
    return uniq.length > 1 ? uniq : (uniq[0] ?? null)
  }

  return flat.length > 1 ? flat : (flat[0] ?? null)
}

function parseCell(raw: string): unknown {
  const s = raw.trim()
  const ids = [...s.matchAll(UUID_IN_VALUE_RE)].map(m => m[1])
  if (ids.length > 1)
    return ids
  if (ids.length === 1 && /\)\s*$/.test(s))
    return ids[0]
  if (/^(?:true|false)$/i.test(s))
    return s.toLowerCase() === 'true'
  const n = Number(s.replace(',', '.'))
  if (!Number.isNaN(n) && s !== '')
    return n
  return s
}
