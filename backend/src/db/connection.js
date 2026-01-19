import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME || 'test_db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'admin',
  connectionLimit: 10,
  waitForConnections: true,
});

export default pool;

