import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'brltracker',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const connectDB = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    console.log('PostgreSQL Connected successfully');
    
    // Test the connection
    const result = await client.query('SELECT NOW()');
    console.log('Database connection test successful:', result.rows[0]);
    
    client.release();
    
    // Create tables if they don't exist
    await createTables();
    
  } catch (error) {
    console.error(`PostgreSQL connection error: ${(error as Error).message}`);
    process.exit(1);
  }
};

const createTables = async (): Promise<void> => {
  const createExchangeRatesTable = `
    CREATE TABLE IF NOT EXISTS exchange_rates (
      id SERIAL PRIMARY KEY,
      from_currency VARCHAR(3) NOT NULL,
      to_currency VARCHAR(3) NOT NULL,
      rate DECIMAL(20, 8) NOT NULL,
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      source VARCHAR(50),
      UNIQUE(from_currency, to_currency, timestamp)
    );
  `;
  
  const createIndexes = `
    CREATE INDEX IF NOT EXISTS idx_exchange_rates_currencies 
    ON exchange_rates (from_currency, to_currency);
    
    CREATE INDEX IF NOT EXISTS idx_exchange_rates_timestamp 
    ON exchange_rates (timestamp DESC);
  `;
  
  try {
    const client = await pool.connect();
    await client.query(createExchangeRatesTable);
    await client.query(createIndexes);
    console.log('Database tables created successfully');
    client.release();
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await pool.end();
    console.log('PostgreSQL connection pool closed');
    process.exit(0);
  } catch (err) {
    console.error('Error during PostgreSQL shutdown:', err);
    process.exit(1);
  }
});

export {
  connectDB,
  pool,
};
