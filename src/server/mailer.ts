import "server-only"

export async function sendMail(input: { to: string; subject: string; text: string }) {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.info(`[mail] ${input.subject} to ${input.to}`)
    return { sent: false as const }
  }
  const from = process.env.MAIL_FROM
  if (!from) {
    console.error("[mail] MAIL_FROM is missing")
    return { sent: false as const }
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
    }),
  })
  if (!response.ok) {
    console.error(`[mail] Resend returned ${response.status}`)
    return { sent: false as const }
  }
  return { sent: true as const }
}
