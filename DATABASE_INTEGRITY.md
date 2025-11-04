# Database Integrity and Referential Actions

## Problem Fixed
Previously, when deleting a product, all historical data (client orders, sales records, purchase orders, and inventory) were being deleted due to `ON DELETE CASCADE` constraints. This is incorrect for business logic - historical records should be preserved.

## Solution Implemented

### Foreign Key Constraints Updated

#### 1. **Inventory Table**
```sql
FOREIGN KEY (prod_id) REFERENCES Products(prod_id) ON DELETE RESTRICT
```
- **Effect**: You CANNOT delete a product if it has inventory records
- **Reason**: Forces you to remove/transfer inventory before discontinuing a product
- **Business Logic**: Prevents accidental deletion of products with stock

#### 2. **ClientOrders Table**
```sql
FOREIGN KEY (prod_id) REFERENCES Products(prod_id) ON DELETE RESTRICT
FOREIGN KEY (wh_id) REFERENCES Warehouses(wh_id) ON DELETE RESTRICT
```
- **Effect**: You CANNOT delete a product or warehouse if there are client orders
- **Reason**: Historical order records must be preserved
- **Business Logic**: Customer purchase history is permanent for accounting/legal reasons

#### 3. **Sales Table**
```sql
FOREIGN KEY (prod_id) REFERENCES Products(prod_id) ON DELETE RESTRICT
FOREIGN KEY (wh_id) REFERENCES Warehouses(wh_id) ON DELETE RESTRICT
```
- **Effect**: You CANNOT delete a product or warehouse if there are sales records
- **Reason**: Sales history must be preserved for reporting and tax purposes
- **Business Logic**: Financial records are immutable

#### 4. **Orders Table (Purchase Orders)**
```sql
FOREIGN KEY (prod_id) REFERENCES Products(prod_id) ON DELETE RESTRICT
```
- **Effect**: You CANNOT delete a product if there are purchase orders
- **Reason**: Preserve procurement history
- **Business Logic**: Track what was ordered even for discontinued products

## How to Delete a Product Correctly

### Step-by-Step Process:
1. **Stop selling the product** - Mark as discontinued in the UI (if implemented)
2. **Clear inventory** - Transfer or dispose of all stock
3. **Wait for orders to complete** - Fulfill all pending orders
4. **Archive historical data** - (Optional) Export to archive before deletion
5. **Delete inventory records** - Remove from Inventory table
6. **Delete product** - Now you can safely delete from Products table

### What You CAN'T Do:
❌ Delete a product with active inventory  
❌ Delete a product with order history  
❌ Delete a product with sales records  

### What Happens:
- MySQL will return error: `Cannot delete or update a parent row: a foreign key constraint fails`
- Frontend should show user-friendly message: "Cannot delete product - has active inventory/orders"

## Cascading Deletes Still Used

### User Deletion
```sql
FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
```
- **Effect**: Deleting a user deletes their orders
- **Reason**: GDPR compliance - user data must be removable

### Warehouse Deletion (Inventory Only)
```sql
FOREIGN KEY (wh_id) REFERENCES Warehouses(wh_id) ON DELETE CASCADE
```
- **Effect**: Deleting a warehouse deletes its inventory records
- **Reason**: Inventory is tied to physical location
- **Note**: Historical orders/sales are protected by RESTRICT

## Adding New Products

### Important Note:
When you add a new product via the admin panel, it:
✅ Creates the product in Products table  
❌ Does NOT automatically create inventory records  

### To Make Product Available to Clients:
1. **Add Product** - Use Product Management tab
2. **Add Inventory** - Go to warehouse and add stock for this product
3. **Set Safety Stock** - Configure minimum stock levels
4. **Product Now Available** - Clients can now order it

### Why Separate?
- A product can exist without inventory (pre-order, discontinued)
- Inventory is warehouse-specific (product can be in multiple warehouses)
- Better control over stock management

## Frontend Recommendations

### Product Delete Handler Should:
```javascript
async function deleteProduct(id) {
  try {
    await api.delete(`/products/${id}`)
    // Success
  } catch (error) {
    if (error.response?.status === 500 && error.response?.data?.error?.includes('foreign key')) {
      alert('Cannot delete product: It has inventory or order history. Please remove inventory first.')
    }
  }
}
```

### Add Inventory Management UI:
- "Add to Inventory" button after creating product
- Shows which warehouses have stock
- Allows adding/removing inventory per warehouse

## Testing

### Test Case 1: Delete Product with Inventory
```sql
-- This will FAIL (as intended)
INSERT INTO Products (name, category, unit_price) VALUES ('Test', 'Test', 10);
INSERT INTO Inventory (prod_id, wh_id, stock_qty, safety_stock) VALUES (LAST_INSERT_ID(), 1, 100, 20);
DELETE FROM Products WHERE name='Test';
-- ERROR: Cannot delete - has inventory
```

### Test Case 2: Delete Product After Clearing Inventory
```sql
-- This will SUCCEED
DELETE FROM Inventory WHERE prod_id = (SELECT prod_id FROM Products WHERE name='Test');
DELETE FROM Products WHERE name='Test';
-- SUCCESS
```

### Test Case 3: Try to Delete Product with Order History
```sql
-- This will FAIL (as intended)
-- Place a client order first, then try to delete product
-- ERROR: Cannot delete - has order history
```

## Database Status After Update
- ✅ Schema updated with RESTRICT constraints
- ✅ Database recreated with new schema
- ✅ Admin user recreated (admin@example.com / mithra)
- ✅ Sample data loaded (2 products, 2 warehouses, inventory, suppliers)
- ✅ Historical data protection enabled
