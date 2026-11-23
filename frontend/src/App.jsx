import { useCallback, useEffect, useMemo, useState } from 'react'
import { getErrorMessage } from './api/client'
import AdminDashboard from './components/AdminDashboard'
import AuthDialog from './components/AuthDialog'
import Header from './components/Header'
import Home from './components/Home'
import MapView from './components/MapView'
import ReportDetail from './components/ReportDetail'
import ReportForm from './components/ReportForm'
import ReportList from './components/ReportList'
import { AuthProvider } from './context/AuthContext'
import { ReportsProvider } from './context/ReportsContext'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { useAuth } from './context/useAuth'
import { useReports } from './context/useReports'
import { useTheme } from './context/useTheme'
import './App.css'

const DEFAULT_CENTER = [9.43, -82.52]

function Dashboard() {
  const { user, isAuthenticated, isAdmin, isModerator, isStaff, isAuthOpen, openAuth, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const {
    reports,
    loading,
    error,
    selectedReport,
    selectReport,
    clearSelection,
    loadReports,
    createReport,
    voteReport,
    changeStatus,
  } = useReports()

  const [showForm, setShowForm] = useState(false)
  const [position, setPosition] = useState(null)
  const [filters, setFilters] = useState({ gravedad: '', estado: '', sort: 'votos' })
  const [homeCenter, setHomeCenter] = useState(DEFAULT_CENTER)
  const [userLocation, setUserLocation] = useState(null)
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState('')
  const [view, setView] = useState('home')

  const handleEnterMap = () => setView('dashboard')
  const handleGoHome = () => {
    setShowForm(false)
    setPosition(null)
    setView('home')
  }
  const handleDashboard = () => {
    if (!isStaff) return
    setShowForm(false)
    setPosition(null)
    setView('admin')
  }

  useEffect(() => {
    loadReports()
  }, [loadReports])

  const activeView = view === 'admin' && !isStaff ? 'home' : view

  useEffect(() => {
    if (!notice) return undefined
    const timer = setTimeout(() => setNotice(''), 4000)
    return () => clearTimeout(timer)
  }, [notice])

  const focus = useMemo(
    () => (selectedReport ? [selectedReport.lat, selectedReport.lng] : null),
    [selectedReport],
  )

  const handleLogout = () => {
    setShowForm(false)
    setPosition(null)
    logout()
  }

  const handleToggleForm = () => {
    if (!user) {
      openAuth('register')
      return
    }

    clearSelection()
    setShowForm((current) => {
      if (current) setPosition(null)
      return !current
    })
  }

  const handleCreate = async (formData) => {
    const created = await createReport(formData)
    selectReport(created.id)
    setShowForm(false)
    setPosition(null)
    setNotice('Reporte publicado. Ya aparece en el mapa.')
  }

  const handleVote = async (id) => {
    setActionError('')
    try {
      await voteReport(id)
    } catch (err) {
      setActionError(getErrorMessage(err, 'No se pudo registrar el voto'))
    }
  }

  const handleStatusChange = async (id, estado) => {
    setActionError('')
    try {
      await changeStatus(id, estado)
      setNotice(`Estado actualizado a: ${estado}`)
    } catch (err) {
      setActionError(getErrorMessage(err, 'No se pudo cambiar el estado'))
    }
  }

  const handleNearMe = () => {
    setActionError('')

    if (!navigator.geolocation) {
      setActionError('Tu navegador no soporta geolocalización.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const center = [coords.latitude, coords.longitude]
        setUserLocation({ lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy })
        setHomeCenter(center)
        clearSelection()
        await loadReports({ lat: center[0], lng: center[1], radius: 10 })
        setNotice(
          `Tu ubicación: ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)} (±${Math.round(coords.accuracy)} m)`,
        )
      },
      () => setActionError('No se pudo obtener tu ubicación.'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  const handleShowAll = useCallback(() => {
    setHomeCenter(DEFAULT_CENTER)
    setUserLocation(null)
    clearSelection()
    loadReports()
    setNotice('Mostrando todos los reportes')
  }, [clearSelection, loadReports])

  const handlePick = useCallback(
    (newPosition) => {
      setPosition(newPosition)
      setHomeCenter([newPosition.lat, newPosition.lng])
    },
    [],
  )

  return (
    <div className="app-shell">
      <Header
        user={user}
        isAdmin={isAdmin}
        isModerator={isModerator}
        isStaff={isStaff}
        onHome={handleGoHome}
        onDashboard={handleDashboard}
        onLogin={() => openAuth('login')}
        onRegister={() => openAuth('register')}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {activeView === 'home' && (
        <Home
          onEnter={handleEnterMap}
          onLogin={() => openAuth('login')}
          onRegister={() => openAuth('register')}
          isAuthenticated={isAuthenticated}
        />
      )}

      {activeView === 'dashboard' && (
        <>
          <main className="workspace">
            <aside className="sidebar">
              <button
                type="button"
                className={`button button--primary button--wide${showForm ? ' is-active' : ''}`}
                onClick={handleToggleForm}
              >
                {showForm ? '× Cancelar reporte' : '+ Reportar un bache'}
              </button>

              {actionError && <p className="alert alert--error">{actionError}</p>}

              {showForm && user && (
                <ReportForm
                  position={position}
                  onPositionChange={setPosition}
                  onSubmit={handleCreate}
                  onCancel={() => {
                    setShowForm(false)
                    setPosition(null)
                  }}
                />
              )}

              <div className="map-actions">
                <button type="button" onClick={handleNearMe}>
                  Cerca de mí
                </button>
                <button type="button" onClick={handleShowAll}>
                  Ver todos
                </button>
              </div>

              <ReportList
                reports={reports}
                loading={loading}
                error={error}
                selectedId={selectedReport?.id || null}
                onSelect={selectReport}
                filters={filters}
                onFiltersChange={setFilters}
                onRetry={() => loadReports()}
              />
            </aside>

            <section className="map-area" aria-label="Mapa de baches">
              <MapView
                reports={reports}
                homeCenter={homeCenter}
                focus={focus}
                selectedId={selectedReport?.id || null}
                onSelect={selectReport}
                pickMode={showForm}
                picked={position}
                onPick={handlePick}
                userLocation={userLocation}
              />

              <div className="map-legend">
                <strong>Gravedad</strong>
                <span><i className="severity-dot severity-dot--bajo" /> Bajo</span>
                <span><i className="severity-dot severity-dot--medio" /> Medio</span>
                <span><i className="severity-dot severity-dot--alto" /> Alto</span>
              </div>

              {showForm && <div className="pick-banner">Haz clic en el mapa para marcar el bache</div>}

              {selectedReport && (
                <ReportDetail
                  key={selectedReport.id}
                  report={selectedReport}
                  user={user}
                  isAdmin={isStaff}
                  onClose={clearSelection}
                  onVote={handleVote}
                  onStatusChange={handleStatusChange}
                  onRequireAuth={() => openAuth('login')}
                />
              )}
            </section>
          </main>
        </>
      )}

      {activeView === 'admin' && isStaff && <AdminDashboard />}

      {isAuthOpen && <AuthDialog />}

      {notice && <div className="toast" role="status">{notice}</div>}
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ReportsProvider>
          <Dashboard />
        </ReportsProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
