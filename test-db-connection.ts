import dotenv from 'dotenv';
dotenv.config();
import pool from './src/config/database';

async function testConnection() {
    console.log('Testing database connection...');
    // Masking the password for log safety if printed
    const dbUrl = process.env.DATABASE_URL || '';
    console.log('Database URL:', dbUrl ? 'Loaded' : 'Not Loaded');

    try {
        const res = await pool.query('SELECT NOW()');
        console.log('✅ Connection successful. Server time:', res.rows[0]);
    } catch (err) {
        console.error('❌ Connection failed:', err);
    } finally {
        await pool.end();
    }
}

testConnection();
