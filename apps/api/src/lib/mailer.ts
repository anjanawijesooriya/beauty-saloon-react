import sgMail from '@sendgrid/mail'
import { env } from '../config/env'

sgMail.setApiKey(env.SENDGRID_API_KEY)

export async function sendEmail(to: string, subject: string, html: string) {
  await sgMail.send({ to, from: env.SENDGRID_FROM, subject, html })
}

export async function sendBookingConfirmation(to: string, data: { name: string; date: string; stylist: string }) {
  await sendEmail(
    to,
    'Your GlowHer Appointment is Confirmed!',
    `<h2>Hi ${data.name},</h2><p>Your appointment with ${data.stylist} on ${data.date} is confirmed.</p>`
  )
}

export async function sendWelcomeEmail(to: string, name: string) {
  await sendEmail(
    to,
    'Welcome to GlowHer!',
    `<h2>Welcome, ${name}!</h2><p>We're thrilled to have you on GlowHer — Sri Lanka's premier beauty platform.</p>`
  )
}
