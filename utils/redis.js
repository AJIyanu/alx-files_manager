// const redis = require('redis');
import { createClient } from 'redis';

class RedisClient {
    constructor () {
        this.client = createClient();
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
        this.client.get(key, (err, resp) => {
            if (err) console.error(err);
            return resp;
        })
    }

    async set(key, value, duration) {
        this.client.setex(key, duration, value, (err, resp) => {
            if (err) console.error(error);
        })
    }

    async del(key) {
        this.client.del(key, (err) => console.error(err))
    }
}

const redisClient = new RedisClient();

module.exports = redisClient;
