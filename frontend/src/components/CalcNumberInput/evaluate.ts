/**
 * Safely evaluates a simple arithmetic expression: + - * / and parentheses.
 * Supports unary minus (e.g. "-5", "10*-2", "-(1+2)").
 * Returns null if the expression is invalid.
 */
export function evaluateExpression(input: string): number | null {
  const source = input
    .replace(/\s+/g, '')
    .replace(/,/g, '.')
    .replace(/[−–—]/g, '-') // unicode minus / dashes → ASCII
  if (!source)
    return null

  let pos = 0

  function peek(): string {
    return source[pos] ?? ''
  }

  function consume(): string {
    return source[pos++] ?? ''
  }

  function parseExpression(): number | null {
    let left = parseTerm()
    if (left === null)
      return null

    while (peek() === '+' || peek() === '-') {
      const op = consume()
      const right = parseTerm()
      if (right === null)
        return null
      left = op === '+' ? left + right : left - right
    }

    return left
  }

  function parseTerm(): number | null {
    let left = parseUnary()
    if (left === null)
      return null

    while (peek() === '*' || peek() === '/') {
      const op = consume()
      const right = parseUnary()
      if (right === null)
        return null
      if (op === '/') {
        if (right === 0)
          return null
        left = left / right
      }
      else {
        left = left * right
      }
    }

    return left
  }

  function parseUnary(): number | null {
    if (peek() === '+') {
      consume()
      return parseUnary()
    }
    if (peek() === '-') {
      consume()
      const value = parseUnary()
      return value === null ? null : -value
    }
    return parsePrimary()
  }

  function parsePrimary(): number | null {
    if (peek() === '(') {
      consume()
      const value = parseExpression()
      if (value === null || peek() !== ')')
        return null
      consume()
      return value
    }

    return parseNumber()
  }

  function parseNumber(): number | null {
    const start = pos
    while (peek() >= '0' && peek() <= '9')
      consume()

    if (peek() === '.') {
      consume()
      while (peek() >= '0' && peek() <= '9')
        consume()
    }

    if (pos === start)
      return null

    const value = Number(source.slice(start, pos))
    return Number.isFinite(value) ? value : null
  }

  const result = parseExpression()
  if (result === null || pos !== source.length || !Number.isFinite(result))
    return null

  return result
}

export function formatNumberValue(value: number): string {
  if (!Number.isFinite(value))
    return ''
  // Avoid floating-point noise like 0.30000000000000004
  return String(Number(value.toPrecision(12)))
}
