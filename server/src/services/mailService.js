const nodemailer = require('nodemailer')
const env = require('../config/env')

let transport = null

function getTransport() {
  if (!env.smtpUser || !env.smtpPassword) return null

  if (!transport) {
    transport = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPassword,
      },
    })
  }

  return transport
}

function renderLayout({ preheader, title, body, footer }) {
  return `
  <div style="margin:0;padding:24px;background:#f0fdfa;font-family:'Segoe UI',Arial,sans-serif;color:#134e4a;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #ccfbf1;border-radius:20px;overflow:hidden;box-shadow:0 10px 30px rgba(6,78,59,0.12);">
      <div style="padding:28px 32px;background:linear-gradient(135deg,#042f2e,#0f766e);color:#f0fdfa;">
        <div style="display:inline-block;padding:6px 12px;border-radius:999px;background:rgba(255,255,255,0.14);font-size:12px;font-weight:700;letter-spacing:0.4px;">BACHES PANAMÁ</div>
        <h1 style="margin:16px 0 0;font-size:28px;line-height:1.2;">${title}</h1>
      </div>
      <div style="padding:32px;">
        ${body}
      </div>
      <div style="padding:20px 32px;background:#ecfdf5;border-top:1px solid #ccfbf1;font-size:12px;line-height:1.6;color:#5f8f8a;">
        ${footer}
      </div>
    </div>
  </div>`
}

async function sendMail({ to, subject, text, html, logLabel }) {
  const activeTransport = getTransport()

  if (!activeTransport) {
    console.warn(`[MAIL] SMTP sin configurar. ${logLabel} para ${to}`)
    return { delivered: false }
  }

  await activeTransport.sendMail({
    from: env.mailFrom,
    to,
    subject,
    text,
    html,
  })

  return { delivered: true }
}

async function sendVerificationCode(email, code) {
  const subject = 'Tu código de verificación — Baches Panamá'
  const text = `Tu código de verificación es ${code}. Expira en ${env.otpMinutes} minutos.`
  const html = renderLayout({
    preheader: `Tu código es ${code}. Expira en ${env.otpMinutes} minutos.`,
    title: 'Verifica tu correo',
    body: `
      <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">Usa este código para completar tu registro en <strong>Baches Panamá</strong>.</p>
      <div style="margin:24px 0;padding:24px;border-radius:16px;background:#f0fdfa;border:1px solid #99f6e4;text-align:center;">
        <div style="font-size:12px;font-weight:700;letter-spacing:1px;color:#0f766e;text-transform:uppercase;">Código de verificación</div>
        <div style="margin-top:10px;font-size:38px;line-height:1;font-weight:800;letter-spacing:10px;color:#134e4a;">${code}</div>
      </div>
      <p style="margin:0;font-size:14px;line-height:1.7;color:#5f8f8a;">Este código expira en <strong>${env.otpMinutes} minutos</strong>. Si no solicitaste esta cuenta, puedes ignorar este correo.</p>
    `,
    footer: 'Baches Panamá · Reporta, vota y da seguimiento a las vías en Changuinola, Bocas del Toro.',
  })

  return sendMail({ to: email, subject, text, html, logLabel: `Código ${code}` })
}

async function sendWelcomeEmail(email, nombre) {
  const safeName = String(nombre || 'ciudadano').trim() || 'ciudadano'
  const subject = '¡Bienvenido a Baches Panamá!'
  const text = `Hola ${safeName}, tu cuenta en Baches Panamá ya está verificada. Ya puedes reportar y votar baches en Changuinola.`
  const html = renderLayout({
    preheader: 'Tu cuenta ya está lista para reportar y votar baches.',
    title: `¡Bienvenido, ${safeName}!`,
    body: `
      <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">Tu cuenta ya fue verificada correctamente. Desde ahora puedes participar en <strong>Baches Panamá</strong>.</p>
      <div style="margin:24px 0;padding:20px;border-radius:16px;background:#ecfdf5;border:1px solid #ccfbf1;">
        <p style="margin:0 0 10px;font-size:14px;"><strong>📍 Reporta</strong> baches en Changuinola, Bocas del Toro.</p>
        <p style="margin:0 0 10px;font-size:14px;"><strong>▲ Vota</strong> los reportes más urgentes.</p>
        <p style="margin:0;font-size:14px;"><strong>🔄 Sigue</strong> el estado hasta su reparación.</p>
      </div>
      <p style="margin:0;font-size:14px;line-height:1.7;color:#5f8f8a;">Gracias por ayudar a mejorar las vías de tu comunidad.</p>
    `,
    footer: 'Baches Panamá · Changuinola, Bocas del Toro. Este correo fue enviado porque creaste una cuenta en la plataforma.',
  })

  return sendMail({ to: email, subject, text, html, logLabel: 'Bienvenida' })
}

async function sendPasswordResetCode(email, code) {
  const subject = 'Restablece tu contraseña — Baches Panamá'
  const text = `Tu código para restablecer la contraseña es ${code}. Expira en ${env.otpMinutes} minutos. Si no lo solicitaste, ignora este correo.`
  const html = renderLayout({
    preheader: `Tu código para restablecer la contraseña es ${code}.`,
    title: 'Restablece tu contraseña',
    body: `
      <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">Recibimos una solicitud para cambiar la contraseña de tu cuenta en <strong>Baches Panamá</strong>.</p>
      <div style="margin:24px 0;padding:24px;border-radius:16px;background:#fff7ed;border:1px solid #fed7aa;text-align:center;">
        <div style="font-size:12px;font-weight:700;letter-spacing:1px;color:#c2410c;text-transform:uppercase;">Código de recuperación</div>
        <div style="margin-top:10px;font-size:38px;line-height:1;font-weight:800;letter-spacing:10px;color:#9a3412;">${code}</div>
      </div>
      <div style="margin:0 0 16px;padding:16px;border-radius:12px;background:#f0fdfa;border:1px solid #ccfbf1;">
        <p style="margin:0;font-size:14px;line-height:1.7;color:#134e4a;"><strong>¿Cómo usarlo?</strong><br>Ingresa este código en la pantalla de recuperación y crea tu nueva contraseña.</p>
      </div>
      <p style="margin:0;font-size:14px;line-height:1.7;color:#5f8f8a;">Este código expira en <strong>${env.otpMinutes} minutos</strong>. Si no solicitaste este cambio, ignora este correo: tu contraseña seguirá igual.</p>
    `,
    footer: 'Baches Panamá · Seguridad de tu cuenta. Nunca compartas este código con nadie.',
  })

  return sendMail({ to: email, subject, text, html, logLabel: `Reset ${code}` })
}

module.exports = { sendVerificationCode, sendWelcomeEmail, sendPasswordResetCode }
