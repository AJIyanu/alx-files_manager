const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

class UsersController {

    static async postNew (req, res) {
        const email = req.body ? req.body.email : null;
        const password = req.body ? req.body.password : null;

        console.log(email, password);

        if (!email) {
            res.status(400).json({error: "Missing email"});
        }
        if (!password) {
            res.status(400).json({error: "Missing password"});
        }
    }
}

module.exports = UsersController;
