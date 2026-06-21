// Inline loading spinner for use inside buttons.
// Default variant is for colored/gradient buttons (white on dark).
// Use variant="dark" for buttons with a light background.
type SpinnerProps = {
  variant?: 'light' | 'dark'
  size?: number
}

export function Spinner({ variant = 'light', size = 16 }: SpinnerProps) {
  const color =
    variant === 'light'
      ? 'border-white/30 border-t-white'
      : 'border-neutral-300 border-t-neutral-600'
  return (
    <span
      style={{ width: size, height: size }}
      className={`inline-block flex-shrink-0 border-2 rounded-full animate-spin ${color}`}
    />
  )
}
