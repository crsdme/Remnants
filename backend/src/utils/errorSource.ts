import fs from 'node:fs'
import path from 'node:path'

interface ParsedStackFrame {
  file: string
  line: number
}

interface ErrorSource {
  file: string
  line: number
  source: string
}

function parseStackLine(stackLine: string): ParsedStackFrame | null {
  const match = stackLine.match(/:(\d+):\d+\)?$/)
  if (match?.index === undefined)
    return null

  const line = Number(match[1])
  const rest = stackLine.slice(0, match.index)
  const fileMatch = rest.match(/\((.+)$/) ?? rest.match(/at (.+)$/)
  if (fileMatch === null)
    return null

  return { file: fileMatch[1], line }
}

export function getErrorSourceFromStack(stack?: string): ErrorSource | undefined {
  if (stack === undefined || stack.length === 0)
    return undefined

  for (const stackLine of stack.split('\n').slice(1)) {
    const frame = parseStackLine(stackLine)
    if (!frame || frame.file.includes('node_modules'))
      continue

    try {
      const filePath = path.isAbsolute(frame.file) ? frame.file : path.resolve(frame.file)
      if (!fs.existsSync(filePath))
        continue

      const source = fs.readFileSync(filePath, 'utf8').split('\n')[frame.line - 1]?.trim()
      if (source === undefined || source.length === 0)
        continue

      return { file: filePath, line: frame.line, source }
    }
    catch {
      continue
    }
  }

  return undefined
}
