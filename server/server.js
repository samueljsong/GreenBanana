"use strict";

// Node Modules
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const mysql = require('mysql');

// Generic Constants
const PORT = process.env.PORT || 4000;
const app = express();


// Connecting to MongoDB
mongoose.connect(process.env.MONGO_URL, {});
mongoose.connection.once('open', () => {
    console.log('MongoDB: connected...')
})

// Creating Sessions 
let mongoStore = MongoStore.create({
    mongoUrl: process.env.MONGO_URL,
    crypto: {
        secret: process.env.MONGO_SESSION_SECRET
    },
    collectionName: "sessions"
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
    if(err) throw err;
    console.log('MySQL: connected...')
})

// MiddleWare
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended: false}))
app.use(session({
    secret: process.env.NODE_SECRET_SESSION,
    store: mongoStore,
    saveUninitialized: false,
    resave: true,
    cookie: {
        maxAge: 100, //temporary cookie expiration time... fix later
        secure: false
    }
}))

app.listen(PORT, () => {
    console.log(`Server: running on port... ${PORT}`);
})