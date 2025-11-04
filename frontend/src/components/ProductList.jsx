import React, {useEffect, useState} from 'react'
import { api } from '../api'
import OrderForm from './OrderForm'

export default function ProductList({ userId }){
  const [products, setProducts] = useState([])
  const [selected, setSelected] = useState(null)
  const [inventories, setInventories] = useState({}) // prod_id -> inventory rows

  useEffect(()=>{
    api.get('/products').then(r=>setProducts(r.data)).catch(console.error)
  },[])

  async function loadInventory(prod_id){
    try{
      const res = await api.get(`/inventory?prod_id=${prod_id}`)
      setInventories(prev=>({ ...prev, [prod_id]: res.data }))
    }catch(e){ console.error(e) }
  }

  function openOrder(p){
    setSelected(p)
    if (!inventories[p.prod_id]) loadInventory(p.prod_id)
  }

  return (
    <div>
      <h3>Products</h3>
      <ul>
        {products.map(p=> (
          <li key={p.prod_id} style={{marginBottom:8}}>
            <strong>{p.name}</strong> — ${p.unit_price} &nbsp;
            <button onClick={()=>openOrder(p)}>Order</button>
            <div style={{fontSize:12,color:'#666'}}>Category: {p.category || '—'}</div>
            {inventories[p.prod_id] && (
              <div style={{marginTop:6}}>
                <em>Warehouses:</em>
                <ul>
                  {inventories[p.prod_id].map(inv=> (
                    <li key={inv.inv_id}>{inv.warehouse} — stock: {inv.stock_qty} (safety: {inv.safety_stock})</li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>

      {selected && (
        <div style={{border:'1px solid #ddd',padding:12,marginTop:12}}>
          <h4>Order: {selected.name}</h4>
          <OrderForm product={selected} userId={userId} inventories={inventories[selected.prod_id]||[]} onDone={()=>{ setSelected(null) }} />
        </div>
      )}
    </div>
  )
}
