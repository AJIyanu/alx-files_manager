const mongoDB = require('mongodb');

const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = process.env.DB_PORT || '27017';
const dbDatabase = process.env.DB_DATABASE || 'files_manager';

const uri = `mongodb://${dbHost}:${dbPort}/${dbDatabase}`;

class DBClient {
  constructor() {
    this.client = new mongoDB.MongoClient(uri, { useUnifiedTopology: true });
    this.client.connect();
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    return this.client.db().collection('users').countDocuments();
  }

  async nbFiles() {
    return this.client.db().collection('files').countDocuments();
  }

  async addFiles( file ) {
    const newFile = await this.client.db().collection('files').insertOne(file);
    return newFile.insertedId.toString();
  }

  async addUser(email, hashedPassword) {
    const newUser = await this.client.db().collection('users').insertOne({ email, password: hashedPassword });
    return newUser.insertedId.toString();
  }

  async findUser(email) {
    const existUser = await this.client.db().collection('users').findOne({ email });
    return existUser;
  }

  async userById(userId) {
    const userid = new mongoDB.ObjectID(userId);
    const user = await this.client.db().collection('users').findOne({ _id: userid });
    return user;
  }

  async findFile(parentId) {
    const parentID = new mongoDB.ObjectID(parentId);
    const exist = await this.client.db().collection('files').findOne({ _id: parentID });
    return exist;
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
