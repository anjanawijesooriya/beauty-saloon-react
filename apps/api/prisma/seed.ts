import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // ── Categories ─────────────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.serviceCategory.upsert({ where: { slug: 'hair' },   update: {}, create: { name: 'Hair',   slug: 'hair',   order: 1 } }),
    prisma.serviceCategory.upsert({ where: { slug: 'skin' },   update: {}, create: { name: 'Skin',   slug: 'skin',   order: 2 } }),
    prisma.serviceCategory.upsert({ where: { slug: 'nails' },  update: {}, create: { name: 'Nails',  slug: 'nails',  order: 3 } }),
    prisma.serviceCategory.upsert({ where: { slug: 'makeup' }, update: {}, create: { name: 'Makeup', slug: 'makeup', order: 4 } }),
    prisma.serviceCategory.upsert({ where: { slug: 'spa' },    update: {}, create: { name: 'Spa',    slug: 'spa',    order: 5 } }),
  ])
  const [hair, skin, nails, makeup, spa] = categories
  console.log('✓ Categories')

  // ── Services ───────────────────────────────────────────────────────────────
  const serviceData = [
    { categoryId: hair.id,   name: 'Haircut & Blow Dry',      slug: 'haircut-blow-dry',     durationMins: 60,  basePriceLKR: 2500,  description: 'Precision cut tailored to your face shape, finished with a professional blow dry.' },
    { categoryId: hair.id,   name: 'Hair Colouring',          slug: 'hair-colouring',       durationMins: 120, basePriceLKR: 6500,  description: 'Full colour service using premium ammonia-free dyes, toner and gloss included.' },
    { categoryId: hair.id,   name: 'Keratin Treatment',       slug: 'keratin-treatment',    durationMins: 180, basePriceLKR: 12000, description: 'Smooth, frizz-free hair for up to 3 months with our Brazilian keratin treatment.' },
    { categoryId: hair.id,   name: 'Hair Highlights',         slug: 'hair-highlights',      durationMins: 150, basePriceLKR: 8500,  description: 'Balayage or foil highlights for dimension and sun-kissed warmth.' },
    { categoryId: skin.id,   name: 'Classic Facial',          slug: 'classic-facial',       durationMins: 60,  basePriceLKR: 3500,  description: 'Deep cleanse, exfoliation, mask, and moisturiser for glowing skin.' },
    { categoryId: skin.id,   name: 'Gold Brightening Facial', slug: 'gold-facial',          durationMins: 90,  basePriceLKR: 5500,  description: 'Luxurious 24k gold facial to brighten, firm, and revitalise dull skin.' },
    { categoryId: skin.id,   name: 'Microdermabrasion',       slug: 'microdermabrasion',    durationMins: 75,  basePriceLKR: 4500,  description: 'Crystal-free exfoliation that buffs away dead skin cells for a silky-smooth finish.' },
    { categoryId: nails.id,  name: 'Classic Manicure',        slug: 'classic-manicure',     durationMins: 45,  basePriceLKR: 1500,  description: 'Nail shaping, cuticle care, hand massage, and your choice of polish.' },
    { categoryId: nails.id,  name: 'Gel Manicure',            slug: 'gel-manicure',         durationMins: 60,  basePriceLKR: 2500,  description: 'Long-lasting gel polish cured under UV light. Chip-free for up to 3 weeks.' },
    { categoryId: nails.id,  name: 'Luxury Pedicure',         slug: 'luxury-pedicure',      durationMins: 75,  basePriceLKR: 3000,  description: 'Foot soak, scrub, massage, and polish. The ultimate foot care experience.' },
    { categoryId: nails.id,  name: 'Nail Art',                slug: 'nail-art',             durationMins: 90,  basePriceLKR: 3500,  description: 'Custom nail art designs — from minimalist to intricate. Consultation included.' },
    { categoryId: makeup.id, name: 'Bridal Makeup',           slug: 'bridal-makeup',        durationMins: 120, basePriceLKR: 15000, description: 'Full bridal look with trial session. Airbrush or traditional — your choice.' },
    { categoryId: makeup.id, name: 'Party Glam Makeup',       slug: 'party-glam-makeup',    durationMins: 60,  basePriceLKR: 4500,  description: 'Evening-ready glam makeup to make you shine at any event.' },
    { categoryId: spa.id,    name: 'Swedish Massage',         slug: 'swedish-massage',      durationMins: 60,  basePriceLKR: 5000,  description: 'Gentle, relaxing full-body massage to melt away stress and tension.' },
    { categoryId: spa.id,    name: 'Deep Tissue Massage',     slug: 'deep-tissue-massage',  durationMins: 75,  basePriceLKR: 6500,  description: 'Targets deep muscle layers to relieve chronic pain and stiffness.' },
    { categoryId: spa.id,    name: 'Aromatherapy Massage',    slug: 'aromatherapy-massage', durationMins: 90,  basePriceLKR: 7000,  description: 'Essential oil massage that relaxes the body and calms the mind.' },
  ]
  const services: Record<string, string> = {}
  for (const s of serviceData) {
    const svc = await prisma.service.upsert({ where: { slug: s.slug }, update: {}, create: s })
    services[s.slug] = svc.id
  }
  console.log('✓ Services')

  // ── Users ──────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin@1234', 12)
  await prisma.user.upsert({
    where: { email: 'admin@glowher.lk' },
    update: {},
    create: { name: 'GlowHer Admin', email: 'admin@glowher.lk', passwordHash: adminHash, role: 'ADMIN' },
  })

  const custHash = await bcrypt.hash('Customer@1234', 12)
  await prisma.user.upsert({
    where: { email: 'customer@glowher.lk' },
    update: {},
    create: { name: 'Sachini Perera', email: 'customer@glowher.lk', passwordHash: custHash, role: 'CUSTOMER' },
  })
  console.log('✓ Admin & demo customer')

  // ── Stylists ───────────────────────────────────────────────────────────────
  const stylistHash = await bcrypt.hash('Stylist@1234', 12)

  const stylistSeeds = [
    {
      user: { name: 'Kavindi Rathnayake', email: 'kavindi@glowher.lk' },
      profile: {
        bio: 'Certified hair specialist with 8 years of experience. Known for transformative colour work and precision cuts.',
        specialities: ['Hair Colouring', 'Balayage', 'Keratin Treatments'],
        experience: 8,
        rating: 4.8,
        reviewCount: 124,
        portfolioUrls: [],
      },
      serviceSlugs: ['haircut-blow-dry', 'hair-colouring', 'keratin-treatment', 'hair-highlights'],
      availability: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' },
      ],
    },
    {
      user: { name: 'Nimasha Fernando', email: 'nimasha@glowher.lk' },
      profile: {
        bio: 'Skin care expert and makeup artist. I believe every woman deserves to feel flawless on her special day.',
        specialities: ['Bridal Makeup', 'Facials', 'Skin Treatments'],
        experience: 5,
        rating: 4.9,
        reviewCount: 89,
        portfolioUrls: [],
      },
      serviceSlugs: ['classic-facial', 'gold-facial', 'microdermabrasion', 'bridal-makeup', 'party-glam-makeup'],
      availability: [
        { dayOfWeek: 2, startTime: '10:00', endTime: '18:00' },
        { dayOfWeek: 3, startTime: '10:00', endTime: '18:00' },
        { dayOfWeek: 5, startTime: '10:00', endTime: '18:00' },
        { dayOfWeek: 6, startTime: '09:00', endTime: '15:00' },
      ],
    },
    {
      user: { name: 'Dinusha Wijesinghe', email: 'dinusha@glowher.lk' },
      profile: {
        bio: 'Nail artist and spa therapist. I specialise in intricate nail designs and deeply relaxing massages.',
        specialities: ['Nail Art', 'Gel Nails', 'Massage Therapy'],
        experience: 6,
        rating: 4.7,
        reviewCount: 63,
        portfolioUrls: [],
      },
      serviceSlugs: ['classic-manicure', 'gel-manicure', 'luxury-pedicure', 'nail-art', 'swedish-massage', 'aromatherapy-massage'],
      availability: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '18:00' },
        { dayOfWeek: 3, startTime: '09:00', endTime: '18:00' },
        { dayOfWeek: 4, startTime: '09:00', endTime: '18:00' },
        { dayOfWeek: 5, startTime: '09:00', endTime: '18:00' },
        { dayOfWeek: 6, startTime: '10:00', endTime: '16:00' },
      ],
    },
  ]

  for (const seed of stylistSeeds) {
    const user = await prisma.user.upsert({
      where: { email: seed.user.email },
      update: {},
      create: { ...seed.user, passwordHash: stylistHash, role: 'STYLIST' },
    })

    const profile = await prisma.stylistProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, ...seed.profile },
    })

    // Availability
    await prisma.availability.deleteMany({ where: { stylistId: profile.id } })
    await prisma.availability.createMany({
      data: seed.availability.map((a) => ({ ...a, stylistId: profile.id })),
    })

    // Stylist services (price slightly above base)
    await prisma.stylistService.deleteMany({ where: { stylistId: profile.id } })
    await prisma.stylistService.createMany({
      data: seed.serviceSlugs.map((slug) => ({
        stylistId: profile.id,
        serviceId: services[slug],
        priceLKR: serviceData.find((s) => s.slug === slug)!.basePriceLKR * 1.1,
      })),
    })
  }
  console.log('✓ Stylists (kavindi / nimasha / dinusha — password: Stylist@1234)')

  console.log('\nSeed complete!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
