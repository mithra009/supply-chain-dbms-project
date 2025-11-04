# Inventory Management System - DBMS Academic Project

## Project Overview
A full-stack inventory management application demonstrating database concepts including:
- Relational database design (MySQL)
- Foreign key constraints and referential integrity
- Database triggers
- CRUD operations
- Complex SQL queries with JOINs
- Transaction management
- Role-based access control

## Database Schema

### Tables
1. **Products** - Stores product information
2. **Warehouses** - Stores warehouse locations
3. **Inventory** - Junction table linking products to warehouses with stock levels
4. **Suppliers** - Supplier information
5. **Orders** - Purchase orders to suppliers (admin creates)
6. **Sales** - Sales records (auto-generated via trigger)
7. **Users** - Application users (admin/client roles)
8. **ClientOrders** - Orders placed by clients

### Key Relationships
- **Inventory** is a junction table with FKs to Products and Warehouses (many-to-many)
- **Orders** references Suppliers and Products
- **Sales** references Products and Warehouses
- **ClientOrders** references Users, Products, and Warehouses

### Database Trigger
**trg_after_client_order** - Automatically executes after a client places an order:
- Inserts a record into Sales table
- Decrements stock_qty in Inventory table

## Technology Stack

### Backend
- Node.js + Express
- MySQL (mysql2 driver)
- JWT authentication
- bcryptjs for password hashing

### Frontend
- React (Vite)
- Axios for API calls
- React Router for navigation

## Setup Instructions

### Prerequisites
- MySQL Server 8+
- Node.js 16+
- npm

### Database Setup
```powershell
# Import schema
mysql -u root -pmithra < "db\schema.sql"

# Verify
mysql -u root -pmithra -e "USE inventory_app; SHOW TABLES;"
```

### Backend Setup
```powershell
cd backend
npm install
copy .env.example .env
npm run dev
```

Server runs on http://localhost:4000

### Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```

UI runs on http://localhost:5173

### Seed Admin User
```powershell
cd backend
node scripts/seed_admin.js
```
Creates admin@example.com with password: mithra

## Features Demonstrated

### Database Concepts

1. **Foreign Keys & Referential Integrity**
   - All relationships use foreign keys
   - Cascade deletes for dependent records
   - SET NULL for optional relationships (e.g., Orders.supplier_id)

2. **Database Triggers**
   - Client order placement triggers Sales insert and Inventory update
   - Demonstrates automatic database operations

3. **Complex Queries**
   - JOINs across multiple tables (Inventory with Products and Warehouses)
   - Aggregation (sales summary by product)
   - Subqueries and filtering (low stock alerts)

4. **Transactions**
   - Client order validation uses FOR UPDATE lock
   - Atomic operations for inventory updates

5. **Indexes**
   - Primary keys on all tables
   - Composite index on Inventory(prod_id, wh_id)
   - Index on Sales(prod_id, sale_date) for analytics

### Application Features

#### Admin Capabilities
- **Products Tab**: CRUD operations on products
- **Warehouses Tab**: Manage warehouse locations
- **Suppliers Tab**: Manage suppliers with ratings
- **Inventory Tab**: 
  - View all inventory across warehouses
  - Low stock alerts (stock < safety_stock)
  - Manual stock adjustments
- **Purchase Orders Tab**:
  - Create purchase orders to suppliers
  - Receive orders (increases inventory)
  - Track order status
- **Client Orders & Sales Tab**: View all customer orders and sales
- **Database Schema Tab**: Live view of schema, relationships, SQL queries, and triggers

#### Client Capabilities
- Browse products
- View stock by warehouse
- Place orders (validated against available stock)
- View order history

#### Authentication
- JWT-based authentication
- Role-based access (admin/client)
- Protected routes and API endpoints

## SQL Queries Used

### 1. Get Products with Inventory
```sql
SELECT i.*, p.name as product_name, w.location 
FROM Inventory i 
JOIN Products p ON i.prod_id = p.prod_id 
JOIN Warehouses w ON i.wh_id = w.wh_id
```

### 2. Low Stock Alert
```sql
SELECT i.*, p.name as product_name 
FROM Inventory i 
JOIN Products p ON i.prod_id = p.prod_id 
WHERE i.stock_qty < i.safety_stock
```

### 3. Sales Summary
```sql
SELECT p.name, SUM(s.sale_qty) as total_sold 
FROM Sales s 
JOIN Products p ON s.prod_id = p.prod_id 
GROUP BY p.prod_id 
ORDER BY total_sold DESC
```

### 4. Client Order (with validation)
```sql
-- Check stock
SELECT stock_qty FROM Inventory 
WHERE prod_id=? AND wh_id=? FOR UPDATE;

-- Insert order
INSERT INTO ClientOrders (user_id, prod_id, wh_id, qty) 
VALUES (?, ?, ?, ?);

-- Trigger automatically executes:
INSERT INTO Sales (prod_id, wh_id, sale_qty, sale_date) VALUES (...);
UPDATE Inventory SET stock_qty = stock_qty - ? WHERE ...;
```

### 5. Receive Purchase Order
```sql
-- Increase inventory
UPDATE Inventory 
SET stock_qty = stock_qty + ?, last_updated = NOW() 
WHERE prod_id = ? AND wh_id = ?;

-- Update order status
UPDATE Orders SET status = 'Delivered' WHERE order_id = ?;
```

## Database Normalization
- All tables are in 3NF (Third Normal Form)
- No redundant data
- Each table has a single-column primary key
- Foreign keys maintain referential integrity

## Academic Learning Objectives
1. ✅ Design normalized relational database schema
2. ✅ Implement foreign key constraints and cascading
3. ✅ Create and use database triggers
4. ✅ Write complex SQL queries with JOINs and aggregations
5. ✅ Implement transaction management for data consistency
6. ✅ Build full-stack application with database backend
7. ✅ Demonstrate CRUD operations
8. ✅ Implement authentication and authorization
9. ✅ Use indexes for query optimization
10. ✅ Handle concurrency with row-level locks

## Project Structure
```
dbms/
├── db/
│   └── schema.sql          # Complete database schema
├── backend/
│   ├── src/
│   │   ├── index.js        # Express server
│   │   ├── db.js           # MySQL connection
│   │   ├── middleware/
│   │   │   └── auth.js     # JWT auth middleware
│   │   └── routes/         # API endpoints
│   ├── scripts/
│   │   └── seed_admin.js   # Admin user seeding
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── main.jsx        # App entry point
│   │   ├── App.jsx         # Root component
│   │   ├── auth.jsx        # Auth context
│   │   ├── api.js          # API helper
│   │   └── components/     # React components
│   └── package.json
└── README.md
```

## Default Credentials
- **Admin**: admin@example.com / mithra
- **Database**: root / mithra

## API Endpoints

### Authentication
- POST /api/auth/register - Create user
- POST /api/auth/login - Login (returns JWT)

### Products
- GET /api/products - List all products
- POST /api/products - Create product (admin)
- PUT /api/products/:id - Update product (admin)
- DELETE /api/products/:id - Delete product (admin)

### Inventory
- GET /api/inventory - List inventory (with filters)
- GET /api/inventory/low - Low stock alerts (admin)
- PUT /api/inventory/:id/stock - Update stock (admin)

### Orders (Purchase Orders)
- GET /api/orders - List orders
- POST /api/orders - Create order (admin)
- PUT /api/orders/:id/status - Update status (admin)
- PUT /api/orders/:id/receive - Receive order + increase inventory (admin)

### Client Orders
- POST /api/client-orders - Place order (client)
- GET /api/client-orders/user/:userId - User's orders
- GET /api/client-orders/all - All client orders (admin)

### Sales
- GET /api/sales - List all sales records

### Warehouses & Suppliers
- GET/POST/PUT/DELETE /api/warehouses
- GET/POST/PUT/DELETE /api/suppliers

## Future Enhancements
- Sales forecasting (moving average)
- Analytics dashboard with charts
- Export to CSV
- Docker deployment
- Automated tests
- Real-time notifications for low stock

## Contributors
- DBMS Academic Project
- Date: November 2025
