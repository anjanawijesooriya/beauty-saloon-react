import twilio from 'twilio'
import { env } from '../config/env'

const client = env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN
  ? twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)
  : null

export async function sendSms(to: string, body: string) {
  if (!client || !env.TWILIO_FROM) {
    console.log(`[sms-dev] To: ${to} | ${body}`)
    return
  }
  await client.messages.create({ from: env.TWILIO_FROM, to, body })
}
