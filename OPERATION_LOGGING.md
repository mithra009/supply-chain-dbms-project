# Database Operation Logging System

## Overview
This document describes the live operation logging system implemented for academic demonstration purposes. The system shows exactly where each database operation is performed, including:
- Operation name
- API endpoint called
- Backend file handling the request
- SQL query executed
- Description of what the operation does

## Architecture

### 1. Operation Log Context (`frontend/src/operationLog.jsx`)
- **Purpose**: Central state management for operation logs
- **Features**:
  - Stores last 50 operations with timestamps
  - `addLog(operation, endpoint, sql, file, description)` - Adds new log entry
  - `clearLogs()` - Clears all logs
  - Automatically generates unique IDs and timestamps
- **Provider**: `OperationLogProvider` wraps the entire app in `main.jsx`

### 2. Operation Log Viewer (`frontend/src/components/OperationLogViewer.jsx`)
- **Purpose**: Fixed bottom panel displaying live operation logs
- **UI Features**:
  - Dark theme (#1e1e1e background, #007acc accents)
  - Fixed position at bottom of screen
  - Max height 300px with scrolling
  - Shows logs in reverse chronological order (newest first)
  - Clear button to reset logs
- **Display Sections** for each log:
  - Operation name and timestamp
  - API endpoint (e.g., `GET /api/products`)
  - Backend file path (e.g., `backend/src/routes/products.js`)
  - SQL query with syntax highlighting
  - Operation description

### 3. Integration Points
The `OperationLogViewer` component is integrated into:
- **AdminDashboard.jsx** - Visible during all admin operations
- **ClientDashboard.jsx** - Visible during client operations

## Instrumented Operations

### Product Management (`ProductManagement.jsx`)
- ✅ **Load Products**: `GET /api/products` → `SELECT * FROM Products`
- ✅ **Create Product**: `POST /api/products` → `INSERT INTO Products`
- ✅ **Update Product**: `PUT /api/products/:id` → `UPDATE Products`
- ✅ **Delete Product**: `DELETE /api/products/:id` → `DELETE FROM Products` (cascading)

### Warehouse Management (`WarehouseManagement.jsx`)
- ✅ **Load Warehouses**: `GET /api/warehouses` → `SELECT * FROM Warehouses`
- ✅ **Create Warehouse**: `POST /api/warehouses` → `INSERT INTO Warehouses`
- ✅ **Update Warehouse**: `PUT /api/warehouses/:id` → `UPDATE Warehouses`
- ✅ **Delete Warehouse**: `DELETE /api/warehouses/:id` → `DELETE FROM Warehouses` (cascading to inventory)

### Supplier Management (`SupplierManagement.jsx`)
- ✅ **Load Suppliers**: `GET /api/suppliers` → `SELECT * FROM Suppliers`
- ✅ **Create Supplier**: `POST /api/suppliers` → `INSERT INTO Suppliers`
- ✅ **Update Supplier**: `PUT /api/suppliers/:id` → `UPDATE Suppliers`
- ✅ **Delete Supplier**: `DELETE /api/suppliers/:id` → `DELETE FROM Suppliers` (sets order supplier_id to NULL)

### Inventory Management (`InventoryManagement.jsx`)
- ✅ **Load Inventory**: `GET /api/inventory` → `SELECT FROM Inventory JOIN Products JOIN Warehouses`
- ✅ **Load Low Stock**: `GET /api/inventory/low` → `SELECT WHERE stock_qty < safety_stock`
- ✅ **Update Stock**: `PUT /api/inventory/:id/stock` → `UPDATE Inventory SET stock_qty, last_updated`

### Purchase Order Management (`OrderManagement.jsx`)
- ✅ **Load Orders**: `GET /api/orders` → `SELECT FROM Orders LEFT JOIN Suppliers LEFT JOIN Products`
- ✅ **Create Order**: `POST /api/orders` → `INSERT INTO Orders`
- ✅ **Update Status**: `PUT /api/orders/:id/status` → `UPDATE Orders SET status`
- ✅ **Receive Order**: `PUT /api/orders/:id/receive` → `UPDATE Inventory (increases stock) + UPDATE Orders`

### Client Order Placement (`OrderForm.jsx`)
- ✅ **Place Client Order**: `POST /api/client-orders` → Complex transaction:
  ```sql
  BEGIN;
  SELECT stock_qty FROM Inventory FOR UPDATE; -- Lock row for validation
  INSERT INTO ClientOrders;
  -- Trigger fires automatically:
  INSERT INTO Sales;
  UPDATE Inventory (decrements stock);
  COMMIT;
  ```

### Authentication (`Login.jsx`, `Register.jsx`)
- ✅ **User Login**: `POST /api/auth/login` → `SELECT FROM Users WHERE email` (password verification + JWT generation)
- ✅ **User Registration**: `POST /api/auth/register` → `INSERT INTO Users` (with bcrypt password hashing)

## Usage for Academic Demonstration

### During Presentation
1. **Login as Admin** - Observe login operation in log panel
2. **Navigate to Products tab** - See "Load Products" operation
3. **Add a Product** - Watch "Create Product" operation with INSERT SQL
4. **Edit a Product** - See "Update Product" operation with UPDATE SQL
5. **Delete a Product** - Observe "Delete Product" with CASCADE behavior
6. **Navigate to Inventory** - See JOIN queries fetching related data
7. **Check Low Stock** - Watch filtered query with WHERE condition
8. **Create Purchase Order** - See complex transaction with supplier JOIN
9. **Receive Order** - Observe inventory UPDATE increasing stock
10. **Switch to Client View** - Log panel remains visible
11. **Place Client Order** - See transaction with trigger explanation

### Key Educational Points
- **Separation of Concerns**: Frontend → API → Backend Route → Database
- **RESTful API Design**: Clear endpoint naming and HTTP methods
- **SQL Operations**: All CRUD operations visible in real-time
- **Database Constraints**: Foreign keys, cascading deletes, nullable fields
- **Triggers**: Automatic operations (trg_after_client_order) explained in logs
- **Transactions**: ACID properties demonstrated in client orders
- **JOINs**: Complex queries joining multiple tables for reporting
- **Security**: Password hashing, JWT authentication visible in logs

## Technical Implementation Details

### Adding a New Logged Operation
To add logging to any component:

```jsx
import { useOperationLog } from '../operationLog'

function MyComponent() {
  const { addLog } = useOperationLog()
  
  async function myOperation() {
    addLog(
      'Operation Name',           // Short name for UI
      'GET /api/endpoint',         // API endpoint called
      'SELECT * FROM Table',       // SQL query executed
      'backend/src/routes/file.js', // Backend file path
      'Description of what this does' // Detailed explanation
    )
    
    await api.get('/endpoint')
    // ... rest of operation
  }
}
```

### Log Entry Structure
```javascript
{
  id: 123,                        // Unique auto-generated ID
  timestamp: '2024-01-15 10:30:45', // Auto-generated timestamp
  operation: 'Load Products',     // Operation name
  endpoint: 'GET /api/products',  // API endpoint
  sql: 'SELECT * FROM Products',  // SQL query
  file: 'backend/src/routes/products.js', // Backend file
  description: 'Fetching all products...' // Detailed description
}
```

## Benefits for DBMS Academics

### For Students
- **Visual Learning**: See database operations in real-time
- **Traceability**: Understand request → route → SQL flow
- **Debugging**: Identify which queries are slow or failing
- **Best Practices**: Learn proper API and SQL patterns

### For Instructors
- **Demonstration Tool**: Show complete database lifecycle
- **Code Review**: Quickly identify implementation patterns
- **Performance Analysis**: Spot inefficient queries
- **Architecture Explanation**: Clear separation of layers

### For Evaluation
- **Feature Completeness**: All operations logged and visible
- **Code Quality**: Demonstrates understanding of full stack
- **Database Design**: Shows proper use of constraints, triggers, JOINs
- **Documentation**: Self-documenting through operation descriptions

## Future Enhancements
- Add SQL query execution time tracking
- Include query result set size
- Add color coding for operation types (SELECT=blue, INSERT=green, UPDATE=yellow, DELETE=red)
- Export logs to CSV for analysis
- Add query performance recommendations
- Include transaction isolation level information
