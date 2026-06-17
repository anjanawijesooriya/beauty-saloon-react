import { create } from 'zustand'

interface BookingStore {
  step: 1 | 2 | 3 | 4
  selectedServiceIds: string[]
  selectedStylistId: string | null
  selectedDate: Date | null
  selectedTime: string | null
  notes: string
  setStep: (s: 1 | 2 | 3 | 4) => void
  setServices: (ids: string[]) => void
  setStylist: (id: string) => void
  setDate: (date: Date) => void
  setTime: (time: string) => void
  setNotes: (notes: string) => void
  reset: () => void
}

const initial = {
  step: 1 as const,
  selectedServiceIds: [],
  selectedStylistId: null,
  selectedDate: null,
  selectedTime: null,
  notes: '',
}

export const useBookingStore = create<BookingStore>((set) => ({
  ...initial,
  setStep: (step) => set({ step }),
  setServices: (selectedServiceIds) => set({ selectedServiceIds }),
  setStylist: (selectedStylistId) => set({ selectedStylistId }),
  setDate: (selectedDate) => set({ selectedDate }),
  setTime: (selectedTime) => set({ selectedTime }),
  setNotes: (notes) => set({ notes }),
  reset: () => set(initial),
}))
