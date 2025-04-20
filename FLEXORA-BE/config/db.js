// config/db.js
const mysql = require('mysql2/promise'); // Using mysql2 promise wrapper
require('dotenv').config(); // Load environment variables from .env file

// Create a connection pool
// Pooling is important for managing multiple connections efficiently in a web server
const pool = mysql.createPool({
  host: process.env.DB_HOST,         // Database host (from .env)
  user: process.env.DB_USER,         // Database user (from .env)
  password: process.env.DB_PASSWORD, // Database password (from .env)
  database: process.env.DB_DATABASE, // Database name (from .env)
  waitForConnections: true,          // Whether the pool should wait for connections if all are in use
  connectionLimit: 10,               // Maximum number of connections in the pool
  queueLimit: 0                      // Maximum number of connection requests to queue (0 = no limit)
});

// Optional: Test the connection pool on startup
pool.getConnection()
  .then(connection => {
    console.log('Successfully connected to the database pool.');
    connection.release(); // Release the connection back to the pool
  })
  .catch(err => {
    console.error('!!! DATABASE POOL CONNECTION ERROR !!!');
    console.error(`Error connecting to the database. Please check credentials in .env and ensure MySQL server is running.`);
    console.error(`DB Host: ${process.env.DB_HOST}`);
    console.error(`DB User: ${process.env.DB_USER}`);
    console.error(`DB Name: ${process.env.DB_DATABASE}`);
    console.error('Error details:', err.code, err.message);
    // Exit the process if the database connection fails on startup
    // You might handle this differently in production (e.g., retry logic)
    process.exit(1);
  });

// Export the pool to be used in controllers
module.exports = pool;