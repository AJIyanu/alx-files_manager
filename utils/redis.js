const redis = require('redis');
// import { createClient } from 'redis';

class RedisClient {
    constructor () {
        this.client = redis.createClient();
        this.connected = true;
        this.client.on('error', (err) => {
            this.connected = false;
            console.error(err);
        })
        this.client.on("connect", () => {
            this.connected = true;
        })
    }

    isAlive() {
        return this.connected;
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
