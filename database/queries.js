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


module.exports = {createUser, getUser, createImage}