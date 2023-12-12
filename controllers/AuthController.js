const dbClient = require('../utils/db');
const crypto = require('crypto');


class AuthController {
    static getConnect ( req, res ) {
        let userCredentials = req.headers.authorization;
        userCredentials = userCredentials.split(" ")[1]
        const bufObj = Buffer.from(userCredentials, "base64")
        userCredentials = bufObj.toString("utf-8");
        const email = userCredentials.split(":")[0];
        const password = userCredentials.split(":")[1];
        const hashedPassword = crypto.createHash('sha1').update(password).digest('hex')

        const user = dbClient.findUser( email );

        if (!user) {
            res.status(401).json({ error: Unauthorized });
            return;
        }

        const verify = crypto.timingSafeEqual(Buffer.from(hashedPassword, 'hex'), Buffer.from(user.password, 'hex'));

        res.status(200).json({ email: user.email, pwd: user.password, verify });
    }
}

module.exports = AuthController;
