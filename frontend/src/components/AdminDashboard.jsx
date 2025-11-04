import React, {useState} from 'react'
import { useAuth } from '../auth.jsx'
import ProductManagement from './ProductManagement'
import WarehouseManagement from './WarehouseManagement'
import SupplierManagement from './SupplierManagement'
import InventoryManagement from './InventoryManagement'
import OrderManagement from './OrderManagement'
import SalesManagement from './SalesManagement'
import DatabaseViewer from './DatabaseViewer'

export default function AdminDashboard(){
  const { user, logout } = useAuth()
  const [tab, setTab] = useState('products')

  if (!user || user.role !== 'admin'){
    return (
      <div style={{padding:20}}>
        <h2>Admin Dashboard</h2>
        <div>You must be an admin to view this page. <a href="/login">Login</a></div>
      </div>
    )
  }

  return (
    <div style={{padding:20}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <h2>Admin Dashboard</h2>
        <div>
          <span style={{marginRight:12}}>Welcome, {user.name}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      <div style={{marginBottom:20,borderBottom:'2px solid #ccc'}}>
        <button onClick={()=>setTab('products')} style={{padding:'8px 12px',marginRight:8,fontWeight:tab==='products'?'bold':'normal'}}>Products</button>
        <button onClick={()=>setTab('warehouses')} style={{padding:'8px 12px',marginRight:8,fontWeight:tab==='warehouses'?'bold':'normal'}}>Warehouses</button>
        <button onClick={()=>setTab('suppliers')} style={{padding:'8px 12px',marginRight:8,fontWeight:tab==='suppliers'?'bold':'normal'}}>Suppliers</button>
        <button onClick={()=>setTab('inventory')} style={{padding:'8px 12px',marginRight:8,fontWeight:tab==='inventory'?'bold':'normal'}}>Inventory</button>
        <button onClick={()=>setTab('orders')} style={{padding:'8px 12px',marginRight:8,fontWeight:tab==='orders'?'bold':'normal'}}>Purchase Orders</button>
        <button onClick={()=>setTab('sales')} style={{padding:'8px 12px',marginRight:8,fontWeight:tab==='sales'?'bold':'normal'}}>Client Orders & Sales</button>
        <button onClick={()=>setTab('database')} style={{padding:'8px 12px',marginRight:8,fontWeight:tab==='database'?'bold':'normal',backgroundColor:'#4a90a4',color:'white',border:'none'}}>Database Schema</button>
      </div>

      {tab === 'products' && <ProductManagement />}
      {tab === 'warehouses' && <WarehouseManagement />}
      {tab === 'suppliers' && <SupplierManagement />}
      {tab === 'inventory' && <InventoryManagement />}
      {tab === 'orders' && <OrderManagement />}
      {tab === 'sales' && <SalesManagement />}
      {tab === 'database' && <DatabaseViewer />}
    </div>
  )
}
