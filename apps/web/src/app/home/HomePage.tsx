import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { staggerContainer, fadeUp } from '@/lib/motion'
import { Scissors, Sparkles, Star, ShoppingBag, CalendarCheck, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero min-h-[90vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <motion.p variants={fadeUp} className="text-brand-400 font-medium tracking-widest uppercase text-sm">
              Sri Lanka's Premier Beauty Platform
            </motion.p>
            <motion.h1 variants={fadeUp} className="font-display text-6xl italic text-neutral-900 mt-2 leading-tight">
              Look Beautiful,<br />Feel Confident
            </motion.h1>
            <motion.p variants={fadeUp} className="text-neutral-600 text-lg mt-4 max-w-md">
              Book top-rated stylists near you. Hair, skin, nails, and beyond.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mt-8">
              <Link to="/book" className="px-8 py-3 text-white gradient-brand rounded-pill font-medium hover:opacity-90 transition-opacity">
                Book Now
              </Link>
              <Link to="/services" className="px-8 py-3 border border-brand-400 text-brand-400 rounded-pill font-medium hover:bg-brand-50 transition-colors">
                Explore Services
              </Link>
            </motion.div>
          </motion.div>
          <div className="hidden lg:flex items-center justify-center gap-4">
            <div className="space-y-4">
              {[
                { icon: Scissors,    label: 'Expert Stylists',    sub: '50+ certified professionals' },
                { icon: CalendarCheck, label: 'Easy Booking',    sub: 'Pick a slot in seconds' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="bg-white/70 backdrop-blur rounded-2xl p-5 shadow-card flex items-center gap-4 w-56">
                  <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
                    <Icon size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900 text-sm">{label}</p>
                    <p className="text-neutral-400 text-xs mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4 mt-8">
              {[
                { icon: Star,        label: 'Verified Reviews',  sub: '4.9 avg rating' },
                { icon: ShoppingBag, label: 'Beauty Products',   sub: 'Shop premium brands' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="bg-white/70 backdrop-blur rounded-2xl p-5 shadow-card flex items-center gap-4 w-56">
                  <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
                    <Icon size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900 text-sm">{label}</p>
                    <p className="text-neutral-400 text-xs mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories
      <section className="py-16 max-w-7xl mx-auto px-4">
        <h2 className="font-display text-4xl italic text-center text-neutral-900 mb-10">Browse by Category</h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {['Hair', 'Skin', 'Nails', 'Makeup', 'Spa'].map((cat) => (
            <Link
              key={cat}
              to={`/services?category=${cat.toLowerCase()}`}
              className="flex-shrink-0 px-6 py-3 bg-brand-50 rounded-pill text-brand-700 font-medium hover:bg-brand-100 transition-colors"
            >
              {cat}
            </Link>
          ))}
        </div>
      </section> */}

      {/* How it works */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-display text-4xl italic text-center text-neutral-900 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Choose a Service', desc: 'Browse our catalogue of hair, skin, nail, makeup and spa services.' },
              { step: '02', title: 'Pick Your Stylist', desc: 'Select from verified, top-rated stylists based on availability and reviews.' },
              { step: '03', title: 'Book & Enjoy',      desc: 'Confirm your slot, pay securely, and arrive ready to glow.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-14 h-14 rounded-2xl gradient-brand text-white font-bold text-xl flex items-center justify-center mx-auto mb-4">
                  {step}
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2">{title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/book" className="inline-flex items-center gap-2 px-8 py-3 gradient-brand text-white rounded-pill font-medium hover:opacity-90 transition-opacity">
              Start Booking <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Explore Stylists */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <h2 className="font-display text-4xl italic text-neutral-900">Our Stylists</h2>
          <Link to="/stylists" className="text-brand-400 text-sm font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { emoji: '💇', title: 'Hair Specialists',   desc: 'Cuts, colour, keratin, extensions and more by certified hair artists.' },
            { emoji: '✨', title: 'Skin & Beauty',      desc: 'Facials, glow treatments, makeup and bridal services.' },
            { emoji: '💅', title: 'Nail Technicians',  desc: 'Manicures, pedicures, gel, nail art and cuticle care.' },
          ].map(({ emoji, title, desc }) => (
            <Link key={title} to="/stylists" className="group bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all p-6 flex flex-col items-start gap-3">
              <span className="text-4xl">{emoji}</span>
              <h3 className="font-semibold text-neutral-900 group-hover:text-brand-500 transition-colors">{title}</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">{desc}</p>
              <span className="text-brand-400 text-sm font-medium mt-auto flex items-center gap-1">
                Browse <ArrowRight size={13} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Shop Banner */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="rounded-3xl gradient-brand p-10 md:p-14 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={20} className="text-white/80" />
                <span className="text-white/80 font-medium tracking-wider uppercase text-xs">Beauty Products</span>
              </div>
              <h2 className="font-display text-4xl italic mb-3">Shop Premium Products</h2>
              <p className="text-white/80 text-base leading-relaxed max-w-md">
                From professional hair care to skincare essentials — shop top brands used by our expert stylists.
              </p>
            </div>
            <div className="flex flex-col gap-3 flex-shrink-0">
              <Link to="/shop" className="px-8 py-3.5 bg-white text-brand-500 rounded-pill font-semibold hover:bg-brand-50 transition-colors flex items-center gap-2 justify-center">
                <ShoppingBag size={18} /> Browse Shop
              </Link>
              <Link to="/cart" className="px-8 py-3.5 border-2 border-white/40 text-white rounded-pill font-medium hover:border-white transition-colors text-center">
                View Cart
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      {/* <section className="gradient-brand text-white py-16 text-center">
        <h2 className="font-display text-4xl italic mb-4">Book Your First Appointment</h2>
        <p className="text-white/80 mb-8">Join thousands of happy customers across Sri Lanka</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/register" className="px-10 py-3 bg-white text-brand-500 rounded-pill font-semibold hover:bg-brand-50 transition-colors">
            Get Started Free
          </Link>
          <Link to="/stylists" className="px-10 py-3 border-2 border-white/40 text-white rounded-pill font-semibold hover:border-white transition-colors">
            Meet Our Stylists
          </Link>
        </div>
      </section> */}
    </div>
  )
}
