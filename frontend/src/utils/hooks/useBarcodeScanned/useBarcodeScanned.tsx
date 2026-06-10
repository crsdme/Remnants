import { useEffect, useRef } from 'react'

interface UseBarcodeScannedOptions {
  minLength?: number
  resetDelay?: number
  charTimeout?: number
}

export function useBarcodeScanned(
  onBarcodeScanned: (barcode: string) => Promise<void>,
  { minLength = 5, resetDelay = 100, charTimeout = 50 }: UseBarcodeScannedOptions = {},
) {
  const barcodeRef = useRef('')
  const lastKeyTimeRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      const currentTime = Date.now()

      if (!/^\d$/.test(event.key))
        return

      if (currentTime - lastKeyTimeRef.current > charTimeout) {
        barcodeRef.current = ''
      }

      barcodeRef.current += event.key
      lastKeyTimeRef.current = currentTime

      if (timerRef.current)
        clearTimeout(timerRef.current)

      timerRef.current = setTimeout(() => {
        if (barcodeRef.current.length >= minLength) {
          void onBarcodeScanned(barcodeRef.current)
        }
        barcodeRef.current = ''
      }, resetDelay)
    }

    window.addEventListener('keydown', handleKeydown)

    return () => {
      window.removeEventListener('keydown', handleKeydown)
      if (timerRef.current)
        clearTimeout(timerRef.current)
    }
  }, [onBarcodeScanned, minLength, resetDelay, charTimeout])
}
