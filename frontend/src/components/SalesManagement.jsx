import React, {useEffect, useState} from 'react'
import { api } from '../api'

export default function SalesManagement(){
  const [sales, setSales] = useState([])
  const [clientOrders, setClientOrders] = useState([])

  useEffect(()=>{ loadSales(); loadClientOrders() }, [])

  async function loadSales(){
    try{
      const res = await api.get('/sales')
      setSales(res.data)
    }catch(e){ console.error(e) }
  }

  async function loadClientOrders(){
    try{
      const res = await api.get('/client-orders/all')
      setClientOrders(res.data)
    }catch(e){ console.error(e) }
  }

  return (
    <div>
      <h3>Client Orders & Sales</h3>
      
      <h4>Client Orders</h4>
      {clientOrders.length === 0 && <div>No client orders found.</div>}
      {clientOrders.length > 0 && (
        <table border='1' cellPadding='6' style={{width:'100%',marginBottom:30}}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User ID</th>
              <th>Product ID</th>
              <th>Warehouse ID</th>
              <th>Qty</th>
              <th>Order Date</th>
              <th>Status</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {clientOrders.map(o=> (
              <tr key={o.corder_id}>
                <td>{o.corder_id}</td>
                <td>{o.user_id}</td>
                <td>{o.prod_id}</td>
                <td>{o.wh_id}</td>
                <td>{o.qty}</td>
                <td>{o.order_date}</td>
                <td>{o.status}</td>
                <td>{new Date(o.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h4>Sales Records (Auto-generated from Client Orders)</h4>
      {sales.length === 0 && <div>No sales records found.</div>}
      {sales.length > 0 && (
        <table border='1' cellPadding='6' style={{width:'100%'}}>
          <thead>
            <tr>
              <th>Sale ID</th>
              <th>Product ID</th>
              <th>Warehouse ID</th>
              <th>Sale Qty</th>
              <th>Sale Date</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {sales.map(s=> (
              <tr key={s.sale_id}>
                <td>{s.sale_id}</td>
                <td>{s.prod_id}</td>
                <td>{s.wh_id}</td>
                <td>{s.sale_qty}</td>
                <td>{s.sale_date}</td>
                <td>{new Date(s.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
