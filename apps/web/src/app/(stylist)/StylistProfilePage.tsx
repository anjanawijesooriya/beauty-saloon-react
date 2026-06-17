import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, CheckCircle2 } from 'lucide-react'
import { useMyProfile, useUpdateMyProfile, useSetMyAvailability } from '@/hooks/useStylists'
import { toast } from 'sonner'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const profileSchema = z.object({
  bio: z.string().max(1000).optional(),
  experience: z.coerce.number().int().min(0).max(50),
  specialities: z.array(z.string().min(1)).min(1, 'Add at least one specialty'),
  isAvailable: z.boolean(),
})

type ProfileValues = z.infer<typeof profileSchema>

export default function StylistProfilePage() {
  const { data: profile, isLoading } = useMyProfile()
  const { mutateAsync: updateProfile, isPending: savingProfile } = useUpdateMyProfile()
  const { mutateAsync: setAvailability, isPending: savingAvail } = useSetMyAvailability()

  const [newSpecialty, setNewSpecialty] = useState('')
  const [availSlots, setAvailSlots] = useState<Record<number, { startTime: string; endTime: string } | null>>(() => {
    const initial: Record<number, { startTime: string; endTime: string } | null> = {}
    DAYS.forEach((_, i) => { initial[i] = null })
    return initial
  })
  const [availInit, setAvailInit] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { bio: '', experience: 0, specialities: [], isAvailable: true },
    values: profile
      ? {
          bio: profile.bio ?? '',
          experience: profile.experience,
          specialities: profile.specialities,
          isAvailable: profile.isAvailable,
        }
      : undefined,
  })

  // Sync availability from profile on first load
  if (profile && !availInit) {
    const slots: Record<number, { startTime: string; endTime: string } | null> = {}
    DAYS.forEach((_, i) => { slots[i] = null })
    ;(profile as any).availabilities?.forEach((a: any) => {
      slots[a.dayOfWeek] = { startTime: a.startTime, endTime: a.endTime }
    })
    setAvailSlots(slots)
    setAvailInit(true)
  }

  const specialities = watch('specialities') ?? []

  const addSpecialty = () => {
    const trimmed = newSpecialty.trim()
    if (trimmed && !specialities.includes(trimmed)) {
      setValue('specialities', [...specialities, trimmed])
      setNewSpecialty('')
    }
  }

  const removeSpecialty = (s: string) => {
    setValue('specialities', specialities.filter((x) => x !== s))
  }

  const onSaveProfile = async (data: ProfileValues) => {
    await updateProfile(data)
  }

  const onSaveAvailability = async () => {
    const slots = Object.entries(availSlots)
      .filter(([, v]) => v !== null)
      .map(([day, v]) => ({ dayOfWeek: Number(day), startTime: v!.startTime, endTime: v!.endTime }))
    await setAvailability(slots)
  }

  const toggleDay = (day: number) => {
    setAvailSlots((prev) => ({
      ...prev,
      [day]: prev[day] ? null : { startTime: '09:00', endTime: '18:00' },
    }))
  }

  if (isLoading) {
    return <div className="animate-pulse space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-neutral-100 rounded-xl" />)}</div>
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-8 text-center text-neutral-400">
        <p>No stylist profile found. Contact the admin to set one up.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">My Profile</h1>

      {/* Profile form */}
      <form onSubmit={handleSubmit(onSaveProfile)} className="bg-white rounded-2xl shadow-card p-6 space-y-5">
        <h2 className="font-semibold text-neutral-900 border-b border-neutral-100 pb-3">Profile Details</h2>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Bio</label>
          <textarea {...register('bio')} rows={4} placeholder="Tell customers about yourself…" className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
          {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Years of experience</label>
          <input {...register('experience')} type="number" min={0} max={50} className="w-32 px-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Specialties</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {specialities.map((s) => (
              <span key={s} className="flex items-center gap-1.5 bg-brand-50 text-brand-700 text-sm px-3 py-1 rounded-pill">
                {s}
                <button type="button" onClick={() => removeSpecialty(s)} className="hover:text-brand-900"><Trash2 size={12} /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newSpecialty}
              onChange={(e) => setNewSpecialty(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
              placeholder="e.g. Hair Colouring"
              className="flex-1 px-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <button type="button" onClick={addSpecialty} className="px-4 py-2.5 border border-brand-400 text-brand-400 rounded-xl text-sm hover:bg-brand-50 transition-colors">
              <Plus size={16} />
            </button>
          </div>
          {errors.specialities && <p className="text-red-500 text-xs mt-1">{errors.specialities.message}</p>}
        </div>

        <div className="flex items-center gap-3">
          <input {...register('isAvailable')} type="checkbox" id="available" className="w-4 h-4 accent-brand-400" />
          <label htmlFor="available" className="text-sm text-neutral-700">Available for bookings</label>
        </div>

        <button type="submit" disabled={savingProfile} className="w-full py-3 gradient-brand text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-60 text-sm">
          {savingProfile ? 'Saving…' : 'Save Profile'}
        </button>
      </form>

      {/* Availability */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <h2 className="font-semibold text-neutral-900 border-b border-neutral-100 pb-3 mb-4">Weekly Availability</h2>
        <p className="text-xs text-neutral-400 mb-4">Toggle days on/off and set your working hours.</p>
        <div className="space-y-3">
          {DAYS.map((day, i) => {
            const slot = availSlots[i]
            return (
              <div key={day} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${slot ? 'bg-brand-50' : 'bg-neutral-50'}`}>
                <button
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${slot ? 'gradient-brand text-white' : 'bg-white border border-neutral-200 text-neutral-400'}`}
                >
                  <CheckCircle2 size={16} />
                </button>
                <span className={`w-24 text-sm font-medium ${slot ? 'text-brand-700' : 'text-neutral-400'}`}>{day}</span>
                {slot && (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => setAvailSlots((p) => ({ ...p, [i]: { ...p[i]!, startTime: e.target.value } }))}
                      className="px-2 py-1 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                    />
                    <span className="text-neutral-400 text-xs">to</span>
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => setAvailSlots((p) => ({ ...p, [i]: { ...p[i]!, endTime: e.target.value } }))}
                      className="px-2 py-1 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <button
          type="button"
          onClick={onSaveAvailability}
          disabled={savingAvail}
          className="mt-5 w-full py-3 gradient-brand text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-60 text-sm"
        >
          {savingAvail ? 'Saving…' : 'Save Availability'}
        </button>
      </div>
    </div>
  )
}
