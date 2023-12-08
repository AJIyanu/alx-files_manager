const redis = require('redis');
const utils = require('util');
// import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.connected = true;
    this.client.on('error', (err) => {
      this.connected = false;
      console.error(err);
    });
    this.client.on('connect', () => {
      this.connected = true;
    });
  }

  isAlive() {
    return this.connected;
  }

  async get(key) {
    return utils.promisify(this.client.GET).bind(this.client)(key);
  }

  async set(key, value, duration) {
    await this.client.setex(key, duration, value);
  }

  async del(key) {
    await this.client.del(key, (err) => console.error(err));
  }
}

const redisClient = new RedisClient();

module.exports = redisClient;
