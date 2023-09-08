require('dotenv').config();
const mysql = require('mysql2/promise');

// Connecting to MySQL
let dbConfig = {
    host: process.env.MYSQL_HOST,   
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_NAME
}

console.log(dbConfig);

let database = mysql.createPool(dbConfig);

module.exports = database;