"use strict";


// Node Modules
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const cloudinary = require('cloudinary').v2;
const ejs = require('ejs');

//DB
const db_query = require('./database/queries')

// Generic Constants
const PORT = process.env.PORT || 4000;
const app = express();
const expireTime = 5 * 60 * 1000; //expires after 5min  (hours * minutes * seconds * millis)
const saltRounds = 12;

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


// Connect to Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    secure: true,
    api_key: process.env.CLOUDINARY_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET
});

// MiddleWare
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.static("public"));
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
}));


// Routes
app.get('/', (req, res) => {
    res.render('index', {loggedin: false});
})

app.get('/signup', (req, res) => {
    res.render('signup');
})

app.get('/login', (req, res) => {
    res.render('login');
})


// API
app.post('/createUser', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;

    let hashedPassword = bcrypt.hashSync(password, saltRounds);

    if(email && username && password){
        let success = await db_query.createUser({user: username, email: email, hashedPassword: hashedPassword});

        if(success){
            console.log("User has been created");
            res.redirect("/");
        } else {
            console.log("ERROR OCCURED")
        }
    }else{
        if(!username) console.log("Fillout Username")
        if(!password) console.log("Fillout Password")
        if(!email) console.log("Fillout Email")
        
    }
})


app.listen(PORT, async () => {
    console.log(`Server: running on port... ${PORT}`);
})