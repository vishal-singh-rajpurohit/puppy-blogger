import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

// Replace with a domain verified in your Resend dashboard.
// const FROM = "Puppy Blogs <hello@puppyblogs.app>"
const FROM = process.env.RESEND_FROM
const baseUrl = process.env.BASE_URL

if (!baseUrl || !FROM) {
    throw new Error("Base URL not provided")
}

const BRAND = {
    name: "Puppy Blogs",
    logoEmoji: "🐾",
    accent: "#3F5B33",
    ink: "#2B2318",
    cream: "#FAF6EC",
    card: "#FFFFFF",
    muted: "#6B6152",
}

type EmailTemplate = {
    subject: string
    html: string
}

function emailLayout(preheader: string, bodyHtml: string): string {
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${BRAND.name}</title>
  </head>
  <body style="margin:0; padding:0; background-color:${BRAND.cream}; font-family: Arial, Helvetica, sans-serif;">
    <span style="display:none; max-height:0; overflow:hidden;">${preheader}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.cream}; padding: 32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; width: 100%;">
            <tr>
              <td align="center" style="padding-bottom: 24px;">
                <span style="font-size: 22px; font-weight: bold; color: ${BRAND.ink};">
                  ${BRAND.logoEmoji} ${BRAND.name}
                </span>
              </td>
            </tr>
            <tr>
              <td style="background-color: ${BRAND.card}; border-radius: 8px; padding: 32px 28px; color: ${BRAND.ink};">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-top: 24px;">
                <p style="margin:0; font-size:12px; color:${BRAND.muted};">
                  You're receiving this email because of activity on your ${BRAND.name} account.
                </p>
                <p style="margin:4px 0 0; font-size:12px; color:${BRAND.muted};">
                  &copy; ${new Date().getFullYear()} ${BRAND.name}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

function button(label: string, href: string): string {
    return `<a href="${href}" style="display:inline-block; margin-top: 20px; padding: 12px 24px; background-color:${BRAND.accent}; color:#ffffff; font-size:14px; font-weight:bold; text-decoration:none; border-radius:4px;">${label}</a>`
}

// --- Templates -------------------------------------------------------------

export function registrationEmailTemplate({
    username,
    ctaUrl
}: {
    username: string
    ctaUrl: string
}): EmailTemplate {
    const subject = `Welcome to ${BRAND.name}, ${username}! ${BRAND.logoEmoji}`
    const html = emailLayout(
        subject,
        `
      <p style="margin:0 0 4px; font-size:13px; letter-spacing:0.04em; text-transform:uppercase; color:${BRAND.muted};">
        Welcome
      </p>
      <h1 style="margin:0 0 16px; font-size:22px; color:${BRAND.ink};">
        Hey ${username}, glad you're here.
      </h1>
      <p style="margin:0 0 8px; font-size:15px; line-height:1.6; color:${BRAND.ink};">
        Your ${BRAND.name} account is ready. Whatever you want to write about,
        this is the place to start &mdash; a short story, a how-to, a travel
        journal, or something you've been meaning to say for a while.
      </p>
      <p style="margin:0; font-size:15px; line-height:1.6; color:${BRAND.ink};">
        No pressure to be polished. Just start.
      </p>
      ${button("Start writing", ctaUrl)}
    `
    )
    return { subject, html }
}

export function otpEmailTemplate({ otp }: { otp: string }): EmailTemplate {
    const subject = `${otp} is your ${BRAND.name} verification code`
    const html = emailLayout(
        subject,
        `
      <p style="margin:0 0 4px; font-size:13px; letter-spacing:0.04em; text-transform:uppercase; color:${BRAND.muted};">
        Verify your email
      </p>
      <h1 style="margin:0 0 16px; font-size:22px; color:${BRAND.ink};">
        Here's your code
      </h1>
      <p style="margin:0 0 20px; font-size:15px; line-height:1.6; color:${BRAND.ink};">
        Enter this code to verify your email address. It expires in 10 minutes.
      </p>
      <div style="text-align:center; padding: 16px 0; background-color:${BRAND.cream}; border-radius:6px; letter-spacing: 8px; font-size: 28px; font-weight: bold; color:${BRAND.ink};">
        ${otp}
      </div>
      <p style="margin:20px 0 0; font-size:13px; line-height:1.6; color:${BRAND.muted};">
        If you didn't request this, you can safely ignore this email.
      </p>
    `
    )
    return { subject, html }
}

export function passwordResetSuccessTemplate({
    username,
    supportUrl,
    changedAt = new Date(),
}: {
    username?: string
    supportUrl: string
    changedAt?: Date
}): EmailTemplate {
    const subject = `Your ${BRAND.name} password was changed`
    const formattedDate = changedAt.toLocaleString("en-US", {
        dateStyle: "long",
        timeStyle: "short",
    })
    const html = emailLayout(
        subject,
        `
      <p style="margin:0 0 4px; font-size:13px; letter-spacing:0.04em; text-transform:uppercase; color:${BRAND.muted};">
        Security update
      </p>
      <h1 style="margin:0 0 16px; font-size:22px; color:${BRAND.ink};">
        Password changed${username ? `, ${username}` : ""}
      </h1>
      <p style="margin:0 0 8px; font-size:15px; line-height:1.6; color:${BRAND.ink};">
        Your password was successfully changed on ${formattedDate}.
      </p>
      <p style="margin:0; font-size:15px; line-height:1.6; color:${BRAND.ink};">
        If this was you, no action is needed.
      </p>
      <p style="margin:20px 0 0; font-size:13px; line-height:1.6; color:${BRAND.muted};">
        If you didn't make this change,
        <a href="${supportUrl}" style="color:${BRAND.accent};">secure your account</a>
        immediately.
      </p>
    `
    )
    return { subject, html }
}

// --- Senders -------------------------------------------------------------

export const sendRegistrationEmail = (to: string, username: string, ctaUrl: string = baseUrl) => {
    const { subject, html } = registrationEmailTemplate({ username, ctaUrl })
    return resend.emails.send({ from: FROM, to, subject, html })
}

export const sendOtp = (otp: string, to: string) => {
    const { subject, html } = otpEmailTemplate({ otp })
    return resend.emails.send({ from: FROM, to, subject, html })
}

export const sendPasswordResetSuccessEmail = (
    to: string,
    options: { username?: string; supportUrl: string; changedAt?: Date }
) => {
    const { subject, html } = passwordResetSuccessTemplate(options)
    return resend.emails.send({ from: FROM, to, subject, html })
}