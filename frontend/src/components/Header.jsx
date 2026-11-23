export default function Header({
  user,
  isAdmin,
  isModerator,
  isStaff,
  onHome,
  onDashboard,
  onLogin,
  onRegister,
  onLogout,
  theme,
  onToggleTheme,
}) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand__mark" colorbackground="white">
          <img src="/bache.png" alt="Logo de Baches Panamá" />
        </span>
        <div>
          <h1>Baches Panamá</h1>
          <p>Reporta, vota y da seguimiento a las vías</p>
        </div>
      </div>

      <nav className="topbar__actions" aria-label="Navegación">
        <button
          type="button"
          className="icon-button icon-button--theme"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button type="button" className="button button--ghost" onClick={onHome}>
          Inicio
        </button>
        {isStaff && (
          <button type="button" className="button button--ghost" onClick={onDashboard}>
            Panel
          </button>
        )}
        {user ? (
          <>
            <span className="user-chip">
              Hola, {user.nombre?.split(' ')[0] || user.email}
              {isAdmin && <em>Admin</em>}
              {!isAdmin && isModerator && <em>Moderador</em>}
            </span>
            <button type="button" className="button button--ghost" onClick={onLogout}>
              Salir
            </button>
          </>
        ) : (
          <>
            <button type="button" className="button button--ghost" onClick={onLogin}>
              Iniciar sesión
            </button>
            <button type="button" className="button button--primary" onClick={onRegister}>
              Registrarse
            </button>
          </>
        )}
      </nav>
    </header>
  )
}
