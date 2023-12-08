const redis = require('redis');
// import { createClient } from 'redis';

class RedisClient {
    constructor () {
        this.client = redis.createClient();
        this.client.on('error', (err) => {
            console.error(err);
        })
    }

    isAlive() {
        this.client.ping((err, resp) => {
            if (resp === 'PONG') return true;
            else return false;
        })
    }

    async get(key) {
        await this.client.get(key, (err, resp) => {
            if (err) console.error(err);
            return resp;
        })
    }

    async set(key, value, duration) {
        await this.client.setex(key, duration, value, (err, resp) => {
            if (err) console.error(error);
        })
    }

    async del(key) {
        await this.client.del(key, (err) => console.error(err))
    }
}

const redisClient = new RedisClient();

module.exports = redisClient;
