import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file
dotenv.config({ path: join(__dirname, '..', '.env') });

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306');
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'admin';
const DB_NAME = process.env.DB_NAME || 'test_db';

async function createDatabase() {
  let connection;
  
  try {
    // Connect without specifying database (to create it)
    console.log('Connecting to MySQL server...');
    connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
    });

    console.log('Creating database if it doesn\'t exist...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`);
    console.log(`✅ Database '${DB_NAME}' created or already exists`);

    // Switch to the database
    await connection.query(`USE \`${DB_NAME}\``);
    console.log(`✅ Using database '${DB_NAME}'`);

    // Read and execute SQL file
    const sqlFile = join(__dirname, '..', 'src', 'db', 'create_test_db.sql');
    console.log(`Reading SQL file: ${sqlFile}`);
    
    if (!fs.existsSync(sqlFile)) {
      throw new Error(`SQL file not found: ${sqlFile}`);
    }

    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Split by semicolons and execute each statement
    // Remove comments and empty statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

    console.log(`Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length > 10) { // Skip very short statements
        try {
          await connection.query(statement);
          if ((i + 1) % 10 === 0) {
            console.log(`  Processed ${i + 1}/${statements.length} statements...`);
          }
        } catch (err) {
          // Ignore "table already exists" errors
          if (!err.message.includes('already exists') && !err.message.includes('Duplicate')) {
            console.warn(`  Warning on statement ${i + 1}: ${err.message}`);
          }
        }
      }
    }

    console.log('✅ Database setup completed successfully!');
    console.log(`✅ Database '${DB_NAME}' is ready to use`);
    
  } catch (error) {
    console.error('❌ Error creating database:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Connection closed');
    }
  }
}

createDatabase();
