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
    let isOwner = await db_query.getImageOwner(
        {
            user_id: req.session.user_id,
            public_id: req.params.id
        }
    );
    let imagePost = await db_query.getImage({public_id: req.params.id});

    if(imagePost === false || imagePost== null) {
        if(!req.session.authenticated){
            res.render('404', {loggedin: true})
        } else {
            res.render('404', {loggedin: false})
        }
    } else {
        if (req.session.authenticated && isOwner){
            let userInfo = await db_query.getPostOwner({user_id: imagePost.frn_user_id});
            res.render('post', {
                loggedin: true,
                hits: imagePost.hits,
                url: imagePost.url,
                postOwner: userInfo.username
            });
        } 

        if (req.session.authenticated && !isOwner){
            await db_query.increaseImageHit({public_id: req.params.id});
            let userInfo = await db_query.getPostOwner({user_id: imagePost.frn_user_id});
            res.render('post', {
                loggedin: true,
                hits: imagePost.hits,
                url: imagePost.url,
                postOwner: userInfo.username
            });
        } 

        if (!req.session.authenticated){
            await db_query.increaseImageHit({public_id: req.params.id});
            let userInfo = await db_query.getPostOwner({user_id: imagePost.frn_user_id});
            res.render('post', {
                loggedin: false,
                hits: imagePost.hits,
                url: imagePost.url,
                postOwner: userInfo.username
            });
        }
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
        let totalPosts = allPosts.image.length + allPosts.text.length + allPosts.link.length;
        let totalHits = getHits(allPosts.image) + getHits(allPosts.text) + getHits(allPosts.link);
        let domain = `${req.protocol}://${req.get('host')}`;
        
        //separate the different types of post and sort by date

        let textPosts = allPosts.text.sort((a,b) => {
            return b.date_created - a.date_created;
        })

        let imagePosts = allPosts.image.sort((a,b) => {
            return b.date_created - a.date_created;
        })

        let linkPosts = allPosts.link.sort((a,b) => {
            return b.date_created - a.date_created;
        })

        res.render('profile', {
            loggedin: true,
            username: req.session.username,
            email: req.session.email,
            imagePosts: imagePosts,
            linkPosts: linkPosts,
            textPosts: textPosts,
            totalPosts: totalPosts,
            totalHits: totalHits,
            domain: domain
        });
    }
})

app.get('/link', async (req, res) => {
    let allLinks = await db_query.getAllLinks();
    let domain = `${req.protocol}://${req.get('host')}`;

    if (!req.session.authenticated){
        res.render("link", {domain: domain, loggedin: false, links: allLinks});
    } else {
        res.render('link', {
            domain: domain,
            loggedin: true,
            username: req.session.username,
            email: req.session.email,
            links: allLinks
        })
    }
})

app.get('/url/:id', async (req, res) => {

    let linkDetails = await db_query.getLinkDetails({url_short: req.params.id});
    if(linkDetails === false || linkDetails == null){
        if(!req.session.authenticated){
            res.render('404', {loggedin: true})
        } else {
            res.render('404', {loggedin: false})
        }
    } else {
        await db_query.increaseLinkHits({url_short: req.params.id});
        res.render("url", {
            loggedin: false,
            url: linkDetails.url
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

// Text Routing

app.get('/text', async(req, res) => {
    let allText = await db_query.getAllTextPosts();
    if(!req.session.authenticated){
        res.render("textLanding", {
            loggedin: false,
            textPosts: allText
        });
    } else {
        res.render("textLanding", {
            loggedin: true,
            user_id: req.session.user_id,
            textPosts: allText
        });
    }
})

app.post('/post/text/:id/delete', async (req, res) => {
    
    await db_query.deleteText({text_id: req.params.id})
})

app.post('/post/url/:id/delete', async (req, res) => {
    await db_query.deleteLink({link_id: req.params.id});
})

app.get('/post/text/:id', async (req, res) => {

    let textDetails = await db_query.getTextDetails({text_id: req.params.id});
    if(textDetails === false || linkDetails == null){
        if(!req.session.authenticated){
            res.render('404', {loggedin: true})
        } else {
            res.render('404', {loggedin: false})
        }
    } else {
        if(!req.session.authenticated){
        await db_query.increaseTextHits({text_id: req.params.id});
        res.render("text", {
            loggedin: false,
            owner: false,
            text_id: req.params.id,
            html: textDetails.html,
            css: textDetails.css,
            js: textDetails.js
        });
        }else{
            let result = await db_query.isOwner({text_id: req.params.id});
            if(result.frn_user_id === req.session.user_id){
                res.render('text', {
                    loggedin: true,
                    owner: true,
                    text_id: req.params.id,
                    html: textDetails.html,
                    css: textDetails.css,
                    js: textDetails.js
                });
            }else{
                await db_query.increaseTextHits({text_id: req.params.id});
                res.render('text',{
                    loggedin: true,
                    owner: false,
                    text_id: req.params.id,
                    html: textDetails.html,
                    css: textDetails.css,
                    js: textDetails.js
                })
            }
        }
    }

    
})
    
app.get('/404', (req,res) => {
    res.status(404);
	res.render("404", {loggedin: false});
})

app.get("*", (req,res) => {
    res.redirect("/404")
})

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

        let date = new Date();
        let dateString = date.toISOString().slice(0, 19).replace('T', ' ');

        let results = await db_query.createImage({
            user_id: user_id, 
            type_id: 2, 
            url:url, 
            public_id:public_id,
            date_created: dateString
        });

    })

    res.redirect('/image')
})

app.post('/createLink', async (req, res) => {
    let shorturl = Math.random().toString(32).slice(2);
    let date = new Date();
    let dateString = date.toISOString().slice(0, 19).replace('T', ' ');

    await db_query.createLink({
        user_id: req.session.user_id,
        url: req.body.url,
        url_short: shorturl,
        date_created: dateString
    })

    res.redirect('/link')
})

//Text post

app.post('/createText', async (req, res) => {
    let newID = crypto.randomUUID();
    let date = new Date();
    let dateString = date.toISOString().slice(0, 19).replace('T', ' ');

    await db_query.createText({
        text_id: newID,
        user_id: req.session.user_id,
        html: '',
        css:'',
        js:'',
        date_created: dateString
    })

    res.redirect(`/post/text/${newID}`);
})

app.post('/saveWork', async (req, res) => {
    let text_id = req.body.text_id;
    let html = req.body.html;
    let css = req.body.css;
    let js = req.body.js;

    let postData = {
        html: html,
        css: css,
        js: js,
        text_id: text_id
    }

    let result = await db_query.saveTextDetails(postData);
    res.redirect(`/post/text/${text_id}`);
})



app.listen(PORT, async () => {
    console.log(`Server: running on port... ${PORT}`);
})