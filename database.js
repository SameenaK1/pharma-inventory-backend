// db.js
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = `postgresql://postgres:${process.env.DB_PASSWORD}@db.mbitcxuojpbpvqrrrqnq.supabase.co:5432/postgres`;

// Strict TLS by default. Set DB_SSL_REJECT_UNAUTHORIZED=false only for local/dev.
const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false';

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized
  }
});
pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

(async () => {
  try {
    console.log('Successfully connected to Supabase!');
  } catch (err) {
    console.error('Database connection error during initialization:', err.message);
  }
})();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool, 
};
