import cron from 'node-cron'
import { addDays, startOfDay, endOfDay, format } from 'date-fns'
import { prisma } from '../config/database'
import { sendSms } from '../lib/sms'
import { sendBookingReminder } from '../lib/mailer'

export function startReminderJob() {
  // Run daily at 09:00 Sri Lanka time (UTC+5:30 = 03:30 UTC)
  cron.schedule('30 3 * * *', async () => {
    console.log('[cron] Running appointment reminders')
    const tomorrow = addDays(new Date(), 1)
    const appointments = await prisma.appointment.findMany({
      where: {
        startsAt: { gte: startOfDay(tomorrow), lte: endOfDay(tomorrow) },
        status: 'CONFIRMED',
      },
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        stylist:  { include: { user: { select: { name: true } } } },
      },
    })

    for (const appt of appointments) {
      const timeStr = format(appt.startsAt, 'h:mm a')
      // Email reminder
      sendBookingReminder(appt.customer.email, {
        name:    appt.customer.name,
        time:    timeStr,
        stylist: appt.stylist.user.name,
      }).catch((e) => console.error(`[cron] email reminder failed for ${appt.customer.email}:`, e?.message))

      if (appt.customer.phone) {
        sendSms(
          appt.customer.phone,
          `Hi ${appt.customer.name}! Your GlowHer appointment with ${appt.stylist.user.name} is tomorrow at ${timeStr}. We can't wait to see you!`
        ).catch((e) => console.error(`[cron] SMS reminder failed for ${appt.customer.phone}:`, e?.message))
      }
    }
    console.log(`[cron] Sent ${appointments.length} reminders`)
  })

  console.log('[cron] Reminder job scheduled')
}
