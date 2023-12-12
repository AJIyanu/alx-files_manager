const dbClient = require('../utils/db');


class AuthController {
    static getConnect ( req, res ) {
        let userCredentials = req.headers.authorization;
        userCredentials = userCredentials.split(" ")[1]
        const bufObj = Buffer.from(userCredentials, "base64")
        userCredentials = bufObj.toString("utf-8");
        res.status(200).json({check: userCredentials});
    }
}

module.exports = AuthController;
