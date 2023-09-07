const database = require('../databaseConnection')

async function createUser(postData) {
    let createUserSQL = `
        INSERT INTO user
        (username, email, password)
        VALUES
        (?, ?, ?);
    `;

    let param = [postData.user, postData.email, postData.hashedPassword]

    try {
        const result = await database.query(createUserSQL, param);

        return true;
    }
    catch(err){
        console.log("Error inserting user");
        console.log(err);
        return false
    }
}


module.exports = {createUser}