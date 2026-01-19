import { pool } from './src/db/connection.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, '.env') });

async function checkSchema() {
  try {
    const [rows] = await pool.query("DESCRIBE bookings");
    console.log("Bookings Table Schema:", rows);
  } catch (err) {
    console.error("Error describing bookings:", err);
  } finally {
    process.exit();
  }
}

checkSchema();