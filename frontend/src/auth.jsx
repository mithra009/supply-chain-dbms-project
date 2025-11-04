import React, { createContext, useContext, useEffect, useState } from 'react'
import { setAuthToken } from './api'

const AuthContext = createContext(null)

function parseJwt(token){
  try{
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return decoded
  }catch(e){ return null }
}

export function AuthProvider({ children }){
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })

  useEffect(()=>{
    if (token){
      setAuthToken(token)
      const decoded = parseJwt(token)
      if (decoded) {
        const u = { user_id: decoded.user_id, role: decoded.role, name: decoded.name }
        setUser(u)
        localStorage.setItem('user', JSON.stringify(u))
      }
      localStorage.setItem('token', token)
    } else {
      setAuthToken(null)
      setUser(null)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }, [token])

  function loginWithToken(t){ setToken(t) }
  function logout(){ setToken(null) }

  return (
    <AuthContext.Provider value={{ token, user, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(){ return useContext(AuthContext) }
