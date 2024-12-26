const mysql = require('mysql2');

const pool = mysql.createPool({
   host: process.env.DB_HOST, // Public IP of your Cloud SQL instance
    user: process.env.DB_USER, // Usually "root"
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

const promisePool = pool.promise();

module.exports = promisePool;