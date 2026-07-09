import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'talent_intelligence',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
})

// Kiểm tra kết nối
export const connectDB = async () => {
  try {
    const client = await pool.connect()
    console.log('Database connection established successfully.')
    client.release()
    return pool
  } catch (error) {
    console.error('Unable to connect to the database:', error.message)
    throw error
  }
}

export default pool