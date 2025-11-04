import React, {useEffect, useState} from 'react'
import { api } from '../api'
import { useOperationLog } from '../operationLog'
import CategoryOperationLog from './CategoryOperationLog'

export default function OrderManagement(){
  const [orders, setOrders] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [form, setForm] = useState({ supplier_id: '', prod_id: '', qty: '', expected_date: '' })
  const [showSQL, setShowSQL] = useState(false)
  const { addLog } = useOperationLog()

  useEffect(()=>{ loadOrders(); loadSuppliers(); loadProducts(); loadWarehouses() }, [])

  async function loadOrders(){
    try{ 
      addLog('Load Orders', 'GET /api/orders', 'SELECT o.*, s.company_name, p.name as product_name FROM Orders o LEFT JOIN Suppliers s ON o.supplier_id=s.supplier_id LEFT JOIN Products p ON o.prod_id=p.prod_id', 'backend/src/routes/orders.js', 'Fetching all purchase orders with supplier and product details', 'orders')
      const res = await api.get('/orders'); 
      setOrders(res.data) 
    }catch(e){ console.error(e) }
  }

  async function loadSuppliers(){
    try{ const res = await api.get('/suppliers'); setSuppliers(res.data) }catch(e){ console.error(e) }
  }

  async function loadProducts(){
    try{ const res = await api.get('/products'); setProducts(res.data) }catch(e){ console.error(e) }
  }

  async function loadWarehouses(){
    try{ const res = await api.get('/warehouses'); setWarehouses(res.data) }catch(e){ console.error(e) }
  }

  async function createOrder(){
    try{
      addLog('Create Order', 'POST /api/orders', `INSERT INTO Orders (supplier_id, prod_id, qty, expected_date, status) VALUES (${form.supplier_id}, ${form.prod_id}, ${form.qty}, '${form.expected_date}', 'Placed')`, 'backend/src/routes/orders.js', 'Creating new purchase order from supplier', 'orders')
      await api.post('/orders', form)
      setForm({ supplier_id: '', prod_id: '', qty: '', expected_date: '' })
      loadOrders()
    }catch(e){ alert(e.response?.data?.error || 'Error creating order') }
  }

  async function updateStatus(order_id, status){
    try{
      addLog('Update Order Status', `PUT /api/orders/${order_id}/status`, `UPDATE Orders SET status='${status}' WHERE order_id=${order_id}`, 'backend/src/routes/orders.js', `Changing order status to ${status}`, 'orders')
      await api.put(`/orders/${order_id}/status`, { status })
      loadOrders()
    }catch(e){ alert(e.response?.data?.error || 'Error updating status') }
  }

  async function receiveOrder(order_id){
    const wh_id = prompt('Enter warehouse ID to receive goods:')
    if (!wh_id) return
    try{
      addLog('Receive Order', `PUT /api/orders/${order_id}/receive`, `UPDATE Inventory SET stock_qty = stock_qty + [order_qty] WHERE prod_id=[prod_id] AND wh_id=${wh_id}; UPDATE Orders SET status='Delivered' WHERE order_id=${order_id}`, 'backend/src/routes/orders.js', 'Receiving purchase order - increases inventory stock and marks order delivered', 'orders')
      await api.put(`/orders/${order_id}/receive`, { wh_id: parseInt(wh_id,10) })
      alert('Order received and inventory updated')
      loadOrders()
    }catch(e){ alert(e.response?.data?.error || 'Error receiving order') }
  }

  return (
    <div>
      <h3>Purchase Order Management</h3>
      <div style={{marginBottom:12}}>
        <label style={{marginRight:12}}>
          <input type='checkbox' checked={showSQL} onChange={e=>setShowSQL(e.target.checked)} />
          Show SQL Queries
        </label>
      </div>
      {showSQL && (
        <div style={{padding:12,backgroundColor:'#282c34',color:'#abb2bf',marginBottom:12,fontFamily:'monospace',fontSize:13}}>
          <div><strong style={{color:'#c678dd'}}>-- Get all orders with JOIN</strong></div>
          <div><strong style={{color:'#61afef'}}>SELECT</strong> o.*, s.company_name, p.name <strong style={{color:'#61afef'}}>FROM</strong> Orders o <strong style={{color:'#61afef'}}>LEFT JOIN</strong> Suppliers s <strong style={{color:'#61afef'}}>ON</strong> o.supplier_id=s.supplier_id <strong style={{color:'#61afef'}}>LEFT JOIN</strong> Products p <strong style={{color:'#61afef'}}>ON</strong> o.prod_id=p.prod_id;</div>
          <div style={{marginTop:8}}><strong style={{color:'#c678dd'}}>-- Create order</strong></div>
          <div><strong style={{color:'#61afef'}}>INSERT INTO</strong> Orders (supplier_id, prod_id, qty, expected_date, status) <strong style={{color:'#61afef'}}>VALUES</strong> (?, ?, ?, ?, 'Placed');</div>
          <div style={{marginTop:8}}><strong style={{color:'#c678dd'}}>-- Receive order (increase inventory)</strong></div>
          <div><strong style={{color:'#61afef'}}>UPDATE</strong> Inventory <strong style={{color:'#61afef'}}>SET</strong> stock_qty = stock_qty + ? <strong style={{color:'#61afef'}}>WHERE</strong> prod_id=? <strong style={{color:'#61afef'}}>AND</strong> wh_id=?;</div>
        </div>
      )}
      
      <h4>Create New Purchase Order</h4>
      <div style={{marginBottom:12}}>
        <select value={form.supplier_id} onChange={e=>setForm({...form, supplier_id:e.target.value})} style={{marginRight:8}}>
          <option value=''>--Supplier--</option>
          {suppliers.map(s=> <option key={s.supplier_id} value={s.supplier_id}>{s.company_name}</option>)}
        </select>
        <select value={form.prod_id} onChange={e=>setForm({...form, prod_id:e.target.value})} style={{marginRight:8}}>
          <option value=''>--Product--</option>
          {products.map(p=> <option key={p.prod_id} value={p.prod_id}>{p.name}</option>)}
        </select>
        <input placeholder='Qty' type='number' value={form.qty} onChange={e=>setForm({...form, qty:e.target.value})} style={{marginRight:8,width:80}} />
        <input type='date' value={form.expected_date} onChange={e=>setForm({...form, expected_date:e.target.value})} style={{marginRight:8}} />
        <button onClick={createOrder}>Create Order</button>
      </div>

      <h4>Orders</h4>
      <table border='1' cellPadding='6' style={{width:'100%'}}>
        <thead><tr><th>Order ID</th><th>Supplier</th><th>Product</th><th>Qty</th><th>Expected Date</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {orders.map(o=> (
            <tr key={o.order_id}>
              <td>{o.order_id}</td>
              <td>{o.company_name || '—'}</td>
              <td>{o.product_name}</td>
              <td>{o.qty}</td>
              <td>{o.expected_date || '—'}</td>
              <td>{o.status}</td>
              <td>
                {o.status === 'Placed' && <button onClick={()=>receiveOrder(o.order_id)}>Receive</button>}
                {o.status === 'Delivered' && <button onClick={()=>updateStatus(o.order_id, 'Completed')}>Mark Complete</button>}
                {o.status !== 'Completed' && o.status !== 'Cancelled' && <button onClick={()=>updateStatus(o.order_id, 'Cancelled')} style={{marginLeft:8}}>Cancel</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <CategoryOperationLog category="orders" title="Purchase Order Database Operations" />
    </div>
  )
}
