import React, { useState } from 'react'
import { loginAuth } from '../api'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.jsx'
import { useOperationLog } from '../operationLog'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const auth = useAuth()
  const { addLog } = useOperationLog()

  async function submit(e){
    e.preventDefault(); setError(null)
    try{
      addLog('User Login', 'POST /api/auth/login', `SELECT user_id, name, email, role, password_hash FROM Users WHERE email='${email}'`, 'backend/src/routes/auth.js', 'Authenticating user credentials and generating JWT token', 'auth')
      const res = await loginAuth({ email, password })
      const token = res.data.token
      auth.loginWithToken(token)
      // redirect based on role
      const payload = token.split('.')[1]
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
      if (decoded.role === 'admin') navigate('/admin')
      else navigate('/client')
    }catch(err){
      setError(err.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div style={{padding:20}}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <div><label>Email <input value={email} onChange={e=>setEmail(e.target.value)} /></label></div>
        <div><label>Password <input type='password' value={password} onChange={e=>setPassword(e.target.value)} /></label></div>
        <div style={{marginTop:8}}><button type='submit'>Login</button></div>
        {error && <div style={{color:'red',marginTop:8}}>{error}</div>}
      </form>
    </div>
  )
}
