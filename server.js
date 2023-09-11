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
const expireTime = 60 * 60 * 1000; //expires after 1hr  (hours * minutes * seconds * millis)
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
    let loggedin = isValidSession(req);
    res.render('index', {loggedin: loggedin});
})

app.get('/signup', (req, res) => {
    let msg = req.query.msg;
    res.render('signup', {msg: msg, loggedin: false});
})

app.get('/login', (req, res) => {
    let msg = req.query.msg;
    res.render('login', {msg: msg, loggedin: false});
})

app.get('/profile', (req, res) => {
    let loggedin = isValidSession(req)
    res.render('profile', {loggedin: loggedin});
})


// Util functions

function isValidSession(req){
    if(req.session.authenticated === true){
        return true;
    }else{
        return false
    }
}

function containsUppercase(str){
    return /[A-Z]/.test(str);
}

function containsNumbers(str){
    return /[0-9]/.test(str);
}

function containsSpecialCharacter(str){
    let specialChars =/[`!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?~ ]/;
    return specialChars.test(str);
}

function isPassValid(str){
    if (str.length < 10) return 'Password length has to be at least 10..';
    if (!containsUppercase(str)) return 'Password must contain 1 uppercase..';
    if (!containsNumbers(str)) return 'Password must contain 1 number..';
    if (!containsSpecialCharacter(str)) return 'Password must contain 1 special character..';
    return true;
}

// API

// Creates user
app.post('/createUser', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;

    if(email && username && password){

        let result = isPassValid(password);
        if(result === true){

            let hashedPassword = bcrypt.hashSync(password, saltRounds);

            let success = await db_query.createUser(
                {user: username, email: email, hashedPassword: hashedPassword}
            );

            if(success){
                console.log("User has been created");
                res.redirect("/");
            }
            else {
                console.log("ERROR OCCURED")
            }
        }
        else{
            // Need to create a popup to the front end
            res.redirect(`signup?msg=${result}`);
        }
    }else{
        if(!username) console.log("Fillout Username")
        if(!password) console.log("Fillout Password")
        if(!email) console.log("Fillout Email")
    }
})

// Login User
app.post('/loginUser', async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    let results = await db_query.getUser({email: email});
    console.log(results);
    console.log(results.length);
    if(results){
        if (results.length === 1){
            console.log(bcrypt.compareSync(password, results[0].password))
            if ( bcrypt.compareSync(password, results[0].password)){
                req.session.save();
                req.session.authenticated = true;
                req.session.username = results[0].username;
                req.session.cookie.maxAge = expireTime;
                req.session.user_id = results[0].user_id;
                console.log(req.session.authenticated);
                res.redirect('/');
                return;
            } 
            else {
                let message = "Password does not match the email in our records. Try again."
                res.redirect(`login?msg=${message}`);
            }
        }
        else {
            let message = "An account with that email has not been found in our records."
            res.redirect(`login?msg=${message}`);
        }
    }
    else {
        let message = "An account with that email has not been found in our records."
        res.redirect(`login?msg=${message}`);
    }

})

app.post('/logout', async (req,res) => {
    req.session.destroy();
    res.redirect('/');
});


app.listen(PORT, async () => {
    console.log(`Server: running on port... ${PORT}`);
})