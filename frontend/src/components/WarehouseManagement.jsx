import React, {useEffect, useState} from 'react'
import { api } from '../api'
import { useOperationLog } from '../operationLog'
import CategoryOperationLog from './CategoryOperationLog'

export default function WarehouseManagement(){
  const [warehouses, setWarehouses] = useState([])
  const [editId, setEditId] = useState(null)
  const [location, setLocation] = useState('')
  const { addLog } = useOperationLog()

  useEffect(()=>{ loadWarehouses() }, [])

  async function loadWarehouses(){
    try{ 
      addLog('Load Warehouses', 'GET /api/warehouses', 'SELECT * FROM Warehouses', 'backend/src/routes/warehouses.js', 'Fetching all warehouse locations', 'warehouses')
      const res = await api.get('/warehouses'); 
      setWarehouses(res.data) 
    }catch(e){ console.error(e) }
  }

  function startEdit(w){
    setEditId(w.wh_id)
    setLocation(w.location)
  }

  function cancelEdit(){
    setEditId(null)
    setLocation('')
  }

  async function saveWarehouse(){
    try{
      if (editId){
        addLog('Update Warehouse', `PUT /api/warehouses/${editId}`, `UPDATE Warehouses SET location='${location}' WHERE wh_id=${editId}`, 'backend/src/routes/warehouses.js', 'Updating warehouse location', 'warehouses')
        await api.put(`/warehouses/${editId}`, { location })
      } else {
        addLog('Create Warehouse', 'POST /api/warehouses', `INSERT INTO Warehouses (location) VALUES ('${location}')`, 'backend/src/routes/warehouses.js', 'Adding new warehouse location', 'warehouses')
        await api.post('/warehouses', { location })
      }
      cancelEdit()
      loadWarehouses()
    }catch(e){ alert(e.response?.data?.error || 'Error saving warehouse') }
  }

  async function deleteWarehouse(id){
    if (!confirm('Delete this warehouse?')) return
    try{ 
      addLog('Delete Warehouse', `DELETE /api/warehouses/${id}`, `DELETE FROM Warehouses WHERE wh_id=${id}`, 'backend/src/routes/warehouses.js', 'Removing warehouse and cascading deletes to inventory records', 'warehouses')
      await api.delete(`/warehouses/${id}`); 
      loadWarehouses() 
    }catch(e){ alert(e.response?.data?.error || 'Error deleting') }
  }

  return (
    <div>
      <h3>Warehouse Management</h3>
      <div style={{marginBottom:12}}>
        <input placeholder='Location' value={location} onChange={e=>setLocation(e.target.value)} style={{marginRight:8}} />
        <button onClick={saveWarehouse}>{editId ? 'Update' : 'Add'}</button>
        {editId && <button onClick={cancelEdit} style={{marginLeft:8}}>Cancel</button>}
      </div>
      <table border='1' cellPadding='6' style={{width:'100%'}}>
        <thead><tr><th>ID</th><th>Location</th><th>Actions</th></tr></thead>
        <tbody>
          {warehouses.map(w=> (
            <tr key={w.wh_id}>
              <td>{w.wh_id}</td>
              <td>{w.location}</td>
              <td>
                <button onClick={()=>startEdit(w)}>Edit</button>
                <button onClick={()=>deleteWarehouse(w.wh_id)} style={{marginLeft:8}}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <CategoryOperationLog category="warehouses" title="Warehouse Database Operations" />
    </div>
  )
}
