import { useState } from 'react'
import { getErrorMessage } from '../api/client'
import { useAuth } from '../context/useAuth'

export default function AuthDialog() {
  const {
    authMode,
    openAuth,
    closeAuth,
    login,
    register,
    verifyRegistration,
    resendCode,
    forgotPassword,
    resetPassword,
  } = useAuth()

  const [form, setForm] = useState({ nombre: '', email: '', password: '' })
  const [code, setCode] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [pendingEmail, setPendingEmail] = useState('')
  const [stage, setStage] = useState('form')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isRegister = authMode === 'register'
  const isVerify = stage === 'verify'
  const isForgot = stage === 'forgot'
  const isReset = stage === 'reset'

  const resetForm = () => {
    setForm({ nombre: '', email: '', password: '' })
    setCode('')
    setResetCode('')
    setNewPassword('')
    setPendingEmail('')
    setStage('form')
    setError('')
    setNotice('')
  }

  const changeField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')
    setSubmitting(true)

    try {
      if (isVerify) {
        await verifyRegistration({ email: pendingEmail, code })
        closeAuth()
        return
      }

      if (isForgot) {
        const result = await forgotPassword(form.email)
        setPendingEmail(form.email.trim().toLowerCase())
        setNotice(result.message)
        setStage('reset')
        return
      }

      if (isReset) {
        const result = await resetPassword({
          email: pendingEmail,
          code: resetCode,
          password: newPassword,
        })
        setNotice(result.message)
        setStage('form')
        setAuthModeSafe('login')
        setForm((current) => ({ ...current, password: '', email: pendingEmail }))
        setResetCode('')
        setNewPassword('')
        return
      }

      if (isRegister) {
        const result = await register({
          nombre: form.nombre,
          email: form.email,
          password: form.password,
        })
        setPendingEmail(result.email)
        setNotice(result.message)
        setStage('verify')
        return
      }

      await login({ email: form.email, password: form.password })
      closeAuth()
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo completar la acción'))
    } finally {
      setSubmitting(false)
    }
  }

  const setAuthModeSafe = (mode) => {
    openAuth(mode)
  }

  const handleResend = async () => {
    setError('')
    setNotice('')
    setSubmitting(true)

    try {
      if (isReset) {
        const result = await forgotPassword(pendingEmail)
        setNotice(result.message || 'Código reenviado')
      } else {
        const result = await resendCode(pendingEmail)
        setNotice(result.message)
      }
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo reenviar el código'))
    } finally {
      setSubmitting(false)
    }
  }

  const title = isVerify
    ? 'Verifica tu correo'
    : isForgot
      ? 'Recupera tu contraseña'
      : isReset
        ? 'Crea una nueva contraseña'
        : isRegister
          ? 'Crear cuenta'
          : 'Bienvenido de nuevo'

  const subtitle = isVerify
    ? `Enviamos un código de 6 dígitos a ${pendingEmail}.`
    : isForgot
      ? 'Ingresa tu correo y te enviaremos un código para restablecer tu contraseña.'
      : isReset
        ? `Ingresa el código enviado a ${pendingEmail} y tu nueva contraseña.`
        : isRegister
          ? 'Necesitas una cuenta para reportar y votar baches.'
          : 'Ingresa para votar y dar seguimiento a tus reportes.'

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeAuth()
      }}
    >
      <div className="modal modal--auth" role="dialog" aria-modal="true">
        <button
          type="button"
          className="modal__close"
          onClick={closeAuth}
          aria-label="Cerrar"
        >
          ×
        </button>

        <h2>{title}</h2>
        <p className="modal__subtitle">{subtitle}</p>

        {!isVerify && !isForgot && !isReset && (
          <div className="tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={!isRegister}
              className={!isRegister ? 'active' : ''}
              onClick={() => {
                resetForm()
                openAuth('login')
              }}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isRegister}
              className={isRegister ? 'active' : ''}
              onClick={() => {
                resetForm()
                openAuth('register')
              }}
            >
              Registrarse
            </button>
          </div>
        )}

        <form className="stack-form" onSubmit={handleSubmit}>
          {isVerify && (
            <label>
              Código de verificación
              <input
                className="code-input"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength="6"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                required
              />
            </label>
          )}

          {isForgot && (
            <label>
              Correo electrónico
              <input
                type="email"
                value={form.email}
                onChange={changeField('email')}
                placeholder="nombre@correo.com"
                required
              />
            </label>
          )}

          {isReset && (
            <>
              <label>
                Código de recuperación
                <input
                  className="code-input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength="6"
                  value={resetCode}
                  onChange={(event) => setResetCode(event.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  required
                />
              </label>
              <label>
                Nueva contraseña
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  minLength="6"
                  required
                />
              </label>
            </>
          )}

          {!isVerify && !isForgot && !isReset && (
            <>
              {isRegister && (
                <label>
                  Nombre
                  <input
                    type="text"
                    value={form.nombre}
                    onChange={changeField('nombre')}
                    placeholder="Tu nombre"
                    minLength="2"
                    required
                  />
                </label>
              )}

              <label>
                Correo electrónico
                <input
                  type="email"
                  value={form.email}
                  onChange={changeField('email')}
                  placeholder="nombre@correo.com"
                  required
                />
              </label>

              <label>
                Contraseña
                <input
                  type="password"
                  value={form.password}
                  onChange={changeField('password')}
                  placeholder="Mínimo 6 caracteres"
                  minLength="6"
                  required
                />
              </label>
            </>
          )}

          {!isRegister && !isVerify && !isForgot && !isReset && (
            <div className="auth-actions auth-actions--right">
              <button
                type="button"
                className="button--link"
                onClick={() => {
                  setError('')
                  setNotice('')
                  setStage('forgot')
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          {notice && <p className="auth-note">{notice}</p>}
          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="button button--primary button--wide" disabled={submitting}>
            {submitting
              ? 'Un momento…'
              : isVerify
                ? 'Verificar cuenta'
                : isForgot
                  ? 'Enviar código'
                  : isReset
                    ? 'Actualizar contraseña'
                    : isRegister
                      ? 'Crear cuenta'
                      : 'Ingresar'}
          </button>

          {(isVerify || isReset) && (
            <div className="auth-actions">
              <button type="button" className="button--link" onClick={handleResend} disabled={submitting}>
                Reenviar código
              </button>
              <button
                type="button"
                className="button--link"
                onClick={() => {
                  setStage('form')
                  setError('')
                  setNotice('')
                  if (isVerify) setCode('')
                  if (isReset) {
                    setResetCode('')
                    setNewPassword('')
                  }
                }}
              >
                Volver
              </button>
            </div>
          )}

          {isForgot && (
            <div className="auth-actions">
              <button
                type="button"
                className="button--link"
                onClick={() => {
                  setStage('form')
                  setError('')
                  setNotice('')
                }}
              >
                Volver a iniciar sesión
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}