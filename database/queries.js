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
        INSERT INTO images (frn_user_id, frn_type_id, url, public_id)
        VALUES (?, ?, ?, ?);
    `

    let param = [postData.user_id, postData.type_id, postData.url, postData.public_id];

    try{
        const results = await database.query(createImageSQL, param);
    }
    catch(err){
        console.log("Error in inputing a new image");
        console.log(err);
    }
}

// async function getTotalPosts(postData){
//     let getTotalImagePostsSQL = `
//         SELECT COUNT(*)
//         FROM images
//         WHERE frn_user_id = (?);
//     `

//     let getTotalUrlPostsSQL = `
//         SELECT COUNT(*)
//         FROM url
//         WHERE frn_user_id = (?);
//     `

//     let getTotalTextPostsSQL = `
//         SELECT COUNT(*)
//         FROM text
//         WHERE frn_user_id = (?);
//     `

//     let param = [postData.user_id];

//     try{
//         const imgResult = await database.query(getTotalImagePostsSQL, param);
//         const urlResult = await database.query(getTotalUrlPostsSQL, param);
//         const textResult = await database.query(getTotalTextPostsSQL, param);
        
//         return imgResult[0][0]['COUNT(*)'] + urlResult[0][0]['COUNT(*)'] + textResult[0][0]['COUNT(*)'];
//     }
//     catch(err){
//         console.log("Error in getting all hits");
//         console.log(err);
//     }
// }

// async function getTotalHits(postData){

//     let getTotalImageHits = `
//         SELECT SUM(hits)
//         FROM images
//         WHERE frn_user_id = (?);
//     `

//     let getTotalUrlHits = `
//         SELECT SUM(hits)
//         FROM url
//         WHERE frn_user_id = (?);
//     `

//     let getTotalTextHits = `
//         SELECT SUM(hits)
//         FROM text
//         WHERE frn_user_id = (?);
//     `

//     let param = [postData.user_id];

//     try {
//         const imgResult = await database.query(getTotalImageHits, param);
//         const urlResult = await database.query(getTotalUrlHits, param);
//         const textResult = await database.query(getTotalTextHits, param);
//         let total = 0;

//         if(textResult[0][0]['SUM(hits)'] !== null){
//             total += parseInt(textResult[0][0]['SUM(hits)']);
//         }

//         if(imgResult[0][0]['SUM(hits)'] !== null){
//             total += parseInt(imgResult[0][0]['SUM(hits)']);
//         }

//         if(urlResult[0][0]['SUM(hits)'] !== null){
//             total += parseInt(urlResult[0][0]['SUM(hits)']);
//         }

//         // console.log(total);
//         return total;

//     }
//     catch (err){
//         console.log("Error in getting total hits")
//         console.log(err);
//     }
    
// }

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

module.exports = {
    createUser, getUser, createImage,
    getAllPosts
}