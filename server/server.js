"use strict";

// Node Modules
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const mysql = require('mysql');

// Generic Constants
const PORT = process.env.PORT || 4000;
const app = express();

// MiddleWare
app.use(express.json());


// Connecting to MongoDB
mongoose.connect(process.env.MONGO_URL, {});
mongoose.connection.once('open', () => {
    console.log('MongoDB: connected...')
})

// Connecting to MySQL
let con = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_NAME,
    multipleStatements: false,
    namedPlaceholders: true
})

con.connect( (err) => {
    console.log('MySQL: connected...')
})


app.listen(PORT, () => {
    console.log(`Server: running on port... ${PORT}`);
})