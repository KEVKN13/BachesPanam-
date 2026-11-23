import heroImage from '../assets/hero-map.svg'

const FEATURES = [
  {
    icon: '📍',
    title: 'Reporta',
    text: 'Marca el bache en el mapa, agrega gravedad y una foto. Tu reporte queda visible al instante.',
  },
  {
    icon: '👍',
    title: 'Vota',
    text: 'Apoya los reportes que más afectan tu ruta. Los más votados suben en el listado.',
  },
  {
    icon: '🛠️',
    title: 'Da seguimiento',
    text: 'Cada reporte pasa por Reportado, En revisión y Reparado. Consulta su historial completo.',
  },
]

export default function Home({ onEnter, onLogin, onRegister, isAuthenticated }) {
  return (
    <main className="home">
      <section className="home__hero">
        <div className="home__intro">
          <span className="home__eyebrow">Plataforma ciudadana · Panamá</span>
          <h2>Tu voz arregla las vías</h2>
          <p>
            Reporta baches desde donde estés, vota los que más te afectan y sigue su reparación
            en un mapa abierto para todos.
          </p>
          <div className="home__actions">
            <button type="button" className="button button--primary" onClick={onEnter}>
              Entrar al mapa
            </button>
            {!isAuthenticated && (
              <>
                <button type="button" className="button button--ghost" onClick={onLogin}>
                  Iniciar sesión
                </button>
                <button type="button" className="button button--link home__register" onClick={onRegister}>
                  Crear cuenta
                </button>
              </>
            )}
          </div>
        </div>
        <button type="button" className="home__hero-link" onClick={onEnter} aria-label="Entrar al mapa">
          <img
            className="home__hero-image"
            src={heroImage}
            alt="Mapa de reportes de baches en Changuinola, Bocas del Toro"
          />
        </button>
      </section>

      <section className="home__features" aria-label="Cómo funciona">
        {FEATURES.map((feature) => (
          <article className="home__card" key={feature.title}>
            <span aria-hidden="true">{feature.icon}</span>
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </article>
        ))}
      </section>
    </main>
  )
}
