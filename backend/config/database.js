const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Karthik@1234',
    database: 'habit_tracker',
    
});

const promisePool = pool.promise();

module.exports = promisePool;