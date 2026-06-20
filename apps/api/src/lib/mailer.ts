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

export async function sendCancellationEmail(
  to: string,
  name: string,
  data?: { date?: string; stylist?: string; reason?: string; cancelledBy?: 'stylist' | 'admin' | 'auto' }
) {
  const whoLine = data?.cancelledBy === 'stylist'
    ? `Your stylist <strong>${data.stylist ?? 'your stylist'}</strong> has cancelled your appointment.`
    : data?.cancelledBy === 'auto'
    ? `Your appointment was automatically cancelled because another booking was confirmed for this time slot.`
    : `Your appointment has been cancelled.`

  const reasonBlock = data?.reason
    ? `<p style="background:#fff5f5;border-left:3px solid #f87171;padding:10px 14px;border-radius:4px;margin:16px 0;">
         <strong>Reason:</strong> ${data.reason}
       </p>`
    : ''

  const dateBlock = data?.date
    ? `<p>Appointment date: <strong>${data.date}</strong></p>`
    : ''

  await sendEmail(
    to,
    'Your GlowHer appointment has been cancelled',
    `<h2>Hi ${name},</h2>
     <p>${whoLine}</p>
     ${dateBlock}
     ${reasonBlock}
     <p>You can book a new appointment anytime at GlowHer.</p>`
  )
}

export async function sendStylistCancellationEmail(
  to: string,
  stylistName: string,
  data: { customerName: string; date: string; services: string[]; reason?: string }
) {
  const reasonBlock = data.reason
    ? `<p style="background:#fff5f5;border-left:3px solid #f87171;padding:10px 14px;border-radius:4px;margin:16px 0;">
         <strong>Customer's reason:</strong> ${data.reason}
       </p>`
    : ''

  await sendEmail(
    to,
    'Appointment cancelled by customer — GlowHer',
    `<h2>Hi ${stylistName},</h2>
     <p><strong>${data.customerName}</strong> has cancelled their appointment with you.</p>
     <p>Date: <strong>${data.date}</strong></p>
     <p>Services: ${data.services.join(', ')}</p>
     ${reasonBlock}
     <p>The time slot is now free on your schedule.</p>`
  )
}

export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  await sendEmail(
    to,
    'Reset your GlowHer password',
    `<h2>Hi ${name},</h2>
     <p>We received a request to reset your GlowHer password.</p>
     <p><a href="${resetUrl}" style="background:#d4547a;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">Reset Password</a></p>
     <p>This link expires in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.</p>`
  )
}
