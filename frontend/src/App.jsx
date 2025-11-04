import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from './auth.jsx'

export default function App(){
  const { user } = useAuth()

  return (
    <div style={{padding:20}}>
      <h1>Inventory Management App</h1>
      {user ? (
        <div>
          <p>Welcome, {user.name} ({user.role})</p>
          <p>
            {user.role === 'admin' ? <Link to='/admin'>Go to Admin Dashboard</Link> : <Link to='/client'>Go to Client Dashboard</Link>}
          </p>
        </div>
      ) : (
        <p><Link to='/login'>Login</Link> | <Link to='/register'>Register</Link></p>
      )}
      <p><Link to='/admin'>Admin Dashboard</Link> | <Link to='/client'>Client Dashboard</Link></p>
    </div>
  )
}
