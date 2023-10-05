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

    let getLinkSQL = `
        SELECT *
        FROM link
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
        let linkPosts = await database.query(getLinkSQL, param);
        let textPosts = await database.query(getTextSQL, param);

        let posts = {};
        posts.image = imagePosts[0];
        posts.link = linkPosts[0];
        posts.text = textPosts[0];

        return posts;
    }
    catch(err){
        console.log("Error in getting users images");
        console.log(err);
    }
}

async function getImage(postData){

    let getImageSQL = `
        SELECT *
        FROM images
        WHERE public_id = (?);
    `

    let param = [postData.public_id];
    try{
        let imagePost = await database.query(getImageSQL, param);
        return imagePost[0][0];
    }
    catch(err){
        console.log("Error in getting img");
        console.log(err);
    }
}

async function getImageOwner(postData) {
    let imageOwner = `
        SELECT frn_user_id
        FROM images
        WHERE public_id = (?);
    `

    let param = [postData.public_id];

    try {
        let result = await database.query(imageOwner, param);
        let ownerID = result[0][0].frn_user_id;
        if (ownerID === postData.user_id){
            return true;
        }else{
            return false;
        }
    } catch(e){
        console.log("Error in getting image owner");
        console.log(e);
    }
}

async function increaseImageHit(postData){
    let increaseHitSQL = `
        UPDATE images
        SET hits = hits + 1
        WHERE public_id = (?);
    `;

    let param = [postData.public_id];

    try {
        await database.query(increaseHitSQL, param);
    } catch(e){
        console.log("Error in increasing image hit");
        console.log(e);
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


//link queries
async function createLink(postData) {

    let createLinkSQL = `
        INSERT INTO link (frn_user_id, frn_type_id, url, url_short, date_created)
        VALUES (?, ?, ?, ?, ?);
    `
    let param = [postData.user_id, 3, postData.url, postData.url_short, postData.date_created];

    try {
        let results = await database.query(createLinkSQL, param);
    }catch(err){
        console.log(err);
    }
}

async function getAllLinks(){
    
    let getlinksSQL = `
        SELECT link_id, url, url_short, hits, date_created, username
        FROM link
        JOIN user 
        on user_id = frn_user_id
        ORDER BY link_id DESC;
    `

    try {
        let linkPosts = await database.query(getlinksSQL);

        let links = linkPosts[0];

        return links;
    }
    catch(err){
        console.log("Error in getting links");
        console.log(err);
    }
}

async function increaseLinkHits(postData){
    let increaseHitSQL = `
        UPDATE link
        SET hits = hits + 1
        WHERE url_short = (?);
    `

    let param = [postData.url_short];

    try {
        let result = await database.query(increaseHitSQL, param);
        
    } catch (err){
        console.log(err);
    }

}

async function getLinkDetails(postData){
    let getDetailsSQL = `
        SELECT *
        FROM link
        WHERE url_short = (?);
    `

    let param = [postData.url_short];

    try{
        let linkDetails = await database.query(getDetailsSQL, param);
        return linkDetails[0][0];
    } catch (err) {
        return false;
    }
}

async function deleteLink(postData){
    let deleteLinkSQL = `
        DELETE FROM link
        WHERE link_id = (?);
    `

    let param = [postData.link_id];

    try {
        let result = await database.query(deleteLinkSQL, param);
    } catch (err) {
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

async function getAllTextPosts(){
    let getAllTextPostSQL = `
        SELECT text_id, frn_user_id, html, css, js, hits, date_created, username
        FROM text
        JOIN user
        ON frn_user_id = user_id
        ORDER BY date_created DESC;
    `

    try {
        let result = await database.query(getAllTextPostSQL);
        return result[0];
    } catch (error) {
        console.log('Error in getting all text posts');
        console.log(error);
    }


}

module.exports = {
    createUser, getUser, createImage,
    getAllPosts, getImage, increaseImageHit, getPostOwner, getAllImages, getImageOwner,
    createText, isOwner, getTextDetails, saveTextDetails,
    increaseTextHits, deleteText, getAllTextPosts,
    createLink, getAllLinks, increaseLinkHits, deleteLink,
    getLinkDetails
}