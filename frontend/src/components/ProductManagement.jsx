import React, {useEffect, useState} from 'react'
import { api } from '../api'
import { useOperationLog } from '../operationLog.jsx'
import CategoryOperationLog from './CategoryOperationLog'

export default function ProductManagement(){
  const [products, setProducts] = useState([])
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ name: '', category: '', unit_price: '' })
  const [showSQL, setShowSQL] = useState(false)
  const { addLog } = useOperationLog()

  useEffect(()=>{ loadProducts() }, [])

  async function loadProducts(){
    try{ 
      addLog('Load Products', 'GET /api/products', 'SELECT * FROM Products', 'backend/src/routes/products.js', 'Fetching all products from database', 'products')
      const res = await api.get('/products'); 
      setProducts(res.data) 
    }catch(e){ console.error(e) }
  }

  function startEdit(p){
    setEditId(p.prod_id)
    setForm({ name: p.name, category: p.category, unit_price: p.unit_price })
  }

  function cancelEdit(){
    setEditId(null)
    setForm({ name: '', category: '', unit_price: '' })
  }

  async function saveProduct(){
    try{
      if (editId){
        addLog('Update Product', `PUT /api/products/${editId}`, `UPDATE Products SET name='${form.name}', category='${form.category}', unit_price=${form.unit_price} WHERE prod_id=${editId}`, 'backend/src/routes/products.js', 'Updating product details', 'products')
        await api.put(`/products/${editId}`, form)
      } else {
        addLog('Create Product', 'POST /api/products', `INSERT INTO Products (name, category, unit_price) VALUES ('${form.name}', '${form.category}', ${form.unit_price})`, 'backend/src/routes/products.js', 'Adding new product to database', 'products')
        await api.post('/products', form)
      }
      cancelEdit()
      loadProducts()
    }catch(e){ alert(e.response?.data?.error || 'Error saving product') }
  }

  async function deleteProduct(id){
    if (!confirm('Delete this product?')) return
    try{ 
      addLog('Delete Product', `DELETE /api/products/${id}`, `DELETE FROM Products WHERE prod_id=${id}`, 'backend/src/routes/products.js', 'Removing product and cascading deletes to related records', 'products')
      await api.delete(`/products/${id}`); 
      loadProducts() 
    }catch(e){ alert(e.response?.data?.error || 'Error deleting') }
  }

  return (
    <div>
      <h3>Product Management</h3>
      <div style={{marginBottom:12}}>
        <label style={{marginRight:12}}>
          <input type='checkbox' checked={showSQL} onChange={e=>setShowSQL(e.target.checked)} />
          Show SQL Queries
        </label>
      </div>
      {showSQL && (
        <div style={{padding:12,backgroundColor:'#282c34',color:'#abb2bf',marginBottom:12,fontFamily:'monospace'}}>
          <div><strong style={{color:'#61afef'}}>SELECT</strong> * <strong style={{color:'#61afef'}}>FROM</strong> Products;</div>
          <div style={{marginTop:8}}><strong style={{color:'#61afef'}}>INSERT INTO</strong> Products (name, category, unit_price) <strong style={{color:'#61afef'}}>VALUES</strong> (?, ?, ?);</div>
          <div style={{marginTop:8}}><strong style={{color:'#61afef'}}>UPDATE</strong> Products <strong style={{color:'#61afef'}}>SET</strong> name=?, category=?, unit_price=? <strong style={{color:'#61afef'}}>WHERE</strong> prod_id=?;</div>
          <div style={{marginTop:8}}><strong style={{color:'#61afef'}}>DELETE FROM</strong> Products <strong style={{color:'#61afef'}}>WHERE</strong> prod_id=?;</div>
        </div>
      )}
      <div style={{marginBottom:12}}>
        <input placeholder='Name' value={form.name} onChange={e=>setForm({...form, name:e.target.value})} style={{marginRight:8}} />
        <input placeholder='Category' value={form.category} onChange={e=>setForm({...form, category:e.target.value})} style={{marginRight:8}} />
        <input placeholder='Price' type='number' step='0.01' value={form.unit_price} onChange={e=>setForm({...form, unit_price:e.target.value})} style={{marginRight:8}} />
        <button onClick={saveProduct}>{editId ? 'Update' : 'Add'}</button>
        {editId && <button onClick={cancelEdit} style={{marginLeft:8}}>Cancel</button>}
      </div>
      <table border='1' cellPadding='6' style={{width:'100%'}}>
        <thead><tr><th>ID</th><th>Name</th><th>Category</th><th>Price</th><th>Actions</th></tr></thead>
        <tbody>
          {products.map(p=> (
            <tr key={p.prod_id}>
              <td>{p.prod_id}</td>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>${p.unit_price}</td>
              <td>
                <button onClick={()=>startEdit(p)}>Edit</button>
                <button onClick={()=>deleteProduct(p.prod_id)} style={{marginLeft:8}}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <CategoryOperationLog category="products" title="Product Database Operations" />
    </div>
  )
}
