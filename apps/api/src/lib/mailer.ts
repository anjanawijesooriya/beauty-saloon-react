import nodemailer from 'nodemailer'
import { env } from '../config/env'

function createTransporter() {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) return null
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  })
}

const transporter = createTransporter()

async function sendEmail(to: string, subject: string, html: string) {
  if (!transporter) {
    console.log(`[mailer-dev] To: ${to} | Subject: ${subject}`)
    return
  }
  try {
    await transporter.sendMail({ from: env.SMTP_FROM, to, subject, html })
    console.log(`[mailer] Sent "${subject}" → ${to}`)
  } catch (err: any) {
    console.error(`[mailer] Error sending "${subject}" to ${to}:`, err?.message ?? err)
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
    `<h2>Hi ${name},</h2><p>Your appointment has been cancelled.</p>`
  )
}
