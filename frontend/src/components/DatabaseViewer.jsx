import React, {useState} from 'react'
import { api } from '../api'

export default function DatabaseViewer(){
  const [activeSection, setActiveSection] = useState('schema')
  const [queryResult, setQueryResult] = useState(null)
  const [customQuery, setCustomQuery] = useState('')

  const tables = [
    { name: 'Products', columns: ['prod_id (PK)', 'name', 'category', 'unit_price', 'created_at'] },
    { name: 'Warehouses', columns: ['wh_id (PK)', 'location', 'created_at'] },
    { name: 'Inventory', columns: ['inv_id (PK)', 'prod_id (FK→Products)', 'wh_id (FK→Warehouses)', 'stock_qty', 'safety_stock', 'last_updated'] },
    { name: 'Suppliers', columns: ['supplier_id (PK)', 'company_name', 'rating', 'created_at'] },
    { name: 'Orders', columns: ['order_id (PK)', 'supplier_id (FK→Suppliers)', 'prod_id (FK→Products)', 'qty', 'order_date', 'expected_date', 'status', 'created_at'] },
    { name: 'Sales', columns: ['sale_id (PK)', 'prod_id (FK→Products)', 'wh_id (FK→Warehouses)', 'sale_qty', 'sale_date', 'created_at'] },
    { name: 'Users', columns: ['user_id (PK)', 'name', 'email', 'password_hash', 'role (admin/client)', 'created_at'] },
    { name: 'ClientOrders', columns: ['corder_id (PK)', 'user_id (FK→Users)', 'prod_id (FK→Products)', 'wh_id (FK→Warehouses)', 'qty', 'order_date', 'status', 'created_at'] }
  ]

  const relationships = [
    { from: 'Inventory', to: 'Products', type: 'Many-to-One', fk: 'prod_id' },
    { from: 'Inventory', to: 'Warehouses', type: 'Many-to-One', fk: 'wh_id' },
    { from: 'Orders', to: 'Suppliers', type: 'Many-to-One', fk: 'supplier_id', cascade: 'SET NULL' },
    { from: 'Orders', to: 'Products', type: 'Many-to-One', fk: 'prod_id' },
    { from: 'Sales', to: 'Products', type: 'Many-to-One', fk: 'prod_id' },
    { from: 'Sales', to: 'Warehouses', type: 'Many-to-One', fk: 'wh_id' },
    { from: 'ClientOrders', to: 'Users', type: 'Many-to-One', fk: 'user_id' },
    { from: 'ClientOrders', to: 'Products', type: 'Many-to-One', fk: 'prod_id' },
    { from: 'ClientOrders', to: 'Warehouses', type: 'Many-to-One', fk: 'wh_id' }
  ]

  const sampleQueries = {
    'Get all products': 'SELECT * FROM Products',
    'Get inventory with joins': 'SELECT i.*, p.name as product_name, w.location FROM Inventory i JOIN Products p ON i.prod_id = p.prod_id JOIN Warehouses w ON i.wh_id = w.wh_id',
    'Low stock items': 'SELECT i.*, p.name as product_name FROM Inventory i JOIN Products p ON i.prod_id = p.prod_id WHERE i.stock_qty < i.safety_stock',
    'Client order with trigger': 'INSERT INTO ClientOrders (user_id, prod_id, wh_id, qty) VALUES (1, 1, 1, 5) -- This triggers: Sales insert + Inventory decrement',
    'Sales summary by product': 'SELECT p.name, SUM(s.sale_qty) as total_sold FROM Sales s JOIN Products p ON s.prod_id = p.prod_id GROUP BY p.prod_id ORDER BY total_sold DESC',
    'Receive purchase order': 'UPDATE Inventory SET stock_qty = stock_qty + ? WHERE prod_id = ? AND wh_id = ?'
  }

  const triggers = [
    {
      name: 'trg_after_client_order',
      event: 'AFTER INSERT ON ClientOrders',
      action: `BEGIN
  INSERT INTO Sales(prod_id, wh_id, sale_qty, sale_date)
  VALUES (NEW.prod_id, NEW.wh_id, NEW.qty, NEW.order_date);

  UPDATE Inventory
  SET stock_qty = stock_qty - NEW.qty
  WHERE prod_id = NEW.prod_id AND wh_id = NEW.wh_id;
END`
    }
  ]

  async function executeQuery(query){
    try{
      // Note: This is for demo only. In production, never expose raw SQL execution to frontend
      setQueryResult({ status: 'info', message: 'Query would execute: ' + query })
    }catch(e){
      setQueryResult({ status: 'error', message: e.message })
    }
  }

  return (
    <div style={{padding:20}}>
      <h2>Database Schema & Operations (DBMS Academic Demo)</h2>
      
      <div style={{marginBottom:20,borderBottom:'2px solid #ccc'}}>
        <button onClick={()=>setActiveSection('schema')} style={{padding:'8px 12px',marginRight:8,fontWeight:activeSection==='schema'?'bold':'normal'}}>Tables & Schema</button>
        <button onClick={()=>setActiveSection('relations')} style={{padding:'8px 12px',marginRight:8,fontWeight:activeSection==='relations'?'bold':'normal'}}>Relationships (ER)</button>
        <button onClick={()=>setActiveSection('queries')} style={{padding:'8px 12px',marginRight:8,fontWeight:activeSection==='queries'?'bold':'normal'}}>SQL Queries</button>
        <button onClick={()=>setActiveSection('triggers')} style={{padding:'8px 12px',marginRight:8,fontWeight:activeSection==='triggers'?'bold':'normal'}}>Triggers</button>
        <button onClick={()=>setActiveSection('operations')} style={{padding:'8px 12px',marginRight:8,fontWeight:activeSection==='operations'?'bold':'normal'}}>Operations Log</button>
      </div>

      {activeSection === 'schema' && (
        <div>
          <h3>Database Tables & Columns</h3>
          {tables.map(t=> (
            <div key={t.name} style={{marginBottom:20,padding:12,border:'1px solid #ddd',backgroundColor:'#f9f9f9'}}>
              <h4 style={{margin:0,marginBottom:8}}>{t.name}</h4>
              <ul style={{marginLeft:20}}>
                {t.columns.map((col,i)=> <li key={i}>{col}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}

      {activeSection === 'relations' && (
        <div>
          <h3>Table Relationships (Foreign Keys)</h3>
          <table border='1' cellPadding='8' style={{width:'100%'}}>
            <thead>
              <tr><th>From Table</th><th>To Table</th><th>Relationship Type</th><th>Foreign Key</th><th>On Delete</th></tr>
            </thead>
            <tbody>
              {relationships.map((r,i)=> (
                <tr key={i}>
                  <td>{r.from}</td>
                  <td>{r.to}</td>
                  <td>{r.type}</td>
                  <td>{r.fk}</td>
                  <td>{r.cascade || 'CASCADE'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{marginTop:20,padding:12,backgroundColor:'#e8f4f8',border:'1px solid #4a90a4'}}>
            <strong>ER Diagram Summary:</strong>
            <ul>
              <li><strong>Products</strong> ↔ <strong>Inventory</strong> ↔ <strong>Warehouses</strong> (Many-to-Many via Inventory junction table)</li>
              <li><strong>Orders</strong> references <strong>Suppliers</strong> and <strong>Products</strong></li>
              <li><strong>Sales</strong> references <strong>Products</strong> and <strong>Warehouses</strong></li>
              <li><strong>ClientOrders</strong> references <strong>Users</strong>, <strong>Products</strong>, and <strong>Warehouses</strong></li>
            </ul>
          </div>
        </div>
      )}

      {activeSection === 'queries' && (
        <div>
          <h3>Sample SQL Queries Used in Application</h3>
          {Object.entries(sampleQueries).map(([name, query])=> (
            <div key={name} style={{marginBottom:16,padding:12,border:'1px solid #ddd',backgroundColor:'#f5f5f5'}}>
              <strong>{name}:</strong>
              <pre style={{backgroundColor:'#282c34',color:'#abb2bf',padding:12,marginTop:8,overflow:'auto'}}>{query}</pre>
              <button onClick={()=>executeQuery(query)} style={{marginTop:8}}>Show Execution Info</button>
            </div>
          ))}
          {queryResult && (
            <div style={{padding:12,marginTop:12,backgroundColor:queryResult.status==='error'?'#ffe0e0':'#e0f0ff',border:'1px solid #999'}}>
              {queryResult.message}
            </div>
          )}
        </div>
      )}

      {activeSection === 'triggers' && (
        <div>
          <h3>Database Triggers</h3>
          {triggers.map(t=> (
            <div key={t.name} style={{marginBottom:16,padding:12,border:'1px solid #ddd',backgroundColor:'#fff8e0'}}>
              <h4>{t.name}</h4>
              <div><strong>Event:</strong> {t.event}</div>
              <div style={{marginTop:8}}><strong>Action:</strong></div>
              <pre style={{backgroundColor:'#282c34',color:'#abb2bf',padding:12,marginTop:8,overflow:'auto'}}>{t.action}</pre>
              <div style={{marginTop:8,color:'#666',fontSize:14}}>
                <strong>Purpose:</strong> When a client places an order (INSERT into ClientOrders), this trigger automatically:
                <ul>
                  <li>Creates a Sales record</li>
                  <li>Decrements Inventory stock_qty for the product at the selected warehouse</li>
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSection === 'operations' && (
        <div>
          <h3>Database Operations</h3>
          <div style={{padding:12,backgroundColor:'#f0f0f0',border:'1px solid #ccc',marginBottom:12}}>
            <strong>Operation Flow Examples:</strong>
          </div>
          
          <div style={{marginBottom:16,padding:12,border:'1px solid #ddd'}}>
            <h4>1. Client Places Order</h4>
            <pre style={{backgroundColor:'#282c34',color:'#abb2bf',padding:12}}>
{`-- Frontend calls: POST /api/client-orders
-- Backend validation query:
SELECT stock_qty FROM Inventory WHERE prod_id=? AND wh_id=? FOR UPDATE

-- Backend insert:
INSERT INTO ClientOrders (user_id, prod_id, wh_id, qty) VALUES (?,?,?,?)

-- Trigger executes automatically:
INSERT INTO Sales (prod_id, wh_id, sale_qty, sale_date) VALUES (...)
UPDATE Inventory SET stock_qty = stock_qty - ? WHERE prod_id=? AND wh_id=?`}
            </pre>
          </div>

          <div style={{marginBottom:16,padding:12,border:'1px solid #ddd'}}>
            <h4>2. Admin Creates Purchase Order</h4>
            <pre style={{backgroundColor:'#282c34',color:'#abb2bf',padding:12}}>
{`-- Frontend calls: POST /api/orders
INSERT INTO Orders (supplier_id, prod_id, qty, expected_date, status) 
VALUES (?, ?, ?, ?, 'Placed')`}
            </pre>
          </div>

          <div style={{marginBottom:16,padding:12,border:'1px solid #ddd'}}>
            <h4>3. Admin Receives Order (Increases Inventory)</h4>
            <pre style={{backgroundColor:'#282c34',color:'#abb2bf',padding:12}}>
{`-- Frontend calls: PUT /api/orders/:id/receive
-- Check if inventory exists:
SELECT * FROM Inventory WHERE prod_id=? AND wh_id=?

-- If exists:
UPDATE Inventory SET stock_qty = stock_qty + ?, last_updated=NOW() 
WHERE prod_id=? AND wh_id=?

-- If not exists:
INSERT INTO Inventory (prod_id, wh_id, stock_qty, safety_stock) 
VALUES (?, ?, ?, 0)

-- Update order status:
UPDATE Orders SET status='Delivered' WHERE order_id=?`}
            </pre>
          </div>

          <div style={{marginBottom:16,padding:12,border:'1px solid #ddd'}}>
            <h4>4. Admin Views Low Stock Items</h4>
            <pre style={{backgroundColor:'#282c34',color:'#abb2bf',padding:12}}>
{`-- Frontend calls: GET /api/inventory/low
SELECT i.*, p.name as product_name, w.location 
FROM Inventory i 
JOIN Products p ON i.prod_id = p.prod_id 
JOIN Warehouses w ON i.wh_id = w.wh_id 
WHERE i.stock_qty < i.safety_stock`}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
