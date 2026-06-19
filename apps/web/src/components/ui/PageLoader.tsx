import { useState, useEffect } from 'react'

// Only renders after 250 ms — fast chunk loads show nothing at all, preventing flash
export function PageLoader() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 250)
    return () => clearTimeout(t)
  }, [])

  if (!show) return null

  return (
    <div className="animate-pulse space-y-5 p-1">
      <div className="space-y-2">
        <div className="h-7 w-52 bg-neutral-200 rounded-xl" />
        <div className="h-4 w-72 bg-neutral-100 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 bg-neutral-100 rounded-2xl" />
        ))}
      </div>
      <div className="h-60 bg-neutral-100 rounded-2xl" />
      <div className="h-40 bg-neutral-100 rounded-2xl" />
    </div>
  )
}
