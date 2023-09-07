const database = require('../databaseConnection')

async function createUser(postData) {
    let createUserSQL = `
        INSERT INTO user
        (username, email, password)
        VALUES
        (:user, :email, :passwordHash);
    `;

    let params = {
        user: postData.user,
        email: postData.email,
        passwordHash: postData.hashedPassword
    }

    try {
        const result = await database.query(createUserSQL, params);

        return true;
    }
    catch(err){
        console.log("Error inserting user");
        console.log(err);
        return false
    }
}


module.exports = {createUser}