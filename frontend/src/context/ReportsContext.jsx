import { useCallback, useMemo, useState } from 'react'
import { api, getErrorMessage } from '../api/client'
import { ReportsContext } from './useReports'

export function ReportsProvider({ children }) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  const loadReports = useCallback(async (params = {}) => {
    setLoading(true)
    setError('')

    try {
      const { data } = await api.get('/reports', { params })
      setReports(data.data)
      return data.data
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudieron cargar los reportes'))
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const createReport = useCallback(async (formData) => {
    const { data } = await api.post('/reports', formData)
    setReports((current) => [data.data, ...current])
    return data.data
  }, [])

  const voteReport = useCallback(async (id) => {
    const { data } = await api.post(`/reports/${id}/vote`)
    setReports((current) =>
      current.map((report) => (report.id === id ? data.data : report)),
    )
    return data.data
  }, [])

  const changeStatus = useCallback(async (id, estado) => {
    const { data } = await api.patch(`/reports/${id}/status`, { estado })
    setReports((current) =>
      current.map((report) => (report.id === id ? data.data : report)),
    )
    return data.data
  }, [])

  const selectReport = useCallback((id) => {
    setSelectedId((current) => (current === id ? null : id))
  }, [])

  const clearSelection = useCallback(() => setSelectedId(null), [])

  const selectedReport = useMemo(
    () => reports.find((report) => report.id === selectedId) || null,
    [reports, selectedId],
  )

  const value = useMemo(
    () => ({
      reports,
      loading,
      error,
      selectedId,
      selectedReport,
      loadReports,
      createReport,
      voteReport,
      changeStatus,
      selectReport,
      clearSelection,
    }),
    [
      reports,
      loading,
      error,
      selectedId,
      selectedReport,
      loadReports,
      createReport,
      voteReport,
      changeStatus,
      selectReport,
      clearSelection,
    ],
  )

  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>
}
