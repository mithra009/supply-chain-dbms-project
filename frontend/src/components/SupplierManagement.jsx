import React, {useEffect, useState} from 'react'
import { api } from '../api'
import { useOperationLog } from '../operationLog'
import CategoryOperationLog from './CategoryOperationLog'

export default function SupplierManagement(){
  const [suppliers, setSuppliers] = useState([])
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ company_name: '', rating: 3 })
  const { addLog } = useOperationLog()

  useEffect(()=>{ loadSuppliers() }, [])

  async function loadSuppliers(){
    try{ 
      addLog('Load Suppliers', 'GET /api/suppliers', 'SELECT * FROM Suppliers', 'backend/src/routes/suppliers.js', 'Fetching all supplier records', 'suppliers')
      const res = await api.get('/suppliers'); 
      setSuppliers(res.data) 
    }catch(e){ console.error(e) }
  }

  function startEdit(s){
    setEditId(s.supplier_id)
    setForm({ company_name: s.company_name, rating: s.rating })
  }

  function cancelEdit(){
    setEditId(null)
    setForm({ company_name: '', rating: 3 })
  }

  async function saveSupplier(){
    try{
      if (editId){
        addLog('Update Supplier', `PUT /api/suppliers/${editId}`, `UPDATE Suppliers SET company_name='${form.company_name}', rating=${form.rating} WHERE supplier_id=${editId}`, 'backend/src/routes/suppliers.js', 'Updating supplier information', 'suppliers')
        await api.put(`/suppliers/${editId}`, form)
      } else {
        addLog('Create Supplier', 'POST /api/suppliers', `INSERT INTO Suppliers (company_name, rating) VALUES ('${form.company_name}', ${form.rating})`, 'backend/src/routes/suppliers.js', 'Adding new supplier to database', 'suppliers')
        await api.post('/suppliers', form)
      }
      cancelEdit()
      loadSuppliers()
    }catch(e){ alert(e.response?.data?.error || 'Error saving supplier') }
  }

  async function deleteSupplier(id){
    if (!confirm('Delete this supplier?')) return
    try{ 
      addLog('Delete Supplier', `DELETE /api/suppliers/${id}`, `DELETE FROM Suppliers WHERE supplier_id=${id}`, 'backend/src/routes/suppliers.js', 'Removing supplier and setting related order supplier_id to NULL', 'suppliers')
      await api.delete(`/suppliers/${id}`); 
      loadSuppliers() 
    }catch(e){ alert(e.response?.data?.error || 'Error deleting') }
  }

  return (
    <div>
      <h3>Supplier Management</h3>
      <div style={{marginBottom:12}}>
        <input placeholder='Company Name' value={form.company_name} onChange={e=>setForm({...form, company_name:e.target.value})} style={{marginRight:8}} />
        <input placeholder='Rating (1-5)' type='number' min='1' max='5' value={form.rating} onChange={e=>setForm({...form, rating:e.target.value})} style={{marginRight:8,width:100}} />
        <button onClick={saveSupplier}>{editId ? 'Update' : 'Add'}</button>
        {editId && <button onClick={cancelEdit} style={{marginLeft:8}}>Cancel</button>}
      </div>
      <table border='1' cellPadding='6' style={{width:'100%'}}>
        <thead><tr><th>ID</th><th>Company</th><th>Rating</th><th>Actions</th></tr></thead>
        <tbody>
          {suppliers.map(s=> (
            <tr key={s.supplier_id}>
              <td>{s.supplier_id}</td>
              <td>{s.company_name}</td>
              <td>{s.rating}</td>
              <td>
                <button onClick={()=>startEdit(s)}>Edit</button>
                <button onClick={()=>deleteSupplier(s.supplier_id)} style={{marginLeft:8}}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <CategoryOperationLog category="suppliers" title="Supplier Database Operations" />
    </div>
  )
}
