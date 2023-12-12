const crypto = require('crypto');
const dbClient = require('../utils/db');

class UsersController {

    static async postNew (req, res) {
        const email = req.body ? req.body.email : null;
        const password = req.body ? req.body.password : null;

        if (!email) {
            res.status(400).json({error: "Missing email"});
            return;
        }
        if (!password) {
            res.status(400).json({error: "Missing password"});
            return;
        }

        const user = await (await dbClient.usersCollection()).findOne({ email });
        if ( user ) {
            res.status(400).json({error: "Already exist"})
            return;
        }

        const hashedPassword =crypto.createHash('sha1').update(password).digest('hex')

        const newUser = await (await dbClient.usersCollection()).insertOne({ email: email, password: hashedPassword});
        res.status(201).json({ email, id: newUser.insertedId.toString()});
    }
}

module.exports = UsersController;
