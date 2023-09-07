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

//DB
const db_query = require('../database/queries')

// Generic Constants
const PORT = process.env.PORT || 4000;
const app = express();
const expireTime = 5 * 60 * 1000; //expires after 5min  (hours * minutes * seconds * millis)

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
        maxAge: expireTime,
        secure: false
    }
}))



app.post('/createUser', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;

    let hashedPassword = bcrypt.hashSync(password, 12);

    let success = await db_query.createUser({user: username, email: email, hashedPassword: hashedPassword});

    if(success){
        console.log("User has been created");
    } else {
        console.log("ERROR OCCURED")
    }
})

app.listen(PORT, () => {
    console.log(`Server: running on port... ${PORT}`);
})