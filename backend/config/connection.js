// require('dotenv').config();
// const mysql = require('mysql2/promise');

// const isProduction = process.env.NODE_ENV === 'production';

// const dbConfig = {
//   host: isProduction ? process.env.DB_HOST_PROD : process.env.DB_HOST_DEV,
//   user: isProduction ? process.env.DB_USER_PROD : process.env.DB_USER_DEV,
//   password: isProduction ? process.env.DB_PASSWORD_PROD : process.env.DB_PASSWORD_DEV,
//   database: isProduction ? process.env.DB_NAME_PROD : process.env.DB_NAME_DEV,
//   port: isProduction ? process.env.DB_PORT_PROD : process.env.DB_PORT_DEV,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
//   connectTimeout: 30000 // 30 seconds
// };

// const pool = mysql.createPool(dbConfig);

// pool.getConnection()
//   .then(() => console.log(`✅ Connected to MySQL Database: ${dbConfig.database}`))
//   .catch(err => console.error('❌ Database connection failed:', err.message));

// module.exports = pool;
// config/connection.js
require('dotenv').config();
const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: isProduction ? process.env.DATABASE_URL : process.env.DATABASE_URL_DEV,
  ssl: {
    rejectUnauthorized: false // required for Render PostgreSQL
  },
});

pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL Database'))
  .catch(err => console.error('❌ Database connection failed:', err.message));

module.exports = pool;
