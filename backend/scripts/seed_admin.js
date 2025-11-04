// Run with: node scripts/seed_admin.js
const pool = require('../src/db');
const bcrypt = require('bcryptjs');

async function seed(){
  try{
    const name = 'Admin';
    const email = 'admin@example.com';
    const password = 'mithra';
    const password_hash = await bcrypt.hash(password, 10);
    const [rows] = await pool.query('SELECT user_id FROM Users WHERE email=?', [email]);
    if (rows.length) return console.log('Admin user already exists');
    const [res] = await pool.query('INSERT INTO Users (name,email,password_hash,role) VALUES (?,?,?,?)', [name,email,password_hash,'admin']);
    console.log('Seeded admin id=', res.insertId);
    process.exit(0);
  }catch(err){
    console.error(err);
    process.exit(1);
  }
}

seed();
