import { useState, useEffect, useRef } from 'react'

// Keeps isPending visually true for at least `minMs` so fast API calls
// still show the spinner long enough for the user to notice.
export function useMinPending(isPending: boolean, minMs = 600): boolean {
  const [showing, setShowing] = useState(false)
  const startRef = useRef(0)

  useEffect(() => {
    if (isPending) {
      startRef.current = Date.now()
      setShowing(true)
      return
    }
    const elapsed = Date.now() - startRef.current
    const delay = Math.max(0, minMs - elapsed)
    const t = setTimeout(() => setShowing(false), delay)
    return () => clearTimeout(t)
  }, [isPending, minMs])

  return showing
}
