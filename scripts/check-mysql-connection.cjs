require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'scinsmedia_db';

  console.log(`Testing MySQL connection to ${host}:${port} with user: [${user ? 'CONFIGURED' : 'NONE'}], database: ${database}`);

  try {
    const conn = await mysql.createConnection({
      host,
      port,
      user,
      password
    });
    console.log('SUCCESS: Connected to MySQL server.');

    // Check databases
    const [dbs] = await conn.query('SHOW DATABASES');
    console.log('Databases on server:', dbs.map(d => Object.values(d)[0]));

    await conn.end();
  } catch (err) {
    console.log('Connection failed with current settings:', err.code, err.message);
  }
}

testConnection();
