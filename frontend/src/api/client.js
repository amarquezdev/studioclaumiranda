import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 70000,
})

// Inject JWT on every request if available
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Public endpoints ────────────────────────────────────────────────────────
export const getServices      = () => client.get('/services/')
export const getBarbers       = () => client.get('/barbers/')
export const getBusinessHours = () => client.get('/business-hours/')
export const getAvailability  = (date, barberId, serviceIds) => {
  const ids = Array.isArray(serviceIds) ? serviceIds : [serviceIds]
  return client.get('/availability/', { params: { date, barber_id: barberId, service_ids: ids.join(',') } })
}
export const getReviews       = () => client.get('/reviews/')

// ── Auth ────────────────────────────────────────────────────────────────────
export const login  = (email, password) => client.post('/auth/login',
  new URLSearchParams({ username: email, password }),
  { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
export const getMe  = () => client.get('/auth/me')

// ── Service Types (public + admin) ──────────────────────────────────────────
export const getServiceTypes          = () => client.get('/service-types/')
export const adminCreateServiceType   = (data) => client.post('/service-types/', data)
export const adminUpdateServiceType   = (id, data) => client.patch(`/service-types/${id}`, data)
export const adminDeleteServiceType   = (id) => client.delete(`/service-types/${id}`)

// ── Admin: Services ─────────────────────────────────────────────────────────
export const adminGetServices    = () => client.get('/services/?active_only=false')
export const adminCreateService  = (data) => client.post('/services', data)
export const adminUpdateService  = (id, data) => client.patch(`/services/${id}`, data)
export const adminDeleteService  = (id) => client.delete(`/services/${id}`)

// ── Admin: Service Options ───────────────────────────────────────────────────
export const adminCreateServiceOption = (serviceId, data) =>
  client.post(`/services/${serviceId}/options`, data)
export const adminUpdateServiceOption = (serviceId, optId, data) =>
  client.patch(`/services/${serviceId}/options/${optId}`, data)
export const adminDeleteServiceOption = (serviceId, optId) =>
  client.delete(`/services/${serviceId}/options/${optId}`)

// ── Admin: Barbers ──────────────────────────────────────────────────────────
export const adminGetBarbers    = () => client.get('/barbers?active_only=false')
export const adminCreateBarber  = (data) => client.post('/barbers/', data)
export const adminUpdateBarber  = (id, data) => client.patch(`/barbers/${id}`, data)
export const adminDeleteBarber  = (id) => client.delete(`/barbers/${id}`)

// ── Admin: Business Hours ────────────────────────────────────────────────────
export const adminGetHours    = () => client.get('/business-hours/')
export const adminUpsertHours = (day, data) => client.put(`/business-hours/${day}`, data)

// ── Blocked dates (public + admin) ───────────────────────────────────────────
export const getBlockedDates        = () => client.get('/blocked-dates/')
export const adminCreateBlockedDate = (data) => client.post('/blocked-dates/', data)
export const adminDeleteBlockedDate = (id)   => client.delete(`/blocked-dates/${id}`)

// ── Guest booking (no auth required) ────────────────────────────────────────
export const guestCreateAppointment = (data) => client.post('/appointments/guest', data)

// ── Admin: Appointments ──────────────────────────────────────────────────────
export const adminGetAppointments    = (skip = 0, limit = 100) =>
  client.get(`/appointments?skip=${skip}&limit=${limit}`)
export const adminUpdateApptStatus   = (id, status) =>
  client.patch(`/appointments/${id}/status`, { status })
export const adminDeleteAppointment  = (id) => client.delete(`/appointments/${id}`)
export const adminCreateAppointment  = (data) => client.post('/appointments/guest', data)

// ── Admin: Users ─────────────────────────────────────────────────────────────
export const adminGetUsers    = () => client.get('/users')
export const adminUpdateUser  = (id, data) => client.patch(`/users/${id}`, data)
export const adminDeleteUser  = (id) => client.delete(`/users/${id}`)
export const adminRegisterUser = (data) => client.post('/auth/register', data)

export default client
