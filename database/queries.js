const { text } = require('express');
const database = require('../databaseConnection')

async function createUser(postData) {
    
    const {data, error} = await database
        .from('user')
        .insert([
            {
                username: postData.user, 
                email: postData.email, 
                password: postData.hashedPassword
            }
        ])
    
    if (error) {
        console.log("Error in creating user");
        console.log(error);
        return false;
    }

    return true;
}

async function getUser(postData){
    const { data, error } = await database
        .from('user')
        .select('user_id, username, email, password')
        .eq('email', postData.email)
        .limit(1) // optional, since email should be unique

        if (error) {
            console.log('Error finding user:', error)
            return [];
        }

        // data is an array, return first element
    
    return data;
}

async function createImage(postData){
    try {
        const { data, error } = await database
            .from('images')
            .insert([
                {
                    frn_user_id: postData.user_id,
                    frn_type_id: postData.type_id,
                    url: postData.url,
                    public_id: postData.public_id,
                    date_created: postData.date_created
                }
            ])
            .select() // optional: returns inserted row(s)

        if (error) {
            console.log("Error inserting new image:", error)
            return false
        }

        return data // or true if you just need success
    } catch (err) {
        console.log("Unexpected error inserting image:", err)
        return false
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

    const { data, error } = await database
        .from('images')
        .select('*')
        .eq('public_id', postData.public_id)
        .limit(1) // optional, since public_id should be unique

    console.log(data);

    return data[0];
}

async function getImageOwner(postData) {

    try {
        const { data, error } = await database
            .from('images')
            .select('frn_user_id')
            .eq('public_id', postData.public_id)
            .single() // ensures only one row is returned

        if (error) {
            console.error("Error in getting image owner:", error)
            return false
        }

        if (data && data.frn_user_id === postData.user_id) {
            return true
        } else {
            return false
        }
    } catch (e) {
        console.error("Unexpected error in getImageOwner:", e)
        return false
    }
}

async function increaseImageHit(postData){
    try {
    // Step 1: Get current hits
        const { data: image, error: fetchError } = await database
        .from('images')
        .select('hits')
        .eq('public_id', postData.public_id)
        .single()

        if (fetchError) {
            console.error("Error fetching current hits:", fetchError)
            return
        }

    // Step 2: Increment
        const newHits = (image?.hits || 0) + 1

    // Step 3: Update
        const { error: updateError } = await database
            .from('images')
            .update({ hits: newHits })
            .eq('public_id', postData.public_id)

        if (updateError) {
            console.error("Error in increasing image hit:", updateError)
        }
    } catch (e) {
        console.error("Unexpected error in increasing image hit:", e)
    }
}

async function getPostOwner(postData){
     try {
        const { data, error } = await database
            .from('user')            // your table name
            .select('*')             // select all columns
            .eq('user_id', postData.user_id)
            .single()                // expect exactly one row

        if (error) {
            console.error('Could not get Post owner details:', error)
            return null
        }

        return data
    } catch (err) {
        console.error('Unexpected error in getPostOwner:', err)
        return null
    }
}

async function getAllImages(){
    
    const { data: images, error} = await database
        .from('images')
        .select(`
            image_id, url, public_id, date_created, hits, frn_user_id, frn_type_id
        `)
        .order('image_id', { ascending: false })

        if (error) {
            console.log("Error in getting all images");
            console.log(error);
            return [];
        }

    return images;

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