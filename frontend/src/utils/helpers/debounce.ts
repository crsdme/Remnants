export function debounce<TArgs extends unknown[]>(
  func: (...args: TArgs) => void,
  delay = 300,
): (...args: TArgs) => void {
  let timeout: ReturnType<typeof setTimeout> | undefined

  return (...args: TArgs) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
    }, delay)
  }
}
