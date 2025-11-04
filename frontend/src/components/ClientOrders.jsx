import React, {useEffect, useState} from 'react'
import { api } from '../api'

export default function ClientOrders({ userId }){
  const [orders, setOrders] = useState([])

  useEffect(()=>{
    if (!userId) return
    api.get(`/client-orders/user/${userId}`).then(r=>setOrders(r.data)).catch(console.error)
  },[userId])

  return (
    <div style={{marginTop:20}}>
      <h3>Your Orders</h3>
      {orders.length===0 && <div>No orders found.</div>}
      <ul>
        {orders.map(o=> (
          <li key={o.corder_id}>#{o.corder_id} — Product: {o.prod_id} — Qty: {o.qty} — Status: {o.status} — {new Date(o.created_at).toLocaleString()}</li>
        ))}
      </ul>
    </div>
  )
}
