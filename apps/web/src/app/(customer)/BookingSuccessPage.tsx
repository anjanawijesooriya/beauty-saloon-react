import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Calendar, Scissors } from 'lucide-react'
import { fadeUp } from '@/lib/motion'

export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-pink-50 px-4">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-3xl shadow-card p-10 max-w-md w-full text-center"
      >
        <div className="w-20 h-20 gradient-brand rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-white" />
        </div>

        <h1 className="font-display text-4xl italic text-neutral-900 mb-2">Booking Confirmed!</h1>
        <p className="text-neutral-500 text-sm mb-8">
          Your appointment has been placed and is awaiting confirmation from your stylist. We'll notify you once it's confirmed.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            to="/appointments"
            className="flex items-center justify-center gap-2 px-6 py-3.5 gradient-brand text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <Calendar size={16} />
            View My Appointments
          </Link>
          <Link
            to="/book"
            className="flex items-center justify-center gap-2 px-6 py-3.5 border border-neutral-200 text-neutral-600 rounded-xl text-sm hover:bg-neutral-50 transition-colors"
          >
            <Scissors size={16} />
            Book Another Appointment
          </Link>
          <Link to="/" className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors mt-1">
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
