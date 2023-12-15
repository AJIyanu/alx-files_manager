const fs = require('fs');
const mongoDB = require('mongodb');
const uuidv4 = require('uuid').v4;
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

async function saveFileLocal(details) {
  const pFolder = process.env.FOLDER_PATH || '/tmp/files_manager';
  let path = '';

  if (details.parentId !== 0) {
    fs.access(`${pFolder}/${details.parentFolder}`, (err) => {
      if (err) {
        fs.mkdir(`${pFolder}/${details.parentFolder}`, (error) => console.error(error));
      }
    });
    path = `${pFolder}/${details.parentFolder}/${uuidv4()}`;
  } else {
    fs.access(pFolder, (err) => {
      if (err) {
        fs.mkdir(pFolder, (err) => console.error(err));
      }
    });
    path = `${pFolder}/${uuidv4()}`;
  }

  const bufObj = Buffer.from(details.data, 'base64');
  const plainString = bufObj.toString('utf-8');

  fs.writeFileSync(path, plainString, (errr) => console.error(errr));

  return path;
}

class FilesController {
  static async postUpload(req, res) {
    let token = req.headers;
    token = token['x-token'];
    const exist = await redisClient.get(`auth_${token}`);
    if (!exist) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const name = req.body ? req.body.name : null;
    const type = req.body ? req.body.type : null;
    const parentId = req.body.parentId || 0;
    const isPublic = req.body ? req.body.isPublic : false;
    const data = req.body ? req.body.data : null;
    const fileType = ['folder', 'file', 'image'];

    if (!name) {
      res.status(400).json({ error: 'Missing name' });
      return;
    }
    if (!type || fileType.indexOf(type) === -1) {
      res.status(400).json({ error: 'Missing type' });
      return;
    }
    if (!data && fileType.indexOf(type) !== 0) {
      res.status(400).json({ error: 'Missing data' });
      return;
    }

    let parentFolder = '';
    if (parentId !== 0) {
      const checkFolder = await dbClient.findFile(parentId);
      if (!checkFolder) {
        res.status(400).json({ error: 'Parent not found' });
        return;
      }
      if (checkFolder.type !== 'folder') {
        res.status(400).json({ error: 'Parent is not a folder' });
        return;
      }
      parentFolder = checkFolder.name;
    }

    if (type === 'folder') {
      const fileProperty = {
        name,
        type,
        parentId,
        userId: new mongoDB.ObjectID(exist),
      };
      const saveFile = await dbClient.addFiles(fileProperty);
      res.status(201).json({
        id: saveFile, userId: exist, name, type, parentId,
      });
      return;
    }
    const localPath = await saveFileLocal({ parentFolder, parentId, data });

    const fileProperty = {
      name,
      type,
      parentId,
      isPublic,
      localPath,
      userId: new mongoDB.ObjectID(exist),
    };

    const saveFile = await dbClient.addFiles(fileProperty);
    res.status(201).json({
      id: saveFile, userId: exist, name, type, isPublic, parentId,
    });
  }

  static async getShow(req, res) {
    const token = req.headers['x-token'];
    const exist = await redisClient.get(`auth_${token}`);
    if (!exist) {
      res.status(401).json({ error: "Unauthorozed" });
    }
    const fileId = req.params.id;
    const file = await dbClient.findFile(fileId);
    if (!file) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    if ( file.userId.toString() !== exist ) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    res.status(201).json({ id: file._id, userId: exist, name: file.name, type: file.type, isPublic: file.isPublic, parentId: file.parentId })
  }

  static async getIndex(req, res) {
    const token = req.headers['x-token'];
    const exist = await redisClient.get(`auth_${token}`);
    if (!exist) {
      res.status(401).json({ error: "Unauthorozed" });
    }
    const parentIdQuery = req.query.parentId;
    const pageQuery = req.query.page;
    const allFiles = await dbClient.findFIles({userId: exist})
    console.log(allFiles);
  }
}

module.exports = FilesController;
