# Inventory Management App (Express + MySQL + React)

This repository contains a minimal fullstack inventory management app scaffold.

Overview
- MySQL database (schema in `db/schema.sql`)
- Backend: Node.js + Express + mysql2
- Frontend: React (skeleton)

DB credentials (development)
- user: root
- password: mithra
- database: inventory_app

Quick start (Windows PowerShell)
1. Create the database and tables
   - Install MySQL and make sure you can connect as `root` with password `mithra`.
   - Run the SQL file (from a MySQL client or CLI):

   mysql -u root -p < db\schema.sql

2. Backend
   cd backend
   npm install
   copy .env.example .env
   # then edit .env if needed
   npm run dev

4. Seed an admin user (optional)
   - After running the database schema and starting the backend, you can create a default admin user by running:

   node scripts/seed_admin.js

   This will create `admin@example.com` with password `mithra` (development only). The script uses the DB settings in `.env`/defaults.

3. Frontend
   (frontend is a skeleton; follow README in `frontend/` for steps)

Notes & next steps
- Password hashes: the example SQL includes seed data but not hashed passwords for users. Use the `/api/auth/register` endpoint to create users.
- Trigger `trg_after_client_order` automates Sales insertion and Inventory decrement after a `ClientOrders` insert.
- Forecasting: add `GET /api/forecast` to the backend to run demand analysis (sample endpoint planned).

Security
- Do not use the example `JWT_SECRET` in production.
- Use environment variables and secrets management for production deployment.

If you'd like, I can now:
- Add a simple forecasting endpoint (moving average)
- Finish the React frontend with Admin and Client pages
- Add tests and Docker support

