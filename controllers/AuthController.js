const crypto = require('crypto');
const uuidv4 = require('uuid').v4;
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis')

class AuthController {
  static async getConnect(req, res) {
    let userCredentials = req.headers.authorization;
    userCredentials = userCredentials.split(' ')[1];
    const bufObj = Buffer.from(userCredentials, 'base64');
    userCredentials = bufObj.toString('utf-8');
    const [ email, password ] = userCredentials.split(':');
    // const password = userCredentials.split(':')[1];
    const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');

    const user = await dbClient.findUser(email);

    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const verify = crypto.timingSafeEqual(Buffer.from(hashedPassword, 'hex'), Buffer.from(user.password, 'hex'));
    if (verify) {
        const token = uuidv4()
        await redisClient.set(`auth_${token}`, user._id, 24 * 60);
        res.status(200).json({ token });
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
  }
}

module.exports = AuthController;
