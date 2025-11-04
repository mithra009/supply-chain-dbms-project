import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api'

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
})

export function setAuthToken(token){
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  else delete api.defaults.headers.common['Authorization']
}

// Client order helpers
export async function placeClientOrder(payload){
  return api.post('/client-orders', payload)
}

export async function getClientOrdersByUser(userId){
  return api.get(`/client-orders/user/${userId}`)
}

export async function getInventoryByProduct(prod_id){
  return api.get(`/inventory?prod_id=${prod_id}`)
}

// Auth
export async function registerAuth(payload){
  return api.post('/auth/register', payload)
}

export async function loginAuth(payload){
  return api.post('/auth/login', payload)
}
