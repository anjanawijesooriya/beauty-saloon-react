import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('glowher-token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthEndpoint = err.config?.url?.includes('/auth/')
    const isPasswordChange = err.config?.url?.includes('/users/me/password')
    if (err.response?.status === 401 && !isAuthEndpoint && !isPasswordChange) {
      // Session expired on a protected call — force re-login
      localStorage.removeItem('glowher-token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)
