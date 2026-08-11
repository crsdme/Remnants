import fs, { readFile } from 'node:fs'
import path from 'node:path'
import { parse as parseCSVFile } from 'fast-csv'
import xlsx from 'xlsx'
import { HttpError } from './httpError'

export async function parseFile(filePath: string): Promise<Record<string, unknown>[]> {
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

async function parseCSV(filePath: string, delimiter = ','): Promise<Record<string, unknown>[]> {
  const results: Record<string, unknown>[] = []

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(parseCSVFile({ headers: true, delimiter }))
      .on('error', reject)
      .on('data', (row: Record<string, unknown>) => results.push(row))
      .on('end', () => resolve(results))
  })
}

function parseXLSX(filePath: string): Record<string, unknown>[] {
  const workbook = xlsx.readFile(filePath)
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  return xlsx.utils.sheet_to_json(sheet)
}

async function parseJSON(filePath: string): Promise<Record<string, unknown>[]> {
  return new Promise((resolve, reject) => {
    readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        reject(err)
      }
      else {
        const parsed = JSON.parse(data) as Record<string, unknown>[]
        resolve(Array.isArray(parsed) ? parsed : [parsed])
      }
    })
  })
}

export function toBoolean(record: Record<string, unknown>, key: string): boolean {
  if (typeof record[key] !== 'string')
    return false

  return record[key].toString().toLowerCase() === 'true' || record[key].toString().toLowerCase() === 'yes'
}

export function toNumber(record: Record<string, unknown>, key: string): number {
  if (typeof record[key] !== 'string')
    return 0

  return Number(record[key].toString().replace(',', '.') ?? 0) || 0
}

export function getId(record: Record<string, unknown>, key: string): string {
  if (typeof record[key] !== 'string')
    return ''

  const match = record[key].toString().match(/\(([\w-]{36})\)$/)
  return match ? match[1] : ''
}

export function extractLangMap(record: Record<string, unknown>, prefix: string): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(record)) {
    if (key.startsWith(`${prefix}_`)) {
      const lang = key.replace(`${prefix}_`, '')
      result[lang] = value
    }
  }

  return result
}

export function parseFormData(body: Record<string, unknown>): Record<string, unknown> {
  const obj: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(body)) {
    if (typeof value !== 'string') {
      obj[key] = value
      continue
    }
    try {
      obj[key] = JSON.parse(value)
    }
    catch {
      obj[key] = value
    }
  }
  return obj
}

const UUID_STRING_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const UUID_IN_PARENS_RE = /\(\s*([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\s*\)\s*$/i

export function parseId(record: Record<string, unknown>, key: string): string | undefined {
  if (typeof record[key] !== 'string')
    return undefined

  const value = record[key].toString().trim()
  if (!value)
    return undefined

  const parenMatch = value.match(UUID_IN_PARENS_RE)
  if (parenMatch)
    return parenMatch[1]

  if (UUID_STRING_RE.test(value))
    return value

  return undefined
}

export function parseMultiSelect(record: Record<string, unknown>, key: string, mode: 'values' | 'id' = 'values'): string[] {
  const prefix = `${key.toLowerCase()}_`
  return Object.entries(record)
    .filter(([entryKey]) => entryKey.toLowerCase().startsWith(prefix))
    .map(([, val]) => {
      if (val == null || val === '')
        return ''
      if (mode === 'values')
        return String(val)
      const match = String(val).match(UUID_IN_PARENS_RE)
      return match ? match[1] : ''
    })
    .filter(Boolean)
}

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i
const PROPERTY_KEY_RE = new RegExp(`\\((${UUID_RE.source})(?:_(\\d+))?\\)\\s*$`, 'i')
const UUID_IN_VALUE_RE = new RegExp(`\\((${UUID_RE.source})\\)`, 'gi')

export function parseProductProperties(
  row: Record<string, unknown>,
): Array<{ _id: string, value: unknown }> {
  const items: Array<{ id: string, idx: number, value: unknown, indexed: boolean }> = []

  for (const [rawKey, rawVal] of Object.entries(row)) {
    if (typeof rawVal !== 'string')
      continue
    const m = PROPERTY_KEY_RE.exec(rawKey.trim())
    if (!m)
      continue
    const id = m[1]
    const indexed = m[2] !== undefined
    const idx = indexed ? Number(m[2]) : 0
    items.push({ id, idx, value: parseCell(rawVal), indexed })
  }

  if (items.length === 0)
    return []

  items.sort((a, b) => (a.id === b.id ? a.idx - b.idx : a.id.localeCompare(b.id)))

  const map = new Map<string, { values: unknown[], isMultiSelect: boolean }>()
  for (const it of items) {
    if (!map.has(it.id))
      map.set(it.id, { values: [], isMultiSelect: false })
    const entry = map.get(it.id)!
    entry.values.push(it.value)
    if (it.indexed)
      entry.isMultiSelect = true
  }

  const result: Array<{ _id: string, value: unknown }> = []
  for (const [id, { values, isMultiSelect }] of map.entries()) {
    result.push({ _id: id, value: mergeValues(values, isMultiSelect) })
  }
  return result
}

function mergeValues(values: unknown[], isMultiSelect = false): unknown {
  const flat = values
    // eslint-disable-next-line ts/no-unsafe-return
    .flatMap(v => (Array.isArray(v) ? v : [v]))
    .filter(v => v !== '' && v != null)

  if (flat.every(v => typeof v === 'string' && UUID_RE.test(v))) {
    const seen = new Set<string>()
    const uniq: string[] = []
    for (const v of flat as string[]) {
      if (!seen.has(v)) {
        seen.add(v)
        uniq.push(v)
      }
    }
    // multiSelect columns are exported as Type_1 (uuid_1), … — always store as array
    if (isMultiSelect)
      return uniq
    return uniq.length > 1 ? uniq : (uniq[0] ?? null)
  }

  if (isMultiSelect)
    return flat

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
