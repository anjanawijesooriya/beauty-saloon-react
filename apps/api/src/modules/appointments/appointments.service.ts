import { prisma } from '../../config/database'
import { AppError } from '../../middleware/error.middleware'
import { Role } from '@prisma/client'

interface CreateAppointmentDto {
  stylistId: string
  serviceIds: string[]
  startsAt: string
  notes?: string
}

export const appointmentsService = {
  async create(customerId: string, dto: CreateAppointmentDto) {
    const stylist = await prisma.stylistProfile.findUnique({ where: { id: dto.stylistId } })
    if (!stylist) throw new AppError(404, 'Stylist not found')

    const stylistServices = await prisma.stylistService.findMany({
      where: { stylistId: dto.stylistId, serviceId: { in: dto.serviceIds } },
      include: { service: true },
    })
    if (stylistServices.length !== dto.serviceIds.length) throw new AppError(400, 'One or more services not available with this stylist')

    const totalMins = stylistServices.reduce((acc, ss) => acc + ss.service.durationMins, 0)
    const totalLKR = stylistServices.reduce((acc, ss) => acc + Number(ss.priceLKR), 0)
    const startsAt = new Date(dto.startsAt)
    const endsAt = new Date(startsAt.getTime() + totalMins * 60000)

    const appointment = await prisma.appointment.create({
      data: {
        customerId,
        stylistId: dto.stylistId,
        startsAt,
        endsAt,
        totalLKR,
        notes: dto.notes,
        items: {
          create: stylistServices.map(ss => ({
            serviceId: ss.serviceId,
            priceLKR: ss.priceLKR,
            durationMins: ss.service.durationMins,
          })),
        },
      },
      include: { items: { include: { service: true } }, customer: { select: { name: true, email: true } }, stylist: { include: { user: { select: { name: true } } } } },
    })
    return appointment
  },

  async list(userId: string, role: Role) {
    const where: any = {}
    if (role === 'CUSTOMER') where.customerId = userId
    else if (role === 'STYLIST') {
      const profile = await prisma.stylistProfile.findUnique({ where: { userId } })
      if (profile) where.stylistId = profile.id
    }
    return prisma.appointment.findMany({
      where,
      include: { items: { include: { service: true } }, customer: { select: { name: true, email: true } }, stylist: { include: { user: { select: { name: true } } } } },
      orderBy: { startsAt: 'desc' },
    })
  },

  async getById(id: string) {
    const appt = await prisma.appointment.findUnique({
      where: { id },
      include: { items: { include: { service: true } }, customer: { select: { name: true, email: true } }, stylist: { include: { user: { select: { name: true } } } } },
    })
    if (!appt) throw new AppError(404, 'Appointment not found')
    return appt
  },

  async cancel(id: string, userId: string, reason?: string) {
    const appt = await prisma.appointment.findUnique({ where: { id } })
    if (!appt) throw new AppError(404, 'Appointment not found')
    if (appt.customerId !== userId) throw new AppError(403, 'Forbidden')
    return prisma.appointment.update({ where: { id }, data: { status: 'CANCELLED', cancelReason: reason } })
  },

  async confirm(id: string) {
    return prisma.appointment.update({ where: { id }, data: { status: 'CONFIRMED' } })
  },

  async complete(id: string) {
    return prisma.appointment.update({ where: { id }, data: { status: 'COMPLETED' } })
  },
}
