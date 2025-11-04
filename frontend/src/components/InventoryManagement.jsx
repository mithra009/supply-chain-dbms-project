import React, {useEffect, useState} from 'react'
import { api } from '../api'
import { useOperationLog } from '../operationLog'
import CategoryOperationLog from './CategoryOperationLog'

export default function InventoryManagement(){
  const [inventory, setInventory] = useState([])
  const [lowStock, setLowStock] = useState([])
  const { addLog } = useOperationLog()

  useEffect(()=>{ loadInventory(); loadLowStock() }, [])

  async function loadInventory(){
    try{ 
      addLog('Load Inventory', 'GET /api/inventory', 'SELECT i.*, p.name as product_name, w.location as warehouse FROM Inventory i JOIN Products p ON i.prod_id=p.prod_id JOIN Warehouses w ON i.wh_id=w.wh_id', 'backend/src/routes/inventory.js', 'Fetching all inventory records with product and warehouse details', 'inventory')
      const res = await api.get('/inventory'); 
      setInventory(res.data) 
    }catch(e){ console.error(e) }
  }

  async function loadLowStock(){
    try{ 
      addLog('Load Low Stock', 'GET /api/inventory/low', 'SELECT i.*, p.name as product_name, w.location as warehouse FROM Inventory i JOIN Products p ON i.prod_id=p.prod_id JOIN Warehouses w ON i.wh_id=w.wh_id WHERE i.stock_qty < i.safety_stock', 'backend/src/routes/inventory.js', 'Finding inventory items below safety stock threshold', 'inventory')
      const res = await api.get('/inventory/low'); 
      setLowStock(res.data) 
    }catch(e){ console.error(e) }
  }

  async function updateStock(inv_id, current){
    const newQty = prompt(`Update stock for inventory ${inv_id} (current: ${current}):`, current)
    if (newQty === null) return
    try{
      addLog('Update Stock', `PUT /api/inventory/${inv_id}/stock`, `UPDATE Inventory SET stock_qty=${parseInt(newQty,10)}, last_updated=NOW() WHERE inv_id=${inv_id}`, 'backend/src/routes/inventory.js', 'Manually adjusting inventory stock quantity', 'inventory')
      await api.put(`/inventory/${inv_id}/stock`, { stock_qty: parseInt(newQty,10) })
      loadInventory()
      loadLowStock()
    }catch(e){ alert(e.response?.data?.error || 'Error updating stock') }
  }

  return (
    <div>
      <h3>Inventory Management</h3>
      
      <h4 style={{marginTop:20,color:'red'}}>Low Stock Alerts (Below Safety Stock)</h4>
      {lowStock.length === 0 && <div>No low stock items.</div>}
      {lowStock.length > 0 && (
        <table border='1' cellPadding='6' style={{width:'100%',marginBottom:20}}>
          <thead><tr><th>Inv ID</th><th>Product</th><th>Warehouse</th><th>Current Stock</th><th>Safety Stock</th></tr></thead>
          <tbody>
            {lowStock.map(i=> (
              <tr key={i.inv_id} style={{backgroundColor:'#ffe0e0'}}>
                <td>{i.inv_id}</td>
                <td>{i.product_name}</td>
                <td>{i.warehouse}</td>
                <td>{i.stock_qty}</td>
                <td>{i.safety_stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h4>All Inventory</h4>
      <table border='1' cellPadding='6' style={{width:'100%'}}>
        <thead><tr><th>Inv ID</th><th>Product</th><th>Warehouse</th><th>Stock</th><th>Safety Stock</th><th>Last Updated</th><th>Actions</th></tr></thead>
        <tbody>
          {inventory.map(i=> (
            <tr key={i.inv_id}>
              <td>{i.inv_id}</td>
              <td>{i.product_name}</td>
              <td>{i.warehouse}</td>
              <td>{i.stock_qty}</td>
              <td>{i.safety_stock}</td>
              <td>{new Date(i.last_updated).toLocaleString()}</td>
              <td><button onClick={()=>updateStock(i.inv_id, i.stock_qty)}>Update Stock</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <CategoryOperationLog category="inventory" title="Inventory Database Operations" />
    </div>
  )
}
