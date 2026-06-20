import { useState, useMemo, useEffect } from 'react'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday, isPast, startOfDay,
  addMonths, subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { useStylistAvailability, useStylistSlots } from '@/hooks/useStylists'
import { useBookingStore } from '@/store/booking'

export default function Step3DateTime() {
  const { selectedStylist, selectedDate, selectedTime, setDate, setTime, setStep, totalDurationMins } = useBookingStore()
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()))

  const { data: availability } = useStylistAvailability(selectedStylist?.id ?? '')
  const availableDays = useMemo(() => new Set((availability ?? []).map((a) => a.dayOfWeek)), [availability])

  const { data: slots, isLoading: slotsLoading } = useStylistSlots(
    selectedStylist?.id ?? '',
    selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
    totalDurationMins(),
  )

  // If a selected time slot disappears after a refresh (booked by someone else), clear it
  useEffect(() => {
    if (selectedTime && slots && !slots.includes(selectedTime)) {
      setTime(null)
      toast.error('That slot was just booked — please select another time.')
    }
  }, [slots, selectedTime, setTime])

  // Build calendar grid
  const calStart = startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 0 })
  const calEnd   = endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 0 })
  const calDays  = eachDayOfInterval({ start: calStart, end: calEnd })

  const isDisabled = (day: Date) => {
    if (!isSameMonth(day, viewMonth)) return true
    if (isPast(startOfDay(day)) && !isToday(day)) return true
    return !availableDays.has(day.getDay())
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-neutral-900 mb-1">Choose Date & Time</h2>
      <p className="text-sm text-neutral-500 mb-5">Pick a date, then select an available slot.</p>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Calendar */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setViewMonth((m) => subMonths(m, 1))} className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-semibold text-neutral-800">{format(viewMonth, 'MMMM yyyy')}</span>
            <button onClick={() => setViewMonth((m) => addMonths(m, 1))} className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => (
              <div key={d} className="text-xs text-neutral-400 font-medium pb-2">{d}</div>
            ))}
            {calDays.map((day) => {
              const disabled = isDisabled(day)
              const selected = selectedDate && isSameDay(day, selectedDate)
              const today    = isToday(day)
              return (
                <button
                  key={day.toISOString()}
                  disabled={disabled}
                  onClick={() => { setDate(day); setTime(null) }}
                  className={[
                    'aspect-square flex items-center justify-center text-sm rounded-full m-0.5 transition-all',
                    disabled ? 'text-neutral-300 cursor-not-allowed' : 'hover:bg-brand-50 cursor-pointer',
                    selected ? 'gradient-brand text-white font-semibold' : '',
                    today && !selected ? 'ring-1 ring-brand-300 font-semibold text-brand-500' : '',
                    !selected && !disabled && !today ? 'text-neutral-700' : '',
                  ].join(' ')}
                >
                  {format(day, 'd')}
                </button>
              )
            })}
          </div>
        </div>

        {/* Time slots */}
        <div className="flex-1">
          {!selectedDate ? (
            <div className="h-full flex items-center justify-center text-neutral-300 text-sm">Select a date first</div>
          ) : slotsLoading ? (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 9 }).map((_, i) => <div key={i} className="h-10 bg-neutral-100 rounded-lg animate-pulse" />)}
            </div>
          ) : !slots?.length ? (
            <div className="text-center py-8 text-neutral-400 text-sm">No available slots for this date.</div>
          ) : (
            <div>
              <p className="text-xs text-neutral-500 mb-3 flex items-center gap-1.5">
                <Clock size={12} />
                {format(selectedDate, 'EEEE, d MMM')} · {slots.length} slot{slots.length !== 1 ? 's' : ''} available
                <span className="text-neutral-300">·</span>
                <span className="text-neutral-400">{totalDurationMins()} min total</span>
              </p>
              <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setTime(slot)}
                    className={`py-2.5 px-2 rounded-lg text-xs font-medium transition-all ${
                      selectedTime === slot
                        ? 'gradient-brand text-white'
                        : 'bg-neutral-50 border border-neutral-200 text-neutral-700 hover:border-brand-300 hover:bg-brand-50'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <button onClick={() => setStep(2)} className="px-6 py-3 border border-neutral-200 text-neutral-600 rounded-xl text-sm hover:bg-neutral-50 transition-colors">
          ← Back
        </button>
        <button
          onClick={() => setStep(4)}
          disabled={!selectedDate || !selectedTime}
          className="px-8 py-3 gradient-brand text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          Next: Confirm →
        </button>
      </div>
    </div>
  )
}
