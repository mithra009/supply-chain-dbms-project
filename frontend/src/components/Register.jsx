import React, { useState } from 'react'
import { registerAuth } from '../api'
import { useNavigate } from 'react-router-dom'
import { useOperationLog } from '../operationLog'

export default function Register(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('client')
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { addLog } = useOperationLog()

  async function submit(e){
    e.preventDefault(); setError(null)
    try{
      addLog('User Registration', 'POST /api/auth/register', `INSERT INTO Users (name, email, password_hash, role) VALUES ('${name}', '${email}', '[bcrypt_hash]', '${role}')`, 'backend/src/routes/auth.js', 'Creating new user account with encrypted password', 'auth')
      await registerAuth({ name, email, password, role })
      navigate('/login')
    }catch(err){ setError(err.response?.data?.error || 'Register failed') }
  }

  return (
    <div style={{padding:20}}>
      <h2>Register</h2>
      <form onSubmit={submit}>
        <div><label>Name <input value={name} onChange={e=>setName(e.target.value)} /></label></div>
        <div><label>Email <input value={email} onChange={e=>setEmail(e.target.value)} /></label></div>
        <div><label>Password <input type='password' value={password} onChange={e=>setPassword(e.target.value)} /></label></div>
        <div><label>Role <select value={role} onChange={e=>setRole(e.target.value)}><option value='client'>client</option><option value='admin'>admin</option></select></label></div>
        <div style={{marginTop:8}}><button type='submit'>Register</button></div>
        {error && <div style={{color:'red',marginTop:8}}>{error}</div>}
      </form>
    </div>
  )
}
