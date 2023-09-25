const { text } = require('express');
const database = require('../databaseConnection')

async function createUser(postData) {
    let createUserSQL = `
        INSERT INTO user
        (username, email, password)
        VALUES
        (?, ?, ?);
    `;

    let param = [postData.user, postData.email, postData.hashedPassword];

    try {
        const result = await database.query(createUserSQL, param);

        return true;
    }
    catch(err){
        console.log("Error inserting user");
        console.log(err);
        return false;
    }
}

async function getUser(postData){
    let getUserSQL = `
        SELECT user_id, username, email, password
        FROM user
        WHERE email = (?);
    `;

    let param = [postData.email];

    try{
        const results = await database.query(getUserSQL, param);
        return results[0];
    }
    catch (err) {
        console.log("Error in finding user");
        console.log(err);
        return false;
    }
}

async function createImage(postData){
    let createImageSQL = `
        INSERT INTO images (frn_user_id, frn_type_id, url, public_id, date_created)
        VALUES (?, ?, ?, ?, ?);
    `

    let param = [postData.user_id, postData.type_id, postData.url, postData.public_id, postData.date_created];

    try{
        const results = await database.query(createImageSQL, param);
    }
    catch(err){
        console.log("Error in inputing a new image");
        console.log(err);
    }
}

async function getAllPosts(postData){
    
    let getImagesSQL = `
        SELECT *
        FROM images
        WHERE frn_user_id = (?);
    `

    let getUrlSQL = `
        SELECT *
        FROM url
        WHERE frn_user_id = (?);
    `

    let getTextSQL = `
        SELECT *
        FROM text
        WHERE frn_user_id = (?);
    `

    let param = [postData.user_id];

    try {
        let imagePosts = await database.query(getImagesSQL, param);
        let urlPosts = await database.query(getUrlSQL, param);
        let textPosts = await database.query(getTextSQL, param);

        let posts = {};
        posts.image = imagePosts[0];
        posts.url = urlPosts[0];
        posts.text = textPosts[0];

        return posts;
    }
    catch(err){
        console.log("Error in getting users images");
        console.log(err);
    }
}

async function hitAndGetImage(postData){
    let increaseHitSQL = `
        UPDATE images
        SET hits = hits + 1
        WHERE public_id = (?);
    `

    let getImageSQL = `
        SELECT *
        FROM images
        WHERE public_id = (?);
    `

    let param = [postData.public_id];
    try{
        await database.query(increaseHitSQL, param);
        let imagePost = await database.query(getImageSQL, param);
        return imagePost[0][0];
    }
    catch(err){
        console.log("Error in increasing hit and getting img");
        console.log(err);
    }
}

async function getPostOwner(postData){
    let getPostOwnerSQL = `
        SELECT * 
        FROM user
        WHERE user_id = (?);
    `

    let param = [postData.user_id];

    try{
        let userInfo = await database.query(getPostOwnerSQL, param);
        console.log(userInfo);
        return userInfo[0][0];
    }
    catch(err){
        console.log('Could not get Post owner details');
        console.log(err);
    }
}

async function getAllImages(){
    
    let getImagesSQL = `
        SELECT image_id, url, public_id, hits, username
        FROM images
        JOIN user 
        on user_id = frn_user_id
        ORDER BY image_id ASC;
    `

    try {
        let imagePosts = await database.query(getImagesSQL);

        let images = imagePosts[0];

        return images;
    }
    catch(err){
        console.log("Error in getting images");
        console.log(err);
    }
}

//Text Queries

async function createText(postData) {

    let createTextSQL = `
        INSERT INTO text (text_id, frn_user_id, frn_type_id, html, css, js, date_created)
        VALUES (?, ?, ?, ?, ?, ?, ?);
    `
    let param = [postData.text_id, postData.user_id, 1, postData.html, postData.css, postData.js, postData.date_created];

    try {
        let results = await database.query(createTextSQL, param);
    }catch(err){
        console.log(err);
    }
}

async function isOwner(postData){
    let checkIfOwnerSQL = `
        SELECT frn_user_id 
        FROM text
        WHERE text_id = (?);
    `

    let param = [postData.text_id];

    try {
        let results = await database.query(checkIfOwnerSQL, param);
        return results[0][0];
    } catch (err){
        console.log(err);
    }
}

async function getTextDetails(postData){
    let getDetailsSQL = `
        SELECT *
        FROM text
        WHERE text_id = (?);
    `

    let param = [postData.text_id];

    try{
        let textDetails = await database.query(getDetailsSQL, param);
        return textDetails[0][0];
    } catch (err) {
        return false;
    }
}

async function saveTextDetails(postData){
    let saveDetailsSQL = `
        UPDATE text
        SET html = (?), css = (?), js = (?)
        WHERE text_id = (?);
    `

    let param = [postData.html, postData.css, postData.js, postData.text_id];

    try{
        let results = await database.query(saveDetailsSQL, param);
    } catch (err){
        console.log(err);
    }
}

async function increaseTextHits(postData){
    let increaseHitSQL = `
        UPDATE text
        SET hits = hits + 1
        WHERE text_id = (?);
    `

    let param = [postData.text_id];

    try {
        let result = await database.query(increaseHitSQL, param);
        
    } catch (err){
        console.log(err);
    }

}

async function deleteText(postData){
    let deleteTextSQL = `
        DELETE FROM text
        WHERE text_id = (?);
    `

    let param = [postData.text_id];

    try {
        let result = await database.query(deleteTextSQL, param);
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    createUser, getUser, createImage,
    getAllPosts, hitAndGetImage, getPostOwner, getAllImages,
    createText, isOwner, getTextDetails, saveTextDetails,
    increaseTextHits, deleteText
}