import { Star, Clock, CheckCircle2 } from 'lucide-react'
import { useStylists } from '@/hooks/useStylists'
import { useBookingStore } from '@/store/booking'
import type { StylistProfile } from '@/types'

export default function Step2Stylist() {
  const { selectedServices, selectedStylist, setStylist, setStep } = useBookingStore()
  const serviceIds = selectedServices.map((s) => s.id)

  const { data, isLoading } = useStylists({ limit: 50 } as any)

  // Only show stylists that offer ALL selected services
  const eligible = data?.stylists.filter((st) => {
    const offered = ((st as any).services ?? []).map((ss: any) => ss.service?.id ?? ss.serviceId)
    return serviceIds.every((id) => offered.includes(id))
  }) ?? []

  return (
    <div>
      <h2 className="text-lg font-semibold text-neutral-900 mb-1">Choose a Stylist</h2>
      <p className="text-sm text-neutral-500 mb-5">All stylists below offer your selected services.</p>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-neutral-100 rounded-xl animate-pulse" />)}
        </div>
      ) : eligible.length === 0 ? (
        <div className="text-center py-12 text-neutral-400">
          <p className="text-sm">No stylists currently offer all selected services.</p>
          <button onClick={() => setStep(1)} className="mt-3 text-brand-500 text-sm underline">Go back</button>
        </div>
      ) : (
        <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
          {eligible.map((stylist) => {
            const selected = selectedStylist?.id === stylist.id
            return (
              <button
                key={stylist.id}
                onClick={() => setStylist(stylist as StylistProfile)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                  selected ? 'border-brand-400 bg-brand-50' : 'border-neutral-200 bg-white hover:border-brand-200 hover:bg-neutral-50'
                }`}
              >
                {/* Avatar */}
                {(stylist as any).user.avatarUrl
                  ? <img src={(stylist as any).user.avatarUrl} alt={stylist.user.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                  : <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-lg ${selected ? 'gradient-brand' : 'bg-neutral-300'}`}>
                      {stylist.user.name[0]}
                    </div>
                }

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${selected ? 'text-brand-700' : 'text-neutral-900'}`}>{stylist.user.name}</p>
                    {stylist.isAvailable && (
                      <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">Available</span>
                    )}
                  </div>
                  {(stylist as any).experience > 0 && (
                    <p className="text-xs text-neutral-400 mt-0.5">
                      <Clock size={10} className="inline mr-1" />{(stylist as any).experience} yrs experience
                    </p>
                  )}
                  {stylist.specialities?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {stylist.specialities.slice(0, 3).map((sp) => (
                        <span key={sp} className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">{sp}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {stylist.rating > 0 && (
                    <span className="flex items-center gap-1 text-xs font-medium text-amber-500">
                      <Star size={11} fill="currentColor" /> {stylist.rating.toFixed(1)}
                    </span>
                  )}
                  {selected && <CheckCircle2 size={18} className="text-brand-400" />}
                </div>
              </button>
            )
          })}
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <button onClick={() => setStep(1)} className="px-6 py-3 border border-neutral-200 text-neutral-600 rounded-xl text-sm hover:bg-neutral-50 transition-colors">
          ← Back
        </button>
        <button
          onClick={() => setStep(3)}
          disabled={!selectedStylist}
          className="px-8 py-3 gradient-brand text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          Next: Pick Date & Time →
        </button>
      </div>
    </div>
  )
}
