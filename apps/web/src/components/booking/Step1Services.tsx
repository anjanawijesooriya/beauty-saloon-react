import { useState } from 'react'
import { Clock, CheckCircle2 } from 'lucide-react'
import { useServices, useServiceCategories } from '@/hooks/useServices'
import { useBookingStore } from '@/store/booking'
import type { Service } from '@/types'

export default function Step1Services() {
  const [categoryId, setCategoryId] = useState<string | undefined>()
  const { data: categories } = useServiceCategories()
  const { data, isLoading } = useServices({ categoryId, limit: 50 })
  const { selectedServices, toggleService, setStep } = useBookingStore()

  const isSelected = (s: Service) => selectedServices.some((x) => x.id === s.id)

  return (
    <div>
      <h2 className="text-lg font-semibold text-neutral-900 mb-1">Choose Services</h2>
      <p className="text-sm text-neutral-500 mb-5">Select one or more services for your appointment.</p>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-5">
        <button
          onClick={() => setCategoryId(undefined)}
          className={`px-4 py-1.5 rounded-pill text-xs font-medium transition-all ${!categoryId ? 'gradient-brand text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
        >
          All
        </button>
        {categories?.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoryId(c.id)}
            className={`px-4 py-1.5 rounded-pill text-xs font-medium transition-all ${categoryId === c.id ? 'gradient-brand text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Service grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-20 bg-neutral-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
          {data?.services.map((service) => {
            const selected = isSelected(service)
            return (
              <button
                key={service.id}
                onClick={() => toggleService(service)}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                  selected
                    ? 'border-brand-400 bg-brand-50'
                    : 'border-neutral-200 bg-white hover:border-brand-200 hover:bg-neutral-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${selected ? 'border-brand-400 bg-brand-400' : 'border-neutral-300'}`}>
                  {selected && <CheckCircle2 size={12} className="text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${selected ? 'text-brand-700' : 'text-neutral-900'}`}>{service.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-neutral-400 flex items-center gap-1"><Clock size={10} /> {service.durationMins} min</span>
                    <span className={`text-xs font-semibold ${selected ? 'text-brand-500' : 'text-neutral-600'}`}>
                      LKR {Number(service.basePriceLKR).toLocaleString()}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Selected summary */}
      {selectedServices.length > 0 && (
        <div className="mt-5 p-4 bg-brand-50 rounded-xl border border-brand-100">
          <p className="text-xs font-medium text-brand-700 mb-2">Selected ({selectedServices.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {selectedServices.map((s) => (
              <span key={s.id} className="text-xs bg-white text-brand-600 border border-brand-200 px-2.5 py-1 rounded-pill">
                {s.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => setStep(2)}
          disabled={selectedServices.length === 0}
          className="px-8 py-3 gradient-brand text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          Next: Choose Stylist →
        </button>
      </div>
    </div>
  )
}
