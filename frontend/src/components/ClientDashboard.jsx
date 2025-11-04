import React from 'react'
import ProductList from './ProductList'
import ClientOrders from './ClientOrders'
import { useAuth } from '../auth.jsx'

export default function ClientDashboard(){
  const { user, logout } = useAuth()

  const userId = user?.user_id

  return (
    <div style={{padding:20}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <h2>Client Dashboard</h2>
        {user && (
          <div>
            <span style={{marginRight:12}}>Welcome, {user.name}</span>
            <button onClick={logout}>Logout</button>
          </div>
        )}
      </div>

      {!userId && (
        <div style={{marginBottom:12}}>Please login as a client to place orders and view history. <a href="/login">Login</a> or <a href="/register">Register</a></div>
      )}

      {userId ? (
        <>
          <ProductList userId={parseInt(userId,10)} />
          <ClientOrders userId={parseInt(userId,10)} />
        </>
      ) : null}
    </div>
  )
}
