import { create } from 'zustand'
import type { Service, StylistProfile } from '@/types'

interface BookingStore {
  step: 1 | 2 | 3 | 4
  selectedServices: Service[]
  selectedStylist: StylistProfile | null
  selectedDate: Date | null
  selectedTime: string | null
  notes: string
  // computed
  totalDurationMins: () => number
  totalLKR: () => number
  // setters
  setStep: (s: 1 | 2 | 3 | 4) => void
  toggleService: (service: Service) => void
  setStylist: (stylist: StylistProfile) => void
  setDate: (date: Date) => void
  setTime: (time: string | null) => void
  setNotes: (notes: string) => void
  reset: () => void
}

const initial = {
  step: 1 as const,
  selectedServices: [] as Service[],
  selectedStylist: null,
  selectedDate: null,
  selectedTime: null,
  notes: '',
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  ...initial,

  totalDurationMins: () => get().selectedServices.reduce((a, s) => a + s.durationMins, 0),
  totalLKR: () => {
    const { selectedStylist, selectedServices } = get()
    if (!selectedStylist) return selectedServices.reduce((a, s) => a + Number(s.basePriceLKR), 0)
    // Use stylist-specific price when available
    const ssMap = Object.fromEntries(
      ((selectedStylist as any).services ?? []).map((ss: any) => [ss.service.id, Number(ss.priceLKR)])
    )
    return selectedServices.reduce((a, s) => a + (ssMap[s.id] ?? Number(s.basePriceLKR)), 0)
  },

  setStep: (step) => set({ step }),
  toggleService: (service) =>
    set((state) => {
      const exists = state.selectedServices.find((s) => s.id === service.id)
      return {
        selectedServices: exists
          ? state.selectedServices.filter((s) => s.id !== service.id)
          : [...state.selectedServices, service],
        // Reset downstream selections when services change
        selectedStylist: null,
        selectedDate: null,
        selectedTime: null,
      }
    }),
  setStylist: (selectedStylist) => set({ selectedStylist, selectedDate: null, selectedTime: null }),
  setDate:    (selectedDate)    => set({ selectedDate, selectedTime: null }),
  setTime:    (selectedTime)    => set({ selectedTime }),
  setNotes:   (notes)           => set({ notes }),
  reset:      ()                => set(initial),
}))
