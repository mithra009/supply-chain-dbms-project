import React, {useState} from 'react'
import { api } from '../api'
import { useOperationLog } from '../operationLog'
import CategoryOperationLog from './CategoryOperationLog'

export default function OrderForm({ product, userId, inventories, onDone }){
  const [whId, setWhId] = useState(inventories[0]?.wh_id || '')
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const { addLog } = useOperationLog()

  async function submit(e){
    e.preventDefault(); setLoading(true); setError(null); setSuccess(null)
    try{
      const payload = { user_id: userId, prod_id: product.prod_id, wh_id: parseInt(whId,10), qty: parseInt(qty,10) }
      addLog('Place Client Order', 'POST /api/client-orders', `BEGIN; SELECT stock_qty FROM Inventory WHERE prod_id=${product.prod_id} AND wh_id=${whId} FOR UPDATE; INSERT INTO ClientOrders (user_id, prod_id, wh_id, qty) VALUES (${userId}, ${product.prod_id}, ${whId}, ${qty}); [TRIGGER: INSERT INTO Sales, UPDATE Inventory]; COMMIT;`, 'backend/src/routes/clientOrders.js', 'Client places order - validates stock, creates order, trigger auto-creates sale record and decrements inventory', 'client-orders')
      const res = await api.post('/client-orders', payload)
      setSuccess('Order placed (id: '+res.data.corder_id+')')
      if (onDone) onDone()
    }catch(err){
      console.error(err);
      setError(err.response?.data?.error || 'Error placing order')
    }finally{ setLoading(false) }
  }

  return (
    <form onSubmit={submit}>
      <div>Product: {product.name}</div>
      <div style={{marginTop:8}}>
        <label>Warehouse
          <select value={whId} onChange={e=>setWhId(e.target.value)} style={{marginLeft:8}}>
            <option value=''>--select--</option>
            {inventories.map(inv=> (
              <option key={inv.inv_id} value={inv.wh_id}>{inv.warehouse} (stock: {inv.stock_qty})</option>
            ))}
          </select>
        </label>
      </div>
      <div style={{marginTop:8}}>
        <label>Qty <input type='number' value={qty} min='1' onChange={e=>setQty(e.target.value)} style={{width:80,marginLeft:8}}/></label>
      </div>
      <div style={{marginTop:12}}>
        <button type='submit' disabled={loading || !whId}>Place Order</button>
        <button type='button' onClick={()=>onDone && onDone()} style={{marginLeft:8}}>Cancel</button>
      </div>
      {error && <div style={{color:'red',marginTop:8}}>{error}</div>}
      {success && <div style={{color:'green',marginTop:8}}>{success}</div>}

      <CategoryOperationLog category="client-orders" title="Client Order Database Operations" />
    </form>
  )
}
