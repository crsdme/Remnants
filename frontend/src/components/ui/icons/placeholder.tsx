export function PlaceholderIcon({ className, size = 100 }: { className?: string, size?: number }) {
  return (
    <svg width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width={size} height={size} fill="#F0ECED" />
    </svg>

  )
}
