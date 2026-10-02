export function allocateFifo<T extends { remainingCount: number }>(
  lots: T[],
  quantity: number,
): { allocations: { lot: T, quantity: number }[], shortfall: number } {
  let remaining = quantity
  const allocations: { lot: T, quantity: number }[] = []

  for (const lot of lots) {
    if (remaining <= 0)
      break
    if (lot.remainingCount <= 0)
      continue

    const take = Math.min(lot.remainingCount, remaining)
    allocations.push({ lot, quantity: take })
    remaining -= take
  }

  return { allocations, shortfall: remaining }
}

export function weightedMinorUnitCost(
  layers: Array<{ quantity: number, minorUnitCost: number }>,
): number | null {
  const totalQty = layers.reduce((sum, layer) => sum + layer.quantity, 0)
  if (totalQty <= 0)
    return null

  const totalCost = layers.reduce((sum, layer) => sum + layer.quantity * layer.minorUnitCost, 0)
  return Math.round(totalCost / totalQty)
}

export async function weightedMinorUnitCostInCurrency(
  layers: Array<{ quantity: number, minorUnitCost: number, currencyId: string }>,
  saleCurrencyId: string,
  convert: (amount: number, fromCurrencyId: string, toCurrencyId: string) => Promise<number>,
): Promise<number | null> {
  const totalQty = layers.reduce((sum, layer) => sum + layer.quantity, 0)
  if (totalQty <= 0)
    return null

  let totalCost = 0
  for (const layer of layers) {
    const unitCost = layer.currencyId === saleCurrencyId
      ? layer.minorUnitCost
      : await convert(layer.minorUnitCost, layer.currencyId, saleCurrencyId)
    totalCost += layer.quantity * unitCost
  }

  return Math.round(totalCost / totalQty)
}

export function takeFromLayers<T extends { quantity: number }>(
  layers: T[],
  offset: number,
  take: number,
): T[] {
  if (take <= 0)
    return []

  let skipped = 0
  let remaining = take
  const result: T[] = []

  for (const layer of layers) {
    if (remaining <= 0)
      break

    const layerEnd = skipped + layer.quantity
    if (layerEnd <= offset) {
      skipped = layerEnd
      continue
    }

    const startInLayer = Math.max(0, offset - skipped)
    const available = layer.quantity - startInLayer
    const use = Math.min(available, remaining)
    if (use > 0) {
      result.push({ ...layer, quantity: use })
      remaining -= use
    }
    skipped = layerEnd
  }

  return result
}
