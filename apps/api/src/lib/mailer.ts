import sgMail from '@sendgrid/mail'
import { env } from '../config/env'

if (env.SENDGRID_API_KEY) {
  sgMail.setApiKey(env.SENDGRID_API_KEY)
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!env.SENDGRID_API_KEY) {
    console.log(`[mailer-dev] To: ${to} | Subject: ${subject}`)
    return
  }
  if (!env.SENDGRID_FROM) {
    console.error('[mailer] SENDGRID_FROM is not set — email not sent')
    return
  }
  try {
    await sgMail.send({ to, from: env.SENDGRID_FROM, subject, html })
    console.log(`[mailer] Sent "${subject}" → ${to}`)
  } catch (err: any) {
    const body = err?.response?.body ?? err?.message ?? err
    console.error(`[mailer] SendGrid error sending "${subject}" to ${to}:`, JSON.stringify(body))
  }
}

export async function sendWelcomeEmail(to: string, name: string) {
  await sendEmail(
    to,
    'Welcome to GlowHer!',
    `<h2>Welcome, ${name}!</h2>
     <p>We're thrilled to have you on <strong>GlowHer</strong> — Sri Lanka's premier beauty platform.</p>
     <p>Start exploring top-rated stylists and book your first appointment today.</p>`
  )
}

export async function sendBookingConfirmation(
  to: string,
  data: { name: string; date: string; stylist: string; services: string[] }
) {
  await sendEmail(
    to,
    'Your GlowHer Appointment is Confirmed!',
    `<h2>Hi ${data.name},</h2>
     <p>Your appointment with <strong>${data.stylist}</strong> on <strong>${data.date}</strong> is confirmed.</p>
     <p>Services: ${data.services.join(', ')}</p>`
  )
}

export async function sendBookingReminder(
  to: string,
  data: { name: string; time: string; stylist: string }
) {
  await sendEmail(
    to,
    'Reminder: Your GlowHer appointment is tomorrow!',
    `<h2>Hi ${data.name},</h2>
     <p>Just a reminder that your appointment with <strong>${data.stylist}</strong> is at <strong>${data.time}</strong> tomorrow.</p>`
  )
}

export async function sendCancellationEmail(to: string, name: string) {
  await sendEmail(
    to,
    'Your GlowHer appointment has been cancelled',
    `<h2>Hi ${name},</h2><p>Your appointment has been cancelled as requested.</p>`
  )
}
