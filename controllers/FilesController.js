const fs = require('fs');
const mongoDB = require('mongodb');
const uuidv4 = require('uuid').v4;
const mime = require('mime');
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

async function readLocalFile(fileJson) {
  const pFolder = process.env.FOLDER_PATH || '/tmp/files_manager/';
  let path = fileJson.localPath.split('/').pop();
  let pId = fileJson.parentId;
  /* eslint-disable no-await-in-loop */
  while (pId !== '0' && pId !== 0) {
    const upLevel = await dbClient.findFile(pId);
    console.log(upLevel);
    pId = upLevel.parentId.toString();
    path = `/${upLevel.name}${path}`;
  }
  /* eslint-enable no-await-in-loop */
  path = pFolder + path;

  const fileContent = fs.readFileSync(path);
  return [fileContent, path];
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
      res.status(401).json({ error: 'Unauthorized' });
    }
    const fileId = req.params.id;
    const file = await dbClient.findFile(fileId);
    if (!file) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    if (file.userId.toString() !== exist) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    res.status(200).json({
      id: file._id,
      userId: exist,
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId,
    });
  }

  static async getIndex(req, res) {
    const token = req.headers['x-token'];
    const exist = await redisClient.get(`auth_${token}`);
    if (!exist) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const parentIdQuery = req.query.parentId;
    const pageQuery = req.query.page ? req.params.page : 0;
    const userId = new mongoDB.ObjectID(exist);
    if (!parentIdQuery) {
      const allFiles = await dbClient.findFIles({ userId }, pageQuery, 20);
      const userFiles = [];
      for (const data of allFiles) {
        userFiles.push({
          id: data._id.toString(),
          userId: data.userId,
          name: data.name,
          type: data.type,
          isPublic: data.isPublic,
          parentId: data.parentId,
        });
      }
      res.status(200).json(userFiles);
      return;
    }
    const allFiles = await dbClient.findFIles({ userId, parentId: parentIdQuery }, pageQuery, 20);
    const userFiles = [];
    for (const data of allFiles) {
      userFiles.push({
        id: data._id.toString(),
        userId: data.userId,
        name: data.name,
        type: data.type,
        isPublic: data.isPublic,
        parentId: data.parentId,
      });
    }
    res.status(200).json(userFiles);
  }

  static async putPublish(req, res) {
    const token = req.headers['x-token'];
    const exist = await redisClient.get(`auth_${token}`);
    if (!exist) {
      res.status(401).json({ error: 'Unauthorized' });
    }
    const fileId = req.params.id;
    const file = await dbClient.findFile(fileId);

    if (!file) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    if (file.userId.toString() !== exist) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    await dbClient.updatePublish(file, true);
    res.status(200).json({
      id: file._id.toString(),
      userId: file.userId,
      name: file.name,
      type: file.type,
      isPublic: true,
      parentId: file.parentId,
    });
  }

  static async putUnpublish(req, res) {
    const token = req.headers['x-token'];
    const exist = await redisClient.get(`auth_${token}`);
    if (!exist) {
      res.status(401).json({ error: 'Unauthorized' });
    }
    const fileId = req.params.id;
    const file = await dbClient.findFile(fileId);

    if (!file) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    if (file.userId.toString() !== exist) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    await dbClient.updatePublish(file, false);
    res.status(200).json({
      id: file._id.toString(),
      userId: file.userId,
      name: file.name,
      type: file.type,
      isPublic: false,
      parentId: file.parentId,
    });
  }

  static async getFile(req, res) {
    const token = req.headers['x-token'];
    const exist = await redisClient.get(`auth_${token}`);
    if (!exist) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const fileId = req.params.id;
    const file = await dbClient.findFile(fileId);

    if (!file) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    if (file.isPublic === false) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    if (file.type === "folder") {
      res.status(400).json('A folder doesn\'t have content');
      return;
    }

    console.log(exist !== file.userId.toString(), exist !== file.userId);
    if (exist !== file.userId.toString()) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const type = file.name.split('.').pop();
    const fileContent = await readLocalFile(file);
    res.setHeader('Content-Type', mime.getType(type) || 'text/plain; charset=utf-8');
    res.status(200).sendFile(fileContent[1]);
  }
}

module.exports = FilesController;
