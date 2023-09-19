"use strict";


// Node Modules
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
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
const crypto = require('crypto');
const {v4: uuid} = require('uuid');
const multer  = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const Joi = require("joi");

const cloudinary = require('cloudinary').v2;
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_CLOUD_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_SECRET
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
    console.log(req.session.authenticated);
    if (!req.session.authenticated) {
        req.session.destroy();
        res.render("index", {loggedin: false});
    } else {
        res.render('index', {loggedin: true});
    }
})

app.get('/signup', (req, res) => {
    if (req.session.authenticated) {
        res.render("index", {loggedin: true});
    } else {
        let msg = req.query.msg;
        res.render('signup', {msg: msg, loggedin: false});
    }
})

app.get('/login', (req, res) => {
    if (req.session.authenticated) {
        res.render("index", {loggedin: true});
    } else {
        let msg = req.query.msg;
        res.render('login', {msg: msg, loggedin: false});
    }
})

app.get('/post/img/:id', async (req, res) => {
    if (req.session.authenticated){
        let imagePost = await db_query.hitAndGetImage({public_id: req.params.id});
        let userInfo = await db_query.getPostOwner({user_id: imagePost.frn_user_id});
        res.render('post', {
            loggedin: true,
            hits: imagePost.hits,
            url: imagePost.url,
            postOwner: userInfo.username
        });
    } else {
        let imagePost = await db_query.hitAndGetImage({public_id: req.params.id});
        let userInfo = await db_query.getPostOwner({user_id: imagePost.frn_user_id});
        res.render('post', {
            loggedin: false,
            hits: imagePost.hits,
            url: imagePost.url,
            postOwner: userInfo.username
        });
    }
})


function getHits(posts){
    if(posts.length === 0) return 0;

    let hits = 0;
    for(let post in posts){
        hits += posts[post].hits;
    }
    return hits;
}

app.get('/profile', async (req, res) => {

    if (!req.session.authenticated) {
        req.session.destroy();
        res.render("index", {loggedin: false});
    } else {

        let allPosts = await db_query.getAllPosts({user_id: req.session.user_id});
        let totalPosts = allPosts.image.length + allPosts.text.length + allPosts.url.length;
        let totalHits = getHits(allPosts.image) + getHits(allPosts.text) + getHits(allPosts.url);

        console.log(allPosts.image)
        res.render('profile', {
            loggedin: true,
            username: req.session.username,
            email: req.session.email,
            imagePosts: allPosts.image,
            urlPosts: allPosts.url,
            textPosts: allPosts.text,
            totalPosts: totalPosts,
            totalHits: totalHits,
        });
    }
})


app.get('/image', async (req, res) => {
    let allImages = await db_query.getAllImages();

    console.log(allImages)
    if (!req.session.authenticated){
        res.render("image", {loggedin: false, imagePosts: allImages});
    } else {
        res.render('image', {
            loggedin: true,
            username: req.session.username,
            email: req.session.email,
            imagePosts: allImages
        })
    }
})

app.get('/404', (req,res) => {
    res.status(404);
	res.render("404", {loggedin: false});
})

app.get("*", (req,res) => {
    res.redirect("/404")
})


// Util functions

// function isValidSession(req){
//     if(req.session.authenticated) return true;
//     return false
// }

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
                req.session.authenticated = true;
                req.session.username = results[0].username;
                req.session.email = results[0].email;
                req.session.cookie.maxAge = expireTime;
                req.session.user_id = results[0].user_id;
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


app.post('/createImage', upload.single('image'), (req, res) => {
    let image_uuid = uuid();
    let user_id = req.session.user_id;
    let buf64 = req.file.buffer.toString('base64');

    cloudinary.uploader.upload("data:image/png;base64," + buf64).then(async(result) => {
        let public_id = result.public_id;
        let url = result.url;

        let results = await db_query.createImage({user_id: user_id, type_id: 2, url:url, public_id:public_id});

    })

    res.redirect('/image')
})


app.listen(PORT, async () => {
    console.log(`Server: running on port... ${PORT}`);
})