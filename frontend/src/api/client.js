import axios from 'axios'

const TOKEN_KEY = 'baches_token'
const USER_KEY = 'baches_user'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN || API_URL.replace(/\/api\/?$/, '')

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
})

const storedToken =
  typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null

if (storedToken) {
  api.defaults.headers.common.Authorization = `Bearer ${storedToken}`
}

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    delete api.defaults.headers.common.Authorization
    localStorage.removeItem(TOKEN_KEY)
  }
}

export function storeUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(USER_KEY)
  }
}

export function readUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function getErrorMessage(error, fallback = 'Ocurrió un error') {
  return error?.response?.data?.error?.message || error?.message || fallback
}

export function photoUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  return `${API_ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`
}
