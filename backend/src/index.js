const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const inventoryRoutes = require('./routes/inventory');
const clientOrdersRoutes = require('./routes/clientOrders');
const ordersRoutes = require('./routes/orders');
const suppliersRoutes = require('./routes/suppliers');
const warehousesRoutes = require('./routes/warehouses');
const salesRoutes = require('./routes/sales');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ ok: true, msg: 'Inventory API' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/client-orders', clientOrdersRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/warehouses', warehousesRoutes);
app.use('/api/sales', salesRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
