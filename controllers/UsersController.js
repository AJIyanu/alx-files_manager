const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

class UsersController {

    static postNew (req, res) {
        if (!req.body.email) {
            res.status(400).json({error: "Missing email"});
        }
        if (!req.body.password) {
            res.status(400).json({error: "Missing password"});
        }
    }
}

module.exports = UsersController;
